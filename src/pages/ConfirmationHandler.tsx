
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wine } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Copyright from '@/components/Copyright';

const ConfirmationHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleConfirmation = async () => {
      // Check if we have confirmation tokens in the URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        // Tokens are present, user was redirected from email confirmation
        toast({
          title: "Account confirmed!",
          description: "Let's set up your wine preferences.",
        });
        
        // Wait a moment for auth state to update, then redirect to preferences
        setTimeout(() => {
          navigate('/wine-preferences');
        }, 1500);
      } else if (user) {
        // User is already authenticated, redirect to preferences
        navigate('/wine-preferences');
      } else {
        // No tokens and no user, redirect to login
        toast({
          title: "Please log in",
          description: "You need to log in to continue.",
          variant: "destructive",
        });
        navigate('/login');
      }
      
      setIsProcessing(false);
    };

    handleConfirmation();
  }, [searchParams, user, navigate, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex items-center justify-center px-4">
        <div className="text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-6 animate-pulse">
            <Wine className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Setting up your account...</h2>
          <p>Please wait while we prepare your wine journey.</p>
        </div>
        <Copyright className="text-white/60" />
      </div>
    );
  }

  return null;
};

export default ConfirmationHandler;
