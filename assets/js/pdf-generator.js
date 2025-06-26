/**
 * PDF Generator Engine
 * Core PDF generation functionality
 * Note: Requires pdfmake library to be loaded
 */

import { CONFIG } from './config.js';
import { buildDocumentDefinition } from './pdf-templates.js';

/**
 * Generate PDF from form data
 * @param {Object} formData - Form data
 * @param {string} formType - Type of form
 * @returns {Promise<Blob>} PDF blob
 */
export async function generatePDF(formData, formType) {
  // Get document definition from templates
  const docDefinition = buildDocumentDefinition(formData, formType);
  
  // Add styles to document definition
  docDefinition.styles = PDF_STYLES;
  
  // Generate PDF using pdfmake
  return new Promise((resolve, reject) => {
    try {
      const pdf = pdfMake.createPdf(docDefinition);
      pdf.getBlob((blob) => {
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Comprehensive PDF styles
 */
export const PDF_STYLES = {
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
  sectionHeader: {
    fontSize: 13,
    bold: true,
    color: CONFIG.PEEL_COLORS.BLUE,
    margin: [0, 15, 0, 5]
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
  },
  urgentBanner: {
    fontSize: 14,
    bold: true,
    color: 'white',
    fillColor: '#DC3545'
  },
  warningText: {
    fontSize: 11,
    bold: true,
    color: CONFIG.PEEL_COLORS.YELLOW
  },
  infoText: {
    fontSize: 11,
    color: '#17a2b8'
  }
};