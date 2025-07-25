
import React from 'react';
import { Wine, Zap, Search, MapPin } from 'lucide-react';

const benefits = [
  {
    icon: Wine,
    title: "Menu fear? Gone.",
    description: "No more scanning 40-page wine lists in a panic."
  },
  {
    icon: Zap,
    title: "Order like a pro.",
    description: "Snap a menu, get confident pairings in under 60 seconds."
  },
  {
    icon: Search,
    title: "No guessing, no Googling.",
    description: "AI helps you skip the guesswork and find your match fast."
  },
  {
    icon: MapPin,
    title: "Works anywhere.",
    description: "From high-end bistros to casual BBQs — we've got you."
  }
];

const WhyItMattersSection = () => {
  return (
    <section id="benefits" className="py-20 bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Wine Shouldn't Be Work. Skip the Menu Panic.
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-lg text-slate-600">
            <span>• Order in under 60 seconds</span>
            <span className="hidden md:block">•</span>
            <span>• Get pairings that actually exist on site</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100"
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-pink-700 to-amber-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 leading-tight">
                  {benefit.title}
                </h3>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyItMattersSection;
