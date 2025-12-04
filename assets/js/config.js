/**
 * Configuration and Constants
 * Central location for all app configuration
 * No business logic - just values
 */

import { FVU_LOGO_BASE64, FVU_LOGO_WIDTH, FVU_LOGO_HEIGHT } from './logo-data.js';

export const CONFIG = {
  // API Configuration
  API_ENDPOINT: 'rfs_request_process.php',
  API_TIMEOUT: 30000, // 30 seconds

  // Supabase Configuration
  USE_SUPABASE: true, // Toggle between Supabase and PHP endpoint
  SUPABASE_ENABLED: true,

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
    OFFICER_STORAGE_NOTICE: 'Your investigator information will be saved locally for convenience',

    // Error messages for improved error handling
    ERROR_TIMEOUT: 'Request timed out. Please check your connection and try again.',
    ERROR_OFFLINE: 'You appear to be offline. Your draft has been saved.',
    ERROR_SERVER: 'Server error. Please try again in a few minutes.',
    ERROR_RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
    ERROR_PDF_GENERATION: 'Failed to generate PDF. Please try again.',
    ERROR_UNKNOWN: 'Submission failed. Your draft has been saved.',
    RETRY_ATTEMPT: 'Connection issue. Retrying... (attempt {attempt} of {max})'
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
    { value: 'Evidence.com', text: 'Evidence.com' },
    { value: 'Locker', text: 'Locker' },
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
  },

  // Peel Regional Police Configuration
  PEEL_COLORS: {
    BLUE: '#1B3A6B',
    YELLOW: '#FFD100',
    BLUE_LIGHT: '#2B5AA8'
  },

  // Form Titles
  FORM_TITLES: {
    UPLOAD: 'Video Evidence Upload Request Form',
    ANALYSIS: 'Forensic Analysis Request Form',
    RECOVERY: 'CCTV Recovery Request Form'
  },

  // Draft Button States
  DRAFT_STATES: {
    LOAD: 'load-draft',
    AUTO_SAVE: 'auto-save',
    SAVING: 'saving'
  },

  // Header Specific Sizes
  HEADER_SIZES: {
    DIVIDER_HEIGHT: '40px',
    BUTTON_SIZE: '44px',
    MOBILE_BREAKPOINT: '768px'
  },

  // Box Shadow Values
  SHADOWS: {
    DRAFT_BUTTON: '0 2px 8px rgba(27, 58, 107, 0.3)',
    DRAFT_BUTTON_HOVER: '0 4px 12px rgba(27, 58, 107, 0.4)',
    DRAFT_BUTTON_YELLOW: '0 2px 8px rgba(255, 209, 0, 0.3)',
    DRAFT_BUTTON_YELLOW_HOVER: '0 4px 12px rgba(255, 209, 0, 0.4)',
    BUTTON_HOVER: '0 4px 12px rgba(0, 0, 0, 0.2)'
  },

  // Draft Animation Values
  DRAFT_ANIMATIONS: {
    PULSE_DURATION: 1000,
    PULSE_OPACITY_MIN: 0.7
  },

  // PDF Configuration
  PDF_CONFIG: {
    METADATA: {
      author: 'Peel Regional Police - Forensic Video Unit',
      subject: 'Evidence Request',
      keywords: 'forensic, video, evidence'
    }
  },

  // PDF Logo Configuration
  PDF_LOGO: {
    HOMICIDE: FVU_LOGO_BASE64,
    WIDTH: FVU_LOGO_WIDTH,
    HEIGHT: FVU_LOGO_HEIGHT
  },

  // PDF Layout Configuration
  PDF_LAYOUT: {
    // Page settings
    PAGE_SIZE: 'LETTER',
    PAGE_MARGINS: {
      LEFT: 40,
      TOP: 40,        // REDUCED from 80 - minimizes top padding
      RIGHT: 40,
      BOTTOM: 60
    },

    // Header layout
    HEADER: {
      LOGO_WIDTH: 120,   // Reduced by 25% from 160
      LOGO_HEIGHT: 96,   // Reduced by 25% from 128 (maintains aspect ratio)
      COLUMN_GAP: 20,
      TITLE_STACK_TOP_MARGIN: 10,  // Reduced for tighter layout
      SEPARATOR_TOP_MARGIN: 12,
      SEPARATOR_BOTTOM_MARGIN: 20,
      SEPARATOR_WIDTH: 2
    },

    // Header font sizes
    HEADER_FONTS: {
      PRIMARY_TITLE: 18,    // "PEEL REGIONAL POLICE"
      SECONDARY_TITLE: 16,  // "Forensic Video Unit"
      FORM_TITLE: 14,       // Form-specific title
      PRIMARY_SPACING: 2,   // Space after primary title
      SECONDARY_SPACING: 4  // Space after secondary title
    },

    // Section layout
    SECTION: {
      TOP_MARGIN: 15,
      HEADER_FONT_SIZE: 14,
      HEADER_BOTTOM_MARGIN: 8,
      TABLE_WIDTHS: ['35%', '65%'],
      ROW_PADDING_TOP: 6,
      ROW_PADDING_BOTTOM: 6
    },

    // Typography
    FONTS: {
      LABEL: 10,
      VALUE: 11,
      FOOTER: 8,
      URGENT: 12,
      WARNING: 11
    }
  }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.VALIDATION_PATTERNS);
Object.freeze(CONFIG.FIELD_NAMES);
Object.freeze(CONFIG.FORM_TYPES);
Object.freeze(CONFIG.MESSAGES);
Object.freeze(CONFIG.FEATURES);
Object.freeze(CONFIG.PEEL_COLORS);
Object.freeze(CONFIG.FORM_TITLES);
Object.freeze(CONFIG.DRAFT_STATES);
Object.freeze(CONFIG.HEADER_SIZES);
Object.freeze(CONFIG.SHADOWS);
Object.freeze(CONFIG.DRAFT_ANIMATIONS);
Object.freeze(CONFIG.PDF_CONFIG);
Object.freeze(CONFIG.PDF_LOGO);
Object.freeze(CONFIG.PDF_LAYOUT);
Object.freeze(CONFIG.PDF_LAYOUT.PAGE_MARGINS);
Object.freeze(CONFIG.PDF_LAYOUT.HEADER);
Object.freeze(CONFIG.PDF_LAYOUT.HEADER_FONTS);
Object.freeze(CONFIG.PDF_LAYOUT.SECTION);
Object.freeze(CONFIG.PDF_LAYOUT.FONTS);
