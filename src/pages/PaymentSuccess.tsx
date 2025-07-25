
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Wine, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Copyright from '@/components/Copyright';
import { useAuth } from '@/contexts/AuthContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { checkSubscription } = useAuth();

  useEffect(() => {
    // Refresh subscription status after successful payment
    checkSubscription();
  }, [checkSubscription]);

  const handleContinue = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="flex items-center justify-center px-4 pt-20 pb-32 md:pb-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-green-500" />
                <Wine className="w-8 h-8 text-purple-600 absolute -bottom-2 -right-2 bg-white rounded-full p-1" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Welcome to Wine Wize!
            </h1>
            
            <p className="text-slate-600 mb-6">
              Your subscription is now active. Get ready to discover amazing wine pairings!
            </p>

            {/* What's Next */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-purple-800 mb-2">What's next?</h3>
              <ul className="text-sm text-purple-700 space-y-1 text-left">
                <li>• Start creating wine pairings</li>
                <li>• Explore your wine library</li>
                <li>• Access premium recommendations</li>
              </ul>
            </div>

            {/* Continue Button */}
            <Button 
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
            >
              Start Exploring
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  );
};

export default PaymentSuccess;
