/**
 * Analysis Form Handler
 * Specific handling for analysis form with conditional fields
 */

import { FormHandler } from './form-handler-base.js';
import { ConditionalFieldHandler } from './conditional-field-handler.js';
import { generatePDF } from '../pdf-generator.js';
import { generateJSON } from '../json-generator.js';
import { submitForm } from '../api-client.js';
import { showToast, downloadBlob } from '../utils.js';
import { CONFIG } from '../config.js';

/**
 * Analysis Form Handler
 * Handles video analysis requests with conditional field logic
 */
export class AnalysisFormHandler extends FormHandler {
  constructor(formId) {
    super(formId);
    this.setupAnalysisSpecificListeners();
  }

  setupAnalysisSpecificListeners() {
    // Initialize conditional field handler
    const conditionalHandler = new ConditionalFieldHandler(this);

    // Setup all "Other" fields
    conditionalHandler.setupOtherField('offenceType', 'offenceTypeOtherGroup', 'offenceTypeOther');
    conditionalHandler.setupOtherField('videoLocation', 'videoLocationOtherGroup', 'videoLocationOther');
    conditionalHandler.setupOtherField('city', 'cityOtherGroup', 'cityOther');
    conditionalHandler.setupOtherField('serviceRequired', 'serviceRequiredOtherGroup', 'serviceRequiredOther');

    // Set occurrence date from recording date
    const recordingDateField = this.form.querySelector('#recordingDate');
    if (recordingDateField) {
      recordingDateField.addEventListener('change', (e) => {
        const occDateField = this.form.querySelector('#occDate');
        if (occDateField && e.target.value) {
          occDateField.value = e.target.value;
        }
      });
    }
  }

  collectFormData() {
    const data = super.collectFormData();

    // Set request area
    data[CONFIG.FIELD_NAMES.REQUEST_AREA] = CONFIG.FORM_TYPES.ANALYSIS;

    // Map occurrence type
    data[CONFIG.FIELD_NAMES.OCCURRENCE_TYPE] = data.offenceType === 'Other' ?
      data.offenceTypeOther : data.offenceType;

    // Generate field summaries for third-party
    data[CONFIG.FIELD_NAMES.FILE_DETAILS] = this.generateFileDetails(data);
    data[CONFIG.FIELD_NAMES.REQUEST_DETAILS] = data.requestDetails || '';

    // Handle conditional fields for display
    if (data.offenceType === 'Other' && data.offenceTypeOther) {
      data.offenceTypeDisplay = data.offenceTypeOther;
    } else {
      data.offenceTypeDisplay = data.offenceType;
    }

    if (data.videoLocation === 'Other' && data.videoLocationOther) {
      data.videoLocationDisplay = data.videoLocationOther;
    } else {
      data.videoLocationDisplay = data.videoLocation;
    }

    if (data.city === 'Other' && data.cityOther) {
      data.cityDisplay = data.cityOther;
    } else {
      data.cityDisplay = data.city;
    }

    if (data.serviceRequired === 'Other' && data.serviceRequiredOther) {
      data.serviceRequiredDisplay = data.serviceRequiredOther;
    } else {
      data.serviceRequiredDisplay = data.serviceRequired;
    }

    return data;
  }

  generateFileDetails(data) {
    const details = [];
    if (data.videoLocation) {
      const location = data.videoLocation === 'Other' ? data.videoLocationOther : data.videoLocation;
      details.push(`Location: ${location}`);
    }
    if (data.videoSeizedFrom) details.push(`Seized from: ${data.videoSeizedFrom}`);
    if (data.fileNames) {
      const fileCount = data.fileNames.split('\n').filter(f => f.trim()).length;
      details.push(`${fileCount} file(s) listed`);
    }
    return details.join(' | ');
  }

  async submitForm(formData) {
    // Save officer info using base class method
    this.saveOfficerInfoFromFormData(formData);

    try {
      // Generate PDF and JSON
      const [pdfBlob, jsonBlob] = await Promise.all([
        generatePDF(formData, this.formType),
        generateJSON(formData, this.formType)
      ]);

      console.log('Analysis form ready for submission:', formData);
      console.log('PDF generated:', pdfBlob.size, 'bytes');
      console.log('JSON generated:', jsonBlob.size, 'bytes');

      // Submit to API (Supabase or PHP)
      const result = await submitForm(formData, pdfBlob, jsonBlob);

      if (result.success) {
        // Download PDF locally
        const pdfFilename = `FVU_Analysis_Request_${formData.occNumber || 'NoOccNum'}.pdf`;
        downloadBlob(pdfBlob, pdfFilename);

        showToast(`${CONFIG.MESSAGES.SUBMISSION_SUCCESS}. ID: ${result.submissionId || result.ticketNumber}`, 'success');

        // Clear the form after successful submission
        this.clearFormAfterSubmission();
      } else {
        showToast(result.message || CONFIG.MESSAGES.SUBMISSION_ERROR, 'error');
      }

    } catch (error) {
      console.error('Error during submission:', error);
      showToast(error.message || CONFIG.MESSAGES.SUBMISSION_ERROR, 'error');

      // Save draft on error
      this.saveDraftAuto();
    }
  }
}

export default AnalysisFormHandler;
