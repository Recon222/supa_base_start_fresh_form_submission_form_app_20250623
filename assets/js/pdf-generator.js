/**
 * PDF Generator Engine
 * Core PDF generation functionality
 * Note: Requires pdfmake library to be loaded
 */

import { CONFIG } from './config.js';
import { PDF_TEMPLATES } from './pdf-templates.js';

/**
 * Generate PDF from form data
 * @param {Object} formData - Form data
 * @param {string} formType - Type of form
 * @returns {Promise<Blob>} PDF blob
 */
export async function generatePDF(formData, formType) {
  const template = PDF_TEMPLATES[formType];
  if (!template) {
    throw new Error(`No PDF template found for form type: ${formType}`);
  }
  
  // Build document definition
  const docDefinition = {
    pageSize: 'LETTER',
    pageMargins: [40, 60, 40, 60],
    content: template.buildContent(formData),
    styles: PDF_STYLES,
    defaultStyle: {
      font: 'Roboto'
    }
  };
  
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
 * Shared PDF styles
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