-- ============================================================
-- WEARMS — Women Emergency Alert & Response Management System
-- database/schema.sql — Full Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS wearms_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wearms_db;

-- ─────────────────────────────────────────
-- Table: Users
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Users (
  user_id       INT           NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  phone         VARCHAR(15)   NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  address       TEXT,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- Table: Emergency_Contacts
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Emergency_Contacts (
  contact_id  INT          NOT NULL AUTO_INCREMENT,
  user_id     INT          NOT NULL,
  name        VARCHAR(100) NOT NULL,
  phone       VARCHAR(15)  NOT NULL,
  relation    VARCHAR(50),
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (contact_id),
  CONSTRAINT fk_ec_user FOREIGN KEY (user_id)
    REFERENCES Users (user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- Table: Officers
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Officers (
  officer_id    INT          NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  badge_no      VARCHAR(30)  NOT NULL UNIQUE,
  department    VARCHAR(100),
  phone         VARCHAR(15),
  password_hash VARCHAR(255),
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (officer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- Table: SOS_Alerts
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS SOS_Alerts (
  alert_id              INT              NOT NULL AUTO_INCREMENT,
  user_id               INT              NOT NULL,
  latitude              DECIMAL(10, 8)   NOT NULL,
  longitude             DECIMAL(11, 8)   NOT NULL,
  location_description  TEXT,
  status                ENUM('Active','Closed') NOT NULL DEFAULT 'Active',
  triggered_at          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (alert_id),
  CONSTRAINT fk_alert_user FOREIGN KEY (user_id)
    REFERENCES Users (user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_alert_user ON SOS_Alerts (user_id);

-- ─────────────────────────────────────────
-- Table: Cases
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Cases (
  case_id     INT          NOT NULL AUTO_INCREMENT,
  alert_id    INT          NOT NULL UNIQUE,
  status      ENUM('New','Assigned','In Progress','Resolved','Closed') NOT NULL DEFAULT 'New',
  priority    ENUM('Low','Medium','High','Critical')                   NOT NULL DEFAULT 'High',
  notes       TEXT,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (case_id),
  CONSTRAINT fk_case_alert FOREIGN KEY (alert_id)
    REFERENCES SOS_Alerts (alert_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_case_status ON Cases (status);

-- ─────────────────────────────────────────
-- Table: Assignments
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Assignments (
  assignment_id INT          NOT NULL AUTO_INCREMENT,
  case_id       INT          NOT NULL,
  officer_id    INT          NOT NULL,
  assigned_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by   VARCHAR(100),
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  PRIMARY KEY (assignment_id),
  CONSTRAINT fk_assign_case FOREIGN KEY (case_id)
    REFERENCES Cases (case_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_assign_officer FOREIGN KEY (officer_id)
    REFERENCES Officers (officer_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_assign_case    ON Assignments (case_id);
CREATE INDEX idx_assign_officer ON Assignments (officer_id);

-- ─────────────────────────────────────────
-- Table: Case_Status_History
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Case_Status_History (
  history_id  INT          NOT NULL AUTO_INCREMENT,
  case_id     INT          NOT NULL,
  old_status  VARCHAR(50),
  new_status  VARCHAR(50)  NOT NULL,
  changed_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by  VARCHAR(100),
  remarks     TEXT,
  PRIMARY KEY (history_id),
  CONSTRAINT fk_hist_case FOREIGN KEY (case_id)
    REFERENCES Cases (case_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────
-- Seed: Default Officers for Testing
-- ─────────────────────────────────────────
INSERT IGNORE INTO Officers (name, badge_no, department, phone, is_active) VALUES
  ('Inspector Priya Sharma',  'OFF-001', 'Women Safety Division', '9876543201', TRUE),
  ('Sub-Inspector Rekha Nair','OFF-002', 'Women Safety Division', '9876543202', TRUE),
  ('Inspector Anita Gupta',   'OFF-003', 'Rapid Response Unit',   '9876543203', TRUE),
  ('Officer Sunita Rao',      'OFF-004', 'Patrol Unit',           '9876543204', TRUE);

-- Officer login accounts are stored in Officers table (badge_no = username)
-- Password hash for 'Vigilance@123' (bcrypt, saltRounds=10):
-- $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uElsv/G  (placeholder — will be set via API)
