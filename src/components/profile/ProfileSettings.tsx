
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const ProfileSettings: React.FC = () => {
  const { openCustomerPortal, subscriptionInfo } = useAuth();
  const navigate = useNavigate();

  const handleManageSubscription = async () => {
    navigate('/subscription');
  };

  const handleNotifications = () => {
    navigate('/dashboard');
  };

  const handleAccountSettings = () => {
    navigate('/profile');
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Settings
      </h3>
      
      <div className="space-y-3">
        <Link to="/wine-preferences">
          <Button variant="outline" className="w-full justify-start">
            Wine Preferences
          </Button>
        </Link>
        {subscriptionInfo.subscribed && (
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleManageSubscription}
          >
            <Crown className="w-4 h-4 mr-2" />
            Manage Subscription
          </Button>
        )}
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleNotifications}
        >
          Notifications
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleAccountSettings}
        >
          Account Settings
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
