import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Utensils, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface QuickOrderItem {
  id: string;
  restaurantName: string;
  dishNames: string[];
  dishCount: number;
  lastUsed: string;
  restaurantId: string;
}

interface CollapsibleQuickReorderProps {
  savedOrders: QuickOrderItem[];
  onQuickReorder: (order: QuickOrderItem) => void;
  onDeleteOrder: (orderId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const CollapsibleQuickReorder = ({ 
  savedOrders, 
  onQuickReorder, 
  onDeleteOrder, 
  isLoading = false,
  className = "" 
}: CollapsibleQuickReorderProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (savedOrders.length === 0 && !isLoading) return null;

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className={`${className}`}>
      {/* Collapsible Header Button */}
      <Button
        onClick={toggleExpanded}
        variant="outline"
        className="w-full justify-between bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 py-3"
      >
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          <span className="font-medium">Love What You Had Last Time? Quick Reorder Here</span>
          <Badge variant="secondary" className="text-xs">
            {savedOrders.length}
          </Badge>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-3 space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/50 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            savedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {order.restaurantName === 'Session Restaurant' ? 'Fast Track Pairing' : order.restaurantName}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <Utensils className="w-3 h-3" />
                      <span>{order.dishCount} dishes</span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>{formatDistanceToNow(new Date(order.lastUsed), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteOrder(order.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                    {order.dishNames.slice(0, 3).map((dish, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                      >
                        {dish}
                      </span>
                    ))}
                    {order.dishNames.length > 3 && (
                      <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                        +{order.dishNames.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={() => onQuickReorder(order)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm"
                  size="sm"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reorder & Get Pairings
                </Button>
              </div>
            ))
          )}
          
          {savedOrders.length === 0 && !isLoading && (
            <div className="text-center py-4 text-slate-500 text-sm">
              No saved orders yet. Complete a pairing to save it for quick reordering!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsibleQuickReorder;