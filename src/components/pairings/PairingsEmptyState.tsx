import React from 'react';
import { Link } from 'react-router-dom';
import { Wine, RotateCcw, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PairingsEmptyState: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg border border-purple-200 text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Wine className="w-8 h-8 text-purple-600" />
      </div>
      <h3 className="text-xl font-bold text-purple-600 mb-4">
        🍷 Wine Pairings In Progress
      </h3>
      <p className="text-slate-600 text-lg mb-6">
        Our AI sommelier is still analyzing the wine list to find perfect matches for your dishes. 
        This usually takes just a few more moments...
      </p>
      <div className="bg-white/60 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-purple-700">Wine analysis in progress</span>
        </div>
        <div className="w-full bg-purple-100 rounded-full h-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild variant="outline" className="min-w-0 flex-1 sm:flex-none">
          <Link to="/dishes" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Back to Dishes
          </Link>
        </Button>
        <Button asChild variant="outline" className="min-w-0 flex-1 sm:flex-none">
          <Link to="/library" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Wine Library
          </Link>
        </Button>
      </div>
    </div>
  );
};