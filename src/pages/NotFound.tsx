
import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Copyright from '@/components/Copyright';
import { logger } from '@/utils/logger';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    logger.error('404 Error: User attempted to access non-existent route', { 
      pathname: location.pathname,
      userAgent: navigator.userAgent 
    });
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="flex items-center justify-center px-4 pt-20 pb-32 md:pb-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* 404 Icon */}
            <div className="text-8xl font-bold text-purple-600 mb-4">404</div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Page Not Found</h1>
            <p className="text-slate-600 mb-8">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleGoHome}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Button>

              <Button 
                onClick={handleGoBack}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* URL Info */}
            <div className="mt-6 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">
                Requested URL: <code className="bg-slate-200 px-1 rounded">{location.pathname}</code>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  );
};

export default NotFound;
