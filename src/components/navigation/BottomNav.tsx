
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wine as WineIcon, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionManager } from '@/hooks/useSessionManager';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { hasValidSession } = useSessionManager();

  // Don't show bottom nav if user is not logged in or on auth pages
  if (!user || ['/login', '/register', '/forgot-password', '/email-confirmation', '/confirm', '/'].includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { 
      icon: Home, 
      label: 'Home', 
      href: '/home',
      isActive: location.pathname === '/home'
    },
    { 
      icon: WineIcon, 
      label: 'Pairing', 
      href: '/restaurant',
      isActive: ['/restaurant', '/upload', '/dishes', '/pairings'].includes(location.pathname),
      badge: hasValidSession() ? '•' : undefined
    },
    { 
      icon: WineIcon, 
      label: 'Library', 
      href: '/library',
      isActive: location.pathname === '/library'
    },
    { 
      icon: User, 
      label: 'Profile', 
      href: '/profile',
      isActive: location.pathname === '/profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex flex-col items-center py-2 px-3 min-w-0 relative ${
              item.isActive 
                ? 'text-purple-600' 
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"></span>
              )}
            </div>
            <span className="text-xs mt-1 truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
