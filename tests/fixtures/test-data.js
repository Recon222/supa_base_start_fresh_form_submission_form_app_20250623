/**
 * Test Data Fixtures for FVU Request System
 * Provides reusable test data for all form tests
 */

export const validOfficerData = {
  rName: 'Test Officer',
  badge: '12345',
  requestingEmail: 'test.officer@peelpolice.ca',
  requestingPhone: '9051234567'
};

export const invalidOfficerData = {
  invalidEmail: 'test@gmail.com',
  shortPhone: '123',
  longPhone: '12345678901',
  wrongEmailDomain: 'test@peel.ca',
  noAtSignEmail: 'testofficerpeelpolice.ca',
};

export const validOccurrenceData = {
  occNumber: 'PR2024123456',
  occDate: '2024-01-15',
  offenceType: 'Robbery'
};

export const invalidOccurrenceData = {
  occNumber: '123456', // Missing PR prefix
  occNumberPartial: 'PR', // No numbers after PR
  futureDate: new Date(new Date().getTime() + 86400000).toISOString().split('T')[0], // Tomorrow
};

export const uploadFormValidData = {
  ...validOfficerData,
  occNumber: 'PR2024001234',
  mediaType: 'USB',
  locationAddress: '123 Main Street',
  city: 'Toronto',
  videoStartTime: '2024-01-15T10:00',
  videoEndTime: '2024-01-15T11:00',
  timeCorrect: 'Yes',
  timeOffset: '', // Not used when timeCorrect is "Yes"
  lockerNumber: '5',
  fileDetails: 'Test file details'
};

export const uploadFormWithOtherMediaType = {
  ...validOfficerData,
  occNumber: 'PR2024002234',
  mediaType: 'Other',
  mediaTypeOther: 'Custom Storage Device',
  locationAddress: '456 Oak Street',
  city: 'Mississauga',
  videoStartTime: '2024-01-10T08:00',
  videoEndTime: '2024-01-10T09:30',
  timeCorrect: 'No',
  timeOffset: 'DVR is 2 hours behind',
  fileDetails: 'Files on custom device'
};

export const uploadFormWithOtherCity = {
  ...validOfficerData,
  occNumber: 'PR2024003234',
  mediaType: 'DVD',
  locationAddress: '789 Elm Street',
  city: 'Other',
  cityOther: 'Oakville',
  videoStartTime: '2024-01-12T14:00',
  videoEndTime: '2024-01-12T15:30',
  timeCorrect: 'Yes',
  fileDetails: 'DVD evidence'
};

export const analysisFormValidData = {
  ...validOfficerData,
  occNumber: 'PR2024004234',
  occDate: '2024-01-10',
  offenceType: 'Homicide',
  videoLocation: 'Evidence.com',
  videoSeizedFrom: 'Scene Investigation',
  recordingDate: '2024-01-08',
  serviceRequired: 'Video/Image Clarification',
  jobRequired: 'Enhancement of suspect vehicle registration plate in footage',
  requestDetails: 'Need enhancement of vehicle registration plate',
  fileNames: 'evidence_video_1.mp4\nevidence_video_2.avi'
};

export const analysisFormWithOtherOffence = {
  ...validOfficerData,
  occNumber: 'PR2024005234',
  occDate: '2024-01-07',
  offenceType: 'Other',
  offenceTypeOther: 'Fraud Investigation',
  videoLocation: 'NAS Storage',
  videoSeizedFrom: 'Financial Crime Unit',
  recordingDate: '2024-01-05',
  serviceRequired: 'Timeline',
  jobRequired: 'Create detailed timeline of events from footage',
  requestDetails: 'Create detailed timeline of events',
  fileNames: 'fraud_evidence_01.mp4'
};

export const analysisFormWithOtherVideoLocation = {
  ...validOfficerData,
  occNumber: 'PR2024006234',
  occDate: '2024-01-05',
  offenceType: 'Homicide',
  videoLocation: 'Other',
  videoLocationOther: 'Cloud Storage',
  videoSeizedFrom: 'Investigation Team',
  recordingDate: '2024-01-03',
  serviceRequired: 'Other',
  serviceRequiredOther: 'Custom Analysis',
  jobRequired: 'Custom video analysis task',
  requestDetails: 'Perform custom analysis',
  fileNames: 'cloud_video_001.mp4'
};

