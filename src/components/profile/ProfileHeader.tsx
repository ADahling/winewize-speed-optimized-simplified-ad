
import React from 'react';
import { Link } from 'react-router-dom';
import { User, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileHeaderProps {
  isLoading: boolean;
  getInitials: () => string;
  getDisplayName: () => string;
  getMemberSince: () => string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  isLoading,
  getInitials,
  getDisplayName,
  getMemberSince
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
            {isLoading ? (
              <Skeleton className="w-16 h-16 rounded-xl" />
            ) : (
              getInitials()
            )}
          </div>
          <div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-800">{getDisplayName()}</h2>
                <p className="text-slate-600">Member since {getMemberSince()}</p>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white whitespace-normal break-words text-center px-3 py-2 min-w-0">
              <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="leading-tight">View Analytics</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
