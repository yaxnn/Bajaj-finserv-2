export const fieldTypes = {
  TEXT: 'text',
  TEL: 'tel',
  EMAIL: 'email',
  TEXTAREA: 'textarea',
  DATE: 'date',
  DROPDOWN: 'dropdown',
  RADIO: 'radio',
  CHECKBOX: 'checkbox'
};

export const validateField = (value, field) => {
  if (field.required && (!value || value.length === 0)) {
    return 'This field is required';
  }

  if (field.minLength && value.length < field.minLength) {
    return `Minimum length is ${field.minLength} characters`;
  }

  if (field.maxLength && value.length > field.maxLength) {
    return `Maximum length is ${field.maxLength} characters`;
  }

  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
  }

  if (field.type === 'tel' && value) {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid 10-digit phone number';
    }
  }

  return '';
}; 