export const recoveryFormValidData = {
  ...validOfficerData,
  occNumber: 'PR2024007234',
  offenceType: 'Robbery',
  locationAddress: '321 Market Street',
  city: 'Mississauga',
  locationContact: 'John Smith',
  locationContactPhone: '9055551234',
  dvrMakeModel: 'Hikvision DS-7732NI-K4',
  dvrTimeCorrect: 'Yes',
  dvrTimeOffset: '',
  dvrRetentionDate: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
  hasVideoMonitor: 'Yes',
  timePeriodFrom: '2024-01-15T08:00',
  timePeriodTo: '2024-01-15T18:00',
  timePeriodType: 'DVR Time',
  cameraDetails: 'Camera 1: Front entrance\nCamera 2: Parking lot\nCamera 3: Rear door',
  dvrUsername: 'admin',
  dvrPassword: 'SecurePass123',
  incidentDescription: 'Robbery occurred at location, need DVR footage for investigation'
};

export const recoveryFormWithOtherOffence = {
  ...validOfficerData,
  occNumber: 'PR2024008234',
  offenceType: 'Other',
  offenceTypeOther: 'Fraud',
  locationAddress: '654 Commerce Road',
  city: 'Toronto',
  locationContact: 'Manager Contact',
  locationContactPhone: '905-555-4567',
  dvrMakeModel: 'Axis Communications',
  dvrTimeCorrect: 'No',
  dvrTimeOffset: 'DVR is 30 minutes fast',
  dvrRetentionDate: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago (urgent)
  hasVideoMonitor: 'No',
  timePeriodFrom: '2024-01-14T10:00',
  timePeriodTo: '2024-01-14T16:00',
  timePeriodType: 'Actual Time',
  cameraDetails: 'Multiple cameras covering transaction areas',
  dvrUsername: 'user@company.com',
  dvrPassword: 'Password456',
  incidentDescription: 'Financial fraud investigation requiring DVR footage extraction'
};

export const recoveryFormMultipleDVRs = {
  dvr1: {
    ...validOfficerData,
    occNumber: 'PR2024009234',
    offenceType: 'Assault',
    locationAddress: '987 Park Avenue',
    city: 'Brampton',
    locationContact: 'Building Manager',
    locationContactPhone: '905-555-7890',
    dvrMakeModel: 'Dahua NVR',
    dvrTimeCorrect: 'Yes',
    dvrRetentionDate: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
    hasVideoMonitor: 'Yes',
    timePeriodFrom: '2024-01-15T12:00',
    timePeriodTo: '2024-01-15T14:00',
    timePeriodType: 'DVR Time',
    cameraDetails: 'Entrance camera, hallway camera',
    dvrUsername: 'admin1',
    dvrPassword: 'Pass1234',
    incidentDescription: 'Assault incident in building'
  },
  dvr2: {
    dvrMakeModel: 'Uniview NVR',
    dvrTimeCorrect: 'No',
    dvrTimeOffset: 'DVR is 1 hour behind',
    dvrRetentionDate: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    hasVideoMonitor: 'No',
    timePeriodFrom: '2024-01-15T11:00',
    timePeriodTo: '2024-01-15T15:00',
    timePeriodType: 'Actual Time',
    cameraDetails: 'Parking lot cameras',
    dvrUsername: 'admin2',
    dvrPassword: 'SecurePass789'
  }
};

export const dateHelpers = {
  getTodayISO: () => new Date().toISOString().split('T')[0],
  getYesterdayISO: () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  },
  getTomorrowISO: () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  },
  getDaysAgoISO: (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  },
  getDaysInFutureISO: (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  },
  getTimeISO: (hour, minute = 0) => {
    const date = new Date();
    date.setHours(hour, minute, 0);
    return date.toISOString().split('.')[0];
  }
};
