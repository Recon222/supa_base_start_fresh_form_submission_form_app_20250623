/**
 * Conditional Field Handler
 * DRY solution for "Other" field patterns across all forms
 */

import { toggleElement } from '../utils.js';

export class ConditionalFieldHandler {
  constructor(formHandler) {
    this.formHandler = formHandler;
  }

  /**
   * Setup "Other" field pattern
   * @param {string} selectId - ID of the select element
   * @param {string} otherGroupId - ID of the other field group container
   * @param {string} otherFieldId - ID of the other field input
   */
  setupOtherField(selectId, otherGroupId, otherFieldId) {
    const select = document.getElementById(selectId);
    const otherGroup = document.getElementById(otherGroupId);
    const otherField = document.getElementById(otherFieldId);

    if (!select || !otherGroup || !otherField) return;

    select.addEventListener('change', (e) => {
      const showOther = e.target.value === 'Other';
      toggleElement(otherGroup, showOther);

      if (showOther) {
        otherField.setAttribute('required', 'required');
      } else {
        otherField.removeAttribute('required');
        otherField.value = '';
        this.formHandler.showFieldValidation(otherField, null);
      }
    });
  }
}
