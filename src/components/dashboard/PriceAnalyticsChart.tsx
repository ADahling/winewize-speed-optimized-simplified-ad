
import React from 'react';
import { DollarSign, Wine } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface PriceData {
  month: string;
  avgPrice: number;
}

interface PriceAnalyticsChartProps {
  data: PriceData[];
  annualAverage: number;
}

const PriceAnalyticsChart: React.FC<PriceAnalyticsChartProps> = ({
  data,
  annualAverage
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Wine Price Analytics
        </h3>
        <div className="text-right">
          <div className="text-sm text-slate-600">Annual Average</div>
          <div className="text-2xl font-bold text-purple-600">${annualAverage}</div>
        </div>
      </div>
      
      {data.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' });
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => [`$${value}`, "Average Price"]}
                labelFormatter={(value: any) => {
                  const [year, month] = value.split('-');
                  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                }}
              />
              <Line 
                type="monotone" 
                dataKey="avgPrice" 
                stroke="#9333EA" 
                strokeWidth={3}
                dot={{ fill: "#9333EA", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center text-slate-500 py-12">
          <Wine className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Add wines to your library to see price analytics</p>
        </div>
      )}
    </div>
  );
};

export default PriceAnalyticsChart;
