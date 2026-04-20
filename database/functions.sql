-- ============================================================
-- WEARMS — database/functions.sql
-- ============================================================

USE wearms_db;

DROP FUNCTION IF EXISTS GetTotalCasesByOfficer;
DROP FUNCTION IF EXISTS GetActiveCasesCount;
DROP FUNCTION IF EXISTS GetUserAlertCount;
DROP FUNCTION IF EXISTS GetAverageResponseTime;
DROP FUNCTION IF EXISTS GetCasesByStatus;

DELIMITER //

-- ─────────────────────────────────────────
-- Function 1: GetTotalCasesByOfficer
-- Returns total case COUNT assigned to a given officer (all time)
-- ─────────────────────────────────────────
CREATE FUNCTION GetTotalCasesByOfficer(p_officer_id INT)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(DISTINCT a.case_id) INTO v_count
  FROM Assignments a
  WHERE a.officer_id = p_officer_id;
  RETURN v_count;
END //

-- ─────────────────────────────────────────
-- Function 2: GetActiveCasesCount
-- Returns cases NOT yet resolved or closed
-- ─────────────────────────────────────────
CREATE FUNCTION GetActiveCasesCount()
RETURNS INT
READS SQL DATA
NOT DETERMINISTIC
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(*) INTO v_count
  FROM Cases
  WHERE status NOT IN ('Resolved', 'Closed');
  RETURN v_count;
END //

-- ─────────────────────────────────────────
-- Function 3: GetUserAlertCount
-- Returns total SOS alerts ever triggered by a user
-- ─────────────────────────────────────────
CREATE FUNCTION GetUserAlertCount(p_user_id INT)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(*) INTO v_count
  FROM SOS_Alerts
  WHERE user_id = p_user_id;
  RETURN v_count;
END //

-- ─────────────────────────────────────────
-- Function 4: GetAverageResponseTime
-- Average minutes between SOS trigger and first 'Assigned' history entry
-- ─────────────────────────────────────────
CREATE FUNCTION GetAverageResponseTime()
RETURNS DECIMAL(10, 2)
READS SQL DATA
NOT DETERMINISTIC
BEGIN
  DECLARE v_avg DECIMAL(10, 2) DEFAULT 0.00;

  SELECT ROUND(AVG(
    TIMESTAMPDIFF(MINUTE, s.triggered_at, h.changed_at)
  ), 2) INTO v_avg
  FROM SOS_Alerts s
  JOIN Cases c ON s.alert_id = c.alert_id
  JOIN (
    -- Only the FIRST 'Assigned' history entry per case
    SELECT case_id, MIN(changed_at) AS changed_at
    FROM Case_Status_History
    WHERE new_status = 'Assigned'
    GROUP BY case_id
  ) h ON c.case_id = h.case_id;

  RETURN IFNULL(v_avg, 0.00);
END //

-- ─────────────────────────────────────────
-- Function 5: GetCasesByStatus
-- Returns case count for a given status string
-- ─────────────────────────────────────────
CREATE FUNCTION GetCasesByStatus(p_status VARCHAR(50))
RETURNS INT
READS SQL DATA
NOT DETERMINISTIC
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(*) INTO v_count
  FROM Cases
  WHERE status = p_status;
  RETURN v_count;
END //

DELIMITER ;
