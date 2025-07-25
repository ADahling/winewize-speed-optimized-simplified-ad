
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wine, X, Home, Upload, Utensils, BookOpen, BarChart3, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminUser } from '@/utils/adminUtils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onSignOut }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if user is site admin
  const isSiteAdmin = user && isAdminUser(user);

  const navigationItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Start Wine Journey', path: '/welcome', icon: Wine },
    { name: 'Restaurant Search', path: '/restaurant', icon: Utensils },
    { name: 'Upload Menu', path: '/upload', icon: Upload },
    { name: 'Wine Library', path: '/library', icon: BookOpen },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Wine Preferences', path: '/wine-preferences', icon: Settings },
  ];

  const quickNavRoutes = [
    { path: '/', label: '/ (Landing)' },
    { path: '/home', label: '/home' },
    { path: '/welcome', label: '/welcome' },
    { path: '/restaurant', label: '/restaurant' },
    { path: '/upload', label: '/upload' },
    { path: '/dishes', label: '/dishes' },
    { path: '/pairings', label: '/pairings' },
    { path: '/library', label: '/library' },
    { path: '/profile', label: '/profile' },
    { path: '/dashboard', label: '/dashboard' },
    { path: '/wine-preferences', label: '/wine-preferences' },
    { path: '/login', label: '/login' },
    { path: '/register', label: '/register' },
    { path: '/email-confirmation', label: '/email-confirmation' },
    { path: '/confirm', label: '/confirm' },
    { path: '/forgot-password', label: '/forgot-password' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose}>
      <div 
        className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Wine className="w-6 h-6 text-purple-600" />
            <span className="text-lg font-bold text-slate-800">Navigation</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick Navigation Section - Only show for site_admin */}
        {isSiteAdmin && (
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wide mb-3">🚀 DEV NAVIGATION</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {quickNavRoutes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  onClick={onClose}
                  className={`block px-3 py-2 text-sm font-mono rounded-md transition-colors ${
                    location.pathname === route.path
                      ? 'bg-purple-100 text-purple-800 font-semibold'
                      : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  {route.label}
                  {location.pathname === route.path && (
                    <span className="text-xs text-purple-600 ml-2">← HERE</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="py-4">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer section for authenticated users */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50">
            <Button
              onClick={onSignOut}
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
