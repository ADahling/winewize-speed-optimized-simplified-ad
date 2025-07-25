
import React from 'react';
import { Star, MapPin, Wine, Search } from 'lucide-react';

const features = [
  {
    icon: Star,
    title: "Geo-tagged local wine availability",
    description: "Find wines available near you"
  },
  {
    icon: Wine,
    title: "Real restaurant wine lists, not generic pairings",
    description: "Access actual menus from your dining location"
  },
  {
    icon: Search,
    title: "Personal wine library that learns your preferences",
    description: "Build a collection that grows smarter over time"
  }
];

const UniqueFeaturesSection = () => {
  return (
    <section className="py-20" style={{ backgroundColor: '#F1F5F9' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Unique Features
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover what makes Wine-Wize the most advanced wine pairing app available
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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
        
        <div className="text-center mt-12">
          <span className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
            Coming Soon: Local wine availability
          </span>
        </div>
      </div>
    </section>
  );
};

export default UniqueFeaturesSection;
