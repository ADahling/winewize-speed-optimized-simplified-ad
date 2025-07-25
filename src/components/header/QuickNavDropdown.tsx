
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const QuickNavDropdown: React.FC = () => {
  const location = useLocation();

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

  return (
    <div className="flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 text-slate-700 hover:text-slate-900 border-2 border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100">
            <span className="text-sm font-mono font-bold text-purple-700">{location.pathname}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-64 bg-white border-2 border-purple-200 shadow-xl max-h-80 overflow-y-auto z-50">
          <div className="px-3 py-2 bg-purple-50">
            <p className="text-sm font-bold text-purple-700 uppercase tracking-wide">🚀 DEV NAVIGATION</p>
            <p className="text-xs text-purple-600">Quick jump to any page</p>
          </div>
          <DropdownMenuSeparator />
          {quickNavRoutes.map((route) => (
            <DropdownMenuItem 
              key={route.path}
              asChild
              className={`${
                location.pathname === route.path 
                  ? 'bg-purple-100 text-purple-800 font-semibold' 
                  : 'hover:bg-purple-50'
              } cursor-pointer`}
            >
              <Link 
                to={route.path} 
                className="flex items-center justify-between w-full font-mono text-sm py-2"
              >
                <span>{route.label}</span>
                {location.pathname === route.path && (
                  <span className="text-sm text-purple-600 font-bold">← YOU ARE HERE</span>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default QuickNavDropdown;
