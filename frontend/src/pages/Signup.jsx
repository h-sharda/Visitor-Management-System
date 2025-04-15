import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAccessRequest } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import '../styles/login.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    purpose: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.purpose) {
      showNotification('All fields are required', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await createAccessRequest(formData);
      showNotification(response.message, 'success');
      // Clear form
      setFormData({ fullName: '', email: '', purpose: '' });
      // Redirect to login with success message
      navigate('/login', { state: { message: 'Request submitted successfully. You will be notified once approved.' } });
    } catch (error) {
      console.error('Signup error:', error);
      showNotification(error.response?.data?.message || 'Error submitting request. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Request Access
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Fill in the form below to request access to the system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                Purpose
              </label>
              <div className="mt-1">
                <textarea
                  id="purpose"
                  name="purpose"
                  rows="3"
                  required
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Please explain why you need access to the system"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>

            <div className="text-sm text-center">
              <a 
                href="/login" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Already have an account? Sign in
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
