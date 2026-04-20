-- ============================================================
-- WEARMS — database/triggers.sql
-- ============================================================

USE wearms_db;

-- Drop triggers if they exist (for re-runnable script)
DROP TRIGGER IF EXISTS after_sos_insert;
DROP TRIGGER IF EXISTS after_assignment_insert;
DROP TRIGGER IF EXISTS after_case_status_update;
DROP TRIGGER IF EXISTS after_case_closed;

DELIMITER //

-- ─────────────────────────────────────────
-- Trigger 1: after_sos_insert
-- Fires AFTER a new SOS_Alert is inserted.
-- Auto-creates a Case record and logs the initial status.
-- ─────────────────────────────────────────
CREATE TRIGGER after_sos_insert
AFTER INSERT ON SOS_Alerts
FOR EACH ROW
BEGIN
  DECLARE v_case_id INT;

  -- Create a new Case linked to this SOS alert
  INSERT INTO Cases (alert_id, status, priority)
  VALUES (NEW.alert_id, 'New', 'High');

  SET v_case_id = LAST_INSERT_ID();

  -- Log the initial 'New' status in history
  INSERT INTO Case_Status_History (case_id, old_status, new_status, changed_at, changed_by, remarks)
  VALUES (v_case_id, NULL, 'New', NOW(), 'SYSTEM', 'Case auto-created on SOS trigger');
END //

-- ─────────────────────────────────────────
-- Trigger 2: after_assignment_insert
-- Fires AFTER a new Assignment row is inserted.
-- Updates the linked Case status to 'Assigned'.
-- ─────────────────────────────────────────
CREATE TRIGGER after_assignment_insert
AFTER INSERT ON Assignments
FOR EACH ROW
BEGIN
  UPDATE Cases
  SET status = 'Assigned'
  WHERE case_id = NEW.case_id;
END //

-- ─────────────────────────────────────────
-- Trigger 3: after_case_status_update
-- Fires AFTER Cases.status is updated.
-- Logs every status transition and closes SOS alert on 'Resolved'.
-- ─────────────────────────────────────────
CREATE TRIGGER after_case_status_update
AFTER UPDATE ON Cases
FOR EACH ROW
BEGIN
  -- Only fire when status actually changes
  IF OLD.status <> NEW.status THEN
    -- Log the status transition
    INSERT INTO Case_Status_History (case_id, old_status, new_status, changed_at, changed_by)
    VALUES (NEW.case_id, OLD.status, NEW.status, NOW(), 'SYSTEM');

    -- If resolved, close the originating SOS alert
    IF NEW.status = 'Resolved' THEN
      UPDATE SOS_Alerts
      SET status = 'Closed'
      WHERE alert_id = NEW.alert_id;
    END IF;
  END IF;
END //

-- ─────────────────────────────────────────
-- Trigger 4: after_case_closed
-- Fires AFTER Cases row is updated.
-- Deactivates all active assignments when a Case is Closed.
-- ─────────────────────────────────────────
CREATE TRIGGER after_case_closed
AFTER UPDATE ON Cases
FOR EACH ROW
BEGIN
  IF NEW.status = 'Closed' AND OLD.status <> 'Closed' THEN
    UPDATE Assignments
    SET is_active = FALSE
    WHERE case_id = NEW.case_id
      AND is_active = TRUE;
  END IF;
END //

DELIMITER ;
