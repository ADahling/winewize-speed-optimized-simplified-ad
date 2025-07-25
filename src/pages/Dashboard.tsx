import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import BreadcrumbNav from '@/components/navigation/BreadcrumbNav';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { usePriceAnalytics } from '@/hooks/usePriceAnalytics';
import StatsOverview from '@/components/dashboard/StatsOverview';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import Copyright from '@/components/Copyright';

const Dashboard = () => {
  const { user } = useAuth();
  const { analytics, isLoading } = useDashboardAnalytics(user?.id);
  const { avgPriceData, annualAverage } = usePriceAnalytics(user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-32 md:pb-8">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="text-center">
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
        <Copyright />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-32 md:pb-8">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-20">
        <BreadcrumbNav />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Wine Analytics Dashboard</h1>
            <p className="text-slate-600">Track your wine journey and preferences</p>
          </div>
          <Link to="/profile">
            <Button variant="outline" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              View Profile
            </Button>
          </Link>
        </div>
        
        <StatsOverview
          totalPairings={analytics.totalPairings}
          avgRating={analytics.avgRating}
          restaurants={analytics.restaurants}
          thisMonth={analytics.thisMonth}
        />

        <DashboardTabs
          analytics={analytics}
          avgPriceData={avgPriceData}
          annualAverage={annualAverage}
        />
      </div>
      <Copyright />
    </div>
  );
};

export default Dashboard;
