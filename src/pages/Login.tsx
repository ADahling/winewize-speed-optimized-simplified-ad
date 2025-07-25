
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wine, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginInput } from '@/utils/validation';
import { logger } from '@/utils/logger';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginInput>>({});
  const { toast } = useToast();
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      logger.info('User already logged in, redirecting to home', { userId: user.id, email: user.email });
      navigate('/home');
    }
  }, [user, navigate]);

  const validateForm = (): boolean => {
    try {
      loginSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<LoginInput> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path) {
            fieldErrors[err.path[0] as keyof LoginInput] = err.message;
          }
        });
      }
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      logger.warn('Login form validation failed', { errors });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Enhanced logging for admin troubleshooting
      logger.info('🔐 STARTING LOGIN PROCESS WITH CORRECT SUPABASE PROJECT', { 
        email, 
        timestamp: new Date().toISOString(),
        isKristiEmail: email === 'kristimayfield@wine-wize.com',
        expectedUserId: email === 'kristimayfield@wine-wize.com' ? '7daa99e0-a34e-4130-8dee-139ac28fdc4c' : 'unknown',
        supabaseProject: 'kkkoepjiwdlchkkrvmub'
      });

      // Clear any cached session data before login
      if (email === 'kristimayfield@wine-wize.com') {
        console.log('🧹 CLEARING CACHED DATA FOR ADMIN LOGIN');
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }

      const { error } = await signIn(email, password);
      
      if (error) {
        logger.error('❌ LOGIN FAILED', { 
          error: error.message, 
          email,
          errorCode: error.code || 'unknown',
          timestamp: new Date().toISOString(),
          supabaseProject: 'kkkoepjiwdlchkkrvmub'
        });
        
        // Enhanced error handling for admin account
        if (email === 'kristimayfield@wine-wize.com') {
          console.error('🚨 ADMIN LOGIN FAILED - DETAILED ERROR:', {
            error,
            message: error.message,
            status: error.status,
            cause: error.cause
          });
          
          toast({
            title: "Admin Login Failed",
            description: `Authentication error: ${error.message}. Please contact support if this persists.`,
            variant: "destructive",
          });
        } else if (error.message?.includes('400') || error.message?.toLowerCase().includes('invalid')) {
          toast({
            title: "Invalid Credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        logger.info('✅ LOGIN SUCCESSFUL', { 
          email,
          timestamp: new Date().toISOString(),
          supabaseProject: 'kkkoepjiwdlchkkrvmub'
        });
        
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        
        // Check if this is the admin user
        if (email === 'kristimayfield@wine-wize.com') {
          logger.info('🔑 ADMIN USER LOGGED IN - Redirecting to admin dashboard', { email });
          navigate('/admin');
        } else {
          navigate('/home');
        }
      }
    } catch (error) {
      logger.error('💥 LOGIN EXCEPTION', { 
        error: error instanceof Error ? error.message : String(error), 
        email,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        supabaseProject: 'kkkoepjiwdlchkkrvmub'
      });
      
      toast({
        title: "Unexpected Error",
        description: "Something went wrong during login. Please try again.",
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-6">
            <Wine className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-purple-100">Sign in to continue your wine journey</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
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
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="remember" className="text-purple-200 text-sm">
                Remember me
              </label>
            </div>
            
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-purple-200 hover:text-white text-sm">
              Forgot your password?
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <span className="text-purple-200">Don't have an account? </span>
            <Link to="/register" className="text-white font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* Back to Home link moved below the card */}
        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
