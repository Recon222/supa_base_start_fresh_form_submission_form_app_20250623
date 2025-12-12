# FAT System Form Field Reference

## Document Overview

This document provides a comprehensive database field mapping for the FAT (Forensic and Technical Analysis) System form submission interface. It serves as the authoritative reference for developers integrating form submissions with the underlying database structure.

**Document Version:** 1.0
**Last Updated:** 2025-12-11
**Applicable Tables:** FAT System PostgreSQL/MySQL database

---

## Table of Contents

1. [Form Structure Overview](#form-structure-overview)
2. [Text/Input Fields](#textinput-fields)
3. [Dropdown/Select Fields](#dropdownselect-fields)
4. [Database Table Reference](#database-table-reference)

---

## Form Structure Overview

The FAT System form is organized into the following sections:

### File Details Section
Contains identification and requestor information for the case file.

### Additional Details Section
Contains incident-specific information including type, location, and timeframe details.

### Request Type Section
Contains the type of forensic request and related service information.

---

## Text/Input Fields

### File Details Section

| Field Label | Form Variable | HTML Input Type | Database Column | Table | Max Length | Required | Notes |
|-------------|---|---|---|---|---|---|---|
| File Synopsis | `fileDetails` | textarea | `fileDetails` | `fat_tickets` | TEXT | Yes | Full narrative description of the file |
| Request to Video Forensic Support | `rfsDetails` | textarea | `rfsDetails` | `fat_tickets` | TEXT | No | Specific details of what is being requested |
| File Description | `rfsHeader` | text | `rfsHeader` | `fat_tickets` | varchar(240) | Yes | Brief description/title of the request |
| Requested by | `requestingName` | text | `requestingName` | `fat_tickets` | varchar(240) | Yes | Name of person submitting request |
| Occurrence Number | `fileNr` | text | `fileNr` | `fat_tickets` | varchar(120) | Yes | Primary file/occurrence number |
| Email Address | `requestingEmail` | email | `requestingEmail` | `fat_tickets` | varchar(240) | Yes | Must be @peelpolice.ca domain |
| Master Occurrence Number | `fileNrM` | text | `fileNrM` | `fat_tickets` | varchar(9) | No | Master/parent file number |
| Contact Phone | `requestingPhone` | tel | `requestingPhone` | `fat_tickets` | varchar(240) | Yes | 10-digit phone number |
| X-Reference Occurrence Number | `fileNrX` | text | `fileNrX` | `fat_tickets` | varchar(150) | No | Cross-reference file number(s) |

### Additional Details Section

| Field Label | Form Variable | HTML Input Type | Database Column | Table | Max Length | Required | Notes |
|-------------|---|---|---|---|---|---|---|
| Event Number | `occNr` | text | `occNr` | `fat_tickets` | varchar(9) | Yes | Event/incident reference number |
| Date (From) | `occDate` | date | `occDate` | `fat_tickets` | varchar(10) | Yes | Start date of occurrence (YYYY-MM-DD) |
| Date (To) | `occDateEnd` | date | `occDateEnd` | `fat_tickets` | varchar(10) | No | End date of occurrence (YYYY-MM-DD) |
| Keywords | `keywords` | text | `keywords` | `fat_tickets` | TEXT | No | Key terms related to the case |
| Monetary Loss | `finLoss` | currency | `finLoss` | `fat_tickets` | varies | No | Financial loss amount in dollars |
| Indicators of Compromise | `ioc` | textarea | `ioc` | `fat_tickets` | TEXT | No | Technical indicators related to compromise |

---

## Dropdown/Select Fields

### Type of Occurrence

**Field Name:** Type of occurrence
**Form Variable:** `occType`
**Database Column:** `occType`
**Database Table:** `fat_tickets` (foreign key to `fat_occTypes.typeID`)
**Data Type:** INT(3)

**Complete ID-to-Value Mapping:**

| ID | Display Value |
|----|---|
| 1 | Homicide |
| 2 | Missing Person |
| 3 | Robbery - Armed |
| 4 | Robbery |
| 5 | Sex Assault - Aggravated |
| 6 | Sex Assault - Cause Bodily Harm |
| 7 | Sex Assault |
| 8 | Extortion |
| 9 | Kidnapping |

**Source Table:**
```sql
CREATE TABLE fat_occTypes (
  typeID int(11) NOT NULL,
  typeName varchar(100) NOT NULL
)
```

---

### Location of Victim

**Field Name:** Location of Victim
**Form Variable:** `locVictim`
**Database Column:** `locVictim`
**Database Table:** `fat_tickets` (foreign key to `fat_locations.locID`)
**Data Type:** INT(1)

**Complete ID-to-Value Mapping:**

| ID | Display Value |
|----|---|
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

**Source Table:**
```sql
CREATE TABLE fat_locations (
  locID int(11) NOT NULL,
  locName varchar(80) NOT NULL
)
```

---

### Location of Suspect

**Field Name:** Location of Suspect
**Form Variable:** `locSuspect`
**Database Column:** `locSuspect`
**Database Table:** `fat_tickets` (foreign key to `fat_locations.locID`)
**Data Type:** INT(1)

**Complete ID-to-Value Mapping:**

*Uses the same values as Location of Victim (see above)*

---

### Requesting Area / Service Unit

**Field Name:** Requesting area
**Form Variable:** `reqArea`
**Database Column:** `reqArea`
**Database Table:** `fat_tickets` (foreign key to `fat_servicing.serviceID`)
**Data Type:** INT(1)
**Category:** `itemCatID = 1` (Internal)

**Complete ID-to-Value Mapping:**

| ID | Display Value |
|----|---|
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

**Source Table:**
```sql
CREATE TABLE fat_servicing (
  serviceID int(11) NOT NULL,
  serviceName varchar(50) NOT NULL,
  itemCatID int(11) NOT NULL
)
```

---

### Request Type / RFS Type

**Field Name:** Type of Request / RFS Type
**Form Variable:** `ticketStatus`
**Database Column:** `ticketStatus`
**Database Table:** `fat_tickets`
**Data Type:** INT(1)
**Related Table:** `fat_rfs_types`

**Complete ID-to-Value Mapping:**

| ID | Display Value | Include in Stats | Primary Stat | SFL Box |
|----|---|---|---|---|
| 1 | Video Clarification | Yes | Yes | Yes |
| 2 | Video Timeline | Yes | Yes | Yes |
| 3 | Test | No | No | No |
| 4 | Video Upload | Yes | Yes | Yes |

**Source Table:**
```sql
CREATE TABLE fat_rfs_types (
  rfsID int(11) NOT NULL,
  rfsName varchar(80) NOT NULL,
  incStats int(1) NOT NULL DEFAULT 1,
  primStat int(1) NOT NULL DEFAULT 0,
  sflBox int(1) NOT NULL DEFAULT 0
)
```

**Column Meanings:**
- `incStats`: Whether this RFS type should be included in statistics (0 = no, 1 = yes)
- `primStat`: Whether this is a primary statistic (0 = no, 1 = yes)
- `sflBox`: Whether this type uses the SFL (Statutory Framework License) box (0 = no, 1 = yes)

---

### Priority Level

**Field Name:** Priority / RFS Priority
**Form Variable:** `rfsPriority`
**Database Column:** `rfsPriority`
**Database Table:** `fat_tickets`
**Data Type:** INT(1)

**Complete ID-to-Value Mapping:**

| ID | Priority Level |
|----|---|
| 1 | High |
| 2 | Medium |
| 3 | Low |

**Source Table:**
```sql
CREATE TABLE fat_rfs_prio (
  rfsID int(11) NOT NULL,
  rfsName varchar(80) NOT NULL
)
```

---

## Database Table Reference

### Primary Submission Table: fat_tickets

This is the main table where form submissions are stored.

**Table Structure:**
```sql
CREATE TABLE fat_tickets (
  ticketID int(11) NOT NULL,                          -- Auto-increment primary key
  ticketStamp int(11) NOT NULL,                       -- Unix timestamp of submission
  ticketYear int(4) NOT NULL,                         -- Year for reporting
  ticketNumber int(6) NOT NULL,                       -- Sequential ticket number
  rfsHeader varchar(240) NOT NULL,                    -- File description/title
  ticketHighlight text NOT NULL,                      -- Highlighted information
  ticketHighlight_history text NOT NULL,              -- History of highlights
  fileNr varchar(120) NOT NULL,                       -- Occurrence number
  fileNrM varchar(9) NOT NULL,                        -- Master occurrence number
  fileNrX varchar(150) NOT NULL,                      -- X-reference occurrence number
  occNr varchar(9) NOT NULL,                          -- Event number
  rfsPriority int(1) NOT NULL,                        -- Priority (1=high, 2=medium, 3=low)
  occType int(3) NOT NULL,                            -- Type of occurrence (FK to fat_occTypes)
  occDate varchar(10) NOT NULL,                       -- Start date (YYYY-MM-DD format)
  occDateEnd varchar(10) NOT NULL,                    -- End date (YYYY-MM-DD format)
  requestingName varchar(240) NOT NULL,               -- Name of requestor
  requestingEmail varchar(240) NOT NULL,              -- Email address
  requestingPhone varchar(240) NOT NULL,              -- Phone number
  reqArea int(1) NOT NULL,                            -- Requesting area (FK to fat_servicing)
  locVictim int(1) NOT NULL,                          -- Location of victim (FK to fat_locations)
  locSuspect int(1) NOT NULL,                         -- Location of suspect (FK to fat_locations)
  fileDetails text NOT NULL,                          -- File synopsis/description
  rfsDetails text NOT NULL,                           -- RFS details/request
  rfsAdmCmt text NOT NULL,                            -- Administrator comments
  rfsAdvice text NOT NULL,                            -- Advice/recommendations
  ticketTracking text NOT NULL,                       -- Tracking information
  ticketStatus int(1) NOT NULL DEFAULT 0,             -- RFS type/request type
  ticketProgress int(1) NOT NULL DEFAULT 0,           -- Progress status (0=new, 1=evaluated, 2=assigned, 3=accepted/active, 4=hold, 5=reopened, 6=closed)
  ticketOwner int(3) NOT NULL,                        -- Administrator ID of owner
  ticketReviewed int(11) NOT NULL,                    -- Supervisor review timestamp
  -- Additional columns exist but are system-managed
)
```

**Key Points:**
- `ticketID` is the primary identifier for each submission
- Date fields use YYYY-MM-DD format (varchar, not DATE type)
- All foreign key relationships use integer IDs
- Timestamps use Unix epoch format (seconds since 1970-01-01)

---

### Lookup Table: fat_occTypes

Occurrence/incident type classifications.

**Table Structure:**
```sql
CREATE TABLE fat_occTypes (
  typeID int(11) NOT NULL PRIMARY KEY,
  typeName varchar(100) NOT NULL
)
```

**Use:** Populate "Type of occurrence" dropdown
**Relationship:** `fat_tickets.occType` → `fat_occTypes.typeID`

---

### Lookup Table: fat_locations

Physical location classifications for victim and suspect locations.

**Table Structure:**
```sql
CREATE TABLE fat_locations (
  locID int(11) NOT NULL PRIMARY KEY,
  locName varchar(80) NOT NULL
)
```

**Use:** Populate both "Location of Victim" and "Location of Suspect" dropdowns
**Relationship:**
- `fat_tickets.locVictim` → `fat_locations.locID`
- `fat_tickets.locSuspect` → `fat_locations.locID`

---

### Lookup Table: fat_servicing

Service units and divisions that can request video forensic support.

**Table Structure:**
```sql
CREATE TABLE fat_servicing (
  serviceID int(11) NOT NULL PRIMARY KEY,
  serviceName varchar(50) NOT NULL,
  itemCatID int(11) NOT NULL                         -- Foreign key to fat_servicing_cat
)
```

**Use:** Populate "Requesting area" dropdown
**Relationship:** `fat_tickets.reqArea` → `fat_servicing.serviceID`
**Current Data:** All entries have `itemCatID = 1` (Internal)

---

### Lookup Table: fat_servicing_cat

Categories for service units (currently only "Internal").

**Table Structure:**
```sql
CREATE TABLE fat_servicing_cat (
  itemCatID int(11) NOT NULL PRIMARY KEY,
  itemCatName varchar(250) NOT NULL
)
```

**Current Data:**
- ID 1: "Internal"

---

### Lookup Table: fat_rfs_types

Types of forensic requests that can be submitted.

**Table Structure:**
```sql
CREATE TABLE fat_rfs_types (
  rfsID int(11) NOT NULL PRIMARY KEY,
  rfsName varchar(80) NOT NULL,
  incStats int(1) NOT NULL DEFAULT 1,                 -- Include in statistics (0/1)
  primStat int(1) NOT NULL DEFAULT 0,                 -- Primary statistic (0/1)
  sflBox int(1) NOT NULL DEFAULT 0                    -- SFL box applicable (0/1)
)
```

**Use:** Populate "Type of Request" / "Request Type" dropdown
**Relationship:** `fat_tickets.ticketStatus` → `fat_rfs_types.rfsID`

---

### Lookup Table: fat_rfs_prio

Priority levels for forensic requests.

**Table Structure:**
```sql
CREATE TABLE fat_rfs_prio (
  rfsID int(11) NOT NULL PRIMARY KEY,
  rfsName varchar(80) NOT NULL
)
```

**Use:** Populate "Priority" dropdown
**Relationship:** `fat_tickets.rfsPriority` → `fat_rfs_prio.rfsID`

---

### Support Table: fat_rfs_stat_cat

Categories for request statistics (Judicial, Logistics, Court).

**Table Structure:**
```sql
CREATE TABLE fat_rfs_stat_cat (
  statCatID int(11) NOT NULL PRIMARY KEY,
  statCatName varchar(50) NOT NULL
)
```

**Current Data:**
- ID 1: "Judicial Authorization"
- ID 2: "Logistics"
- ID 3: "Court Requests"

---

### Support Table: fat_rfs_tstats

Tracking statistics types with maximum values per category.

**Table Structure:**
```sql
CREATE TABLE fat_rfs_tstats (
  tstatsID int(11) NOT NULL PRIMARY KEY,
  tstatsName varchar(80) NOT NULL,
  tstatsMax int(11) NOT NULL,                         -- Maximum allowed count
  statCatID int(11) NOT NULL                          -- Category (FK to fat_rfs_stat_cat)
)
```

**Current Data:**
| ID | Name | Max Value | Category |
|----|---|---|---|
| 1 | Production Order | 10 | Judicial Authorization |
| 2 | Search Warrant | 5 | Judicial Authorization |
| 3 | Pickup Attempts | 10 | Logistics |
| 4 | Disclosure | 10 | Court Requests |

---

## Integration Guidelines

### Form Submission Process

1. **Validate all user input** against the patterns defined in configuration
   - Email must be @peelpolice.ca domain
   - Phone must be 10 digits
   - Occurrence number format requirements

2. **Populate dropdown values dynamically** from these lookup tables:
   - `fat_occTypes` for "Type of occurrence"
   - `fat_locations` for "Location of Victim" and "Location of Suspect"
   - `fat_servicing` for "Requesting area"
   - `fat_rfs_types` for "Type of Request"
   - `fat_rfs_prio` for "Priority"

3. **Insert submission** into `fat_tickets` table with:
   - Generated `ticketStamp` (current Unix timestamp)
   - Generated `ticketYear` (current year)
   - Generated `ticketNumber` (next sequential number)
   - User-provided values mapped to corresponding columns
   - Default values for admin-managed fields (`rfsAdmCmt`, `rfsAdvice`, `ticketTracking`, etc.)

4. **Handle dates** carefully:
   - Accept date picker input in YYYY-MM-DD format
   - Store as varchar(10) in format YYYY-MM-DD
   - `occDate` is required, `occDateEnd` is optional

5. **Auto-populate system fields**:
   - `ticketStatus`: Set based on request type (from `fat_rfs_types`)
   - `ticketProgress`: Initialize to 0 (new ticket)
   - `ticketReviewed`: Initialize appropriately (0 or current timestamp)

---

## Database Constraints & Relationships

### Foreign Key Relationships

```
fat_tickets.occType --> fat_occTypes.typeID
fat_tickets.reqArea --> fat_servicing.serviceID
fat_tickets.locVictim --> fat_locations.locID
fat_tickets.locSuspect --> fat_locations.locID
fat_tickets.ticketStatus --> fat_rfs_types.rfsID
fat_tickets.rfsPriority --> fat_rfs_prio.rfsID

fat_servicing.itemCatID --> fat_servicing_cat.itemCatID
fat_rfs_tstats.statCatID --> fat_rfs_stat_cat.statCatID
```

### Required vs Optional Fields

**Required in Form Submission:**
- `rfsHeader` (File Description)
- `fileNr` (Occurrence Number)
- `requestingName` (Requested by)
- `requestingEmail` (Email Address)
- `requestingPhone` (Contact phone)
- `fileDetails` (File Synopsis)
- `occNr` (Event Number)
- `occDate` (Date From)

**Optional in Form Submission:**
- `fileNrM` (Master Occurrence Number)
- `fileNrX` (X-Ref Occurrence Number)
- `occDateEnd` (Date To)
- `rfsDetails` (Request to RFS)
- `keywords` (Keywords)
- `finLoss` (Monetary Loss)
- `ioc` (Indicators of Compromise)

---

## Appendix: Query Examples

### Get all available occurrence types
```sql
SELECT typeID, typeName FROM fat_occTypes ORDER BY typeName;
```

### Get all available locations
```sql
SELECT locID, locName FROM fat_locations ORDER BY locName;
```

### Get all service units (requesting areas)
```sql
SELECT serviceID, serviceName FROM fat_servicing
WHERE itemCatID = 1
ORDER BY serviceName;
```

### Get all request types with statistics flags
```sql
SELECT rfsID, rfsName, incStats, primStat, sflBox FROM fat_rfs_types;
```

### Get all priority levels
```sql
SELECT rfsID, rfsName FROM fat_rfs_prio ORDER BY rfsID;
```

### Retrieve a complete ticket submission
```sql
SELECT * FROM fat_tickets
WHERE ticketID = ?;
```

### Get recent submissions
```sql
SELECT ticketID, ticketNumber, rfsHeader, ticketStamp, ticketStatus, ticketProgress
FROM fat_tickets
ORDER BY ticketStamp DESC
LIMIT 50;
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-11 | Initial comprehensive reference document |

