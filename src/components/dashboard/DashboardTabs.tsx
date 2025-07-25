
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, PieChart, Building2, Bell, Library } from 'lucide-react';
import ActivityChart from '@/components/analytics/ActivityChart';
import WineStyleChart from '@/components/analytics/WineStyleChart';
import ChartErrorBoundary from '@/components/analytics/ChartErrorBoundary';
import TopRestaurants from '@/components/analytics/TopRestaurants';
import PriceAnalyticsChart from '@/components/dashboard/PriceAnalyticsChart';
import RatingRemindersAudit from '@/components/notifications/RatingRemindersAudit';
import WineRatingChart from '@/components/dashboard/WineRatingChart';

interface DashboardTabsProps {
  analytics: {
    monthlyActivity: Array<{ month: string; count: number }>;
    wineStyleBreakdown: Array<{ style: string; count: number; percentage: number }>;
    topRestaurants: Array<{ name: string; count: number }>;
    ratingDistribution: Array<{ rating: number; count: number }>;
    wineRatingDistribution: Array<{ rating: string; count: number; percentage: number }>;
  };
  avgPriceData: Array<{ month: string; avgPrice: number }>;
  annualAverage: number;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  analytics,
  avgPriceData,
  annualAverage
}) => {
  return (
    <Tabs defaultValue="activity" className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-4 shadow-lg">
        <h3 className="text-white font-bold text-lg mb-3 text-center">Dashboard Analytics</h3>
        <TabsList className="w-full bg-transparent p-0 h-auto flex flex-col gap-3 md:flex-row md:gap-0">
          {/* First Row - Mobile: Activity, Wine Styles, Restaurants */}
          <div className="flex w-full gap-2 md:contents">
            <TabsTrigger 
              value="activity" 
              className="flex-1 md:flex-initial flex flex-col items-center gap-1 py-3 px-2 bg-white/10 hover:bg-white/20 data-[state=active]:bg-white data-[state=active]:text-purple-800 text-white font-bold rounded-lg transition-all duration-200 min-w-0"
            >
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs leading-tight text-center">Activity</span>
            </TabsTrigger>
            <TabsTrigger 
              value="styles" 
              className="flex-1 md:flex-initial flex flex-col items-center gap-1 py-3 px-2 bg-white/10 hover:bg-white/20 data-[state=active]:bg-white data-[state=active]:text-purple-800 text-white font-bold rounded-lg transition-all duration-200 min-w-0"
            >
              <PieChart className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs leading-tight text-center">Wine Styles</span>
            </TabsTrigger>
            <TabsTrigger 
              value="restaurants" 
              className="flex-1 md:flex-initial flex flex-col items-center gap-1 py-3 px-2 bg-white/10 hover:bg-white/20 data-[state=active]:bg-white data-[state=active]:text-purple-800 text-white font-bold rounded-lg transition-all duration-200 min-w-0"
            >
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs leading-tight text-center">Restaurants</span>
            </TabsTrigger>
          </div>
          
          {/* Second Row - Mobile: Pricing, Library, Reminders */}
          <div className="flex w-full gap-2 md:contents">
            <TabsTrigger 
              value="pricing" 
              className="flex-1 md:flex-initial flex flex-col items-center gap-1 py-3 px-2 bg-white/10 hover:bg-white/20 data-[state=active]:bg-white data-[state=active]:text-purple-800 text-white font-bold rounded-lg transition-all duration-200 min-w-0"
            >
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs leading-tight text-center">Pricing</span>
            </TabsTrigger>
            <TabsTrigger 
              value="library" 
              className="flex-1 md:flex-initial flex flex-col items-center gap-1 py-3 px-2 bg-white/10 hover:bg-white/20 data-[state=active]:bg-white data-[state=active]:text-purple-800 text-white font-bold rounded-lg transition-all duration-200 min-w-0"
            >
              <Library className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs leading-tight text-center">Library</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reminders" 
              className="flex-1 md:flex-initial flex flex-col items-center gap-1 py-3 px-2 bg-white/10 hover:bg-white/20 data-[state=active]:bg-white data-[state=active]:text-purple-800 text-white font-bold rounded-lg transition-all duration-200 min-w-0"
            >
              <Bell className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs leading-tight text-center">Reminders</span>
            </TabsTrigger>
          </div>
        </TabsList>
      </div>

      <TabsContent value="activity" className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Monthly Pairing Activity
          </h3>
          <ActivityChart data={analytics.monthlyActivity} />
        </div>
      </TabsContent>

      <TabsContent value="styles" className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Wine Style Preferences
          </h3>
          <ChartErrorBoundary>
            <WineStyleChart data={analytics.wineStyleBreakdown} />
          </ChartErrorBoundary>
        </div>
      </TabsContent>

      <TabsContent value="restaurants" className="space-y-4">
        <TopRestaurants data={analytics.topRestaurants} />
      </TabsContent>

      <TabsContent value="pricing" className="space-y-4">
        <PriceAnalyticsChart
          data={avgPriceData}
          annualAverage={annualAverage}
        />
      </TabsContent>

      <TabsContent value="library" className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Library className="w-5 h-5" />
            Wine Rating Distribution
          </h3>
          <ChartErrorBoundary>
            <WineRatingChart data={analytics.wineRatingDistribution} />
          </ChartErrorBoundary>
        </div>
      </TabsContent>

      <TabsContent value="reminders" className="space-y-4">
        <RatingRemindersAudit />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
