
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import WinePreferencesForm from '@/components/WinePreferencesForm';
import Header from '@/components/Header';
import BreadcrumbNav from '@/components/navigation/BreadcrumbNav';
import BackButton from '@/components/navigation/BackButton';
import Copyright from '@/components/Copyright';

const WinePreferences = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handlePreferencesComplete = () => {
    toast({
      title: "Preferences Updated!",
      description: "Your wine preferences have been successfully updated.",
    });
    navigate('/profile');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pb-32 md:pb-8" style={{ backgroundColor: '#F8FAFC' }}>
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-4">
          <BreadcrumbNav />
          <div className="mb-4">
            <BackButton fallbackPath="/profile" label="Back to Profile" />
          </div>
        </div>
        <WinePreferencesForm userId={user.id} onComplete={handlePreferencesComplete} />
      </div>
      <Copyright />
    </div>
  );
};

export default WinePreferences;
