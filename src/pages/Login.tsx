import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api-client';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  jobTitle: string;
  password: string;
  confirmPassword: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error, clearError, loading } = useAuth();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    jobTitle: '',
    password: '',
    confirmPassword: ''
  });

  const [signupErrors, setSignupErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (signupErrors[name as keyof SignupFormData]) {
      setSignupErrors({
        ...signupErrors,
        [name]: undefined
      });
    }
  };

  const validateSignupForm = (): boolean => {
    const errors: Partial<Record<keyof SignupFormData, string>> = {};

    // Required field validation
    if (!signupData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!signupData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!signupData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!signupData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!signupData.address.trim()) {
      errors.address = 'Address is required';
    }
    if (!signupData.company.trim()) {
      errors.company = 'Company name is required';
    }
    if (!signupData.jobTitle.trim()) {
      errors.jobTitle = 'Job title is required';
    }
    if (!signupData.password) {
      errors.password = 'Password is required';
    } else if (signupData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    if (!signupData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginData.email, loginData.password);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }

    try {
      setIsSigningUp(true);
      
      // For now, signup is disabled - redirect to contact admin
      toast.error('New user registration is currently disabled. Please contact your administrator.');
      
      // Clear signup form
      setSignupData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        jobTitle: '',
        password: '',
        confirmPassword: ''
      });
      
      // Pre-fill login email
      setLoginData({
        email: signupData.email,
        password: ''
      });

    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="bg-blue-600 text-white p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                <polyline points="17 2 12 7 7 2"></polyline>
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignupMode ? 'Create your account' : 'Sign in to SpotGrid'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignupMode 
              ? 'Join SpotGrid to manage your TV advertising campaigns'
              : 'Manage your TV advertising campaigns'
            }
          </p>
        </div>
        
        {isSignupMode ? (
          // Signup Form
          <form className="mt-8 space-y-6" onSubmit={handleSignupSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  placeholder="First name"
                  value={signupData.firstName}
                  onChange={handleSignupChange}
                  error={signupErrors.firstName}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  placeholder="Last name"
                  value={signupData.lastName}
                  onChange={handleSignupChange}
                  error={signupErrors.lastName}
                />
              </div>
              
              <Input
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={signupData.email}
                onChange={handleSignupChange}
                error={signupErrors.email}
              />
              
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="Phone number"
                value={signupData.phone}
                onChange={handleSignupChange}
                error={signupErrors.phone}
              />
              
              <Input
                label="Address"
                name="address"
                type="text"
                autoComplete="street-address"
                required
                placeholder="Business address"
                value={signupData.address}
                onChange={handleSignupChange}
                error={signupErrors.address}
              />
              
              <Input
                label="Company Name"
                name="company"
                type="text"
                autoComplete="organization"
                required
                placeholder="Company name"
                value={signupData.company}
                onChange={handleSignupChange}
                error={signupErrors.company}
              />
              
              <Input
                label="Job Title"
                name="jobTitle"
                type="text"
                autoComplete="organization-title"
                required
                placeholder="Job title"
                value={signupData.jobTitle}
                onChange={handleSignupChange}
                error={signupErrors.jobTitle}
              />
              
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Password (min. 8 characters)"
                value={signupData.password}
                onChange={handleSignupChange}
                error={signupErrors.password}
              />
              
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Confirm password"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                error={signupErrors.confirmPassword}
              />
            </div>

            <div>
              <Button
                type="submit"
                className="group relative w-full"
                isLoading={isSigningUp}
              >
                Create Account
              </Button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignupMode(false)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        ) : (
          // Login Form
          <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <Input
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={loginData.email}
                onChange={handleLoginChange}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="group relative w-full"
                isLoading={loading}
              >
                Sign in
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setIsSignupMode(true)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Create an account
                </button>
              </div>
            </div>
          </form>
        )}
        
        {!isSignupMode && (
          <>
            {/* Demo credentials */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-100 text-gray-500">Demo credentials</span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div 
                  className="bg-white p-3 rounded border border-gray-300 text-sm text-center cursor-pointer hover:bg-gray-50"
                  onClick={() => setLoginData({ email: 'info@pursuitchannel.com', password: 'pursuit' })}
                >
                  <p className="font-medium">Regular User</p>
                  <p className="text-gray-500">info@pursuitchannel.com</p>
                </div>
                <div 
                  className="bg-white p-3 rounded border border-gray-300 text-sm text-center cursor-pointer hover:bg-gray-50"
                  onClick={() => setLoginData({ email: 'alex@pursuitchannel.com', password: 'pursuit' })}
                >
                  <p className="font-medium">Traffic Admin</p>
                  <p className="text-gray-500">alex@pursuitchannel.com</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;