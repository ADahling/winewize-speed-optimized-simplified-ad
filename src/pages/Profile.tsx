import React from 'react';
import Header from '@/components/Header';
import BreadcrumbNav from '@/components/navigation/BreadcrumbNav';
import SessionRecovery from '@/components/navigation/SessionRecovery';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileWineLibrary from '@/components/profile/ProfileWineLibrary';
import ProfileSettings from '@/components/profile/ProfileSettings';
import ProfileUsage from '@/components/profile/ProfileUsage';
import Copyright from '@/components/Copyright';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';

const Profile = () => {
  const { user } = useAuth();
  const {
    profile,
    stats,
    wineLibrary,
    isLoading,
    getInitials,
    getDisplayName,
    getMemberSince
  } = useProfileData(user?.id);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-32 md:pb-8">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20 text-center">
          <p className="text-slate-600">Please log in to view your profile.</p>
        </div>
        <Copyright />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-32 md:pb-8">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-20">
        <BreadcrumbNav />
        
        {/* Session Recovery Card */}
        <SessionRecovery className="mb-6" />

        {/* Profile Section */}
        <ProfileHeader
          isLoading={isLoading}
          getInitials={getInitials}
          getDisplayName={getDisplayName}
          getMemberSince={getMemberSince}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ProfileStats isLoading={isLoading} stats={stats} />
          <ProfileUsage />
        </div>

        {/* Wine Library */}
        <ProfileWineLibrary isLoading={isLoading} wineLibrary={wineLibrary} />

        {/* Settings */}
        <ProfileSettings />
      </div>
      <Copyright />
    </div>
  );
};

export default Profile;
