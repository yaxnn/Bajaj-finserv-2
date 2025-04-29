import { useState, useEffect } from 'react';
import axios from 'axios';
import { validateField, fieldTypes } from '../types/form';
import { useNavigate } from 'react-router-dom';

const DynamicForm = () => {
  const [formData, setFormData] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectionTransition, setSectionTransition] = useState('');
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData?.rollNumber) {
          setApiError('Please login to access the form');
          setLoading(false);
          navigate('/');
          return;
        }

        console.log('Fetching form for roll number:', userData.rollNumber);
        const response = await axios.get(`https://dynamic-form-generator-9rl7.onrender.com/get-form?rollNumber=${userData.rollNumber}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log('Form API Response:', response.data);
        
        if (!response.data?.form) {
          console.error('Invalid form data received:', response.data);
          throw new Error('Invalid form data received');
        }

        setFormData(response.data.form);
        
        
        const initialValues = {};
        response.data.form.sections.forEach(section => {
          section.fields.forEach(field => {
            initialValues[field.fieldId] = field.type === fieldTypes.CHECKBOX ? [] : '';
          });
        });
        setFormValues(initialValues);
      } catch (error) {
        console.error('Error fetching form:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          setApiError(error.response.data?.message || 'Failed to load form. Please try again later.');
        } else if (error.request) {
          console.error('No response received:', error.request);
          setApiError('No response from server. Please check your internet connection.');
        } else {
          console.error('Error setting up request:', error.message);
          setApiError('An error occurred while loading the form. Please try again.');
        }
        
        if (error.response?.status === 401) {
          localStorage.removeItem('userData');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [navigate]);

  const handleInputChange = (fieldId, value, type) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: type === fieldTypes.CHECKBOX
        ? (prev[fieldId].includes(value)
          ? prev[fieldId].filter(v => v !== value)
          : [...prev[fieldId], value])
        : value
    }));

    
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateSection = (sectionFields) => {
    const newErrors = {};
    let isValid = true;

    sectionFields.forEach(field => {
      const error = validateField(formValues[field.fieldId], field);
      if (error) {
        newErrors[field.fieldId] = error;
        isValid = false;
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNext = () => {
    const currentSectionData = formData.sections[currentSection];
    if (validateSection(currentSectionData.fields)) {
      setSectionTransition('slide-out-left');
      setTimeout(() => {
        setCurrentSection(prev => prev + 1);
        setSectionTransition('slide-in-right');
      }, 300);
    }
  };

  const handlePrev = () => {
    setSectionTransition('slide-out-right');
    setTimeout(() => {
      setCurrentSection(prev => prev - 1);
      setSectionTransition('slide-in-left');
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentSectionData = formData.sections[currentSection];
    if (validateSection(currentSectionData.fields)) {
      setIsSubmitting(true);
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData?.rollNumber) {
          setApiError('Please login to submit the form');
          navigate('/');
          return;
        }

        const response = await axios.post('https://dynamic-form-generator-9rl7.onrender.com/submit-form', {
          rollNumber: userData.rollNumber,
          formData: formValues
        });
        
        if (response.data.success) {
          
          console.log('Form submitted successfully');
        } else {
          throw new Error('Failed to submit form');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        setApiError(error.response?.data?.message || 'Failed to submit form. Please try again.');
        if (error.response?.status === 401) {
          localStorage.removeItem('userData');
          navigate('/');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600" role="status" aria-label="Loading">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!formData || apiError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Error loading form</h3>
          <p className="mt-2 text-gray-600">{apiError || 'Please try again later or contact support'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentSectionData = formData.sections[currentSection];
  const progress = ((currentSection + 1) / formData.sections.length) * 100;

  const renderField = (field) => {
    const commonProps = {
      id: field.fieldId,
      name: field.fieldId,
      'data-testid': field.dataTestId,
      'aria-invalid': errors[field.fieldId] ? 'true' : 'false',
      'aria-describedby': errors[field.fieldId] ? `${field.fieldId}-error` : undefined,
      onChange: (e) => handleInputChange(field.fieldId, e.target.value, field.type),
      className: `mt-1 block w-full rounded-md shadow-sm transition-all duration-200 ${
        errors[field.fieldId] 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
          : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
      } sm:text-sm`
    };

    switch (field.type) {
      case fieldTypes.TEXTAREA:
        return (
          <textarea
            {...commonProps}
            value={formValues[field.fieldId]}
            placeholder={field.placeholder}
            rows={4}
            className={`${commonProps.className} resize-none`}
            aria-label={field.label}
          />
        );

      case fieldTypes.DROPDOWN:
        return (
          <select
            {...commonProps}
            value={formValues[field.fieldId]}
            className={`${commonProps.className} appearance-none bg-white`}
            aria-label={field.label}
          >
            <option value="">Select an option</option>
            {field.options?.map(option => (
              <option
                key={option.value}
                value={option.value}
                data-testid={option.dataTestId}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case fieldTypes.RADIO:
        return (
          <div className="space-y-2" role="radiogroup" aria-label={field.label}>
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.fieldId}-${option.value}`}
                  name={field.fieldId}
                  value={option.value}
                  checked={formValues[field.fieldId] === option.value}
                  onChange={(e) => handleInputChange(field.fieldId, e.target.value, field.type)}
                  data-testid={option.dataTestId}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  aria-label={option.label}
                />
                <label
                  htmlFor={`${field.fieldId}-${option.value}`}
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case fieldTypes.CHECKBOX:
        return (
          <div className="space-y-2" role="group" aria-label={field.label}>
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${field.fieldId}-${option.value}`}
                  name={field.fieldId}
                  value={option.value}
                  checked={formValues[field.fieldId].includes(option.value)}
                  onChange={(e) => handleInputChange(field.fieldId, e.target.value, field.type)}
                  data-testid={option.dataTestId}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  aria-label={option.label}
                />
                <label
                  htmlFor={`${field.fieldId}-${option.value}`}
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type={field.type}
            value={formValues[field.fieldId]}
            placeholder={field.placeholder}
            aria-label={field.label}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-100">
                    Section {currentSection + 1} of {formData.sections.length}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-indigo-600">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-indigo-100">
                <div
                  style={{ width: `${progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{formData.formTitle}</h1>
              <p className="text-sm text-gray-500 mt-1">Version {formData.version}</p>
            </div>
            
            <div className={`mb-8 transition-all duration-300 ${sectionTransition}`}>
              <h2 className="text-xl font-semibold text-gray-800">{currentSectionData.title}</h2>
              <p className="text-gray-600 mt-1">{currentSectionData.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {currentSectionData.fields.map(field => (
                <div key={field.fieldId} className="space-y-1">
                  <label htmlFor={field.fieldId} className="block text-sm font-medium text-gray-700">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    {renderField(field)}
                  </div>
                  {errors[field.fieldId] && (
                    <p id={`${field.fieldId}-error`} className="text-red-500 text-sm mt-1 flex items-center animate-fade-in">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors[field.fieldId]}
                    </p>
                  )}
                </div>
              ))}

              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {currentSection > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                )}
                
                {currentSection < formData.sections.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    Next
                    <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ${
                      isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit
                        <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicForm; 