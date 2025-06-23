/**
 * PDF Templates
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
      // Calculate retention status
      const retention = data.dvrEarliestDate 
        ? calculateRetentionDays(data.dvrEarliestDate)
        : null;
      
      // Calculate video duration
      const duration = calculateVideoDuration(data.videoStartTime, data.videoEndTime);
      
      return [
        // Header
        this.buildHeader('Video Evidence Upload Request'),
        
        // Urgent banner if needed
        retention?.isUrgent ? this.buildUrgentBanner(retention.message) : {},
        
        // Evidence Information
        this.buildSection('Evidence Information', [
          ['Occurrence Number', data.occNumber],
          ['Evidence Bag #', data.evidenceBag || 'N/A'],
          ['Media Type', data.mediaTypeDisplay || data.mediaType],
          ['Submission Date', formatDateTime(new Date())]
        ]),
        
        // Officer Information
        this.buildSection('Submitting Officer', [
          ['Name', data.rName],
          ['Badge #', data.badge],
          ['Phone', data.requestingPhone],
          ['Email', data.requestingEmail]
        ]),
        
        // Location Information
        ...this.buildLocationSections(data.locations),
        
        // Video Timeframe
        this.buildSection('Video Timeframe', [
          ['Start Time', formatDateTime(data.videoStartTime)],
          ['End Time', formatDateTime(data.videoEndTime)],
          ['Duration', duration.formatted],
          ['Time Synchronized', data.isTimeDateCorrect]
        ]),
        
        // Time offset if applicable
        data.isTimeDateCorrect === 'No' && data.timeOffset 
          ? this.buildTimeOffsetSection(data.timeOffset)
          : {},
        
        // DVR Retention
        retention ? this.buildRetentionSection(retention) : {},
        
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
            text: `  ${message}`,
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
    
    buildLocationSections(locations) {
      return locations.map((location, index) => {
        const city = location.city === 'Other' 
          ? location.cityOther 
          : location.city;
        
        return this.buildSection(
          locations.length > 1 ? `Location ${index + 1}` : 'Location Information',
          [
            ['Business Name', location.businessName || 'N/A'],
            ['Address', location.locationAddress],
            ['City', city]
          ]
        );
      });
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
            color: retention.isUrgent ? '#dc3545' : '#17a2b8',
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
  
  // Placeholder for other form types
  analysis: {
    buildContent(data) {
      return [{ text: 'Analysis form PDF not implemented yet' }];
    }
  },
  
  recovery: {
    buildContent(data) {
      return [{ text: 'Recovery form PDF not implemented yet' }];
    }
  }
};