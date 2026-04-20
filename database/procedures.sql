-- ============================================================
-- WEARMS — database/procedures.sql
-- ============================================================

USE wearms_db;

DROP PROCEDURE IF EXISTS RegisterUser;
DROP PROCEDURE IF EXISTS AddEmergencyContact;
DROP PROCEDURE IF EXISTS CreateSOSAlert;
DROP PROCEDURE IF EXISTS AssignOfficerToCase;
DROP PROCEDURE IF EXISTS UpdateCaseStatus;
DROP PROCEDURE IF EXISTS CloseCase;
DROP PROCEDURE IF EXISTS RPT_AlertsPerDay;
DROP PROCEDURE IF EXISTS RPT_CasesPerOfficer;
DROP PROCEDURE IF EXISTS RPT_AvgResolutionTime;
DROP PROCEDURE IF EXISTS RPT_StatusCount;

DELIMITER //

-- ─────────────────────────────────────────
-- Procedure 1: RegisterUser
-- ─────────────────────────────────────────
CREATE PROCEDURE RegisterUser(
  IN p_name         VARCHAR(100),
  IN p_email        VARCHAR(150),
  IN p_phone        VARCHAR(15),
  IN p_password_hash VARCHAR(255),
  IN p_address       TEXT
)
BEGIN
  DECLARE v_count INT DEFAULT 0;

  SELECT COUNT(*) INTO v_count FROM Users WHERE email = p_email;
  IF v_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Email already registered';
  END IF;

  INSERT INTO Users (name, email, phone, password_hash, address)
  VALUES (p_name, p_email, p_phone, p_password_hash, p_address);

  SELECT LAST_INSERT_ID() AS user_id;
END //

-- ─────────────────────────────────────────
-- Procedure 2: AddEmergencyContact
-- ─────────────────────────────────────────
CREATE PROCEDURE AddEmergencyContact(
  IN p_user_id  INT,
  IN p_name     VARCHAR(100),
  IN p_phone    VARCHAR(15),
  IN p_relation VARCHAR(50)
)
BEGIN
  DECLARE v_user_count    INT DEFAULT 0;
  DECLARE v_contact_count INT DEFAULT 0;

  SELECT COUNT(*) INTO v_user_count FROM Users WHERE user_id = p_user_id;
  IF v_user_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'User not found';
  END IF;

  SELECT COUNT(*) INTO v_contact_count
  FROM Emergency_Contacts
  WHERE user_id = p_user_id;

  IF v_contact_count >= 5 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Max 5 emergency contacts allowed per user';
  END IF;

  INSERT INTO Emergency_Contacts (user_id, name, phone, relation)
  VALUES (p_user_id, p_name, p_phone, p_relation);

  SELECT LAST_INSERT_ID() AS contact_id;
END //

-- ─────────────────────────────────────────
-- Procedure 3: CreateSOSAlert
-- ─────────────────────────────────────────
CREATE PROCEDURE CreateSOSAlert(
  IN p_user_id       INT,
  IN p_latitude      DECIMAL(10, 8),
  IN p_longitude     DECIMAL(11, 8),
  IN p_location_desc TEXT
)
BEGIN
  DECLARE v_user_count INT DEFAULT 0;
  DECLARE v_alert_id   INT;
  DECLARE v_case_id    INT;

  SELECT COUNT(*) INTO v_user_count FROM Users WHERE user_id = p_user_id;
  IF v_user_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'User not found. Cannot create SOS alert.';
  END IF;

  INSERT INTO SOS_Alerts (user_id, latitude, longitude, location_description)
  VALUES (p_user_id, p_latitude, p_longitude, p_location_desc);

  SET v_alert_id = LAST_INSERT_ID();

  -- Trigger after_sos_insert will auto-create the Case; retrieve it
  SELECT case_id INTO v_case_id FROM Cases WHERE alert_id = v_alert_id LIMIT 1;

  SELECT v_alert_id AS alert_id, v_case_id AS case_id;
END //

-- ─────────────────────────────────────────
-- Procedure 4: AssignOfficerToCase
-- ─────────────────────────────────────────
CREATE PROCEDURE AssignOfficerToCase(
  IN p_case_id     INT,
  IN p_officer_id  INT,
  IN p_assigned_by VARCHAR(100)
)
BEGIN
  DECLARE v_case_status   VARCHAR(50);
  DECLARE v_officer_active BOOLEAN;

  SELECT status INTO v_case_status FROM Cases WHERE case_id = p_case_id;
  IF v_case_status IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Case not found';
  END IF;

  IF v_case_status NOT IN ('New', 'Assigned') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Case cannot be assigned in its current status';
  END IF;

  SELECT is_active INTO v_officer_active FROM Officers WHERE officer_id = p_officer_id;
  IF v_officer_active IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Officer not found';
  END IF;
  IF v_officer_active = FALSE THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Officer is not active and cannot be assigned';
  END IF;

  -- Deactivate any existing active assignment for this case
  UPDATE Assignments
  SET is_active = FALSE
  WHERE case_id = p_case_id AND is_active = TRUE;

  -- Insert new assignment (trigger will update Cases.status to 'Assigned')
  INSERT INTO Assignments (case_id, officer_id, assigned_by, is_active)
  VALUES (p_case_id, p_officer_id, p_assigned_by, TRUE);

  SELECT LAST_INSERT_ID() AS assignment_id;
