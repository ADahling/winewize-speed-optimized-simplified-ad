import React from 'react';
import { Brain, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SmartRecommendation {
  wineName: string;
  wineType: string;
  wineStyle: string;
  description: string;
  price: string;
  confidenceReason: string;
  matchScore: number;
}

interface SmartRecommendationsProps {
  recommendations: SmartRecommendation[];
  onRecommendationSelect: (recommendation: SmartRecommendation) => void;
  className?: string;
}

const SmartRecommendations = ({ 
  recommendations, 
  onRecommendationSelect,
  className = "" 
}: SmartRecommendationsProps) => {
  if (recommendations.length === 0) return null;

  return (
    <Card className={`border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="w-5 h-5 text-purple-600" />
          Smart Recommendations
          <Badge variant="secondary" className="ml-auto text-xs">
            AI Powered
          </Badge>
        </CardTitle>
        <p className="text-sm text-slate-600">
          Based on your wine preferences and tasting history
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={`${rec.wineName}-${index}`}
            onClick={() => onRecommendationSelect(rec)}
            className="bg-white rounded-lg p-4 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                  {rec.wineName}
                </h4>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                    {rec.wineType}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {rec.wineStyle}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">{rec.price}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-purple-600">
                    {Math.round(rec.matchScore * 100)}% match
                  </span>
                </div>
              </div>
            </div>
            
            {rec.description && (
              <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                {rec.description}
              </p>
            )}
            
            <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 rounded-full px-3 py-1">
              <Star className="w-3 h-3" />
              {rec.confidenceReason}
            </div>
          </div>
        ))}
        
        <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-200">
          Recommendations improve as you rate more wines
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartRecommendations;