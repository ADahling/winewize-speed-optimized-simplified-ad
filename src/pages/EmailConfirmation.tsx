
import React from 'react';
import { Link } from 'react-router-dom';
import { Wine, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Copyright from '@/components/Copyright';

const EmailConfirmation = () => {
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
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
          <p className="text-purple-100">We've sent you a confirmation link</p>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Wine className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Almost There!</h2>
              <p className="text-purple-100 leading-relaxed">
                We've sent a confirmation email to your inbox. Please click the link in the email to verify your account and complete your registration.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-sm text-purple-200">
                <strong>Next steps:</strong><br />
                1. Check your email inbox<br />
                2. Click the confirmation link<br />
                3. You'll be redirected back to complete your wine preferences
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-purple-200">
                Didn't receive the email? Check your spam folder or try registering again.
              </p>
              
              <Link to="/register">
                <Button 
                  variant="outline" 
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Back to Registration
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Copyright className="text-white/60" />
    </div>
  );
};

export default EmailConfirmation;
