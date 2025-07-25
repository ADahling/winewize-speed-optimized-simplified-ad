
import React from 'react';
import { Link } from 'react-router-dom';
import { Wine } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingNavigation = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Wine className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-slate-800">Wine Wize</h1>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-slate-600 hover:text-purple-600 transition-colors font-medium"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('benefits')}
              className="text-slate-600 hover:text-purple-600 transition-colors font-medium"
            >
              Benefits
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-slate-600 hover:text-purple-600 transition-colors font-medium"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="text-slate-600 hover:text-purple-600 transition-colors font-medium"
            >
              Testimonials
            </button>
          </nav>

          {/* Login Button */}
          <Link to="/login">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingNavigation;
