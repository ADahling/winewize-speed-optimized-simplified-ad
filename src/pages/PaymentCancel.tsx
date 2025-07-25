
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import BackButton from '@/components/navigation/BackButton';
import Copyright from '@/components/Copyright';

const PaymentCancel = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate('/subscription');
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-6">
          <BackButton fallbackPath="/subscription" label="Back to Subscription" />
        </div>

        <div className="flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Cancel Icon */}
              <div className="flex items-center justify-center mb-6">
                <XCircle className="w-20 h-20 text-amber-500" />
              </div>

              {/* Cancel Message */}
              <h1 className="text-3xl font-bold text-slate-800 mb-4">
                Payment Cancelled
              </h1>
              
              <p className="text-slate-600 mb-6">
                Your payment was cancelled. No charges were made to your account.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleRetryPayment}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                <Button 
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </div>

              {/* Help Text */}
              <p className="text-sm text-slate-500 mt-6">
                Need help? Contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  );
};

export default PaymentCancel;
