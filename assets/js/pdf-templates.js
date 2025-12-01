/**
 * PDF Templates
 * Unified form-specific PDF layouts with professional styling
 */

import { formatDateTime } from './utils.js';
import { calculateRetentionDays, calculateVideoDuration, parseTimeOffset } from './calculations.js';
import { CONFIG } from './config.js';

/**
 * Shared PDF template methods
 */
const PDF_BASE = {
  /**
   * Build unified header with logo and stacked title
   * Uses a table layout with absolute positioning to center title on full page width
   * @param {string} formTitle - Specific form title
   * @returns {Array} Header content
   */
  buildUnifiedHeader(formTitle) {
    return [
      {
        // Use table layout for true centering across page
        table: {
          widths: ['*'],
          body: [
            [
              {
                // Stack contains logo and centered titles
                stack: [
                  {
                    // Logo positioned absolutely on left (25% smaller, better positioned)
                    image: CONFIG.PDF_LOGO.HOMICIDE,
                    width: CONFIG.PDF_LAYOUT.HEADER.LOGO_WIDTH,
                    height: CONFIG.PDF_LAYOUT.HEADER.LOGO_HEIGHT,
                    absolutePosition: { x: 70, y: 50 }
                  },
                  {
                    // Titles centered on full page width
                    stack: [
                      {
                        text: 'PEEL REGIONAL POLICE',
                        fontSize: CONFIG.PDF_LAYOUT.HEADER_FONTS.PRIMARY_TITLE,
                        bold: true,
                        color: CONFIG.PEEL_COLORS.BLUE,
                        alignment: 'center'
                      },
                      {
                        text: 'Forensic Video Unit',
                        fontSize: CONFIG.PDF_LAYOUT.HEADER_FONTS.SECONDARY_TITLE,
                        color: CONFIG.PEEL_COLORS.BLUE,
                        alignment: 'center',
                        margin: [0, CONFIG.PDF_LAYOUT.HEADER_FONTS.PRIMARY_SPACING, 0, 0]
                      },
                      {
                        text: formTitle,
                        fontSize: CONFIG.PDF_LAYOUT.HEADER_FONTS.FORM_TITLE,
                        bold: true,
                        color: '#333333',
                        alignment: 'center',
                        margin: [0, CONFIG.PDF_LAYOUT.HEADER_FONTS.SECONDARY_SPACING, 0, 0]
                      }
                    ],
                    margin: [0, CONFIG.PDF_LAYOUT.HEADER.TITLE_STACK_TOP_MARGIN, 0, 0]
                  }
                ],
                border: [false, false, false, false]
              }
            ]
          ]
        },
        layout: 'noBorders'
      },
      // Professional blue line separator
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: CONFIG.PDF_LAYOUT.HEADER.SEPARATOR_WIDTH,
            lineColor: CONFIG.PEEL_COLORS.BLUE
          }
        ],
        margin: [
          0,
          CONFIG.PDF_LAYOUT.HEADER.SEPARATOR_TOP_MARGIN,
          0,
          CONFIG.PDF_LAYOUT.HEADER.SEPARATOR_BOTTOM_MARGIN
        ]
      }
    ];
  },

  /**
   * Build standard section with consistent styling
   * @param {string} title - Section title
   * @param {Array} fields - Array of [label, value] pairs
   * @returns {Object|null} Section content or null if all fields empty
   */
  buildStandardSection(title, fields) {
    // Filter out empty fields
    const nonEmptyFields = fields.filter(([label, value]) => value && value !== 'N/A');
    
    // If all fields are empty, don't render the section
    if (nonEmptyFields.length === 0) {
      return null;
    }

    return {
      margin: [0, CONFIG.PDF_LAYOUT.SECTION.TOP_MARGIN, 0, 0],
      stack: [
        {
          text: title,
          fontSize: CONFIG.PDF_LAYOUT.SECTION.HEADER_FONT_SIZE,
          bold: true,
          color: CONFIG.PEEL_COLORS.BLUE,
          margin: [0, 0, 0, CONFIG.PDF_LAYOUT.SECTION.HEADER_BOTTOM_MARGIN]
        },
        {
          table: {
            widths: CONFIG.PDF_LAYOUT.SECTION.TABLE_WIDTHS,
            body: nonEmptyFields.map(([label, value]) => [
              {
                text: label,
                fontSize: CONFIG.PDF_LAYOUT.FONTS.LABEL,
                bold: true,
                color: '#666666'
              },
              {
                text: value || 'N/A',
                fontSize: CONFIG.PDF_LAYOUT.FONTS.VALUE,
                color: '#000000'
              }
            ])
          },
          layout: {
            hLineWidth: function(i, node) {
              return (i === node.table.body.length) ? 0 : 0.5;
            },
            vLineWidth: function() {
              return 0;
            },
            hLineColor: function() {
              return '#E0E0E0';
            },
            paddingTop: function() {
              return CONFIG.PDF_LAYOUT.SECTION.ROW_PADDING_TOP;
            },
            paddingBottom: function() {
              return CONFIG.PDF_LAYOUT.SECTION.ROW_PADDING_BOTTOM;
            }
          }
        }
      ]
    };
  },

  /**
   * Build text section for longer content
   * @param {string} title - Section title
   * @param {string} content - Text content
   * @returns {Object|null} Section content or null if empty
   */
  buildTextSection(title, content) {
    if (!content || content.trim() === '') {
      return null;
    }

    return {
      margin: [0, CONFIG.PDF_LAYOUT.SECTION.TOP_MARGIN, 0, 0],
      stack: [
        {
          text: title,
          fontSize: CONFIG.PDF_LAYOUT.SECTION.HEADER_FONT_SIZE,
          bold: true,
          color: CONFIG.PEEL_COLORS.BLUE,
          margin: [0, 0, 0, CONFIG.PDF_LAYOUT.SECTION.HEADER_BOTTOM_MARGIN]
        },
        {
          table: {
            widths: ['*'],
            body: [[{
              text: content,
              fontSize: CONFIG.PDF_LAYOUT.FONTS.VALUE,
              margin: [8, 8, 8, 8]
            }]]
          },
          layout: {
            fillColor: function() {
              return '#F8F9FA';
            },
            hLineWidth: function() {
              return 1;
            },
            vLineWidth: function() {
              return 1;
            },
            hLineColor: function() {
              return CONFIG.PEEL_COLORS.YELLOW;
            },
            vLineColor: function() {
              return CONFIG.PEEL_COLORS.YELLOW;
            }
          }
        }
      ]
    };
  },

  /**
   * Build footer with page numbers
   * @param {number} currentPage - Current page number
   * @param {number} pageCount - Total page count
   * @returns {Object} Footer content
   */
  buildFooter(currentPage, pageCount) {
    return {
      columns: [
        {
          text: `Generated: ${new Date().toLocaleString()}`,
          fontSize: CONFIG.PDF_LAYOUT.FONTS.FOOTER,
          color: '#666666',
          alignment: 'left'
        },
        {
          text: 'OFFICIAL REQUEST DOCUMENT',
          fontSize: CONFIG.PDF_LAYOUT.FONTS.FOOTER,
          bold: true,
          color: CONFIG.PEEL_COLORS.BLUE,
          alignment: 'center'
        },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          fontSize: CONFIG.PDF_LAYOUT.FONTS.FOOTER,
          color: '#666666',
          alignment: 'right'
        }
      ],
      margin: [40, 0, 40, 0]
    };
  },

  /**
   * Build urgent banner for priority requests
   * @param {string} message - Urgent message
   * @returns {Object} Banner content
   */
  buildUrgentBanner(message) {
    return {
      margin: [0, 0, 0, CONFIG.PDF_LAYOUT.SECTION.TOP_MARGIN],
      table: {
        widths: ['*'],
        body: [[{
          text: `⚠ ${message.toUpperCase()}`,
          color: 'white',
          bold: true,
          fontSize: CONFIG.PDF_LAYOUT.FONTS.URGENT,
          margin: [10, 8, 10, 8],
          alignment: 'center'
        }]]
      },
      layout: {
        fillColor: '#DC3545',
        hLineWidth: function() { return 0; },
        vLineWidth: function() { return 0; }
      }
    };
  }
};

