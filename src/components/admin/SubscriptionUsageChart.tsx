
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { UsageTrendData } from '@/services/adminAnalytics';

interface SubscriptionUsageChartProps {
  data: UsageTrendData[];
}

const chartConfig = {
  glassTier: {
    label: "Glass Tier",
    color: "#8b5cf6",
  },
  bottleTier: {
    label: "Bottle Tier",
    color: "#06b6d4",
  },
  trialTier: {
    label: "Trial/Free",
    color: "#84cc16",
  },
};

const SubscriptionUsageChart: React.FC<SubscriptionUsageChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Trends by Subscription Tier</CardTitle>
        <CardDescription>
          Monthly pairing generation trends across different subscription tiers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="glassTier" 
              stroke="var(--color-glassTier)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-glassTier)" }}
            />
            <Line 
              type="monotone" 
              dataKey="bottleTier" 
              stroke="var(--color-bottleTier)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-bottleTier)" }}
            />
            <Line 
              type="monotone" 
              dataKey="trialTier" 
              stroke="var(--color-trialTier)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-trialTier)" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SubscriptionUsageChart;
