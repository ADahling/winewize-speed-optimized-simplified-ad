
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  fallbackPath?: string;
  label?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  fallbackPath = '/welcome', 
  label = 'Back',
  className 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const currentPath = location.pathname;
    
    // Define specific navigation flows
    const navigationFlow: Record<string, string> = {
      '/restaurant': '/welcome',
      '/upload': '/restaurant',
      '/dishes': '/upload',
      '/pairings': '/dishes',
      '/wine-preferences': '/profile',
      '/profile': '/welcome',
      '/library': '/profile',
      '/subscription': '/profile'
    };

    // Get the specific fallback for current path or use provided fallback
    const targetPath = navigationFlow[currentPath] || fallbackPath;
    
    console.log(`Navigating back from ${currentPath} to ${targetPath}`);
    navigate(targetPath);
  };

  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className={`flex items-center gap-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors px-3 py-2 ${className || ''}`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
      </Button>
    </div>
  );
};

export default BackButton;
