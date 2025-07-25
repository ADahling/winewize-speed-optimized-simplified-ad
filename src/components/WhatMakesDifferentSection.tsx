
import React from 'react';
import { Camera, Brain, Globe } from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: "Snap a Menu. Let AI Do the Homework.",
    description: "Upload any restaurant menu and wine list—our AI reads it instantly and does all the heavy lifting for you."
  },
  {
    icon: Brain,
    title: "Brain of a Sommelier. Speed of AI.",
    description: "Years of wine expertise condensed into lightning-fast intelligent recommendations that never miss."
  },
  {
    icon: Globe,
    title: "From Bistro to BBQ. Wine Wize Travels With You.",
    description: "From fine dining to casual spots, get perfect pairings anywhere you dine, anytime you need them."
  }
];

const WhatMakesDifferentSection = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            What Makes Menu Match Different
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Not just another wine app—Menu Match is your personal sommelier that understands real restaurants and real menus.
          </p>
          
          {/* Demo GIF Placeholder */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 mb-12 border border-purple-200">
            <div className="w-full h-64 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center border-2 border-dashed border-purple-300">
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-700 mb-2">Demo Coming Soon</div>
                <div className="text-purple-600">Snap. Scan. Sip Smarter. See Menu Match in Action →</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="relative bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-600 group overflow-hidden"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatMakesDifferentSection;
