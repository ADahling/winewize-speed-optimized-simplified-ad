
import React from 'react';
import { Copyright as CopyrightIcon } from 'lucide-react';

interface CopyrightProps {
  className?: string;
}

const Copyright: React.FC<CopyrightProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={`fixed bottom-4 left-4 z-10 flex items-center gap-1 text-xs text-slate-400 ${className}`}>
      <CopyrightIcon className="w-3 h-3" />
      <span>{currentYear} Wine Wize</span>
    </div>
  );
};

export default Copyright;
