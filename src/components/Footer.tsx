
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wine, Facebook, Instagram, Linkedin, Twitter, Youtube, Mail, Headphones, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Welcome to the Club!",
        description: "You've joined 4,000+ savvy sippers getting smart about wine.",
      });
      setEmail('');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Wine className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Wine-Wize</span>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Your AI-powered sommelier that makes perfect wine pairings accessible to everyone.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Features Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Features</h3>
            <ul className="space-y-3">
              <li><Link to="/welcome" className="text-slate-300 hover:text-purple-400 transition-colors">AI Wine Pairing</Link></li>
              <li><Link to="/welcome" className="text-slate-300 hover:text-purple-400 transition-colors">Menu Analysis</Link></li>
              <li><Link to="/welcome" className="text-slate-300 hover:text-purple-400 transition-colors">Wine Library</Link></li>
              <li><Link to="/welcome" className="text-slate-300 hover:text-purple-400 transition-colors">Personal Preferences</Link></li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-300 hover:text-purple-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-slate-300 hover:text-purple-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-slate-300 hover:text-purple-400 transition-colors">Contact</a></li>
              <li><a href="#" className="text-slate-300 hover:text-purple-400 transition-colors">Support</a></li>
            </ul>
            
            {/* Community Links */}
            <div className="mt-6 space-y-3">
              <a href="#" className="flex items-center gap-2 text-slate-300 hover:text-purple-400 transition-colors">
                <Headphones className="w-4 h-4" />
                <span className="text-sm">Everyday Sommelier Podcast</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-slate-300 hover:text-purple-400 transition-colors">
                <Users className="w-4 h-4" />
                <span className="text-sm">Wize Sippers Circle</span>
              </a>
            </div>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Join the Club</h3>
            <p className="text-slate-300 mb-4 text-sm">
              Thirsty for better pairings? 🍷 Join 4,000+ savvy sippers getting smart about wine.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 rounded-r-none"
                  required
                />
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-l-none px-3"
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </form>
            
            {/* Micro CTA for Podcast */}
            <div className="mt-6 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">Prefer audio learning?</span>
              </div>
              <p className="text-xs text-slate-300">
                Catch our <em>Everyday Sommelier</em> podcast — Listen on Spotify
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">
              © {currentYear} Wine-Wize. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link 
                to="/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-purple-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms-and-conditions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-purple-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookie-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-purple-400 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
