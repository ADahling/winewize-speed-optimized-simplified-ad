
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ActivityData {
  month: string;
  count: number;
}

interface ActivityChartProps {
  data: ActivityData[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  if (!data.length) {
    return (
      <div className="text-center text-slate-500 py-8">
        <p>No activity data available</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.split(' ')[0]}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: any, name: any) => [value, 'Pairings']}
            labelFormatter={(label: any) => `Month: ${label}`}
          />
          <Bar dataKey="count" fill="#9333EA" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
