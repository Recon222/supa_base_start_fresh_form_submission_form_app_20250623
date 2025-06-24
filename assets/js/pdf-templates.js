/**
 * PDF Templatey
 * Form-specific PDF layouts
 */

import { formatDateTime } from './utils.js';
import { calculateRetentionDays, calculateVideoDuration, parseTimeOffset } from './calculations.js';

/**
 * PDF template definitions for each form type
 */
export const PDF_TEMPLATES = {
  upload: {
    /**
     * Build content for upload form PDF
     * @param {Object} data - Form data
     * @returns {Array} PDF content definition
     */
    buildContent(data) {
      return [
        // Header
        this.buildHeader('Video Evidence Upload Request'),
        
        // Evidence Information
        this.buildSection('Evidence Information', [
          ['Occurrence Number', data.occNumber],
          ['Evidence Bag #', data.evidenceBag || 'N/A'],
          ['Media Type', data.mediaTypeDisplay || data.mediaType],
          ['Submission Date', formatDateTime(new Date())]
        ]),
        
        // Investigator Information
        this.buildSection('Submitting Investigator', [
          ['Name', data.rName],
          ['Badge #', data.badge],
          ['Phone', data.requestingPhone],
          ['Email', data.requestingEmail]
        ]),
        
        // Location & Video Information
        ...this.buildLocationVideoSections(data.locations),
        
        // Additional Information
        data.otherInfo ? this.buildNotesSection(data.otherInfo) : {},
        
        // Footer
        this.buildFooter()
      ];
    },
    
    buildHeader(title) {
      return {
        columns: [
          {
            text: 'PEEL REGIONAL POLICE\nForensic Video Unit',
            style: 'header'
          },
          {
            text: title,
            style: 'header',
            alignment: 'right'
          }
        ],
        margin: [0, 0, 0, 20]
      };
    },
    
    buildUrgentBanner(message) {
      return {
        margin: [0, 10, 0, 10],
        table: {
          widths: ['*'],
          body: [[{
            text: `� ${message}`,
            color: 'white',
            bold: true,
            fontSize: 12,
            margin: [5, 5, 5, 5],
            alignment: 'center'
          }]]
        },
        layout: {
          fillColor: '#dc3545'
        }
      };
    },
    
    buildSection(title, fields) {
      return {
        margin: [0, 15, 0, 0],
        stack: [
          { text: title, style: 'subheader' },
          {
            table: {
              widths: ['35%', '65%'],
              body: fields.map(([label, value]) => [
                { text: label, style: 'label' },
                { text: value || 'N/A', style: 'value' }
              ])
            },
            layout: 'lightHorizontalLines'
          }
        ]
      };
    },
    
    buildLocationVideoSections(locations) {
      return locations.map((location, index) => {
        const city = location.city === 'Other' 
          ? location.cityOther 
          : location.city;
        
        const sections = [];
        
        // Location header for multiple locations
        if (locations.length > 1) {
          sections.push({
            text: `Location ${index + 1}`,
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          });
        }
        
        // Location Information
        sections.push(this.buildSection('Location Information', [
          ['Business Name', location.businessName || 'N/A'],
          ['Address', location.locationAddress],
          ['City', city]
        ]));
        
        // Video Timeframe
        const duration = calculateVideoDuration(location.videoStartTime, location.videoEndTime);
        sections.push(this.buildSection('Video Timeframe', [
          ['Start Time', formatDateTime(location.videoStartTime)],
          ['End Time', formatDateTime(location.videoEndTime)],
          ['Duration', duration.formatted],
          ['Time Synchronized', location.isTimeDateCorrect]
        ]));
        
        // Time offset if applicable
        if (location.isTimeDateCorrect === 'No' && location.timeOffset) {
          sections.push(this.buildTimeOffsetSection(location.timeOffset));
        }
        
        // DVR Retention for this location
        if (location.dvrEarliestDate) {
          const retention = calculateRetentionDays(location.dvrEarliestDate);
          sections.push(this.buildRetentionSection(retention));
        }
        
        return sections;
      }).flat();
    },
    
    buildTimeOffsetSection(timeOffset) {
      const parsed = parseTimeOffset(timeOffset);
      return {
        margin: [0, 10, 0, 0],
        table: {
          widths: ['*'],
          body: [[{
            text: `Time Offset: ${parsed.formatted}`,
            color: '#ff6600',
            bold: true,
            margin: [5, 5, 5, 5]
          }]]
        },
        layout: {
          fillColor: '#fff3cd'
        }
      };
    },
    
    buildRetentionSection(retention) {
      return {
        margin: [0, 15, 0, 0],
        stack: [
          { text: 'DVR Retention Status', style: 'subheader' },
          {
            text: retention.message,
            color: '#17a2b8',
            fontSize: 11,
            margin: [0, 5, 0, 0]
          }
        ]
      };
    },
    
    buildNotesSection(notes) {
      return {
        margin: [0, 15, 0, 0],
        stack: [
          { text: 'Additional Information', style: 'subheader' },
          {
            text: notes,
            fontSize: 11,
            margin: [0, 5, 0, 0]
          }
        ]
      };
    },
    
    buildFooter() {
      return [
        { text: '\n\n' },
        { 
          text: `Generated: ${new Date().toLocaleString()}`, 
          style: 'footer' 
        },
        { 
          text: 'This is an official request document', 
          style: 'footer' 
        }
      ];
    }
  },
  
  analysis: {
    /**
     * Build content for analysis form PDF
     * @param {Object} data - Form data
     * @returns {Array} PDF content definition
     */
    buildContent(data) {
      return [
        // Header
        this.buildHeader('Forensic Video Analysis Request'),
        
        // Case Information
        this.buildSection('Case Information', [
          ['Occurrence Number', data.occNumber],
          ['Type of Offence', data.offenceTypeDisplay || data.offenceType],
          ['Location of Video', data.videoLocationDisplay || data.videoLocation],
          ['Bag Number', data.bagNumber || 'N/A'],
          ['Locker Number', data.lockerNumber || 'N/A']
        ]),
        
        // Investigator Information
        this.buildSection('Submitting Investigator', [
          ['Name', data.rName],
          ['Badge #', data.badge],
          ['Phone', data.requestingPhone],
          ['Email', data.requestingEmail]
        ]),
        
        // Evidence Details
        this.buildSection('Evidence Details', [
          ['Video Seized From', data.videoSeizedFrom],
          ['Business Name', data.businessName || 'N/A'],
          ['City', data.cityDisplay || data.city],
          ['Recording Date', formatDateTime(data.recordingDate)],
          ['Job Required', data.jobRequired]
        ]),
        
        // File Names if provided
        data.fileNames ? this.buildFileNamesSection(data.fileNames) : {},
        
        // Request Details
        this.buildSection('Analysis Request', [
          ['Service Required', data.serviceRequiredDisplay || data.serviceRequired]
        ]),
        
        // Request Details Text
        this.buildRequestDetailsSection(data.requestDetails),
        
        // Additional Information
        data.additionalInfo ? this.buildNotesSection(data.additionalInfo) : {},
        
        // Footer
        this.buildFooter()
      ];
    },
    
    buildHeader(title) {
      return {
        columns: [
          {
            text: 'PEEL REGIONAL POLICE\nForensic Video Unit',
            style: 'header'
          },
          {
            text: title,
            style: 'header',
            alignment: 'right'
          }
        ],
        margin: [0, 0, 0, 20]
      };
    },
    
    buildSection(title, fields) {
      return {
        margin: [0, 15, 0, 0],
        stack: [
          { text: title, style: 'subheader' },
          {
            table: {
              widths: ['35%', '65%'],
              body: fields.map(([label, value]) => [
                { text: label, style: 'label' },
                { text: value || 'N/A', style: 'value' }
              ])
            },
            layout: 'lightHorizontalLines'
          }
        ]
      };
    },
    
    buildFileNamesSection(fileNames) {
      const files = fileNames.split('\n').filter(f => f.trim());
      
      return {
        margin: [0, 15, 0, 0],
        stack: [
          { text: 'File Names', style: 'subheader' },
          {
            ul: files.map(file => ({ text: file.trim(), fontSize: 10 }))
          }
        ]
      };
    },
    
    buildRequestDetailsSection(details) {
      return {
        margin: [0, 15, 0, 0],
        stack: [
          { text: 'Request Details', style: 'subheader' },
          {
            table: {
              widths: ['*'],
              body: [[{
                text: details || 'No details provided',
                margin: [5, 5, 5, 5],
                fontSize: 11
              }]]
            },
            layout: {
              fillColor: '#f8f8f8'
            }
          }
        ]
      };
    },
    
    buildNotesSection(notes) {
      return {
        margin: [0, 15, 0, 0],
        stack: [
          { text: 'Additional Information', style: 'subheader' },
          {
            text: notes,
            fontSize: 11,
            margin: [0, 5, 0, 0]
          }
        ]
      };
    },
    
    buildFooter() {
      return [
        { text: '\n\n' },
        { 
          text: `Generated: ${new Date().toLocaleString()}`, 
          style: 'footer' 
        },
        { 
          text: 'This is an official request document', 
          style: 'footer' 
        }
      ];
    }
  },
  
  recovery: {
    /**
     * Build content for recovery form PDF
     * @param {Object} data - Form data
     * @returns {Array} PDF content definition
     */
    buildContent(data) {
      return [
        // Header
        this.buildHeader('On-Site DVR Recovery Request'),
        
        // Investigator Information
        this.buildSection('Submitting Investigator', [
          ['Name', data.rName],
          ['Badge #', data.badge],
          ['Phone', data.requestingPhone],
          ['Email', data.requestingEmail],
          ['Unit', data.unit]
        ]),
        
        // Location Information
        this.buildSection('Location Information', [
          ['Business Name', data.businessName || 'N/A'],
          ['Location Address', data.locationAddress],
          ['City', data.cityDisplay || data.city],
          ['Location Contact', data.locationContact],
          ['Contact Phone', data.locationContactPhone],
          ['Type of Offence', data.offenceTypeDisplay || data.offenceType || 'Not specified']
        ]),
        
        // Video Extraction Details
        this.buildSection('Video Extraction Details', [
          ['Extraction Start Time', formatDateTime(data.extractionStartTime)],
          ['Extraction End Time', formatDateTime(data.extractionEndTime)],
          ['Time Period Type', data.timePeriodType],
          ['Extraction Duration', this.calculateDuration(data.extractionStartTime, data.extractionEndTime)]
        ]),
        
        // DVR Information
        this.buildDvrSection(data),
        
        // Access Information
        this.buildSection('Access Information', [
          ['DVR Username', data.dvrUsername || 'Not provided'],
          ['DVR Password', data.dvrPassword],
          ['Video Monitor On-Site', data.hasVideoMonitor || 'Not specified']
        ]),
        
        // Camera Details
        this.buildCameraSection(data.cameraDetails),
        
        // Incident Description
        this.buildIncidentSection(data.incidentDescription),
        
        // Footer
        this.buildFooter()
      ];
    },
    
    buildHeader(title) {
      return {
        columns: [
          {
            text: 'PEEL REGIONAL POLICE\nForensic Video Unit',
            style: 'header'
          },
          {
            text: title,
            style: 'header',
            alignment: 'right'
          }
        ],
        margin: [0, 0, 0, 20]
      };
    },
    
    buildSection(title, fields) {
      return {
        margin: [0, 15, 0, 0],
        stack: [
          { text: title, style: 'subheader' },
          {
            table: {
              widths: ['35%', '65%'],
              body: fields.map(([label, value]) => [
                { text: label + ':', bold: true },
                { text: value || 'N/A' }
              ])
            },
            layout: 'noBorders'
          }
        ]
      };
    },
    
    buildDvrSection(data) {
      const fields = [
        ['DVR Make/Model', data.dvrMakeModel || 'Not specified'],
        ['Time & Date Correct', data.isTimeDateCorrect || 'Not specified']
      ];
      
      // Add time offset if applicable
      if (data.isTimeDateCorrect === 'No' && data.timeOffset) {
        fields.push(['Time Offset', data.timeOffset]);
      }
      
      // Add retention date if provided
      if (data.dvrRetention) {
        const retention = calculateRetentionDays(data.dvrRetention);
        fields.push(['DVR Retention Date', formatDateTime(data.dvrRetention)]);
        fields.push(['Retention Info', retention.message]);
      }
      
      return this.buildSection('DVR Information', fields);
    },
    
    buildCameraSection(cameraDetails) {
      if (!cameraDetails) {
        return {};
      }
      
      const cameras = cameraDetails.split('\n').filter(c => c.trim());
      
      return {
        margin: [0, 15, 0, 0],
        stack: [
          { text: 'Camera Details', style: 'subheader' },
          { text: 'Cameras to be Extracted:', bold: true, margin: [0, 5, 0, 5] },
          {
            ul: cameras.map(camera => camera.trim())
          }
        ]
      };
    },
    
    buildIncidentSection(description) {
      return {
        margin: [0, 15, 0, 0],
        stack: [
          { text: 'Incident Description', style: 'subheader' },
          { text: 'Description of what takes place on camera:', bold: true, margin: [0, 5, 0, 5] },
          {
            text: description || 'No description provided',
            margin: [0, 5, 0, 0],
            style: 'description'
          }
        ]
      };
    },
    
    calculateDuration(startTime, endTime) {
      if (!startTime || !endTime) return 'N/A';
      
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMinutes = Math.round((end - start) / (1000 * 60));
      
      if (diffMinutes < 60) {
        return `${diffMinutes} minutes`;
      }
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      if (minutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      }
      
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    },
    
    buildFooter() {
      return [
        { text: '\n\n' },
        { 
          text: `Generated: ${new Date().toLocaleString()}`, 
          style: 'footer' 
        },
        { 
          text: 'This is an official request document', 
          style: 'footer' 
        }
      ];
    }
  }
};