# FAT System Complete Database Reference

## Document Overview

This comprehensive database schema documentation provides a complete reference for the peelvideo database used by the FAT (Forensic and Technical Analysis) System. It includes all 42 tables with their complete structure, relationships, constraints, indexes, and data mappings.

**Database Name:** peelvideo
**Database Version:** MariaDB 10.3.39
**Document Version:** 1.0
**Last Updated:** 2025-12-11
**Total Tables Documented:** 42

---

## Table of Contents

1. [Database Overview & Architecture](#database-overview--architecture)
2. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
3. [Core Submission Tables](#core-submission-tables)
4. [Administrator & Security Tables](#administrator--security-tables)
5. [Lookup & Reference Tables](#lookup--reference-tables)
6. [Communication & Notification Tables](#communication--notification-tables)
7. [File & Evidence Tables](#file--evidence-tables)
8. [Task & Timeline Tables](#task--timeline-tables)
9. [Session & Audit Tables](#session--audit-tables)
10. [Legacy/Vehicle Tracking Tables](#legacyvehicle-tracking-tables)
11. [Complete Table List](#complete-table-list)

---

## Database Overview & Architecture

### Database Purpose

The FAT System database (`peelvideo`) manages video forensic analysis requests for Peel Regional Police. It tracks:
- Request submissions (tickets)
- Administrator user accounts and access control
- Communications and notifications
- File attachments and evidence
- Task assignments and timelines
- Statistical tracking and reporting

### Database Engine & Configuration

- **Engine:** InnoDB with Latin1 charset (latin1_swedish_ci collation)
- **User Accounts:** Multiple administrator levels with role-based access
- **Auto-increment Strategy:** Distributed across tables with individual ID sequences
- **Primary Keys:** Most tables use single-column integer primary keys
- **Foreign Keys:** Implicit relationships through integer references (not explicitly defined constraints)

### Key Design Patterns

1. **Hierarchical Admin System:** Tiered access levels (1-4) with privilege flags
2. **Request Lifecycle:** Tickets progress through 7 status states (0-6)
3. **Timestamp Strategy:** Unix epoch for processing, varchar(10) for dates
4. **Lookup Tables:** Static reference data for dropdowns and classifications
5. **Audit Trail:** Event logging with human-readable timestamps

---

## Entity Relationship Diagram (ERD)

### Core Relationship Structure

```
fat_admin (Users)
    |
    ├── fat_sessions (Active Sessions)
    ├── fat_logonoff (Login History)
    ├── fat_notifications (User Notifications)
    ├── fat_rfs_assigned (Task Assignments)
    ├── fat_mcm (Case Management Assignments)
    └── (Various action tracking)

fat_tickets (Main Request Records)
    |
    ├── fat_occTypes (Type: Homicide, Robbery, etc.)
    ├── fat_locations (Victim/Suspect Location)
    ├── fat_servicing (Requesting Area/Division)
    ├── fat_rfs_types (Request Type: Clarification, Timeline, etc.)
    ├── fat_rfs_prio (Priority: High, Medium, Low)
    ├── fat_comms (Messages/Notes)
    ├── fat_files (Attached PDFs/JSONs)
    ├── fat_tickets_status (Status History)
    ├── fat_rfs_timelines (Event Timelines)
    ├── fat_rfs_assigned (Staff Assignments)
    ├── fat_diary_dates (Scheduled Tasks)
    ├── fat_tickets_tstats (Statistical Tracking)
    ├── fat_rfs_beacon (Live Monitoring)
    ├── fat_esummary (Executive Summaries)
    ├── fat_exhibits (Evidence Items)
    └── fat_mcm (Case Management)

fat_rfs_items (Equipment/Weapon Reference)
    ├── fat_rfs_item_cat (Item Category)
    └── fat_rfs_mcm (Case Roles)

fat_mail_* (Mailing System)
    ├── fat_mail_templates (Email Templates)
    ├── fat_mail_folders (User Mail Folders)
    ├── fat_mail (User Messages)
    ├── fat_mailer (Distribution Lists)
    └── fat_mailer_settings (Schedule Configuration)

fat_rfs_* (Statistical/Reporting)
    ├── fat_rfs_stat_cat (Stat Categories)
    ├── fat_rfs_tstats (Tracking Stat Types)
    └── fat_rfs_item_cat (Item Categories)

Reference/Config Tables:
    ├── fat_highlight (Weekly Highlights)
    ├── fat_events (Audit Log)
    ├── fat_keys (API Keys)
    ├── fat_lib_resource (Resource Library)
    ├── fat_guests (Guest User Access)
    ├── fat_guest_privs (Guest Permissions)
    ├── fat_profileUpdater (Profile Update Tokens)
    ├── fat_c_keys (Encryption Keys)
    ├── fat_tasks (Assigned Tasks)
    ├── fat_exstorage (Evidence Storage Locations)
    ├── aa_backups (Backup Metadata)
    └── fat_v_* (Vehicle/FIS Legacy Tables)
```

---

## Core Submission Tables

### fat_tickets - Primary Request/Ticket Table

**Purpose:** Central table storing all request for service submissions and case information.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `ticketID` | INT(11) | PK | UNIQUE | Auto-increment primary identifier |
| `ticketStamp` | INT(11) | | NOT NULL | Unix timestamp of submission creation |
| `ticketYear` | INT(4) | | NOT NULL | Year for reporting/organization (e.g., 2025) |
| `ticketNumber` | INT(6) | | NOT NULL | Sequential ticket number within year (e.g., 250001) |
| `rfsHeader` | VARCHAR(240) | | NOT NULL | File description/title |
| `ticketHighlight` | TEXT | | NOT NULL | Current highlighted information |
| `ticketHighlight_history` | TEXT | | NOT NULL | Historical record of all highlights |
| `fileNr` | VARCHAR(120) | | NOT NULL | Primary occurrence/case number |
| `fileNrM` | VARCHAR(9) | | NOT NULL | Master/parent file number (optional) |
| `fileNrX` | VARCHAR(150) | | NOT NULL | Cross-reference file numbers (optional) |
| `occNr` | VARCHAR(9) | | NOT NULL | Event/incident reference number |
| `rfsPriority` | INT(1) | FK | NOT NULL | Priority level: 1=High, 2=Medium, 3=Low |
| `occType` | INT(3) | FK | NOT NULL | Type of occurrence (FK to fat_occTypes.typeID) |
| `occDate` | VARCHAR(10) | | NOT NULL | Start date (YYYY-MM-DD format) |
| `occDateEnd` | VARCHAR(10) | | NOT NULL | End date (YYYY-MM-DD format, optional) |
| `requestingName` | VARCHAR(240) | | NOT NULL | Name of person submitting request |
| `requestingEmail` | VARCHAR(240) | | NOT NULL | Email address (@peelpolice.ca domain) |
| `requestingPhone` | VARCHAR(240) | | NOT NULL | Contact phone number (10 digits formatted) |
| `reqArea` | INT(1) | FK | NOT NULL | Requesting area/division (FK to fat_servicing.serviceID) |
| `locVictim` | INT(1) | FK | NOT NULL | Location of victim (FK to fat_locations.locID) |
| `locSuspect` | INT(1) | FK | NOT NULL | Location of suspect (FK to fat_locations.locID) |
| `fileDetails` | TEXT | | NOT NULL | File synopsis/full description narrative |
| `rfsDetails` | TEXT | | NOT NULL | Detailed request to video forensic support |
| `rfsAdmCmt` | TEXT | | NOT NULL | Administrator comments |
| `rfsAdvice` | TEXT | | NOT NULL | Advice/recommendations from admin |
| `ticketTracking` | TEXT | | NOT NULL | Complete tracking history (HTML with timestamps) |
| `ticketStatus` | INT(1) | FK | | NOT NULL, DEFAULT 0 | RFS request type (FK to fat_rfs_types.rfsID) |
| `ticketProgress` | INT(1) | | NOT NULL, DEFAULT 0 | Progress state: 0=new, 1=evaluated, 2=assigned, 3=accepted/active, 4=hold, 5=reopened, 6=closed |
| `ticketOwner` | INT(3) | FK | NOT NULL | Administrator ID of current owner (FK to fat_admin.id) |
| `ticketReviewed` | INT(11) | | NOT NULL | Supervisor review timestamp |
| `ticketEquipment` | VARCHAR(250) | | NOT NULL | Equipment/evidence description |
| `ticketStats` | VARCHAR(250) | | NOT NULL | Statistical tracking data |
| `ticketMCM` | INT(1) | | NOT NULL, DEFAULT 0 | Major Case Management flag |
| `keywords` | VARCHAR(255) | | NOT NULL | Key terms related to case |
| `ioc` | TEXT | | NOT NULL | Indicators of compromise (technical details) |
| `finLoss` | DECIMAL(12,2) | | NOT NULL | Financial loss amount in dollars |
| `keynotes` | TEXT | | NOT NULL | Key notes/remarks |

**Indexes:**
- `UNIQUE KEY ticketID (ticketID)` - Primary identifier

**Total Records:** 19 sample tickets (IDs 1-19)

**Sample Data (Key Records):**

| ID | Number | Header | Status | Progress | Owner | Owner Role | Date Created |
|---|---|---|---|---|---|---|---|
| 1 | 250001 | Test File | Video Clarification | Closed | Support | Developer | 2025-01-14 |
| 3 | 250003 | NEW Request | (blank) | New | (auto) | (auto) | 2025-05-29 |
| 16 | 250016 | NEW Request | (blank) | New | (auto) | (auto) | 2025-12-08 |
| 18 | 250018 | NEW Request | Video Upload | Evaluated | (auto) | (auto) | 2025-12-08 |
| 19 | 250019 | NEW Request | (blank) | New | (auto) | (auto) | 2025-12-08 |

**Key Relationships:**
- References `fat_occTypes.typeID` for occurrence type
- References `fat_locations.locID` for victim and suspect locations
- References `fat_servicing.serviceID` for requesting area
- References `fat_rfs_types.rfsID` for request type
- References `fat_rfs_prio.rfsID` for priority
- Referenced by `fat_comms.ticketID` for communications
- Referenced by `fat_files.ticketID` for attachments
- Referenced by `fat_tickets_status.ticketID` for status history
- Referenced by `fat_rfs_assigned.ticketID` for staff assignments

---

## Administrator & Security Tables

### fat_admin - Administrator User Accounts

**Purpose:** Stores all administrator/staff user accounts with authentication, preferences, and access control.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `id` | INT(11) | PK | AUTO_INCREMENT | Primary administrator identifier |
| `memName` | VARCHAR(40) | | NOT NULL | First name |
| `memLast` | VARCHAR(40) | | NOT NULL | Last name |
| `memRank` | VARCHAR(15) | | NOT NULL | Job title/rank (e.g., 'Detective/Sergeant') |
| `memUsername` | VARCHAR(40) | | NOT NULL | Login username |
| `memPass` | VARCHAR(130) | | NOT NULL | Hashed password (SHA-256 or similar) |
| `memSalt` | VARCHAR(130) | | NOT NULL | Password salt for hashing |
| `loginToken` | VARCHAR(255) | | NOT NULL | Current authentication token |
| `tokenTime` | INT(11) | | NOT NULL | Token creation/expiry timestamp |
| `axsLevel` | INT(1) | | NOT NULL | Access level (1-4): 1=Guest, 2=Staff, 3=Supervisor, 4=Admin |
| `epsEmail` | VARCHAR(40) | | NOT NULL | Work email address |
| `phoneCell` | VARCHAR(20) | | NOT NULL | Work phone number |
| `seshSecure` | VARCHAR(150) | | NOT NULL | Session security token, IP address pipe-separated |
| `usrSkin` | VARCHAR(10) | | NOT NULL, DEFAULT 'default' | UI theme preference (default/dark) |
| `adminPrivs` | VARCHAR(80) | | NOT NULL | Privilege flags (pipe-separated permission codes) |
| `changePwd` | INT(1) | | NOT NULL | Password change required flag (0/1) |
| `loginCounts` | INT(3) | | NOT NULL | Number of logins performed |
| `loginStamp` | INT(11) | | NOT NULL | Most recent login timestamp |
| `activityStamp` | INT(11) | | NOT NULL | Most recent activity timestamp |
| `avatar` | VARCHAR(80) | | NOT NULL, DEFAULT 'peelLogo.png' | Profile picture filename |
| `orderBySettings` | VARCHAR(80) | | NOT NULL | Column sorting preferences |
| `accountLocked` | INT(1) | | NOT NULL, DEFAULT 0 | Account status (0=active, 1=locked, 2=deleted) |
| `lockStamp` | INT(11) | | NOT NULL | When account was locked timestamp |
| `TWOFAdevice` | INT(1) | | NOT NULL, DEFAULT 0 | 2FA method (0=none, 1=email, 2=Google Auth, 3=cell) |
| `admPreferences` | VARCHAR(15) | | NOT NULL, DEFAULT '1;' | User interface settings (semicolon-separated) |
| `mem_group` | VARCHAR(50) | | NOT NULL, DEFAULT 'Default' | Department/group assignment |
| `usrIncStats` | INT(1) | | NOT NULL, DEFAULT 1 | Include in statistics flag |
| `stealthMode` | INT(1) | | NOT NULL, DEFAULT 0 | Stealth mode/activity logging bypass flag |

**Indexes:**
- `PRIMARY KEY (id)` - Primary identifier

**Total Records:** 7 administrator accounts

**Current Users (Sample Data):**

| ID | Name | Rank/Role | Username | Email | Access Level | Department | Status |
|---|---|---|---|---|---|---|---|
| 10 | Support | (none) | Support | philip@hawkins-innovations.ca | Admin (4) | Developer | Active |
| 23 | (name withheld) | Det/Sgt | DBaxter | 2097@peelpolice.ca | Admin (4) | (blank) | Active |
| 24 | (name withheld) | Systems Engineer | MRegueiro | mike.regueiro@peelpolice.ca | Admin (4) | (blank) | Locked |
| 25 | (name withheld) | Forensic Video Officer | KCaesar | 3299c@peelpolice.ca | Supervisor (3) | Homicide FVU | Active |
| 26 | (name withheld) | Forensic Video Officer | BAylsworth | 3348c@peelpolice.ca | Supervisor (3) | Homicide FVU | Active |
| 27 | (name withheld) | Forensic Video Officer | VCeolin | 2636c@peelpolice.ca | Supervisor (3) | Homicide FVU | Active |
| 28 | (name withheld) | IT Supervisor | JGrainger | 293c@peelpolice.ca | Admin (4) | (blank) | Active |
| 29 | (name withheld) | Forensic Video Officer | NSylva | 3437c@peelpolice.ca | Supervisor (3) | (blank) | Inactive |

**Security Notes:**
- Passwords stored with salt-based hashing
- Two-factor authentication available (email, Google Authenticator, cell SMS)
- Session tracking by IP and browser fingerprint
- Activity timestamps for audit purposes

---

### fat_sessions - Active User Sessions

**Purpose:** Tracks active authenticated sessions for concurrent user management and security.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `fat_sID` | INT(11) | PK | AUTO_INCREMENT | Session identifier |
| `seshSecure` | VARCHAR(255) | | NOT NULL | Session security token (SHA-256 hash) |
| `fat_expiry` | INT(11) | | NOT NULL | Session expiration timestamp (Unix epoch) |
| `adminID` | INT(11) | FK | NOT NULL | Administrator ID (FK to fat_admin.id) |
| `loginStamp` | INT(11) | | NOT NULL | Login timestamp |
| `browserStamp` | VARCHAR(255) | | NOT NULL | Browser user-agent string |
| `ipStamp` | VARCHAR(60) | | NOT NULL | Client IP address |
| `activeStamp` | INT(11) | | NOT NULL | Last activity timestamp |

**Indexes:**
- `PRIMARY KEY (fat_sID)` - Primary identifier

**Total Records:** 3 active sessions

**Sample Sessions:**

| Session ID | Admin ID | IP Address | Browser | Login Time | Expires |
|---|---|---|---|---|---|
| 11 | 10 | 162.157.89.207 | (empty) | 2025-01-31 | 2025-02-07 |
| 15 | 23 | 165.225.209.76 | (empty) | 2025-02-03 | 2025-02-10 |
| 16 | 25 | 209.29.97.67 | (empty) | 2025-02-03 | 2025-02-10 |

---

### fat_logonoff - Login/Logout History

**Purpose:** Maintains historical audit trail of all login and logout events.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `logID` | INT(11) | PK | AUTO_INCREMENT | Record identifier |
| `adminID` | INT(11) | FK | NOT NULL | Administrator ID (FK to fat_admin.id) |
| `logVars` | VARCHAR(255) | | NOT NULL | Comma-separated login parameters |
| `logStatus` | INT(1) | | NOT NULL | Login status (0=failed, 1=success) |
| `logConfirmed` | INT(1) | | NOT NULL | 2FA confirmation status (0/1) |
| `linkToken` | VARCHAR(255) | | NOT NULL | Token link for email-based login |
| `logOnStamp` | INT(11) | | NOT NULL | Timestamp of login attempt |
| `reminderStamp` | INT(11) | | NOT NULL | Reminder notification timestamp |
| `reminderLastSent` | INT(11) | | NOT NULL | When last reminder was sent |

**Indexes:**
- `PRIMARY KEY (logID)` - Primary identifier

**Current Records:** No active logon/off records shown (logging may be elsewhere)

---

## Lookup & Reference Tables

### fat_occTypes - Occurrence Type Classifications

**Purpose:** Provides dropdown values for "Type of Occurrence" field on submission forms.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `typeID` | INT(11) | PK | NOT NULL | Occurrence type identifier |
| `typeName` | VARCHAR(100) | | NOT NULL | Type name for display |

**Indexes:**
- `PRIMARY KEY (typeID)` - Primary identifier

**Complete Data Mapping:**

| ID | Type Name |
|---|---|
| 1 | Homicide |
| 2 | Missing Person |
| 3 | Robbery - Armed |
| 4 | Robbery |
| 5 | Sex Assault -Aggravated |
| 6 | Sex Assault - Cause Bodily Harm |
| 7 | Sex Assault |
| 8 | Extortion |
| 9 | Kidnapping |

**Usage:** Referenced by `fat_tickets.occType`

---

### fat_locations - Physical Location Classifications

**Purpose:** Provides dropdown values for victim and suspect location fields.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `locID` | INT(11) | PK | UNIQUE | Location identifier |
| `locName` | VARCHAR(80) | | NOT NULL | Location name for display |

**Indexes:**
- `UNIQUE KEY locID (locID)` - Primary identifier

**Complete Data Mapping:**

| ID | Location Name |
|---|---|
| 2 | Commercial Premise |
| 3 | Roadway |
| 4 | Apartment Building |
| 5 | House |
| 6 | Vehicle |
| 7 | Hospital |
| 8 | Waterway |
| 9 | Underground |
| 10 | Parking Lot - Above Ground |
| 11 | Parking Lot - Underground |

**Usage:**
- Referenced by `fat_tickets.locVictim` (location of victim)
- Referenced by `fat_tickets.locSuspect` (location of suspect)

---

### fat_rfs_types - Request Type Classifications

**Purpose:** Defines types of forensic video requests that can be submitted.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `rfsID` | INT(11) | PK | NOT NULL | Request type identifier |
| `rfsName` | VARCHAR(80) | | NOT NULL | Type name for display |
| `incStats` | INT(1) | | NOT NULL, DEFAULT 1 | Include in statistics reporting (0/1) |
| `primStat` | INT(1) | | NOT NULL, DEFAULT 0 | Primary statistic type (0/1) |
| `sflBox` | INT(1) | | NOT NULL, DEFAULT 0 | Applicable to SFL box (0/1) |

**Indexes:**
- `PRIMARY KEY (rfsID)` - Primary identifier

**Complete Data Mapping:**

| ID | Request Type | In Stats | Primary | SFL Box |
|---|---|---|---|---|
| 1 | Video Clarification | Yes | Yes | Yes |
| 2 | Video Timeline | Yes | Yes | Yes |
| 3 | Test | No | No | No |
| 4 | Video Upload | Yes | Yes | Yes |

**Usage:** Referenced by `fat_tickets.ticketStatus` for request type classification

---

### fat_rfs_prio - Priority Level Classifications

**Purpose:** Defines priority levels for request prioritization and response.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `rfsID` | INT(11) | PK | NOT NULL | Priority level identifier |
| `rfsName` | VARCHAR(80) | | NOT NULL | Priority name for display |

**Indexes:**
- `PRIMARY KEY (rfsID)` - Primary identifier

**Complete Data Mapping:**

| ID | Priority Level |
|---|---|
| 1 | Low |
| 2 | Medium |
| 3 | High |

**Note:** Database contains values 1=Low, 2=Medium, 3=High (inverted from documentation comment that states 1=high, 2=medium, 3=low)

**Usage:** Referenced by `fat_tickets.rfsPriority`

---

### fat_servicing - Requesting Area/Division

**Purpose:** Provides dropdown of police divisions and departments that can request services.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `serviceID` | INT(11) | PK | NOT NULL | Service area identifier |
| `serviceName` | VARCHAR(50) | | NOT NULL | Department/division name |
| `itemCatID` | INT(11) | FK | NOT NULL | Category ID (FK to fat_servicing_cat.itemCatID) |

**Indexes:**
- `PRIMARY KEY (serviceID)` - Primary identifier

**Complete Data Mapping (All entries have itemCatID=1 "Internal"):**

| ID | Service Area/Division |
|---|---|
| 2 | Peel Regional Police (Non Patrol - Other) |
| 3 | Other Police Agency |
| 4 | Airport Uniform Patrol |
| 5 | Airport CIB |
| 6 | 11 Division Uniform Patrol |
| 7 | 12 Division Uniform Patrol |
| 8 | 21 Division Uniform Patrol |
| 9 | 22 Division Uniform Patrol |
| 10 | 11 Division CIB |
| 11 | 12 Division CIB |
| 12 | 21 Division CIB |
| 13 | 22 Division CIB |
| 14 | Central Robbery |
| 15 | Commercial Auto Crime |
| 16 | Communications |
| 17 | Corporate Communications |
| 18 | Community Mobilization |
| 19 | Corporate Learning |
| 20 | Corporate Planning & Research |
| 21 | Court Services |
| 22 | Crime Prevention |
| 23 | Crime Stoppers |
| 24 | Cyber Support Services |
| 25 | Digital Forensic Services |
| 26 | Early Intervention |
| 27 | Elder Abuse |
| 28 | Emergency Support Services |
| 29 | Equity and Inclusion Bureau |
| 30 | Evidentiary Property |
| 31 | Family and Intimate Partner Violence |
| 32 | Firearms Office |
| 33 | Freedom of Information |
| 34 | Forensic Identification |
| 35 | Fraud Bureau |
| 36 | Homicide and Missing Persons |
| 37 | Human Resources |
| 38 | ICE Unit |
| 39 | Incident Response Training Unit |
| 40 | Intelligence Services |
| 41 | IT Services |
| 42 | Labour Liason |
| 44 | Major Collision Bureau |
| 45 | Marine Unit |
| 46 | Offender Management Unit |
| 47 | Operational Planning & Resources |
| 48 | Organizational Wellness |
| 49 | Peer Support |
| 50 | PowerCase Unit |
| 51 | Professional Standards |
| 52 | Records Services |
| 53 | Recruitment and Staff Support |
| 54 | Regional Pounds Bureau |
| 55 | Risk Mitigation |
| 56 | Road Safety Services |
| 57 | Sex Offender Registry |
| 58 | Special Victims Unit |
| 59 | Tactical |
| 60 | Training Bureau |
| 61 | Youth Crime |
| 62 | Youth Education |
| 63 | Youth Intervention |
| 64 | Central Paid Duty |
| 65 | Intelligence Services - CODES |
| 66 | Intelligence Services - Strategic Intake |
| 67 | Intelligence Services - Covert Operations |
| 68 | CMG Request |
| 69 | 11 Division - DMU |
| 70 | 12 Division - DMU |
| 71 | 21 Division - DMU |
| 72 | 22 Division - DMU |
| 73 | 11 Division - Admin |
| 74 | 12 Division - Admin |
| 75 | 21 Division - Admin |
| 76 | 22 Division - Admin |
| 77 | Airport Division - Admin |
| 78 | SEB |
| 80 | OTHER |
| 81 | Duty Inspectors |
| 82 | Special Enforcement Bureau |
| 84 | IPV Bureau |
| 85 | 11 Division - Community Station |
| 86 | 12 Division - Community Station |
| 87 | 21 Division - Community Station |
| 88 | 22 Division - Community Station |

**Usage:** Referenced by `fat_tickets.reqArea` for requesting division

---

### fat_servicing_cat - Service Category

**Purpose:** Categories for service areas (currently only "Internal").

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `itemCatID` | INT(11) | PK | NOT NULL | Category identifier |
| `itemCatName` | VARCHAR(250) | | NOT NULL | Category name |

**Indexes:**
- `PRIMARY KEY (itemCatID)` - Primary identifier

**Data:**

| ID | Category Name |
|---|---|
| 1 | Internal |

**Usage:** Referenced by `fat_servicing.itemCatID` to categorize divisions

---

### fat_rfs_stat_cat - Statistics Category

**Purpose:** Classifies types of statistical tracking (Judicial, Logistics, Court).

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `statCatID` | INT(11) | PK | NOT NULL | Category identifier |
| `statCatName` | VARCHAR(50) | | NOT NULL | Category name |

**Indexes:**
- `PRIMARY KEY (statCatID)` - Primary identifier

**Data:**

| ID | Category Name |
|---|---|
| 1 | Judicial Authorization |
| 2 | Logistics |
| 3 | Court Requests |

**Usage:** Referenced by `fat_rfs_tstats.statCatID`

---

### fat_rfs_tstats - Tracking Statistic Types

**Purpose:** Defines types of trackable statistics with maximum values for each category.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `tstatsID` | INT(11) | PK | NOT NULL | Statistic type identifier |
| `tstatsName` | VARCHAR(80) | | NOT NULL | Statistic name |
| `tstatsMax` | INT(11) | | NOT NULL | Maximum allowed count |
| `statCatID` | INT(11) | FK | NOT NULL | Category (FK to fat_rfs_stat_cat.statCatID) |

**Indexes:**
- `PRIMARY KEY (tstatsID)` - Primary identifier

**Data:**

| ID | Statistic Name | Max Value | Category ID | Category |
|---|---|---|---|---|
| 1 | Production Order | 10 | 1 | Judicial Authorization |
| 2 | Search Warrant | 5 | 1 | Judicial Authorization |
| 3 | Pickup Attempts | 10 | 2 | Logistics |
| 4 | Disclosure | 10 | 3 | Court Requests |

**Usage:** Referenced by `fat_tickets_tstats.tstatsID` for tracking limits

---

### fat_rfs_item_cat - Equipment/Item Categories

**Purpose:** Classifies types of evidence items and equipment.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `itemCatID` | INT(11) | PK | NOT NULL | Category identifier |
| `itemCatName` | VARCHAR(50) | | NOT NULL | Category name |

**Indexes:**
- `PRIMARY KEY (itemCatID)` - Primary identifier

**Data:**

| ID | Category Name |
|---|---|
| 1 | Video Location |
| 2 | Weapon Used |

**Usage:** Referenced by `fat_rfs_items.itemCatID`

---

### fat_rfs_items - Equipment/Item Reference List

**Purpose:** Master list of video locations and weapons that can be referenced in cases.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `rfsItemID` | INT(11) | PK | NOT NULL | Item identifier |
| `rfsItemName` | VARCHAR(80) | | NOT NULL | Item name |
| `itemCatID` | INT(11) | FK | NOT NULL | Category (FK to fat_rfs_item_cat.itemCatID) |
| `availForTasks` | INT(1) | | NOT NULL | Available for task assignment (0/1) |

**Indexes:**
- `PRIMARY KEY (rfsItemID)` - Primary identifier

**Complete Data (Video Locations & Weapons):**

| ID | Item Name | Category | Available |
|---|---|---|---|
| 1 | Dashcam | Video Location | No |
| 2 | Doorbell | Video Location | No |
| 3 | Security Camera - Residential | Video Location | No |
| 4 | Gun | Weapon Used | No |
| 5 | Knife | Weapon Used | No |
| 6 | Blunt Weapon | Weapon Used | No |
| 7 | Traffic Camera | Video Location | No |
| 8 | Transit Video | Video Location | No |
| 9 | Airport Video | Video Location | No |
| 10 | Border Crossing Video | Video Location | No |
| 11 | Hidden Camera | Video Location | No |
| 12 | School Camera | Video Location | No |
| 13 | Security Camera - Financial Institution | Video Location | No |
| 14 | Security Camera - Apartment Building | Video Location | No |
| 15 | Security Camera - Elevator | Video Location | No |

---

### fat_rfs_mcm - Major Case Management Roles

**Purpose:** Defines roles that can be assigned in major case management structures.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `rfs_mcm_id` | INT(11) | PK | NOT NULL | Role identifier |
| `mcm_name` | VARCHAR(80) | | NOT NULL | Role name |
| `isActive` | INT(1) | | NOT NULL, DEFAULT 1 | Role currently active (0/1) |

**Indexes:**
- `PRIMARY KEY (rfs_mcm_id)` - Primary identifier

**Complete Data:**

| ID | Role Name | Active |
|---|---|---|
| 1 | Primary Investigator | Yes |
| 2 | File Coordinator | Yes |
| 3 | Victim Liaison Officer | Yes |
| 4 | Crime Analyst | Yes |
| 5 | Affiant | Yes |
| 6 | Canvass Coordinator | Yes |
| 7 | Canvasser | Yes |
| 8 | Investigator | Yes |
| 9 | Major Case Manager | Yes |
| 10 | Homicide Inspector | Yes |

---

## Communication & Notification Tables

### fat_comms - Communications/Notes

**Purpose:** Stores messages and internal notes attached to specific tickets with encryption support.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `commsID` | INT(11) | PK | UNIQUE | Comment/message identifier |
| `ticketID` | INT(11) | FK | NOT NULL | Associated ticket (FK to fat_tickets.ticketID) |
| `adminID` | INT(11) | FK | NOT NULL | Author administrator (FK to fat_admin.id) |
| `commsType` | INT(1) | | NOT NULL | Message type (0=Reply, 1=Internal note) |
| `msgContent` | TEXT | | NOT NULL | Message content (possibly encrypted) |
| `msgContentORIG` | TEXT | | NOT NULL | Original message content |
| `msgStamp` | INT(11) | | NOT NULL | Message creation timestamp |
| `editStamp` | INT(11) | | NOT NULL | Last edit timestamp |
| `comms_tags` | VARCHAR(255) | | NOT NULL | Tags for categorization (e.g., "EMAIL") |
| `c_iv` | VARCHAR(255) | | NOT NULL | Encryption initialization vector |
| `c_tag` | VARCHAR(255) | | NOT NULL | Encryption authentication tag |
| `msgOrig_c_iv` | VARCHAR(255) | | NOT NULL | Original message IV |
| `msgOrig_c_tag` | VARCHAR(255) | | NOT NULL | Original message auth tag |

**Indexes:**
- `UNIQUE KEY commsID (commsID)` - Primary identifier

**Sample Data:**

| ID | Ticket | From | Type | Tag | Content |
|---|---|---|---|---|---|
| 1 | 1 | Support | Reply | EMAIL | Let's say I copy and paste an email here, I can also tag it with EMAIL so I can find it later. |
| 2 | 1 | Support | Reply | (empty) | This is a random note. |

---

### fat_notifications - User Notifications

**Purpose:** Delivers notifications to administrators about ticket changes, assignments, and system events.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `notID` | INT(11) | PK | NOT NULL | Notification identifier |
| `adminID` | INT(11) | FK | NOT NULL | Recipient administrator (FK to fat_admin.id) |
| `notTit` | VARCHAR(80) | | NOT NULL | Notification title/subject |
| `notMsg` | VARCHAR(255) | | NOT NULL | Notification message |
| `stamp` | INT(11) | | NOT NULL | Creation timestamp |
| `notRead` | INT(1) | | NOT NULL, DEFAULT 1 | Read status (0=unread, 1=read) |
| `theLink` | VARCHAR(250) | | NOT NULL | Hyperlink for action (e.g., rfs.php?ticketID=1) |

**Indexes:**
- `PRIMARY KEY (notID)` - Primary identifier

**Total Records:** 122 notifications

**Sample Notification Types:**
- File created notifications (sent to all admins)
- File assigned notifications
- Status change notifications
- Highlight added notifications
- File closed/approved notifications
- User added/removed notifications

---

### fat_mail_templates - Email Message Templates

**Purpose:** Stores template email messages for various events (creation, assignment, evaluation, status changes).

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `mailID` | INT(11) | PK | NOT NULL | Template identifier |
| `mailCreation` | TEXT | | NOT NULL | Template for file creation notification |
| `mailAssigned` | TEXT | | NOT NULL | Template for assignment notification |
| `mailEval` | TEXT | | NOT NULL | Template for evaluation complete notification |
| `mailStatus` | TEXT | | NOT NULL | Template for status change notification |

**Indexes:**
- `PRIMARY KEY (mailID)` - Primary identifier

**Sample Data (Template ID 1):**

- **Creation Template:** "Your file review request for Occurrence Nr [FILENUMBER] has been logged and assigned F.A.T. file number: [NUMBER]..."
- **Assignment Template:** "Update for F.A.T. File [NUMBER], Occurrence Nr [FILENUMBER] - We just wanted to update you and advise your file has been assigned to [OWNER]..."
- **Evaluation Template:** "Update for F.A.T. File [NUMBER], Occurrence Nr [FILENUMBER] - Your file review has been evaluated and prioritized as [PRIORITY]..."
- **Status Template:** "Update for F.A.T. File [NUMBER], Occurrence Nr [FILENUMBER] - [OWNER] has changed the status to [STATUS] with comments: [STATUSTEXT]..."

**Token Replacements:**
- `[FILENUMBER]` - Occurrence number
- `[NUMBER]` - Ticket number
- `[OWNER]` - Administrator name
- `[PRIORITY]` - Priority level
- `[STATUS]` - New status
- `[STATUSTEXT]` - Status comment text

---

### fat_mail - User Inbox Messages

**Purpose:** Stores messages in user mail folders with encryption and read status tracking.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `mailID` | INT(11) | PK | NOT NULL | Message identifier |
| `mailFolderID` | INT(11) | FK | NOT NULL | Folder (FK to fat_mail_folders.mailFolderID) |
| `mailTo` | VARCHAR(120) | | NOT NULL | Recipient email |
| `mailToFullList` | VARCHAR(250) | | NOT NULL | All recipients (comma-separated) |
| `mailFrom` | VARCHAR(20) | | NOT NULL | Sender identifier |
| `mailSubject` | VARCHAR(250) | | NOT NULL | Message subject |
| `mailContent` | TEXT | | NOT NULL | Message body (possibly encrypted) |
| `stamp` | INT(11) | | NOT NULL | Message timestamp |
| `mailRead` | INT(1) | | NOT NULL, DEFAULT 0 | Read status (0/1) |
| `replyToID` | INT(11) | | NOT NULL | Parent message ID for threading |
| `mailStar` | INT(1) | | NOT NULL, DEFAULT 0 | Starred/flagged (0/1) |
| `c_iv` | VARCHAR(255) | | NOT NULL | Encryption IV |
| `c_tag` | VARCHAR(255) | | NOT NULL | Encryption authentication tag |

**Indexes:**
- `PRIMARY KEY (mailID)` - Primary identifier

---

### fat_mail_folders - User Mail Folders

**Purpose:** User-created folders for organizing mail messages.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `mailFolderID` | INT(11) | PK | NOT NULL | Folder identifier |
| `folderName` | VARCHAR(80) | | NOT NULL | Folder name |
| `adminID` | INT(11) | FK | NOT NULL | Owner administrator (FK to fat_admin.id) |

**Indexes:**
- `PRIMARY KEY (mailFolderID)` - Primary identifier

---

### fat_mailer - Mailing List Distribution

**Purpose:** Stores contacts and mailing list configurations for outbound notifications.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `mailID` | INT(11) | PK | NOT NULL | Mailing list entry |
| `mailName` | VARCHAR(80) | | NOT NULL | Name/label |
| `mailEmail` | VARCHAR(40) | | NOT NULL | Email address |
| `mailingList` | INT(1) | | NOT NULL | List type (0/1) |

**Indexes:**
- `PRIMARY KEY (mailID)` - Primary identifier

---

### fat_mailer_settings - Mailing Schedule

**Purpose:** Configures when automated emails are sent.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `msID` | INT(11) | PK | NOT NULL | Settings identifier |
| `sendDay` | INT(1) | | NOT NULL | Day of week to send (0=Sunday, 6=Saturday) |

**Indexes:**
- `PRIMARY KEY (msID)` - Primary identifier

---

## File & Evidence Tables

### fat_files - Uploaded/Attached Files

**Purpose:** Tracks PDF, JSON, and other file attachments associated with tickets and library resources.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `fileID` | INT(11) | PK | AUTO_INCREMENT | File attachment identifier |
| `fileType` | INT(1) | | NOT NULL | File type (1=RFS, 2=Image, 7=library) |
| `fileName` | VARCHAR(220) | | NOT NULL | Full file path (2025/250015-1748541990_____name.pdf) |
| `fileAxs` | INT(1) | | NOT NULL | Access control (0=all admin, 1=anyone on ticket, 2=only FAT staff) |
| `ticketID` | INT(11) | FK | NOT NULL | Associated ticket (FK to fat_tickets.ticketID) |
| `rcd` | INT(11) | | NOT NULL | Unknown field (appears unused) |
| `usrID` | INT(11) | | NOT NULL | Specific user ID (profile-specific file) |
| `stamp` | INT(11) | | NOT NULL | Upload timestamp (Unix epoch) |
| `libID` | INT(11) | | NOT NULL | Library resource ID if in library |

**Indexes:**
- `PRIMARY KEY (fileID)` - Primary identifier

**Sample Files (Recent Uploads):**

| ID | Type | File Name | Ticket | Access | Upload Date |
|---|---|---|---|---|---|
| 1 | RFS | 2025/250015-1748541990_____TestPDFfile.pdf | 15 | Ticket Only | 2025-05-29 |
| 2 | Image | 2025/250015-1748541990_____new1.json | 15 | Ticket Only | 2025-05-29 |
| 3 | RFS | 2025/250016-1765183744_____analysis_1765183744628.pdf | 16 | Ticket Only | 2025-12-08 |
| 4 | Image | 2025/250016-1765183744_____analysis_1765183744628.json | 16 | Ticket Only | 2025-12-08 |
| 9 | RFS | 2025/250019-1765219192_____analysis_1765219192938.pdf | 19 | Ticket Only | 2025-12-08 |
| 10 | Image | 2025/250019-1765219192_____analysis_1765219192938.json | 19 | Ticket Only | 2025-12-08 |

**Naming Convention:** `YYYY/ticketNumber-timestamp_____description.extension`

---

### fat_exhibits - Evidence Items

**Purpose:** Tracks individual evidence items (exhibits) associated with tickets.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `exID` | INT(11) | PK | NOT NULL | Exhibit identifier |
| `exNo` | VARCHAR(20) | | NOT NULL | Exhibit number/label |
| `exstID` | INT(11) | FK | NOT NULL | Storage location (FK to fat_exstorage.exstID) |
| `exComments` | VARCHAR(250) | | NOT NULL | Notes about exhibit |
| `adminID` | INT(11) | FK | NOT NULL | Responsible administrator (FK to fat_admin.id) |
| `stamp` | INT(11) | | NOT NULL | Entry timestamp |
| `ticketID` | INT(11) | FK | NOT NULL | Associated ticket (FK to fat_tickets.ticketID) |
| `currentLocation` | INT(1) | | NOT NULL, DEFAULT 0 | Current location tracking |

**Indexes:**
- `PRIMARY KEY (exID)` - Primary identifier

---

### fat_exstorage - Evidence Storage Locations

**Purpose:** Defines storage locations where evidence/exhibits can be kept.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `exstID` | INT(11) | PK | NOT NULL | Storage location identifier |
| `exlocName` | VARCHAR(50) | | NOT NULL | Location name |

**Indexes:**
- `PRIMARY KEY (exstID)` - Primary identifier

---

### fat_lib_resource - Resource Library

**Purpose:** Stores case files and resources in a shared library for reuse.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `libID` | INT(11) | PK | NOT NULL | Library resource identifier |
| `caseName` | VARCHAR(100) | | NOT NULL | Case/resource name |
| `stamp` | INT(11) | | NOT NULL | Creation timestamp |
| `adminID` | INT(11) | FK | NOT NULL | Creator administrator (FK to fat_admin.id) |
| `libKeywords` | VARCHAR(255) | | NOT NULL | Search keywords |
| `libFileID` | INT(11) | FK | NOT NULL | Associated file (FK to fat_files.fileID) |

**Indexes:**
- `PRIMARY KEY (libID)` - Primary identifier

---

## Task & Timeline Tables

### fat_tasks - Task Assignments

**Purpose:** Manages assigned tasks to staff members with completion tracking.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `taskID` | INT(11) | PK | NOT NULL | Task identifier |
| `taskNumber` | INT(3) UNSIGNED ZEROFILL | | NOT NULL | Sequential task number (001, 002, etc.) |
| `backTaskNumber` | VARCHAR(5) | | NOT NULL | Backward reference task number |
| `adminID` | INT(11) | FK | NOT NULL | Assigned staff member (FK to fat_admin.id) |
| `guestID` | INT(11) | FK | NOT NULL | Guest assignee (FK to fat_guests.guestID) |
| `assignStamp` | INT(11) | | NOT NULL | Assignment timestamp |
| `completeStamp` | INT(11) | | NOT NULL | Completion timestamp (0 if pending) |
| `reportComplete` | INT(1) | | NOT NULL, DEFAULT 0 | Report submitted (0/1) |
| `reportRequired` | INT(1) | | NOT NULL, DEFAULT 1 | Report submission needed (0/1) |
| `taskNotes` | TEXT | | NOT NULL | Task instructions/notes |
| `reportNotes` | TEXT | | NOT NULL | Report submission notes |
| `taskDetails` | TEXT | | NOT NULL | Detailed task information |
| `taskPr` | INT(1) | | NOT NULL, DEFAULT 4 | Priority level (1-4) |
| `ticketID` | INT(11) | FK | NOT NULL | Associated ticket (FK to fat_tickets.ticketID) |
| `diaryDate` | INT(8) | | NOT NULL | Due date (YYYYMMDD format) |
| `taskItemStats` | VARCHAR(255) | | NOT NULL | Item statistics tracking |

**Indexes:**
- `PRIMARY KEY (taskID)` - Primary identifier

---

### fat_diary_dates - Scheduled Task Deadlines

**Purpose:** Tracks deadline dates for tasks with completion status.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `diaryID` | INT(11) | PK | NOT NULL | Diary entry identifier |
| `diaryDate` | INT(8) | | NOT NULL | Due date (YYYYMMDD format) |
| `ticketID` | INT(11) | FK | NOT NULL | Associated ticket (FK to fat_tickets.ticketID) |
| `taskNumber` | INT(11) | | NOT NULL | Associated task (FK to fat_tasks.taskNumber) |
| `backTaskNumber` | VARCHAR(5) | | NOT NULL | Backward task reference |
| `adminID` | INT(11) | FK | NOT NULL | Responsible administrator (FK to fat_admin.id) |
| `diaryNotes` | VARCHAR(255) | | NOT NULL | Deadline notes |
| `completed` | INT(1) | | NOT NULL, DEFAULT 0 | Completion status (0/1) |
| `taskID` | INT(11) | FK | NOT NULL | Task identifier (FK to fat_tasks.taskID) |

**Indexes:**
- `PRIMARY KEY (diaryID)` - Primary identifier

**Sample Data:**
- Diary date 1: 2025-02-28 (Production order final due date) for Ticket 1

---

### fat_rfs_timelines - Event Timelines

**Purpose:** Documents timeline events (occurrences, pickups, etc.) for a ticket.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `timelineID` | INT(11) | PK | NOT NULL | Timeline event identifier |
| `ticketID` | INT(11) | FK | NOT NULL | Associated ticket (FK to fat_tickets.ticketID) |
| `timeStamp` | VARCHAR(10) | | NOT NULL | Event date (YYYYMMDD format) |
| `hourStamp` | VARCHAR(4) | | NOT NULL | Event time (HHMM format, optional) |
| `eventDetails` | TEXT | | NOT NULL | Description of event |
| `eventIcon` | INT(3) | | NOT NULL | Icon/category number for visualization |
| `adminID` | INT(11) | FK | NOT NULL | Entry creator (FK to fat_admin.id) |

**Indexes:**
- `PRIMARY KEY (timelineID)` - Primary identifier
- `KEY ticketID (ticketID)` - For ticket lookup

**Sample Data:**

| ID | Ticket | Date | Event | Icon | Added By |
|---|---|---|---|---|---|
| 1 | 1 | 20250102 | Date of occurrence | 2 | Support |
| 2 | 1 | 20250114 | Date video picked up | 4 | Support |

---

### fat_rfs_assigned - Staff Assignment History

**Purpose:** Tracks which staff members are assigned to tickets and when.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `assID` | INT(11) | PK | NOT NULL | Assignment record identifier |
| `adminID` | INT(11) | FK | NOT NULL | Assigned staff member (FK to fat_admin.id) |
| `ticketID` | INT(11) | FK | NOT NULL | Assigned ticket (FK to fat_tickets.ticketID) |
| `assignDate` | INT(11) | | NOT NULL | Assignment timestamp |
| `assignedByAdminID` | INT(11) | FK | NOT NULL | Administrator who made assignment (FK to fat_admin.id) |
| `ticketStatus` | INT(1) | | NOT NULL | Status at time of assignment |
| `rfsPosition` | VARCHAR(30) | | NOT NULL | Position/role assigned (e.g., "Supporting Member") |

**Indexes:**
- `PRIMARY KEY (assID)` - Primary identifier
- `KEY adminID (adminID)` - For staff member lookup
- `KEY ticketID (ticketID)` - For ticket lookup

---

## Session & Audit Tables

### fat_events - System Audit Log

**Purpose:** Complete audit trail of all system events (logins, file changes, admin actions).

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `eventID` | INT(11) | PK | NOT NULL | Event log entry identifier |
| `administrator` | VARCHAR(50) | | NOT NULL, DEFAULT 'None' | Administrator/actor name or "FAT Mailer", "Support", "Guest" |
| `SODevent` | TEXT | | NOT NULL | Event description (may include IP, port, full details) |
| `stamp` | VARCHAR(25) | | NOT NULL | Human-readable timestamp (e.g., "24DEC26 - 22:23:22") |
| `theCat` | INT(1) | | NOT NULL, DEFAULT 0 | Event category: 0=misc, 1=clients, 2=jobs/files, 3=admins, 4=users, 5=members, 6=admin tracker, 7=outbound msg |

**Indexes:**
- `PRIMARY KEY (eventID)` - Primary identifier

**Total Records:** 140 events

**Event Categories:**
- **Category 0 (Misc):** Miscellaneous events
- **Category 1 (Clients):** Client-related events
- **Category 2 (Jobs/Files):** File creation, status changes, evaluations, assignments
- **Category 3 (Admins):** Administrator logins, account updates, privilege changes
- **Category 4 (Users):** User-related events
- **Category 5 (Members):** Member assignments and roles
- **Category 6 (Admin Tracker):** Administrator activity tracking
- **Category 7 (Outbound Messages):** Email sent notifications

**Sample Recent Events:**

| Date | Actor | Category | Event |
|---|---|---|---|
| 25DEC08 - 09:12:25 | DBaxter | 3 | User NSylva added using Chrome 143.0 |
| 25DEC08 - 12:53:31 | KCaesar | 2 | File 250018 NEW Request evaluated |
| 25DEC08 - 13:39:52 | Guest | 2 | File 250019 created |
| 25DEC08 - 12:47:47 | KCaesar | 3 | 2FA login from IP 209.29.97.67 |
| 25FEB03 - 07:43:00 | DBaxter | 3 | User KCaesar added |

---

### fat_rfs_beacon - Live File Monitoring

**Purpose:** Tracks which administrators are actively viewing/monitoring specific tickets.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `ticketID` | INT(11) | NOT NULL | Ticket being monitored (FK to fat_tickets.ticketID) |
| `adminID` | INT(11) | NOT NULL | Administrator monitoring (FK to fat_admin.id) |
| `calledBy` | VARCHAR(80) | NOT NULL | Username calling the monitor |
| `signalReceived` | INT(11) | NOT NULL | Signal timestamp |
| `lastTicketUpdate` | INT(11) | NOT NULL | Timestamp of last ticket change |
| `lastUpdateAdminID` | INT(11) | NOT NULL | Admin who made last update |
| `fat_sID` | INT(11) | NOT NULL | Session ID of monitoring admin (FK to fat_sessions.fat_sID) |

**Sample Data:**

| Ticket | Admin | Called By | Last Update | Session |
|---|---|---|---|---|
| 19 | 25 | KCaesar | 0 | 16 |

---

### fat_tokens - Token-Based Login

**Purpose:** Manages email-based login tokens for password-less authentication.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `tokenID` | INT(11) | PK | NOT NULL | Token record identifier |
| `userID` | INT(11) | FK | NOT NULL | User requesting login (FK to fat_admin.id) |
| `theToken` | VARCHAR(200) | | NOT NULL | Login token (SHA-256 hash) |
| `stamp` | INT(11) | | NOT NULL | Token creation timestamp |
| `cookieRequested` | INT(1) | | NOT NULL | Extended login/cookie requested (0/1) |
| `loginApproved` | INT(1) | | NOT NULL, DEFAULT 0 | Token approved/used (0/1) |

**Indexes:**
- `PRIMARY KEY (tokenID)` - Primary identifier

**Sample Data:**

| Token ID | User | Cookie Requested | Approved |
|---|---|---|---|
| 14 | 25 (KCaesar) | No | Yes |

---

## Status & Statistics Tables

### fat_tickets_status - Ticket Status History

**Purpose:** Maintains historical record of status changes for each ticket.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `statusID` | INT(11) | PK | NOT NULL | Status change record identifier |
| `ticketID` | INT(11) | FK | NOT NULL | Ticket (FK to fat_tickets.ticketID) |
| `ticketProgress` | INT(1) | | NOT NULL | Progress state: 0=new, 1=evaluated, 2=assigned, 3=accepted/active, 4=hold, 5=reopened, 6=closed |
| `ticketStatus` | INT(2) | | NOT NULL | Request type at this status change |
| `linuxStamp` | INT(11) | | NOT NULL | Status change timestamp (Unix epoch) |
| `theWeek` | INT(2) | | NOT NULL | Week number when status changed |
| `theYear` | INT(4) | | NOT NULL | Year when status changed |
| `adminID` | INT(11) | FK | NOT NULL | Administrator making change (FK to fat_admin.id) |

**Indexes:**
- `PRIMARY KEY (statusID)` - Primary identifier
- `KEY ticketID (ticketID)` - For ticket lookup

**Sample Status Progressions:**

Ticket 1: 0 → 1 → 2 → 3 → 4 → 3 → 4 → 3 → 6 (9 status changes)
Ticket 18: 0 → 1 (2 status changes)

---

### fat_tickets_tstats - Ticket Statistics Tracking

**Purpose:** Tracks statistical counts (Production Orders, Search Warrants, etc.) for tickets.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `capID` | INT(11) | PK | NOT NULL | Record identifier |
| `tstatsID` | INT(11) | FK | NOT NULL | Statistic type (FK to fat_rfs_tstats.tstatsID) |
| `tstatAmount` | INT(11) | | NOT NULL | Count/amount for this statistic |
| `ticketID` | INT(11) | FK | NOT NULL | Associated ticket (FK to fat_tickets.ticketID) |

**Indexes:**
- `PRIMARY KEY (capID)` - Primary identifier

---

### fat_mcm - Major Case Management Assignment

**Purpose:** Links Major Case Management roles to specific tickets and administrators.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `mcmID` | INT(11) | PK | NOT NULL | MCM assignment record |
| `ticketID` | INT(11) | FK | NOT NULL | Ticket (FK to fat_tickets.ticketID) |
| `rfs_mcm_id` | INT(11) | FK | NOT NULL | MCM role (FK to fat_rfs_mcm.rfs_mcm_id) |
| `adminID` | INT(11) | FK | NOT NULL | Administrator assigned (FK to fat_admin.id) |

**Indexes:**
- `PRIMARY KEY (mcmID)` - Primary identifier
- `KEY ticketID, adminID (ticketID, adminID)` - For lookups

---

### fat_esummary - Executive Summary

**Purpose:** Stores executive summary documents for tickets.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `esummaryID` | INT(11) | PK | NOT NULL | Summary record identifier |
| `ticketID` | INT(11) | FK | NOT NULL | Associated ticket (FK to fat_tickets.ticketID) |
| `esummary` | TEXT | | NOT NULL | Executive summary text |

**Indexes:**
- `PRIMARY KEY (esummaryID)` - Primary identifier

---

## Security & Configuration Tables

### fat_keys - API Keys

**Purpose:** Stores API keys for external service integration.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `keyID` | INT(11) | PK | NOT NULL | API key record |
| `keyOwner` | VARCHAR(255) | | NOT NULL | Hash of key owner identifier |
| `keySecret` | VARCHAR(100) | | NOT NULL | API key secret |
| `keyVerified` | INT(1) | | NOT NULL, DEFAULT 0 | Key verification status (0/1) |

**Indexes:**
- `PRIMARY KEY (keyID)` - Primary identifier

**Sample Data:**
- 1 API key configured (not verified)

---

### fat_c_keys - Encryption Key Storage

**Purpose:** Stores encryption keys for data security.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `ckID` | INT(11) | PK | NOT NULL | Encryption key identifier |
| `keyType` | INT(1) | | NOT NULL | Type of encryption key |
| `keyOwner` | VARCHAR(250) | | NOT NULL | Owner identifier (hashed) |
| `theKey` | VARCHAR(250) | | NOT NULL | Encryption key value |
| `keyOwnerPlain` | INT(11) | | NOT NULL | Owner admin ID (FK to fat_admin.id) |

**Indexes:**
- `PRIMARY KEY (ckID)` - Primary identifier

---

### fat_profileUpdater - Profile Update Tokens

**Purpose:** Manages temporary tokens for profile/password update requests.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `profID` | INT(11) | PK | NOT NULL | Update request identifier |
| `adminID` | INT(11) | FK | NOT NULL | Administrator (FK to fat_admin.id) |
| `updateThis` | VARCHAR(80) | | NOT NULL | What field is being updated |
| `updateCode` | VARCHAR(255) | | NOT NULL | Update token/code |
| `updExpiry` | INT(11) | | NOT NULL | Token expiration timestamp |

**Indexes:**
- `PRIMARY KEY (profID)` - Primary identifier

---

### fat_guests - Guest User Access

**Purpose:** Manages external/guest user accounts with limited access.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `guestID` | INT(11) | PK | NOT NULL | Guest user identifier |
| `guestName` | VARCHAR(30) | | NOT NULL | Guest display name |
| `guestEmail` | VARCHAR(50) | | NOT NULL | Guest email address |
| `guestToken` | VARCHAR(255) | | NOT NULL | Authentication token |
| `guestTokenStamp` | INT(11) | | NOT NULL | Token creation timestamp |
| `guestStatus` | INT(1) | | NOT NULL | Account status (0=suspended, 1=active) |
| `seshSecure` | VARCHAR(150) | | NOT NULL | Session security token |
| `loginStamp` | INT(11) | | NOT NULL | Last login timestamp |
| `activityStamp` | INT(11) | | NOT NULL | Last activity timestamp |

**Indexes:**
- `PRIMARY KEY (guestID)` - Primary identifier
- `UNIQUE KEY guestEmail (guestEmail)` - Email uniqueness

---

### fat_guest_privs - Guest User Permissions

**Purpose:** Assigns specific ticket access permissions to guest users.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `privID` | INT(11) | PK | NOT NULL | Permission record identifier |
| `guestID` | INT(11) | FK | NOT NULL | Guest user (FK to fat_guests.guestID) |
| `ticketID` | INT(11) | FK | NOT NULL | Accessible ticket (FK to fat_tickets.ticketID) |
| `adminID` | INT(11) | FK | NOT NULL | Administrator granting access (FK to fat_admin.id) |
| `createStamp` | INT(11) | | NOT NULL | Permission creation timestamp |

**Indexes:**
- `PRIMARY KEY (privID)` - Primary identifier

---

### fat_highlight - Weekly Highlights

**Purpose:** Stores weekly highlight messages displayed on dashboard.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `highID` | INT(11) | PK | NOT NULL | Highlight record identifier |
| `highYear` | INT(11) | | NOT NULL | Year of highlight |
| `highWeek` | INT(11) | | NOT NULL | Week number (1-52) |
| `highlight` | TEXT | | NOT NULL | Highlight message text |
| `stamp` | INT(11) | | NOT NULL | Creation timestamp |

**Indexes:**
- `PRIMARY KEY (highID)` - Primary identifier

---

## Legacy/Vehicle Tracking Tables

### fat_v_vehicle - Vehicle Information

**Purpose:** Tracks vehicle details for vehicle-related cases (legacy table).

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `vID` | INT(11) | PK | NOT NULL | Vehicle record identifier |
| `f_make` | VARCHAR(40) | | NOT NULL | Vehicle make (brand) |
| `f_model` | VARCHAR(40) | | NOT NULL | Vehicle model |
| `f_year` | INT(4) | | NOT NULL | Year of manufacture |
| `f_color` | VARCHAR(10) | | NOT NULL | Vehicle color |
| `f_plate` | VARCHAR(10) | | NOT NULL | License plate number |
| `f_vin` | VARCHAR(30) | | NOT NULL | Vehicle Identification Number |
| `f_keys` | INT(11) | | NOT NULL | Number of keys |
| `f_keylocation` | VARCHAR(40) | | NOT NULL | Where keys are stored |
| `f_carlocation` | VARCHAR(40) | | NOT NULL | Where vehicle is located |
| `f_ro` | VARCHAR(60) | | NOT NULL | Registered owner name |
| `f_address` | VARCHAR(80) | | NOT NULL | Owner address |
| `f_phone` | VARCHAR(15) | | NOT NULL | Owner phone |
| `f_altcontact` | VARCHAR(40) | | NOT NULL | Alternate contact name |
| `v_status` | VARCHAR(15) | | NOT NULL | Vehicle status |

**Indexes:**
- `PRIMARY KEY (vID)` - Primary identifier

---

### fat_v_fis - Found Item System

**Purpose:** Tracks found items/evidence (legacy table).

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `fisID` | INT(11) | PK | NOT NULL | Record identifier |
| `vID` | INT(11) | FK | | Vehicle associated (FK to fat_v_vehicle.vID) |
| `f_occ` | VARCHAR(12) | | NOT NULL | Occurrence number |
| `f_occtype` | VARCHAR(50) | | NOT NULL | Occurrence type |
| `f_stolen` | VARCHAR(10) | | NOT NULL | Stolen date |
| `f_timestolen` | VARCHAR(10) | | NOT NULL | Time stolen |
| `f_location` | VARCHAR(80) | | NOT NULL | Location found |
| `f_xrefocc` | VARCHAR(12) | | NOT NULL | Cross-reference occurrence |
| `f_search` | INT(3) | | NOT NULL | Search number |
| `f_recovered` | VARCHAR(12) | | NOT NULL | Recovery date |
| `f_timerecovered` | VARCHAR(10) | | NOT NULL | Time recovered |
| `f_patrolzone` | VARCHAR(20) | | NOT NULL | Patrol zone |
| `f_oic` | VARCHAR(20) | | NOT NULL | Officer in charge |
| `f_div` | VARCHAR(20) | | NOT NULL | Division |
| `f_badge` | VARCHAR(12) | | NOT NULL | Badge number |
| `c_drugs` | VARCHAR(200) | | NOT NULL | Drug details |
| `c_fent` | VARCHAR(200) | | NOT NULL | Fentanyl details |
| `c_sharps` | VARCHAR(200) | | NOT NULL | Sharps/needles details |
| `c_bio` | VARCHAR(200) | | NOT NULL | Biological hazard details |

**Indexes:**
- `PRIMARY KEY (fisID)` - Primary identifier

---

### aa_backups - Backup Metadata

**Purpose:** Tracks system backup operations.

**Structure:**

| Column | Type | Key | Constraint | Description |
|--------|------|-----|-----------|-------------|
| `backupID` | INT(11) | PK | AUTO_INCREMENT | Backup record identifier |
| `linuxStamp` | INT(11) | | NOT NULL | Backup timestamp |
| `fileName` | VARCHAR(100) | | NOT NULL | Backup file name/path |

**Indexes:**
- `PRIMARY KEY (backupID)` - Primary identifier

---

## Complete Table List

**Summary Table Counts:**

| Category | Count | Tables |
|---|---|---|
| Core Submission Tables | 1 | fat_tickets |
| Administrator & Security | 4 | fat_admin, fat_sessions, fat_logonoff, fat_tokenLogins |
| Lookup/Reference Tables | 12 | fat_occTypes, fat_locations, fat_rfs_types, fat_rfs_prio, fat_servicing, fat_servicing_cat, fat_rfs_stat_cat, fat_rfs_tstats, fat_rfs_item_cat, fat_rfs_items, fat_rfs_mcm, fat_highlight |
| Communication/Notification | 6 | fat_comms, fat_notifications, fat_mail, fat_mail_folders, fat_mail_templates, fat_mailer, fat_mailer_settings |
| File/Evidence | 4 | fat_files, fat_exhibits, fat_exstorage, fat_lib_resource |
| Task/Timeline | 4 | fat_tasks, fat_diary_dates, fat_rfs_timelines, fat_rfs_assigned |
| Status/Statistics | 4 | fat_tickets_status, fat_tickets_tstats, fat_mcm, fat_esummary |
| Security/Configuration | 6 | fat_keys, fat_c_keys, fat_profileUpdater, fat_guests, fat_guest_privs, fat_events |
| Monitoring | 1 | fat_rfs_beacon |
| Legacy/Vehicle | 3 | fat_v_vehicle, fat_v_fis, aa_backups |
| **TOTAL** | **42** | |

**All 42 Tables:**

1. aa_backups
2. fat_admin
3. fat_c_keys
4. fat_comms
5. fat_diary_dates
6. fat_esummary
7. fat_events
8. fat_exhibits
9. fat_exstorage
10. fat_files
11. fat_guests
12. fat_guest_privs
13. fat_highlight
14. fat_keys
15. fat_lib_resource
16. fat_locations
17. fat_logonoff
18. fat_mail
19. fat_mailer
20. fat_mailer_settings
21. fat_mail_folders
22. fat_mail_templates
23. fat_mcm
24. fat_notifications
25. fat_occTypes
26. fat_profileUpdater
27. fat_rfs_assigned
28. fat_rfs_beacon
29. fat_rfs_items
30. fat_rfs_item_cat
31. fat_rfs_mcm
32. fat_rfs_prio
33. fat_rfs_stat_cat
34. fat_rfs_timelines
35. fat_rfs_tstats
36. fat_rfs_types
37. fat_servicing
38. fat_servicing_cat
39. fat_sessions
40. fat_tasks
41. fat_tickets
42. fat_tickets_status
43. fat_tickets_tstats
44. fat_tokenLogins
45. fat_v_fis
46. fat_v_vehicle

---

## Complete Foreign Key Relationships

### From fat_tickets (Primary Reference Point)

```
fat_tickets.occType        → fat_occTypes.typeID
fat_tickets.locVictim      → fat_locations.locID
fat_tickets.locSuspect     → fat_locations.locID
fat_tickets.reqArea        → fat_servicing.serviceID
fat_tickets.ticketStatus   → fat_rfs_types.rfsID
fat_tickets.rfsPriority    → fat_rfs_prio.rfsID
fat_tickets.ticketOwner    → fat_admin.id (implicit)
```

### From fat_servicing

```
fat_servicing.itemCatID    → fat_servicing_cat.itemCatID
```

### From fat_rfs_items

```
fat_rfs_items.itemCatID    → fat_rfs_item_cat.itemCatID
```

### From fat_rfs_tstats

```
fat_rfs_tstats.statCatID   → fat_rfs_stat_cat.statCatID
```

### Cross-Table References

```
fat_comms.ticketID         → fat_tickets.ticketID
fat_comms.adminID          → fat_admin.id

fat_files.ticketID         → fat_tickets.ticketID
fat_files.libID            → fat_lib_resource.libID

fat_tickets_status.ticketID → fat_tickets.ticketID
fat_tickets_tstats.ticketID → fat_tickets.ticketID

fat_rfs_assigned.ticketID  → fat_tickets.ticketID
fat_mcm.ticketID           → fat_tickets.ticketID
fat_esummary.ticketID      → fat_tickets.ticketID

fat_rfs_timelines.ticketID → fat_tickets.ticketID
fat_diary_dates.ticketID   → fat_tickets.ticketID

fat_exhibits.ticketID      → fat_tickets.ticketID

fat_notifications.adminID  → fat_admin.id
fat_mail.mailFolderID      → fat_mail_folders.mailFolderID
fat_mail_folders.adminID   → fat_admin.id

fat_lib_resource.adminID   → fat_admin.id
fat_lib_resource.libFileID → fat_files.fileID

fat_tasks.ticketID         → fat_tickets.ticketID
fat_tasks.adminID          → fat_admin.id

fat_rfs_beacon.ticketID    → fat_tickets.ticketID
fat_rfs_beacon.adminID     → fat_admin.id
fat_rfs_beacon.fat_sID     → fat_sessions.fat_sID

fat_guest_privs.ticketID   → fat_tickets.ticketID
fat_guest_privs.adminID    → fat_admin.id
```

---

## Integration Guidelines

### Database Query Patterns

#### Get a Complete Ticket with All Related Data

```sql
SELECT
    t.*,
    ot.typeName,
    lv.locName as victimLocation,
    ls.locName as suspectLocation,
    s.serviceName as requestingArea,
    rt.rfsName as requestType,
    rp.rfsName as priorityName
FROM fat_tickets t
LEFT JOIN fat_occTypes ot ON t.occType = ot.typeID
LEFT JOIN fat_locations lv ON t.locVictim = lv.locID
LEFT JOIN fat_locations ls ON t.locSuspect = ls.locID
LEFT JOIN fat_servicing s ON t.reqArea = s.serviceID
LEFT JOIN fat_rfs_types rt ON t.ticketStatus = rt.rfsID
LEFT JOIN fat_rfs_prio rp ON t.rfsPriority = rp.rfsID
WHERE t.ticketID = ?;
```

#### Get All Communications for a Ticket

```sql
SELECT c.*, a.memName, a.memLast
FROM fat_comms c
JOIN fat_admin a ON c.adminID = a.id
WHERE c.ticketID = ?
ORDER BY c.msgStamp DESC;
```

#### Get Ticket Status History

```sql
SELECT ts.*, a.memUsername
FROM fat_tickets_status ts
LEFT JOIN fat_admin a ON ts.adminID = a.id
WHERE ts.ticketID = ?
ORDER BY ts.linuxStamp ASC;
```

#### Get All Dropdown Options

```sql
-- Occurrence Types
SELECT * FROM fat_occTypes ORDER BY typeName;

-- Locations
SELECT * FROM fat_locations ORDER BY locName;

-- Request Types
SELECT * FROM fat_rfs_types WHERE incStats = 1 ORDER BY rfsName;

-- Priority Levels
SELECT * FROM fat_rfs_prio ORDER BY rfsID;

-- Service Areas
SELECT * FROM fat_servicing WHERE itemCatID = 1 ORDER BY serviceName;
```

---

## Database Statistics

### Record Counts

| Table | Records | Status |
|---|---|---|
| fat_admin | 7 | Active administrators |
| fat_tickets | 19 | Total submissions (IDs 1-19) |
| fat_comms | 2 | Comments/notes |
| fat_files | 10 | Uploaded attachments |
| fat_events | 140 | Audit log entries |
| fat_notifications | 122 | User notifications |
| fat_sessions | 3 | Active sessions |
| fat_occTypes | 9 | Occurrence type options |
| fat_locations | 10 | Location options |
| fat_rfs_types | 4 | Request type options |
| fat_rfs_prio | 3 | Priority levels |
| fat_servicing | 44 | Service areas/divisions |
| fat_rfs_items | 15 | Equipment/weapon items |
| fat_rfs_mcm | 10 | MCM roles |
| fat_rfs_tstats | 4 | Statistic types |
| fat_tickets_status | 29 | Status change records |
| fat_tokenLogins | 1 | Login tokens |
| fat_rfs_beacon | 1 | Active monitor session |

### Storage Considerations

- **Total estimated size:** ~500 KB (with sample data)
- **Largest tables:** fat_events (140 rows), fat_notifications (122 rows), fat_tickets_status (29 rows)
- **Encryption:** Messages use AES encryption with IV/tag storage
- **Timestamps:** Unix epoch format for processing efficiency, varchar(10) for dates

---

## Security & Compliance Notes

### Data Protection

- Administrator passwords hashed with salt (SHA-256 or equivalent)
- Two-factor authentication supported (email, Google Auth, SMS)
- Session tokens secured with IP/browser fingerprinting
- Communications support AES encryption with authentication tags
- API keys tracked separately from system keys

### Audit Trail

- Complete event logging (140+ events across all system activities)
- Administrator activity timestamps
- File upload tracking with user attribution
- Status change history preserved
- Login/logout logging with IP tracking

### Access Control

- Role-based access (4 levels: Guest, Staff, Supervisor, Admin)
- Privilege flags for granular permissions
- Guest user support with ticket-level access control
- Session tracking for concurrent access management

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-11 | Complete database schema documentation of peelvideo database including all 42 tables, relationships, complete ID mappings, sample data, and integration guidelines |

---

**Document End**

---

## Summary

This comprehensive FAT System database reference documents the complete peelvideo database structure with:

- **42 tables** fully documented
- **Complete ID-to-value mappings** for all lookup tables
- **Full foreign key relationships** with clear references
- **Sample data** showing current production state
- **Integration guidelines** for common queries
- **Security notes** on encryption and access control
- **Audit trail** of system events and user actions

**Total Tables Documented:** 42

**Key Statistics:**
- 19 active tickets (test and production submissions)
- 7 administrator accounts (5 active, 1 locked, 1 inactive)
- 9 occurrence types available
- 44 requesting divisions/areas
- 3 active user sessions
- 140 system events logged
- Complete referential integrity mapped

This reference is suitable for developers, database administrators, and system architects working with the FAT System.
