
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const BreadcrumbNav: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbMap: { [key: string]: string } = {
    'welcome': 'Welcome',
    'upload': 'Upload Menu',
    'dishes': 'Select Dishes',
    'pairings': 'Wine Pairings',
    'library': 'Wine Library',
    'profile': 'Profile',
    'dashboard': 'Dashboard',
    'wine-preferences': 'Wine Preferences'
  };

  if (pathSegments.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
      <Link 
        to="/" 
        className="flex items-center hover:text-purple-600 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        const isLast = index === pathSegments.length - 1;
        const displayName = breadcrumbMap[segment] || segment;

        return (
          <div key={segment} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-slate-400" />
            {isLast ? (
              <span className="text-slate-800 font-medium">{displayName}</span>
            ) : (
              <Link 
                to={path} 
                className="hover:text-purple-600 transition-colors"
              >
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNav;