/**
 * PDF template definitions for each form type
 */
export const PDF_TEMPLATES = {
  /**
   * Upload Form Template
   */
  upload: {
    buildContent(data) {
      const content = [];
      
      // Header
      content.push(...PDF_BASE.buildUnifiedHeader('Video Evidence Upload Request Form'));
      
      // Evidence Information
      const evidenceInfo = PDF_BASE.buildStandardSection('Evidence Information', [
        ['Occurrence Number', data.occNumber],
        ['Evidence Bag #', data.evidenceBag],
        ['Media Type', data.mediaTypeDisplay || data.mediaType],
        ['Submission Date', formatDateTime(new Date())]
      ]);
      if (evidenceInfo) content.push(evidenceInfo);
      
      // Investigator Information
      const investigatorInfo = PDF_BASE.buildStandardSection('Submitting Investigator', [
        ['Name', data.rName],
        ['Badge #', data.badge],
        ['Phone', data.requestingPhone],
        ['Email', data.requestingEmail]
      ]);
      if (investigatorInfo) content.push(investigatorInfo);
      
      // Location & Video Information
      if (data.locations && data.locations.length > 0) {
        data.locations.forEach((location, index) => {
          // Location header for multiple locations
          if (data.locations.length > 1) {
            content.push({
              text: `Location ${index + 1}`,
              fontSize: 13,
              bold: true,
              color: CONFIG.PEEL_COLORS.YELLOW,
              background: CONFIG.PEEL_COLORS.BLUE,
              margin: [0, 20, 0, 10],
              padding: [5, 3, 5, 3]
            });
          }
          
          // Location details
          const city = location.city === 'Other' ? location.cityOther : location.city;
          const locationInfo = PDF_BASE.buildStandardSection('Location Information', [
            ['Business Name', location.businessName],
            ['Address', location.locationAddress],
            ['City', city]
          ]);
          if (locationInfo) content.push(locationInfo);
          
          // Video timeframe
          const duration = location.videoStartTime && location.videoEndTime 
            ? calculateVideoDuration(location.videoStartTime, location.videoEndTime)
            : null;
          
          const timeframeInfo = PDF_BASE.buildStandardSection('Video Timeframe', [
            ['Start Time', formatDateTime(location.videoStartTime)],
            ['End Time', formatDateTime(location.videoEndTime)],
            ['Duration', duration ? duration.formatted : null],
            ['Time Synchronized', location.isTimeDateCorrect]
          ]);
          if (timeframeInfo) content.push(timeframeInfo);
          
          // Time offset warning if applicable
          if (location.isTimeDateCorrect === 'No' && location.timeOffset) {
            const parsed = parseTimeOffset(location.timeOffset);
            content.push({
              margin: [0, 10, 0, 0],
              table: {
                widths: ['*'],
                body: [[{
                  text: `⚠ TIME OFFSET: ${parsed.formatted}`,
                  color: CONFIG.PEEL_COLORS.YELLOW,
                  bold: true,
                  fontSize: CONFIG.PDF_LAYOUT.FONTS.WARNING,
                  margin: [8, 6, 8, 6],
                  alignment: 'center'
                }]]
              },
              layout: {
                fillColor: CONFIG.PEEL_COLORS.BLUE,
                hLineWidth: function() { return 0; },
                vLineWidth: function() { return 0; }
              }
            });
          }
          
          // DVR retention warning if applicable
          if (location.dvrEarliestDate) {
            const retention = calculateRetentionDays(location.dvrEarliestDate);
            if (retention.days < 30) {
              content.push(PDF_BASE.buildUrgentBanner(retention.message));
            }
          }
        });
      }
      
      // Additional Information
      const additionalInfo = PDF_BASE.buildTextSection('Additional Information', data.otherInfo);
      if (additionalInfo) content.push(additionalInfo);
      
      return content;
    }
  },

  /**
   * Analysis Form Template
   */
  analysis: {
    buildContent(data) {
      const content = [];
      
      // Header
      content.push(...PDF_BASE.buildUnifiedHeader('Forensic Analysis Request Form'));
      
      // Urgent banner if applicable
      if (data.jobRequired === 'Urgent') {
        content.push(PDF_BASE.buildUrgentBanner('URGENT ANALYSIS REQUEST'));
      }
      
      // Case Information
      const caseInfo = PDF_BASE.buildStandardSection('Case Information', [
        ['Occurrence Number', data.occNumber],
        ['Type of Offence', data.offenceTypeDisplay || data.offenceType],
        ['Job Priority', data.jobRequired]
      ]);
      if (caseInfo) content.push(caseInfo);
      
      // Evidence Location
      const evidenceLocation = PDF_BASE.buildStandardSection('Evidence Location', [
        ['Storage Location', data.videoLocationDisplay || data.videoLocation],
        ['Bag Number', data.bagNumber],
        ['Locker Number', data.lockerNumber]
      ]);
      if (evidenceLocation) content.push(evidenceLocation);
      
      // Investigator Information
      const investigatorInfo = PDF_BASE.buildStandardSection('Submitting Investigator', [
        ['Name', data.rName],
        ['Badge #', data.badge],
        ['Phone', data.requestingPhone],
        ['Email', data.requestingEmail]
      ]);
      if (investigatorInfo) content.push(investigatorInfo);
      
      // Evidence Details
      const evidenceDetails = PDF_BASE.buildStandardSection('Evidence Details', [
        ['Video Seized From', data.videoSeizedFrom],
        ['Business Name', data.businessName],
        ['City', data.cityDisplay || data.city],
        ['Recording Date', formatDateTime(data.recordingDate)]
      ]);
      if (evidenceDetails) content.push(evidenceDetails);
      
      // File Names if provided
      if (data.fileNames) {
        const files = data.fileNames.split('\n').filter(f => f.trim());
        if (files.length > 0) {
          content.push({
            margin: [0, CONFIG.PDF_LAYOUT.SECTION.TOP_MARGIN, 0, 0],
            stack: [
              {
                text: 'File Names',
                fontSize: CONFIG.PDF_LAYOUT.SECTION.HEADER_FONT_SIZE,
                bold: true,
                color: CONFIG.PEEL_COLORS.BLUE,
                margin: [0, 0, 0, CONFIG.PDF_LAYOUT.SECTION.HEADER_BOTTOM_MARGIN]
              },
              {
                ul: files.map(file => ({
                  text: file.trim(),
                  fontSize: CONFIG.PDF_LAYOUT.FONTS.LABEL,
                  margin: [0, 2, 0, 2]
                }))
              }
            ]
          });
        }
      }
      
      // Analysis Request
      const analysisRequest = PDF_BASE.buildStandardSection('Analysis Request', [
        ['Service Required', data.serviceRequiredDisplay || data.serviceRequired]
      ]);
      if (analysisRequest) content.push(analysisRequest);
      
      // Request Details
      const requestDetails = PDF_BASE.buildTextSection('Request Details', data.requestDetails);
      if (requestDetails) content.push(requestDetails);
      
      // Additional Information
      const additionalInfo = PDF_BASE.buildTextSection('Additional Information', data.additionalInfo);
      if (additionalInfo) content.push(additionalInfo);
      
      return content;
    }
  },

  /**
   * Recovery Form Template
   */
  recovery: {
    buildContent(data) {
      const content = [];
      
      // Header
      content.push(...PDF_BASE.buildUnifiedHeader('CCTV Recovery Request Form'));
      
      // Investigator Information
      const investigatorInfo = PDF_BASE.buildStandardSection('Submitting Investigator', [
        ['Name', data.rName],
        ['Badge #', data.badge],
        ['Phone', data.requestingPhone],
        ['Email', data.requestingEmail],
        ['Unit', data.unit]
      ]);
      if (investigatorInfo) content.push(investigatorInfo);
      
      // Location Information
      const locationInfo = PDF_BASE.buildStandardSection('Location Information', [
        ['Business Name', data.businessName],
        ['Location Address', data.locationAddress],
        ['City', data.cityDisplay || data.city],
        ['Location Contact', data.locationContact],
        ['Contact Phone', data.locationContactPhone],
        ['Type of Offence', data.offenceTypeDisplay || data.offenceType]
      ]);
      if (locationInfo) content.push(locationInfo);
      
      // Video Extraction Details
      const extractionDuration = data.extractionStartTime && data.extractionEndTime
        ? calculateVideoDuration(data.extractionStartTime, data.extractionEndTime)
        : null;
        
      const extractionDetails = PDF_BASE.buildStandardSection('Video Extraction Details', [
        ['Extraction Start Time', formatDateTime(data.extractionStartTime)],
        ['Extraction End Time', formatDateTime(data.extractionEndTime)],
        ['Time Period Type', data.timePeriodType],
        ['Extraction Duration', extractionDuration ? extractionDuration.formatted : null]
      ]);
      if (extractionDetails) content.push(extractionDetails);
      
      // DVR Information
      let dvrFields = [
        ['DVR Make/Model', data.dvrMakeModel],
        ['Time & Date Correct', data.isTimeDateCorrect]
      ];
      
      // Add time offset if applicable
      if (data.isTimeDateCorrect === 'No' && data.timeOffset) {
        const parsed = parseTimeOffset(data.timeOffset);
        dvrFields.push(['Time Offset', parsed.formatted]);
      }
      
      // Add retention info if available
      if (data.dvrRetention) {
        const retention = calculateRetentionDays(data.dvrRetention);
        dvrFields.push(['DVR Retention', retention.message]);
        
        // Add urgent banner if retention is low
        if (retention.days < 30) {
          content.push(PDF_BASE.buildUrgentBanner(`DVR DATA AT RISK - ${retention.message}`));
        }
      }
      
      const dvrInfo = PDF_BASE.buildStandardSection('DVR Information', dvrFields);
      if (dvrInfo) content.push(dvrInfo);
      
      // Access Information
      const accessInfo = PDF_BASE.buildStandardSection('Access Information', [
        ['DVR Username', data.dvrUsername],
        ['DVR Password', data.dvrPassword],
        ['Video Monitor On-Site', data.hasVideoMonitor]
      ]);
      if (accessInfo) content.push(accessInfo);
      
      // Camera Details
      const cameraDetails = PDF_BASE.buildTextSection('Camera Details', data.cameraDetails);
      if (cameraDetails) content.push(cameraDetails);
      
      // Incident Description
      const incidentDesc = PDF_BASE.buildTextSection('Incident Description', data.incidentDescription);
      if (incidentDesc) content.push(incidentDesc);
      
      return content;
    }
  }
};

