/**
 * Analysis Form Handler
 * Specific handling for analysis form with conditional fields
 */

import { FormHandler } from './form-handler-base.js';
import { ConditionalFieldHandler } from './conditional-field-handler.js';
import { generatePDF } from '../pdf-generator.js';
import { generateJSON } from '../json-generator.js';
import { submitWithRetry } from '../api-client.js';
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
    conditionalHandler.setupOtherField('videoLocation', 'videoLocationOtherGroup', 'videoLocationOther');
    conditionalHandler.setupOtherField('city', 'cityOtherGroup', 'cityOther');
    conditionalHandler.setupOtherField('serviceRequired', 'serviceRequiredOtherGroup', 'serviceRequiredOther');
  }

  collectFormData() {
    const data = super.collectFormData();

    // Add fileNr mapping for PHP system
    data.fileNr = data.occNumber || '';

    // Set request area to city value for PHP system
    data[CONFIG.FIELD_NAMES.REQUEST_AREA] = data.city || '';

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
    const sections = [];

    // Form Title Header
    const title = 'FORENSIC ANALYSIS REQUEST';
    const boxWidth = 40; // Fixed width for header
    const horizontalLine = '='.repeat(boxWidth);
    const padding = ' '.repeat(Math.floor((boxWidth - title.length) / 2));

    sections.push(horizontalLine);
    sections.push(`${padding}${title}`);
    sections.push(horizontalLine);

    // Section 1: Case Information
    const caseFields = [];
    if (data.occNumber) caseFields.push(`Occurrence: ${data.occNumber}`);
    if (data.offenceTypeDisplay) caseFields.push(`Offence: ${data.offenceTypeDisplay}`);
    if (data.jobRequired) caseFields.push(`Priority: ${data.jobRequired}`);
    if (caseFields.length > 0) {
      sections.push('=== CASE ===\n' + caseFields.join('\n'));
    }

    // Section 2: Evidence Location
    const evidenceFields = [];
    if (data.videoLocationDisplay) evidenceFields.push(`Storage: ${data.videoLocationDisplay}`);
    if (data.bagNumber) evidenceFields.push(`Bag #: ${data.bagNumber}`);
    if (data.lockerNumber) evidenceFields.push(`Locker: ${data.lockerNumber}`);
    if (evidenceFields.length > 0) {
      sections.push('=== EVIDENCE ===\n' + evidenceFields.join('\n'));
    }

    // Section 3: Investigator
    const investigatorFields = [];
    if (data.rName && data.badge) {
      investigatorFields.push(`Name: ${data.rName} (Badge: ${data.badge})`);
    } else if (data.rName) {
      investigatorFields.push(`Name: ${data.rName}`);
    } else if (data.badge) {
      investigatorFields.push(`Badge: ${data.badge}`);
    }
    if (data.requestingPhone) investigatorFields.push(`Phone: ${data.requestingPhone}`);
    if (data.requestingEmail) investigatorFields.push(`Email: ${data.requestingEmail}`);
    if (investigatorFields.length > 0) {
      sections.push('=== INVESTIGATOR ===\n' + investigatorFields.join('\n'));
    }

    // Section 4: Location Details
    const locationFields = [];
    if (data.videoSeizedFrom) locationFields.push(`Seized From: ${data.videoSeizedFrom}`);
    if (data.businessName) locationFields.push(`Business: ${data.businessName}`);
    if (data.locationAddress) {
      const city = data.cityDisplay || '';
      const address = city ? `${data.locationAddress}, ${city}` : data.locationAddress;
      locationFields.push(`Address: ${address}`);
    } else if (data.cityDisplay) {
      locationFields.push(`City: ${data.cityDisplay}`);
    }
    if (data.recordingDate) locationFields.push(`Recording Date: ${data.recordingDate}`);
    if (locationFields.length > 0) {
      sections.push('=== LOCATION ===\n' + locationFields.join('\n'));
    }

    // Section 5: File Names
    if (data.fileNames) {
      const fileList = data.fileNames.split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0)
        .join('\n');
      if (fileList) {
        sections.push('=== FILES ===\n' + fileList);
      }
    }

    // Section 6: Service Required
    if (data.serviceRequiredDisplay) {
      sections.push('=== SERVICE ===\n' + data.serviceRequiredDisplay);
    }

    // Section 7: Request Details
    if (data.requestDetails) {
      sections.push('=== REQUEST ===\n' + data.requestDetails);
    }

    // Section 8: Additional Information
    if (data.additionalInfo) {
      sections.push('=== ADDITIONAL ===\n' + data.additionalInfo);
    }

    return sections.join('\n\n');
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

      // Submit to API with retry logic (Supabase or PHP)
      const result = await submitWithRetry(formData, pdfBlob, jsonBlob);

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

      // Determine specific error type and show appropriate message
      const errorMessage = this.getErrorMessage(error);
      showToast(errorMessage, 'error');

      // Save draft on error
      this.saveDraftAuto();
    }
  }
}

export default AnalysisFormHandler;
