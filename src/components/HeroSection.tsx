
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="min-h-screen relative flex items-center justify-start px-4 py-16 overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        poster="/lovable-uploads/9abec0cc-5f59-4b0f-9866-07161c22c4c9.png"
      >
        <source src="https://res.cloudinary.com/dq85pnfnf/video/upload/v1750030728/y5yklvpduktz7uwkywza.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>

      {/* Mobile Fallback Background Image */}
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat z-0 md:hidden"
        style={{
          backgroundImage: 'url(/lovable-uploads/9abec0cc-5f59-4b0f-9866-07161c22c4c9.png)'
        }}
      />

      {/* Enhanced Semi-transparent overlay for text readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/80 via-black/60 to-black/30 z-10" />

      <div className="max-w-7xl mx-auto w-full relative z-20">
        {/* Left-aligned Content */}
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-left">
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
              Instantly Find The Right Wine Every Time
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/95 max-w-2xl leading-relaxed text-left drop-shadow-2xl">
            Your pocket sommelier pairs wines with any dish in seconds so you can sip with swagger, not second guessing.
          </p>
          
          <div className="text-left mb-6">
            <Link to="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/30">
                Start My 7 Day Taste Test →
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 mb-8 max-w-md border border-white/50 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                ))}
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">4.9 Star Rating</div>
                <div className="text-sm text-slate-600">Pairing Satisfaction</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 text-white/95">
            <div className="flex items-center gap-2 justify-start">
              <span className="text-purple-300 text-xl">🎯</span>
              <span className="text-sm font-medium drop-shadow-lg">No Credit Card Needed</span>
            </div>
            <div className="flex items-center gap-2 justify-start">
              <span className="text-purple-300 text-xl">⚡</span>
              <span className="text-sm font-medium drop-shadow-lg">Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
