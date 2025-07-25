
import React from 'react';
import { MapPin, Wine, Search, Star } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: "Restaurant Locator",
    description: "Search our database for restaurants or simply snap a pic of a restaurant Menu and Wine List, and we'll process it in seconds."
  },
  {
    icon: Wine,
    title: "AI Wine Pairing", 
    description: "Our AI analyzes your selected meal, wine preferences, and budget to suggest the perfect wine pairing every time."
  },
  {
    icon: Search,
    title: "Store Menus And Wine Lists",
    description: "Have your favorite Thursday dinner spot? Our data library stores your menus and wine lists making finding the perfect wine faster each time."
  },
  {
    icon: Star,
    title: "Personal Wine Library",
    description: "Save and rate your favorite wines to build a personalized collection you can reference anytime."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Why Choose Wine-Wize?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover why thousands of wine lovers trust our AI-powered platform for their perfect pairings
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
