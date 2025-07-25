
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import HeaderLogo from './header/HeaderLogo';
import QuickNavDropdown from './header/QuickNavDropdown';
import UserProfileDropdown from './header/UserProfileDropdown';
import MobileMenu from './header/MobileMenu';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Check if we're in preview mode (not dev mode)
  const isPreviewMode = !window.location.hostname.includes('localhost') && 
                       !window.location.hostname.includes('127.0.0.1') &&
                       !window.location.pathname.includes('/dev');

  // Check if we're on the home page
  const isHomePage = location.pathname === '/home';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Menu button and Logo */}
            <div className="flex items-center gap-3">
              {/* Hamburger Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="text-slate-600 hover:text-slate-800"
              >
                <Menu className="w-6 h-6" />
              </Button>

              {/* Logo */}
              <HeaderLogo user={user} />
            </div>

            {/* Center - Quick Navigation Dropdown (only show in dev mode) */}
            {!isPreviewMode && <QuickNavDropdown />}

            {/* Right side - Authentication controls */}
            {user ? (
              <UserProfileDropdown />
            ) : isHomePage ? (
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Login
              </Button>
            ) : (
              <UserProfileDropdown />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu Overlay */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        onSignOut={handleSignOut}
      />
    </>
  );
};

export default Header;
