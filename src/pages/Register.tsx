
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wine, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import LocationAutocomplete from '@/components/location/LocationAutocomplete';
import { logger } from '@/utils/logger';
import { signupSchema, type SignupInput } from '@/utils/validation';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccessful, setRegistrationSuccessful] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignupInput, string>>>({});
  const { toast } = useToast();
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // Watch for user auth state changes after successful registration
  useEffect(() => {
    if (registrationSuccessful && user) {
      logger.info('Registration successful, navigating to home', { 
        userId: user.id, 
        userEmail: user.email 
      });
      toast({
        title: "Welcome to Wine Wize!",
        description: "Your account has been created successfully.",
      });
      navigate('/home');
    }
  }, [registrationSuccessful, user, navigate, toast]);

  const validateForm = (): boolean => {
    try {
      signupSchema.parse({ 
        email, 
        password, 
        confirmPassword, 
        fullName: `${firstName} ${lastName}`.trim(),
        agreeToTerms 
      });
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<Record<keyof SignupInput, string>> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            const fieldName = err.path[0] as keyof SignupInput;
            fieldErrors[fieldName] = err.message as string;
          }
        });
      }
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      logger.warn('Registration form validation failed', { errors });
      return;
    }
    
    setIsLoading(true);
    
    try {
      logger.info('Starting registration process', { email, firstName, lastName, location });
      
      const { error } = await signUp(email, password, firstName, lastName, location);
      
      if (error) {
        logger.error('Registration failed', { error, email });
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        logger.info('Registration API call successful', { email });
        setRegistrationSuccessful(true);
        // Don't navigate immediately - let the useEffect handle it after user state is updated
      }
    } catch (error) {
      logger.error('Registration process error', { error, email });
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-6">
            <Wine className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Join Wine Wize</h1>
          <p className="text-purple-100">Create your account to start your wine journey</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleRegistration} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-purple-200 ${
                    errors.fullName ? 'border-red-400' : ''
                  }`}
                  required
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-purple-200 ${
                    errors.fullName ? 'border-red-400' : ''
                  }`}
                  required
                />
              </div>
            </div>
            {errors.fullName && (
              <p className="text-red-300 text-sm mt-1">{errors.fullName}</p>
            )}
            
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-white/10 border-white/20 text-white placeholder:text-purple-200 ${
                  errors.email ? 'border-red-400' : ''
                }`}
                required
              />
              {errors.email && (
                <p className="text-red-300 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div className="[&_.space-y-2]:space-y-0 [&_label]:hidden [&_input]:bg-white/10 [&_input]:border-white/20 [&_input]:text-white [&_input]:placeholder:text-purple-200">
              <LocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Enter your location"
                required
                disabled={isLoading}
                allowUnauthenticated={true}
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-white/10 border-white/20 text-white placeholder:text-purple-200 ${
                  errors.password ? 'border-red-400' : ''
                }`}
                required
              />
              {errors.password && (
                <p className="text-red-300 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`bg-white/10 border-white/20 text-white placeholder:text-purple-200 ${
                  errors.confirmPassword ? 'border-red-400' : ''
                }`}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-300 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="agreeToTerms" className="text-purple-200 text-sm">
                I agree to the{' '}
                <Link to="/terms-and-conditions" className="text-white hover:underline">
                  Terms & Conditions
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-300 text-sm mt-1">{errors.agreeToTerms}</p>
            )}
            
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <span className="text-purple-200">Already have an account? </span>
            <Link to="/login" className="text-white font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
