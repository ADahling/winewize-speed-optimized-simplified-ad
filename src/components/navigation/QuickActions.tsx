
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Wine, Upload, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionManager } from '@/hooks/useSessionManager';

const QuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { hasValidSession } = useSessionManager();

  // Don't show on auth pages or if not logged in
  if (!user || ['/login', '/register', '/forgot-password', '/email-confirmation', '/confirm', '/'].includes(location.pathname)) {
    return null;
  }

  const quickActions = [
    {
      icon: Wine,
      label: 'Quick Pairing',
      action: () => {
        if (hasValidSession()) {
          navigate('/pairings');
        } else {
          navigate('/restaurant');
        }
      },
      show: location.pathname !== '/pairings'
    },
    {
      icon: Upload,
      label: 'New Session',
      action: () => navigate('/restaurant'),
      show: !['/restaurant', '/upload'].includes(location.pathname)
    },
    {
      icon: Home,
      label: 'Home',
      action: () => navigate('/home'),
      show: location.pathname !== '/home'
    }
  ];

  const visibleActions = quickActions.filter(action => action.show);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-40">
      {/* Action buttons - shown when open */}
      {isOpen && (
        <div className="flex flex-col gap-2 mb-2">
          {visibleActions.map((action, index) => (
            <Button
              key={index}
              size="sm"
              onClick={() => {
                action.action();
                setIsOpen(false);
              }}
              className="bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2 whitespace-nowrap"
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Main trigger button */}
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full shadow-lg transition-transform ${
          isOpen ? 'rotate-45' : 'rotate-0'
        } bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700`}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default QuickActions;
