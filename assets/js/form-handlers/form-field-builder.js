/**
 * Form Field Builder
 * Reusable field creation utilities for dynamic form fields
 */

import { CONFIG } from '../config.js';
import { createElement } from '../utils.js';

export class FormFieldBuilder {
  /**
   * Create a location field (business name or address)
   */
  static createLocationField(baseName, index, label, required) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = index === 0 ? baseName : `${baseName}_${index}`;

    const group = createElement('div', { className: 'form-group' });

    const labelEl = createElement('label', {
      htmlFor: fieldId,
      className: 'form-label'
    });
    labelEl.innerHTML = label + (required ? ' <span class="required">*</span>' : '');

    const input = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      placeholder: baseName === 'businessName' ? 'Leave blank if none' : 'Full address',
      required: required ? 'required' : null
    });

    group.appendChild(labelEl);
    group.appendChild(input);

    if (baseName === 'businessName') {
      const small = createElement('small', { className: 'form-text' }, 'Name of the business where video was collected');
      group.appendChild(small);
    }

    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create a city select field with "Other" option
   */
  static createCityField(index) {
    const fieldName = index === 0 ? 'city' : `city_${index}`;
    const fieldId = index === 0 ? 'city' : `city_${index}`;
    const otherFieldName = index === 0 ? 'cityOther' : `cityOther_${index}`;
    const otherFieldId = index === 0 ? 'cityOther' : `cityOther_${index}`;
    const otherGroupId = index === 0 ? 'cityOtherGroup' : `cityOtherGroup_${index}`;

    const cityGroup = createElement('div', { className: 'form-group' });

    const label = createElement('label', {
      htmlFor: fieldId,
      className: 'form-label'
    });
    label.innerHTML = 'City <span class="required">*</span>';

    const citySelect = createElement('select', {
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      required: 'required'
    });

    CONFIG.CITY_OPTIONS.forEach(option => {
      citySelect.appendChild(createElement('option', {
        value: option.value
      }, option.text));
    });

    cityGroup.appendChild(label);
    cityGroup.appendChild(citySelect);
    cityGroup.appendChild(createElement('div', { className: 'invalid-feedback' }));

    // Other city field
    const otherGroup = createElement('div', {
      className: 'form-group d-none',
      id: otherGroupId
    });

    const otherLabel = createElement('label', {
      htmlFor: otherFieldId,
      className: 'form-label'
    });
    otherLabel.innerHTML = 'Specify City <span class="required">*</span>';

    const otherInput = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: otherFieldId,
      name: otherFieldName,
      placeholder: 'Enter city name'
    });

    otherGroup.appendChild(otherLabel);
    otherGroup.appendChild(otherInput);
    otherGroup.appendChild(createElement('small', { className: 'form-text' }, 'Please enter the city name'));
    otherGroup.appendChild(createElement('div', { className: 'invalid-feedback' }));

    const wrapper = createElement('div');
    wrapper.appendChild(cityGroup);
    wrapper.appendChild(otherGroup);

    return wrapper;
  }

  /**
   * Create a time field (datetime-local input)
   */
  static createTimeField(baseName, index, label, required) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = index === 0 ? baseName : `${baseName}_${index}`;

    const group = createElement('div', { className: 'form-group' });

    const labelEl = createElement('label', {
      htmlFor: fieldId,
      className: 'form-label'
    });
    labelEl.innerHTML = label + (required ? ' <span class="required">*</span>' : '');

    const input = createElement('input', {
      type: 'datetime-local',
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      required: required ? 'required' : null
    });

    const small = createElement('small', { className: 'form-text' },
      baseName.includes('Start') ? 'When the relevant video begins' : 'When the relevant video ends'
    );

    group.appendChild(labelEl);
    group.appendChild(input);
    group.appendChild(small);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create time sync field (Is Time & Date correct?)
   */
  static createTimeSyncField(index) {
    const fieldName = index === 0 ? 'isTimeDateCorrect' : `isTimeDateCorrect_${index}`;
    const yesId = index === 0 ? 'timeCorrectYes' : `timeCorrectYes_${index}`;
    const noId = index === 0 ? 'timeCorrectNo' : `timeCorrectNo_${index}`;
    const warningId = index === 0 ? 'timeSyncWarning' : `timeSyncWarning_${index}`;
    const offsetGroupId = index === 0 ? 'timeOffsetGroup' : `timeOffsetGroup_${index}`;
    const offsetFieldId = index === 0 ? 'timeOffset' : `timeOffset_${index}`;
    const offsetFieldName = index === 0 ? 'timeOffset' : `timeOffset_${index}`;

    const container = createElement('div');

    // Radio group
    const group = createElement('div', { className: 'form-group' });
    const label = createElement('label', { className: 'form-label' });
    label.innerHTML = 'Is the Time & Date correct? <span class="required">*</span>';
    const small = createElement('small', { className: 'form-text mb-2 d-block' }, 'Is the DVR time synchronized with actual time?');

    const yesDiv = createElement('div', { className: 'form-check' });
    const yesInput = createElement('input', {
      className: 'form-check-input',
      type: 'radio',
      name: fieldName,
      id: yesId,
      value: 'Yes',
      required: 'required'
    });
    const yesLabel = createElement('label', {
      className: 'form-check-label',
      htmlFor: yesId
    }, 'Yes');
    yesDiv.appendChild(yesInput);
    yesDiv.appendChild(yesLabel);

    const noDiv = createElement('div', { className: 'form-check' });
    const noInput = createElement('input', {
      className: 'form-check-input',
      type: 'radio',
      name: fieldName,
      id: noId,
      value: 'No',
      required: 'required'
    });
    const noLabel = createElement('label', {
      className: 'form-check-label',
      htmlFor: noId
    }, 'No');
    noDiv.appendChild(noInput);
    noDiv.appendChild(noLabel);

    group.appendChild(label);
    group.appendChild(small);
    group.appendChild(yesDiv);
    group.appendChild(noDiv);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    // Warning message
    const warning = createElement('div', {
      className: 'alert alert-warning d-none',
      id: warningId,
      style: 'margin-top: 1rem;'
    });
    warning.innerHTML = '<strong>Important:</strong> Your confirmation of correct timestamp becomes part of the evidence. If the timestamp conflicts with other evidence or DVR timestamps, this could affect the evidence validity.';

    // Time offset field
    const offsetGroup = createElement('div', {
      className: 'form-group d-none',
      id: offsetGroupId
    });
    const offsetLabel = createElement('label', {
      htmlFor: offsetFieldId,
      className: 'form-label'
    });
    offsetLabel.innerHTML = 'Time Offset <span class="required">*</span>';
    const offsetInput = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: offsetFieldId,
      name: offsetFieldName,
      placeholder: 'e.g., DVR is 1hr 5min 30sec AHEAD of real time'
    });
    const offsetSmall = createElement('small', { className: 'form-text' }, 'Describe how the DVR time differs from actual time');

    offsetGroup.appendChild(offsetLabel);
    offsetGroup.appendChild(offsetInput);
    offsetGroup.appendChild(offsetSmall);
    offsetGroup.appendChild(createElement('div', { className: 'invalid-feedback' }));

    container.appendChild(group);
    container.appendChild(warning);
    container.appendChild(offsetGroup);

    return container;
  }

  /**
   * Create DVR earliest date field with retention calculation
   */
  static createDvrDateField(index, onChangeCallback) {
    const fieldName = index === 0 ? 'dvrEarliestDate' : `dvrEarliestDate_${index}`;
    const fieldId = index === 0 ? 'dvrEarliestDate' : `dvrEarliestDate_${index}`;
    const retentionId = index === 0 ? 'retentionCalculation' : `retentionCalculation_${index}`;

    const group = createElement('div', { className: 'form-group' });

    const label = createElement('label', {
      htmlFor: fieldId,
      className: 'form-label'
    }, 'Earliest Recorded Date on DVR');

    const input = createElement('input', {
      type: 'date',
      className: 'form-control',
      id: fieldId,
      name: fieldName
    });

    const small = createElement('small', { className: 'form-text' }, 'The earliest date available on the DVR system');
    const retentionDiv = createElement('div', {
      id: retentionId,
      className: 'text-info mt-2'
    });

    // Add change listener if callback provided
    if (onChangeCallback) {
      input.addEventListener('change', onChangeCallback);
    }

    group.appendChild(label);
    group.appendChild(input);
    group.appendChild(small);
    group.appendChild(retentionDiv);

    return group;
  }
}
