
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface WineStyleData {
  style: string;
  count: number;
  percentage: number;
}

interface WineStyleChartProps {
  data: WineStyleData[];
}

const COLORS = [
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#6366F1", // Indigo
];

const WineStyleChart: React.FC<WineStyleChartProps> = ({ data }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return (
      <div className="h-96 w-full bg-gray-50 rounded flex items-center justify-center">
        <div className="text-center text-slate-500">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-96 w-full bg-gray-50 rounded flex items-center justify-center">
        <div className="text-center text-slate-500">No wine style data available</div>
      </div>
    );
  }

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data.map(item => ({ name: item.style, value: item.count }))}
            cx="50%"
            cy="50%"
            outerRadius={120}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} wines`, name]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WineStyleChart;
