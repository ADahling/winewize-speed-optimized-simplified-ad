
import React from 'react';
import { Camera, Brain, Wine } from 'lucide-react';

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Snap & Submit",
    description: "Take a quick photo of the menu.",
    result: "→ Instant AI scan starts working."
  },
  {
    number: "02", 
    icon: Brain,
    title: "Get Expert Pairings",
    description: "AI + sommelier brain recommends the perfect wine.",
    result: "→ Based on actual wines at the location."
  },
  {
    number: "03",
    icon: Wine,
    title: "Order With Swagger", 
    description: "Choose with confidence, no stress.",
    result: "→ Sip smarter in <30 seconds."
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            3-Step Visual <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Journey</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From menu panic to wine confidence in three simple steps.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative group text-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-radial from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto">
                  {step.number}
                </div>
                <div className="absolute inset-0 bg-gradient-radial from-purple-600/20 to-pink-600/20 rounded-full opacity-20 animate-pulse"></div>
              </div>
              <div className="mb-4">
                <step.icon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {step.title}
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>
                <p className="text-purple-600 font-medium text-sm">
                  {step.result}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
