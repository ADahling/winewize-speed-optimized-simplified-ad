
import React from 'react';
import { Loader2, Wine } from 'lucide-react';

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-6">
          <Wine className="w-16 h-16 text-purple-600 mx-auto animate-pulse" />
          <Loader2 className="w-8 h-8 animate-spin absolute -top-2 -right-2 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-purple-600 mb-2">Finding Perfect Pairings</h2>
        <p className="text-slate-600 animate-pulse">Our AI sommelier is crafting your recommendations...</p>
        <div className="flex justify-center mt-4 space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
