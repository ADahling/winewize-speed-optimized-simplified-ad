import React from 'react';
import { Wine, Loader } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600">
      <div className="flex flex-col items-center">
        <Wine className="w-16 h-16 text-white mb-4 animate-pulse" />
        <div className="text-white text-lg">Loading...</div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-pulse">
      <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-white/20 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-white/20 rounded w-5/6"></div>
    </div>
  );
}

export function WineCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 animate-pulse">
      <div className="aspect-[3/4] bg-slate-200 rounded-lg mb-4"></div>
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
      <div className="flex justify-between">
        <div className="h-6 bg-slate-200 rounded w-20"></div>
        <div className="h-6 bg-slate-200 rounded w-16"></div>
      </div>
    </div>
  );
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader className={`animate-spin ${sizes[size]} ${className}`} />
  );
}

export function WineLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-8 opacity-0 animate-fade-in">
      <Wine className="w-16 h-16 text-purple-500 mb-4 animate-pulse" />
      <p className="text-slate-600">Loading wine data...</p>
    </div>
  );
}

interface LoadingGridProps {
  count?: number;
  type?: 'card' | 'wine';
}

export function LoadingGrid({ count = 6, type = 'card' }: LoadingGridProps) {
  const SkeletonComponent = type === 'wine' ? WineCardSkeleton : CardSkeleton;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}

export function DishesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 shadow-sm border animate-pulse">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-slate-200 rounded w-16"></div>
          </div>
          <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}
