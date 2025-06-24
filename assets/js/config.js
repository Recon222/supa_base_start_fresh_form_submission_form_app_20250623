/**
 * Configuration and Constants
 * Central location for all app configuration
 * No business logic - just values
 */

export const CONFIG = {
  // API Configuration
  API_ENDPOINT: 'rfs_request_process.php',
  API_TIMEOUT: 30000, // 30 seconds
  
  // File Configuration
  MAX_FILE_SIZE: 10485760, // 10MB
  ALLOWED_FILE_TYPES: ['application/pdf', 'application/json'],
  
  // Draft Configuration
  DRAFT_EXPIRY_DAYS: 7,
  DRAFT_KEY_PREFIX: 'fvu_draft_',
  
  // Session Configuration
  SESSION_WARNING_MINUTES: 20,
  SESSION_TIMEOUT_MINUTES: 24,
  
  // Validation Patterns
  VALIDATION_PATTERNS: {
    PHONE: /^\d{10}$/, // 10 digits, formatting handled separately
    EMAIL: /^[^\s@]+@peelpolice\.ca$/i, // Must be @peelpolice.ca
    CASE_NUMBER: /^PR\d+$/i, // PR followed by numbers
    BADGE: /^.+$/, // Any non-empty value
    TIME_OFFSET: /\d+/, // Must contain at least one number
  },
  
  // Field Names (Third-party mapping)
  FIELD_NAMES: {
    // Required by third-party
    OFFICER_NAME: 'rName',
    OFFICER_EMAIL: 'requestingEmail', 
    OFFICER_PHONE: 'requestingPhone',
    REQUEST_AREA: 'reqArea',
    FILE_DETAILS: 'fileDetails',
    REQUEST_DETAILS: 'rfsDetails',
    OCCURRENCE_TYPE: 'occType',
    OCCURRENCE_DATE: 'occDate',
    
    // Our form fields
    OCCURRENCE_NUMBER: 'occNumber',
    EVIDENCE_BAG: 'evidenceBag',
    BADGE: 'badge',
    MEDIA_TYPE: 'mediaType',
    LOCKER_NUMBER: 'lockerNumber',
    BUSINESS_NAME: 'businessName',
    LOCATION_ADDRESS: 'locationAddress',
    CITY: 'city',
    VIDEO_START: 'videoStartTime',
    VIDEO_END: 'videoEndTime',
    TIME_CORRECT: 'isTimeDateCorrect',
    TIME_OFFSET: 'timeOffset',
    DVR_EARLIEST: 'dvrEarliestDate',
    OTHER_INFO: 'otherInfo',
    
    // Analysis form specific
    OFFENCE_TYPE: 'offenceType',
    OFFENCE_TYPE_OTHER: 'offenceTypeOther',
    VIDEO_LOCATION: 'videoLocation',
    VIDEO_LOCATION_OTHER: 'videoLocationOther',
    BAG_NUMBER: 'bagNumber',
    VIDEO_SEIZED_FROM: 'videoSeizedFrom',
    RECORDING_DATE: 'recordingDate',
    JOB_REQUIRED: 'jobRequired',
    FILE_NAMES: 'fileNames',
    SERVICE_REQUIRED: 'serviceRequired',
    SERVICE_REQUIRED_OTHER: 'serviceRequiredOther',
    REQUEST_DETAILS: 'requestDetails',
    ADDITIONAL_INFO: 'additionalInfo',
    
    // Recovery form specific
    UNIT: 'unit',
    LOCATION_CONTACT: 'locationContact',
    LOCATION_CONTACT_PHONE: 'locationContactPhone',
    EXTRACTION_START_TIME: 'extractionStartTime',
    EXTRACTION_END_TIME: 'extractionEndTime',
    TIME_PERIOD_TYPE: 'timePeriodType',
    DVR_MAKE_MODEL: 'dvrMakeModel',
    CAMERA_DETAILS: 'cameraDetails',
    DVR_RETENTION: 'dvrRetention',
    DVR_USERNAME: 'dvrUsername',
    DVR_PASSWORD: 'dvrPassword',
    HAS_VIDEO_MONITOR: 'hasVideoMonitor',
    INCIDENT_DESCRIPTION: 'incidentDescription'
  },
  
  // Form Types
  FORM_TYPES: {
    ANALYSIS: 'analysis',
    UPLOAD: 'upload',
    RECOVERY: 'recovery'
  },
  
  // Progress Bar Colors
  PROGRESS_COLORS: {
    LOW: 'var(--color-danger)',      // 0-33%
    MEDIUM: 'var(--color-warning)',  // 34-66%
    HIGH: 'var(--color-success)'     // 67-100%
  },
  
  // Animation Durations
  ANIMATIONS: {
    SHAKE_DURATION: 500,
    FADE_DURATION: 300,
    SCROLL_DURATION: 300
  },
  
  // Messages
  MESSAGES: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Must be a valid @peelpolice.ca email',
    INVALID_PHONE: 'Must be 10 digits',
    INVALID_OCCURRENCE: 'Must start with PR followed by numbers',
    TIME_OFFSET_REQUIRED: 'Please specify the time offset',
    CITY_OTHER_REQUIRED: 'Please specify the city name',
    MEDIA_OTHER_REQUIRED: 'Please specify the media type',
    OFFENCE_OTHER_REQUIRED: 'Please specify the offence type',
    VIDEO_LOCATION_OTHER_REQUIRED: 'Please specify the storage location',
    SERVICE_OTHER_REQUIRED: 'Please specify the service required',
    DRAFT_SAVED: 'Draft saved',
    DRAFT_LOADED: 'Draft loaded',
    SUBMISSION_SUCCESS: 'Request submitted successfully',
    SUBMISSION_ERROR: 'Error submitting request',
    NETWORK_ERROR: 'Network error. Your draft has been saved.',
    SESSION_WARNING: 'Your session will expire in 5 minutes',
    SESSION_EXPIRED: 'Session expired. Please refresh the page.',
    OFFICER_INFO_LOADED: 'Investigator information loaded',
    OFFICER_INFO_SAVED: 'Investigator information saved',
    OFFICER_INFO_CLEARED: 'Investigator information cleared',
    OFFICER_STORAGE_NOTICE: 'Your investigator information will be saved locally for convenience'
  },
  
  // City Options
  CITY_OPTIONS: [
    { value: '', text: 'Select city' },
    { value: 'Brampton', text: 'Brampton' },
    { value: 'Mississauga', text: 'Mississauga' },
    { value: 'Toronto', text: 'Toronto' },
    { value: 'Other', text: 'Other' }
  ],
  
  // Media Type Options
  MEDIA_TYPE_OPTIONS: [
    { value: '', text: 'Select media type' },
    { value: 'USB', text: 'USB' },
    { value: 'Hard Drive', text: 'Hard Drive' },
    { value: 'SD Card', text: 'SD Card' },
    { value: 'CD/DVD', text: 'CD/DVD' },
    { value: 'Other', text: 'Other' }
  ],
  
  // Analysis Form Options
  OFFENCE_TYPE_OPTIONS: [
    { value: '', text: 'Select...' },
    { value: 'Homicide', text: 'Homicide' },
    { value: 'Missing Person', text: 'Missing Person' },
    { value: 'Other', text: 'Other' }
  ],
  
  VIDEO_LOCATION_OPTIONS: [
    { value: '', text: 'Select...' },
    { value: 'NAS Storage', text: 'NAS Storage' },
    { value: 'Evidence.com Locker', text: 'Evidence.com Locker' },
    { value: 'USB', text: 'USB' },
    { value: 'Hard Drive', text: 'Hard Drive' },
    { value: 'SD Card', text: 'SD Card' },
    { value: 'CD/DVD', text: 'CD/DVD' },
    { value: 'Other', text: 'Other' }
  ],
  
  SERVICE_REQUIRED_OPTIONS: [
    { value: '', text: 'Select...' },
    { value: 'Video/Image Clarification', text: 'Video/Image Clarification' },
    { value: 'Audio Clarification', text: 'Audio Clarification' },
    { value: 'Comparator Analysis', text: 'Comparator Analysis' },
    { value: 'Timeline', text: 'Timeline' },
    { value: 'Make Playable', text: 'Make Playable' },
    { value: 'Data Carving', text: 'Data Carving' },
    { value: 'Other', text: 'Other' }
  ],
  
  // Date/Time Formats
  DATE_FORMATS: {
    DISPLAY: 'MMM DD, YYYY',
    INPUT: 'YYYY-MM-DD',
    DATETIME: 'YYYY-MM-DD HH:mm',
    TIMESTAMP: 'YYYY-MM-DD HH:mm:ss'
  },
  
  // Development Mode
  IS_DEVELOPMENT: window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  
  // Feature Flags
  FEATURES: {
    SAVE_DRAFTS: true,
    SESSION_WARNINGS: true,
    PROGRESS_BAR: true,
    ANIMATIONS: true
  },
  
  // Officer Storage Configuration
  OFFICER_STORAGE: {
    ENABLED: true,
    KEY: 'fvu_officer_info',
    VERSION: '1.0',
    FIRST_TIME_KEY: 'fvu_officer_storage_acknowledged'
  }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.VALIDATION_PATTERNS);
Object.freeze(CONFIG.FIELD_NAMES);
Object.freeze(CONFIG.FORM_TYPES);
Object.freeze(CONFIG.MESSAGES);
Object.freeze(CONFIG.FEATURES);