END //

-- ─────────────────────────────────────────
-- Procedure 5: UpdateCaseStatus
-- ─────────────────────────────────────────
CREATE PROCEDURE UpdateCaseStatus(
  IN p_case_id    INT,
  IN p_new_status VARCHAR(50),
  IN p_changed_by VARCHAR(100),
  IN p_remarks    TEXT
)
BEGIN
  DECLARE v_old_status VARCHAR(50);

  -- Get current status
  SELECT status INTO v_old_status
  FROM Cases
  WHERE case_id = p_case_id;

  IF v_old_status IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Case not found';
  END IF;

  IF p_new_status NOT IN ('New', 'Assigned', 'In Progress', 'Resolved', 'Closed') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Invalid status value';
  END IF;

  -- Update case (trigger logs history automatically)
  UPDATE Cases
  SET status = p_new_status
  WHERE case_id = p_case_id;

  -- Update latest history entry with officer remarks
  UPDATE Case_Status_History
  SET changed_by = p_changed_by,
      remarks    = p_remarks
  WHERE case_id = p_case_id
    AND new_status = p_new_status
  ORDER BY changed_at DESC
  LIMIT 1;

  SELECT p_new_status AS new_status, p_case_id AS case_id;

END //

-- ─────────────────────────────────────────
-- Procedure 6: CloseCase
-- ─────────────────────────────────────────
CREATE PROCEDURE CloseCase(
  IN p_case_id   INT,
  IN p_closed_by VARCHAR(100)
)
BEGIN
  DECLARE v_alert_id INT;

  -- Get the related alert_id
  SELECT alert_id INTO v_alert_id FROM Cases WHERE case_id = p_case_id;

  IF v_alert_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Case not found';
  END IF;

  -- Delegate to UpdateCaseStatus (trigger handles history + assignment deactivation)
  CALL UpdateCaseStatus(p_case_id, 'Closed', p_closed_by, 'Case closed by officer/admin');

  -- Ensure the SOS alert is also closed
  UPDATE SOS_Alerts SET status = 'Closed' WHERE alert_id = v_alert_id;

  SELECT 'Case closed successfully' AS message;
END //

-- ══════════════════════════════════════════
-- Report Procedures
-- ══════════════════════════════════════════

-- ─────────────────────────────────────────
-- RPT_AlertsPerDay — Alerts last 30 days grouped by date
-- ─────────────────────────────────────────
CREATE PROCEDURE RPT_AlertsPerDay()
BEGIN
  SELECT
    DATE(triggered_at)  AS alert_date,
    COUNT(*)            AS total
  FROM SOS_Alerts
  WHERE triggered_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY DATE(triggered_at)
  ORDER BY alert_date ASC;
END //

-- ─────────────────────────────────────────
-- RPT_CasesPerOfficer — All-time case stats per officer
-- ─────────────────────────────────────────
CREATE PROCEDURE RPT_CasesPerOfficer()
BEGIN
  SELECT
    o.officer_id,
    o.name,
    o.badge_no,
    o.department,
    COUNT(DISTINCT a.case_id)  AS total_cases,
    SUM(CASE WHEN c.status NOT IN ('Resolved','Closed') THEN 1 ELSE 0 END) AS active_cases,
    SUM(CASE WHEN c.status IN ('Resolved','Closed') THEN 1 ELSE 0 END)     AS resolved_cases
  FROM Officers o
  LEFT JOIN Assignments a ON o.officer_id = a.officer_id
  LEFT JOIN Cases c       ON a.case_id    = c.case_id
  GROUP BY o.officer_id, o.name, o.badge_no, o.department
  ORDER BY total_cases DESC;
END //

-- ─────────────────────────────────────────
-- RPT_AvgResolutionTime — Average hours from alert to resolved
-- ─────────────────────────────────────────
CREATE PROCEDURE RPT_AvgResolutionTime()
BEGIN
  SELECT
    ROUND(AVG(TIMESTAMPDIFF(MINUTE, s.triggered_at, h.changed_at)) / 60.0, 2) AS avg_hours
  FROM Cases c
  JOIN SOS_Alerts s         ON c.alert_id  = s.alert_id
  JOIN Case_Status_History h ON c.case_id  = h.case_id
  WHERE h.new_status = 'Resolved';
END //

-- ─────────────────────────────────────────
-- RPT_StatusCount — Case count per status
-- ─────────────────────────────────────────
CREATE PROCEDURE RPT_StatusCount()
BEGIN
  SELECT status, COUNT(*) AS count
  FROM Cases
  GROUP BY status;
END //

DELIMITER ;
