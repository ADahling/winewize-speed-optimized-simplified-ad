
import React from 'react';
import { Zap, BookOpen, DollarSign, Heart } from 'lucide-react';

const differentiators = [{
  icon: Zap,
  title: "Simplified Selection",
  description: "Eliminate the confusion of choosing wines with our AI-guided recommendations."
}, {
  icon: BookOpen,
  title: "Built-in Learning",
  description: "Learn about wine as you use the app with bite-sized resources that are never intimidating."
}, {
  icon: DollarSign,
  title: "Budget Friendly",
  description: "Find the perfect wine for your price range, avoiding awkward overspending."
}, {
  icon: Heart,
  title: "Personal Library",
  description: "Build your wine knowledge by saving and rating wines in your personal digital collection."
}];

const DifferentiatorsSection = () => {
  return (
    <section className="py-20" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-purple-600 font-semibold text-sm uppercase tracking-wide">
            What Makes Us Different?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-slate-800">
            We bring <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">solutions</span> to make wine selection easier.
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          {differentiators.map((item, index) => (
            <div key={index} className="flex gap-6 group">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3 text-slate-800">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-lg text-slate-600">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorsSection;
