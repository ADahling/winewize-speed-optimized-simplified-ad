
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PairingPopupProvider } from "@/contexts/PairingPopupContext";
import { useNavigationGuards } from "@/hooks/useNavigationGuards";
import { useAgeVerification } from "@/hooks/useAgeVerification";
import BottomNav from "@/components/navigation/BottomNav";
import QuickActions from "@/components/navigation/QuickActions";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import React, { Suspense } from 'react';
import { PageLoader } from '@/components/LoadingStates';

import Index from "./pages/Index";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const Profile = React.lazy(() => import("./pages/Profile"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const EmailConfirmation = React.lazy(() => import("./pages/EmailConfirmation"));
const ConfirmationHandler = React.lazy(() => import("./pages/ConfirmationHandler"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const Welcome = React.lazy(() => import("./pages/Welcome"));
const Restaurant = React.lazy(() => import("./pages/Restaurant"));
const Upload = React.lazy(() => import("./pages/Upload"));
const Dishes = React.lazy(() => import("./pages/Dishes"));
const Pairings = React.lazy(() => import("./pages/Pairings"));
const Library = React.lazy(() => import("./pages/Library"));
const WinePreferences = React.lazy(() => import("./pages/WinePreferences"));
const AgeRestricted = React.lazy(() => import("./pages/AgeRestricted"));
const Admin = React.lazy(() => import("./pages/Admin"));
const PaymentSuccess = React.lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = React.lazy(() => import("./pages/PaymentCancel"));
const Subscription = React.lazy(() => import("./pages/Subscription"));
const TermsAndConditions = React.lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy"));
const TestEmailPage = React.lazy(() => import("./pages/admin/test-email"));

const TrialExpiredModal = React.lazy(() => import("./components/modals/TrialExpiredModal"));
import { useTrialStatus } from "./hooks/useTrialStatus";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Component that wraps the routes and includes navigation guards
const AppRoutes = () => {
  useNavigationGuards();
  const { showModal, isLoading, verifyAge } = useAgeVerification();
  const { showTrialExpiredModal, dismissTrialModal } = useTrialStatus();
  
  // Don't render anything while checking age verification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Wine Wize
          </h1>
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Critical routes - no lazy loading */}
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Non-critical routes - lazy loaded */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="/confirm" element={<ConfirmationHandler />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/restaurant" element={<Restaurant />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/dishes" element={<Dishes />} />
          <Route path="/pairings" element={<Pairings />} />
          <Route path="/library" element={<Library />} />
          <Route path="/wine-preferences" element={<WinePreferences />} />
          <Route path="/age-restricted" element={<AgeRestricted />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/test-email" element={<TestEmailPage />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      
      {/* Age Verification Modal */}
      <AgeVerificationModal 
        isOpen={showModal} 
        onVerify={verifyAge} 
      />
      
      {/* Trial Expired Modal */}
      <Suspense fallback={null}>
        <TrialExpiredModal 
          isOpen={showTrialExpiredModal} 
          onClose={dismissTrialModal} 
        />
      </Suspense>
      
      {/* Global Navigation Components */}
      <BottomNav />
      <QuickActions />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PairingPopupProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </PairingPopupProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
