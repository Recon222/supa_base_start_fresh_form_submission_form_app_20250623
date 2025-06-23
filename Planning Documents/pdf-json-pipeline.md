# PDF/JSON Generation Pipeline & Formatting Plan

## Overview

Smart approach! Since the third-party system can't store all your fields, generating your own PDFs ensures you have complete documentation. Here's how to keep it clean and beautiful.

## Architecture

```
PDF Generation Pipeline:
Form Data → PDF Template → PDF Generator → Beautiful PDF
          ↘                              ↗
            JSON Generator → Complete JSON
```

## File Structure

```
assets/js/
├── pdf-generator.js      (Core engine ~200 lines)
├── pdf-templates.js      (Template definitions ~300 lines)
├── json-generator.js     (Simple serializer ~50 lines)
└── calculations.js       (Business logic)
```

## PDF Generator Core (Stays Small)

```javascript
// pdf-generator.js - Just the engine
export async function generatePDF(formData, formType) {
  const template = PDF_TEMPLATES[formType];
  if (!template) throw new Error(`Unknown form type: ${formType}`);
  
  const docDefinition = {
    pageSize: 'LETTER',
    pageMargins: [40, 60, 40, 60],
    content: template.buildContent(formData),
    styles: PDF_STYLES,
    defaultStyle: {
      font: 'Helvetica'
    }
  };
  
  return new Promise((resolve) => {
    const pdf = pdfMake.createPdf(docDefinition);
    pdf.getBlob((blob) => resolve(blob));
  });
}

// Shared styles for all PDFs
const PDF_STYLES = {
  header: {
    fontSize: 16,
    bold: true,
    color: '#000080',
    margin: [0, 0, 0, 10]
  },
  subheader: {
    fontSize: 14,
    bold: true,
    color: '#333333',
    margin: [0, 10, 0, 5]
  },
  label: {
    fontSize: 10,
    bold: true,
    color: '#666666'
  },
  value: {
    fontSize: 11,
    color: '#000000'
  },
  footer: {
    fontSize: 8,
    italics: true,
    color: '#666666',
    alignment: 'center'
  }
};
```

## PDF Templates (Form-Specific Layouts)

```javascript
// pdf-templates.js - Beautiful, form-specific layouts
export const PDF_TEMPLATES = {
  analysis: {
    buildContent(data) {
      return [
        // Header with logo
        {
          columns: [
            {
              image: 'logo',
              width: 50
            },
            {
              stack: [
                { text: 'PEEL REGIONAL POLICE', style: 'header' },
                { text: 'Forensic Video Unit', fontSize: 12, color: '#666666' },
                { text: 'Analysis Request Form', fontSize: 14, bold: true }
              ],
              margin: [10, 0, 0, 0]
            }
          ]
        },
        
        // Case info section
        this.buildSection('Case Information', [
          ['Occurrence #', data.occNumber || 'N/A'],
          ['FVUID #', data.fvuid || 'Pending'],
          ['Offence Type', data.offence || 'N/A'],
          ['Recording Date', formatDate(data.recordingDate)]
        ]),
        
        // Officer section
        this.buildSection('Officer Information', [
          ['Submitting Officer', data.rName],
          ['Badge #', data.submittingOfficerBadge],
          ['Contact', data.requestingPhone],
          ['Email', data.requestingEmail]
        ]),
        
        // Analysis details with special formatting
        {
          margin: [0, 20, 0, 0],
          stack: [
            { text: 'Analysis Requirements', style: 'subheader' },
            {
              table: {
                widths: ['*'],
                body: [
                  [{
                    text: data.rfsDetails || 'No details provided',
                    margin: [5, 5, 5, 5],
                    fontSize: 11
                  }]
                ]
              },
              layout: {
                fillColor: '#f8f8f8'
              }
            }
          ]
        },
        
        // Footer
        { text: '\n\n' },
        { text: `Generated: ${new Date().toLocaleString()}`, style: 'footer' },
        { text: 'This is an official request document', style: 'footer' }
      ];
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
    }
  },

  upload: {
    buildContent(data) {
      // Calculate retention status
      const retentionStatus = calculateRetentionDays(data.dvrRetention);
      const isUrgent = retentionStatus.includes('EXPIRED') || retentionStatus.includes('today');
      
      return [
        // Header
        this.buildHeader('Video Evidence Upload Request'),
        
        // Urgent banner if needed
        isUrgent ? {
          margin: [0, 10, 0, 10],
          table: {
            widths: ['*'],
            body: [[{
              text: `⚠️ URGENT: Retention ${retentionStatus}`,
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
        } : {},
        
        // Evidence details
        this.buildSection('Evidence Information', [
          ['Occurrence #', data.occNumber],
          ['Evidence Bag #', data.evidenceBag],
          ['Media Type', data.mediaType],
          ['DVR Make/Model', data.dvrMakeModel || 'Unknown']
        ]),
        
        // Location info with map link
        this.buildSection('Location Details', [
          ['Business', data.businessName || 'N/A'],
          ['Address', data.locationAddress],
          ['City', data.city]
        ]),
        
        // Time window visualization
        this.buildTimeWindow(data),
        
        // Multiple locations flag
        data.multipleLocations ? {
          margin: [0, 10, 0, 0],
          text: '📍 Note: Multiple locations on single USB drive',
          color: '#ff6600',
          bold: true
        } : {}
      ];
    }
  },

  recovery: {
    buildContent(data) {
      // Check if time offset was calculated
      const hasTimeOffset = data.isTimeDateCorrect === 'No';
      
      return [
        this.buildHeader('On-Site Video Recovery Request'),
        
        // Officer and case info
        this.buildSection('Request Information', [
          ['Officer', data.rName],
          ['Unit', data.unit],
          ['OIC', data.officerInCharge],
          ['Occurrence #', data.occNumber]
        ]),
        
        // Site access info
        {
          margin: [0, 15, 0, 0],
          table: {
            widths: ['*'],
            body: [[{
              stack: [
                { text: 'Site Access Information', style: 'subheader' },
                { text: `Business: ${data.businessName}`, margin: [0, 5, 0, 0] },
                { text: `Address: ${data.locationAddress}, ${data.city}` },
                { text: `Contact: ${data.locationContact} (${data.locationContactPhone})` },
                { text: `Username: ${data.username}`, margin: [0, 5, 0, 0] },
                { text: `Password: ${data.password}`, color: '#000080', bold: true },
                { text: '(DVR access credentials for on-site use)', fontSize: 9, italics: true, color: '#666666' }
              ],
              fillColor: '#f0f8ff',
              margin: [10, 10, 10, 10]
            }]]
          },
          layout: 'noBorders'
        },
        
        // Time offset warning if applicable
        hasTimeOffset ? {
          margin: [0, 10, 0, 0],
          table: {
            widths: ['*'],
            body: [[{
              text: '⏰ TIME OFFSET REQUIRED - DVR time is not synchronized',
              color: '#ff0000',
              bold: true,
              alignment: 'center',
              margin: [5, 5, 5, 5]
            }]]
          },
          layout: {
            fillColor: '#ffeeee'
          }
        } : {},
        
        // Camera and time details
        this.buildSection('Extraction Details', [
          ['Cameras', data.cameraInfo],
          ['From', formatDateTime(data.extractionDateTimeFrom)],
          ['To', formatDateTime(data.extractionDateTimeTo)],
          ['Time Type', data.timePeriodType || 'Not specified']
        ]),
        
        // Description
        {
          margin: [0, 15, 0, 0],
          stack: [
            { text: 'Incident Description', style: 'subheader' },
            {
              text: data.description || 'No description provided',
              fontSize: 11,
              margin: [0, 5, 0, 0]
            }
          ]
        }
      ];
    }
  }
};
```

