import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    rollNumber: false,
    name: false
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    
    if (error) setError('');
  };

  const handleBlur = (e) => {
    setTouched(prev => ({
      ...prev,
      [e.target.name]: true
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.rollNumber.trim()) {
      errors.push('Roll number is required');
    } else if (formData.rollNumber.trim().length < 3) {
      errors.push('Roll number must be at least 3 characters');
    }
    
    if (!formData.name.trim()) {
      errors.push('Name is required');
    } else if (formData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      console.log('Attempting to create user with data:', formData);
      const response = await axios.post('https://dynamic-form-generator-9rl7.onrender.com/create-user', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success) {
        
        localStorage.setItem('userData', JSON.stringify({
          rollNumber: formData.rollNumber,
          name: formData.name
        }));
        
        
        navigate('/form');
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
      
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        console.error('Error headers:', err.response.headers);
        setError(err.response.data?.message || 'Server error occurred. Please try again.');
      } else if (err.request) {
        
        console.error('No response received:', err.request);
        setError('No response from server. Please check your internet connection.');
      } else {
        
        console.error('Error setting up request:', err.message);
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.rollNumber.trim().length >= 3 && 
                     formData.name.trim().length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-indigo-100/20 to-blue-100/20 rounded-full animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-r from-blue-100/20 to-indigo-100/20 rounded-full animate-pulse-slow animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md transform transition-all duration-300 hover:scale-[1.02] relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 animate-pulse-slow"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Student Portal</h2>
              <p className="text-indigo-100 mt-2">Welcome back! Please login to continue</p>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fade-in backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      id="rollNumber"
                      name="rollNumber"
                      type="text"
                      required
                      minLength={3}
                      value={formData.rollNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        touched.rollNumber && !formData.rollNumber.trim()
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      } rounded-md focus:outline-none focus:ring-0 focus:border-transparent sm:text-sm transition-all duration-200`}
                      placeholder="Enter your roll number"
                      aria-invalid={touched.rollNumber && !formData.rollNumber.trim()}
                      aria-describedby={touched.rollNumber && !formData.rollNumber.trim() ? 'rollNumber-error' : undefined}
                    />
                  </div>
                  {touched.rollNumber && !formData.rollNumber.trim() && (
                    <p id="rollNumber-error" className="mt-1 text-sm text-red-600 animate-fade-in">
                      Roll number is required
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      minLength={2}
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        touched.name && !formData.name.trim()
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      } rounded-md focus:outline-none focus:ring-0 focus:border-transparent sm:text-sm transition-all duration-200`}
                      placeholder="Enter your name"
                      aria-invalid={touched.name && !formData.name.trim()}
                      aria-describedby={touched.name && !formData.name.trim() ? 'name-error' : undefined}
                    />
                  </div>
                  {touched.name && !formData.name.trim() && (
                    <p id="name-error" className="mt-1 text-sm text-red-600 animate-fade-in">
                      Name is required
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading || !isFormValid
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  } transition-all duration-200`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 