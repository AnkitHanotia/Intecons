$(document).ready(function() {
    let formFields = [];
    let fieldCounter = 0;

    // Make field buttons draggable
    $('.field-btn').draggable({
        helper: 'clone',
        cursor: 'move',
        revert: 'invalid',
        zIndex: 1000,
        start: function(event, ui) {
            $(ui.helper).addClass('dragging');
        }
    });

    // Make preview form droppable
    $('#preview-form').droppable({
        accept: '.field-btn',
        hoverClass: 'ui-droppable-hover',
        drop: function(event, ui) {
            const fieldType = $(ui.draggable).data('type');
            const label = prompt('Enter field label:');
            
            if (label) {
                const fieldId = `field_${fieldCounter++}`;
                const validationSettings = getValidationSettings(fieldType);
                const field = createFormField(fieldType, label, fieldId, validationSettings);
                
                // Insert the field at the drop position
                const dropY = event.pageY;
                let inserted = false;
                
                $('#preview-form .form-group').each(function() {
                    const elementY = $(this).offset().top;
                    if (dropY < elementY && !inserted) {
                        field.insertBefore(this);
                        inserted = true;
                    }
                });
                
                if (!inserted) {
                    $('#preview-form').append(field);
                }
                
                // Store field information
                formFields.push({
                    type: fieldType,
                    label: label,
                    id: fieldId,
                    validation: validationSettings
                });
            }
        }
    });

    // Add click handler for field buttons
    $('.field-btn').on('click', function(e) {
        e.preventDefault();
        const fieldType = $(this).data('type');
        const label = prompt('Enter field label:');
        
        if (label) {
            const fieldId = `field_${fieldCounter++}`;
            const validationSettings = getValidationSettings(fieldType);
            const field = createFormField(fieldType, label, fieldId, validationSettings);
            $('#preview-form').append(field);
            
            // Store field information
            formFields.push({
                type: fieldType,
                label: label,
                id: fieldId,
                validation: validationSettings
            });
        }
    });

    // Generate JSON button click handler
    $('#generate-json').on('click', function(e) {
        e.preventDefault();
        const formData = {
            fields: formFields
        };
        $('#json-output').text(JSON.stringify(formData, null, 2));
    });

    // Function to get validation settings for a field type
    function getValidationSettings(fieldType) {
        const settings = {
            required: false,
            min: null,
            max: null,
            pattern: null,
            minLength: null,
            maxLength: null
        };

        switch(fieldType) {
            case 'text':
            case 'email':
                settings.required = confirm('Is this field required?');
                settings.minLength = prompt('Minimum length (leave empty for no limit):');
                settings.maxLength = prompt('Maximum length (leave empty for no limit):');
                if (fieldType === 'email') {
                    settings.pattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}';
                }
                break;

            case 'number':
                settings.required = confirm('Is this field required?');
                settings.min = prompt('Minimum value (leave empty for no limit):');
                settings.max = prompt('Maximum value (leave empty for no limit):');
                break;

            case 'textarea':
                settings.required = confirm('Is this field required?');
                settings.minLength = prompt('Minimum length (leave empty for no limit):');
                settings.maxLength = prompt('Maximum length (leave empty for no limit):');
                break;

            case 'select':
                settings.required = confirm('Is this field required?');
                break;

            case 'checkbox':
            case 'radio':
                settings.required = confirm('Is this field required?');
                break;
        }

        // Clean up empty values
        Object.keys(settings).forEach(key => {
            if (settings[key] === '' || settings[key] === null) {
                settings[key] = null;
            }
        });

        return settings;
    }

    // Function to create form fields
    function createFormField(type, label, id, validation) {
        const formGroup = $('<div>').addClass('form-group');
        // Add asterisk to label if field is required
        const labelText = validation.required ? `${label} *` : label;
        const labelElement = $('<label>').attr('for', id).text(labelText);

        let inputElement;

        switch(type) {
            case 'text':
            case 'email':
            case 'number':
                inputElement = $('<input>')
                    .attr('type', type)
                    .attr('id', id)
                    .attr('name', id);
                
                // Add validation attributes
                if (validation.required) inputElement.attr('required', '');
                if (validation.min !== null) inputElement.attr('min', validation.min);
                if (validation.max !== null) inputElement.attr('max', validation.max);
                if (validation.pattern) inputElement.attr('pattern', validation.pattern);
                if (validation.minLength !== null) inputElement.attr('minlength', validation.minLength);
                if (validation.maxLength !== null) inputElement.attr('maxlength', validation.maxLength);
                break;

            case 'textarea':
                inputElement = $('<textarea>')
                    .attr('id', id)
                    .attr('name', id);
                
                // Add validation attributes
                if (validation.required) inputElement.attr('required', '');
                if (validation.minLength !== null) inputElement.attr('minlength', validation.minLength);
                if (validation.maxLength !== null) inputElement.attr('maxlength', validation.maxLength);
                break;

            case 'select':
                inputElement = $('<select>')
                    .attr('id', id)
                    .attr('name', id);
                
                // Add validation attributes
                if (validation.required) inputElement.attr('required', '');
                
                // Add some default options
                const options = ['Option 1', 'Option 2', 'Option 3'];
                options.forEach(option => {
                    inputElement.append($('<option>').text(option));
                });
                break;

            case 'checkbox':
                inputElement = $('<div>').addClass('checkbox-group');
                const checkbox = $('<input>')
                    .attr('type', 'checkbox')
                    .attr('id', id)
                    .attr('name', id);
                
                // Add validation attributes
                if (validation.required) checkbox.attr('required', '');
                
                const checkboxLabel = $('<label>').attr('for', id).text(labelText);
                inputElement.append(checkbox, checkboxLabel);
                labelElement.remove(); // Remove the original label since we're using a custom one
                break;

            case 'radio':
                inputElement = $('<div>').addClass('radio-group');
                const radio = $('<input>')
                    .attr('type', 'radio')
                    .attr('id', id)
                    .attr('name', 'radio_group')
                    .attr('value', label);
                
                // Add validation attributes
                if (validation.required) radio.attr('required', '');
                
                const radioLabel = $('<label>').attr('for', id).text(labelText);
                inputElement.append(radio, radioLabel);
                labelElement.remove(); // Remove the original label since we're using a custom one
                break;
        }

        formGroup.append(labelElement, inputElement);
        return formGroup;
    }
}); 