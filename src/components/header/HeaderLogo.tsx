
import React from 'react';
import { Link } from 'react-router-dom';
import { Wine } from 'lucide-react';

interface HeaderLogoProps {
  user: any;
}

const HeaderLogo: React.FC<HeaderLogoProps> = ({ user }) => {
  return (
    <Link to={user ? "/home" : "/"} className="flex items-center gap-2">
      <Wine className="w-8 h-8 text-purple-600" />
      <h1 className="text-2xl font-bold text-slate-800">Wine Wize</h1>
    </Link>
  );
};

export default HeaderLogo;
