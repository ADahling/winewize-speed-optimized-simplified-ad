
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { SubscriptionUsageData } from '@/services/adminAnalytics';

interface TierComparisonChartProps {
  data: SubscriptionUsageData[];
}

const chartConfig = {
  averagePairingsPerMonth: {
    label: "Avg Pairings/Month",
    color: "#8b5cf6",
  },
  totalUsers: {
    label: "Total Users",
    color: "#06b6d4",
  },
};

const TierComparisonChart: React.FC<TierComparisonChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Tier Comparison</CardTitle>
        <CardDescription>
          Average monthly usage and user counts by subscription tier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tier" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="averagePairingsPerMonth" 
              fill="var(--color-averagePairingsPerMonth)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TierComparisonChart;