## JSON Generator (Dead Simple)

```javascript
// json-generator.js
export function generateJSON(formData, formType) {
  const jsonData = {
    metadata: {
      formType: formType,
      version: '1.0',
      generated: new Date().toISOString(),
      generator: 'FVU Request System'
    },
    formData: formData,
    calculations: {
      retentionDays: calculateRetentionDays(formData.dvrRetention),
      timeOffset: formData.timeOffset || null,
      videoDuration: calculateVideoDuration(
        formData.extractionDateTimeFrom, 
        formData.extractionDateTimeTo
      )
    }
  };
  
  return new Blob(
    [JSON.stringify(jsonData, null, 2)], 
    { type: 'application/json' }
  );
}
```

## Making PDFs Beautiful

### 1. **Visual Hierarchy**
- Clear sections with borders/backgrounds
- Consistent spacing
- Important info stands out (urgent banners)

### 2. **Professional Elements**
- Official header with logo
- Timestamps and version info
- Clean table layouts
- Status indicators (⚠️ ✓ ⏰)

### 3. **Smart Formatting**
- Dates formatted consistently
- Phone numbers formatted
- Sensitive data marked appropriately
- Empty fields show "N/A" not blank

### 4. **Form-Specific Features**
- **Analysis**: Emphasis on request details
- **Upload**: Retention warnings, multiple location flags
- **Recovery**: Time offset alerts, site access cards

## Usage Example

```javascript
// In form-handler.js
async handleSubmit(formData) {
  // Generate both files
  const [pdf, json] = await Promise.all([
    generatePDF(formData, this.formType),
    generateJSON(formData, this.formType)
  ]);
  
  // Add to submission
  const submission = new FormData();
  submission.append('fileAttachmentA', pdf, `${this.formType}_${Date.now()}.pdf`);
  submission.append('fileAttachmentB', json, `${this.formType}_${Date.now()}.json`);
  
  // ... rest of submission
}
```

## Why This Works

1. **PDF generator stays small** - Just the engine
2. **Templates are data** - Easy to modify layouts
3. **Reusable sections** - DRY principle
4. **Beautiful output** - Professional PDFs
5. **Complete JSON** - Everything for your other tools

The key is separation: the generator doesn't know about specific forms, and the templates don't know about PDF generation. Clean, maintainable, and produces gorgeous documents!