/**
 * Generate document definition for PDFMake
 * @param {Object} formData - Form data
 * @param {string} formType - Form type
 * @returns {Object} Document definition
 */
export function buildDocumentDefinition(formData, formType) {
  const template = PDF_TEMPLATES[formType];
  if (!template) {
    throw new Error(`No PDF template found for form type: ${formType}`);
  }
  
  return {
    pageSize: CONFIG.PDF_LAYOUT.PAGE_SIZE,
    pageMargins: [
      CONFIG.PDF_LAYOUT.PAGE_MARGINS.LEFT,
      CONFIG.PDF_LAYOUT.PAGE_MARGINS.TOP,
      CONFIG.PDF_LAYOUT.PAGE_MARGINS.RIGHT,
      CONFIG.PDF_LAYOUT.PAGE_MARGINS.BOTTOM
    ],

    // Document metadata
    info: {
      title: `${CONFIG.FORM_TITLES[formType.toUpperCase()]} - ${formData.occNumber || 'No Occurrence #'}`,
      author: CONFIG.PDF_CONFIG?.METADATA?.author || 'Peel Regional Police - Forensic Video Unit',
      subject: CONFIG.PDF_CONFIG?.METADATA?.subject || 'Evidence Request',
      keywords: CONFIG.PDF_CONFIG?.METADATA?.keywords || 'forensic, video, evidence',
      creator: 'FVU Request System',
      producer: 'FVU Request System'
    },
    
    // Main content
    content: template.buildContent(formData),
    
    // Page footer
    footer: function(currentPage, pageCount) {
      return PDF_BASE.buildFooter(currentPage, pageCount);
    },
    
    // Default styles
    defaultStyle: {
      font: 'Roboto',
      fontSize: 11,
      lineHeight: 1.3
    }
  };
}