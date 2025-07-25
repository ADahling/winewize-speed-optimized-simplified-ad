
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useAuth } from '@/contexts/AuthContext';

interface SessionRecoveryProps {
  className?: string;
}

const SessionRecovery: React.FC<SessionRecoveryProps> = ({ className }) => {
  const navigate = useNavigate();
  const { hasValidSession } = useSessionManager();
  const { user } = useAuth();

  // Only show session recovery if user is authenticated and has a valid session
  if (!user || !hasValidSession()) {
    return null;
  }

  const restaurantName = localStorage.getItem('currentRestaurantName');

  return (
    <Card className={`p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-slate-800">Continue Previous Session</h3>
            <p className="text-sm text-slate-600">
              {restaurantName ? `Resume pairing for ${restaurantName}` : 'Resume your wine pairing session'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/dishes')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
};

export default SessionRecovery;
