
import React from 'react';
import LandingNavigation from '@/components/LandingNavigation';
import HeroSection from '@/components/HeroSection';
import WhyItMattersSection from '@/components/WhyItMattersSection';
import WhatMakesDifferentSection from '@/components/WhatMakesDifferentSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FinalCTASection from '@/components/FinalCTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags (should be in head) */}
      <head>
        <title>Wine Wize – AI Wine Pairing App & Sommelier in Your Pocket</title>
        <meta name="description" content="Snap a menu, get perfect wine pairings, and drink with confidence. Try Wine Wize free for 7 days." />
        <meta name="keywords" content="ai wine pairing, wine app, choose wine with food, pick wine at restaurant" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Wine Wize",
            "description": "AI-powered wine pairing app that helps you choose perfect wines for any dish",
            "applicationCategory": "FoodAndDrink",
            "operatingSystem": "Web, iOS, Android",
            "offers": {
              "@type": "Offer",
              "price": "9.99",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </head>
      
      <LandingNavigation />
      <div className="pt-20">
        <HeroSection />
        <WhyItMattersSection />
        <WhatMakesDifferentSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FinalCTASection />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
