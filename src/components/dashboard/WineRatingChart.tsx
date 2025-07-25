
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RatingData {
  rating: string;
  count: number;
  percentage: number;
}

interface WineRatingChartProps {
  data: RatingData[];
}

const COLORS = {
  '5 Stars': '#10B981', // green-500
  '4 Stars': '#3B82F6', // blue-500
  '3 Stars': '#F59E0B', // amber-500
  '2 Stars': '#EF4444', // red-500
  '1 Star': '#DC2626',  // red-600
  'Unrated': '#6B7280'  // gray-500
};

// Map rating text to include star emojis
const RATING_LABELS = {
  '5 Stars': '5⭐️',
  '4 Stars': '4⭐️',
  '3 Stars': '3⭐️',
  '2 Stars': '2⭐️',
  '1 Star': '1⭐️',
  'Unrated': 'Unrated'
};

const WineRatingChart: React.FC<WineRatingChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800">{RATING_LABELS[data.rating as keyof typeof RATING_LABELS]}</p>
          <p className="text-sm text-slate-600">Count: {data.count}</p>
          <p className="text-sm text-slate-600">Percentage: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="75%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.rating as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Custom Legend with colored dots and proper mobile wrapping */}
      <div className="flex flex-wrap justify-center gap-3 mt-4 px-2">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2 text-sm min-w-0">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: COLORS[entry.rating as keyof typeof COLORS] }}
            />
            <span className="text-slate-700 font-medium whitespace-nowrap">
              {RATING_LABELS[entry.rating as keyof typeof RATING_LABELS]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WineRatingChart;
