
import React, { useState } from 'react';

interface WineDescriptionProps {
  description: string;
  maxLines?: number;
}

const WineDescription = ({ description, maxLines = 3 }: WineDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if description is long enough to need truncation
  const needsTruncation = description.length > 150; // Rough estimate for 3 lines
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click handler
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="text-sm text-slate-700 mb-3 font-medium">
      <p className={`${!isExpanded && needsTruncation ? `line-clamp-${maxLines}` : ''} leading-relaxed`}>
        {description}
      </p>
      {needsTruncation && (
        <button
          onClick={handleToggle}
          className="text-purple-600 hover:text-purple-700 text-xs font-medium mt-1 underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 rounded px-1 py-0.5 min-h-[44px] flex items-center"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

export default WineDescription;
