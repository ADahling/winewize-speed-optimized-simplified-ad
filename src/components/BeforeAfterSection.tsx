
import React from 'react';
import { X, CheckCircle, Star } from 'lucide-react';

const beforeItems = ["Overwhelmed by extensive wine lists", "Unsure which wine pairs with your meal", "Intimidated by wine jargon and sommeliers"];
const afterItems = ["Restaurant-specific wine recommendations", "AI-powered pairings based on your actual meal", "Simple, jargon-free explanations for why pairings work"];
const uniqueFeatures = ["Perfect wine pairings, even if you don't recognize a single one on the list", "Real restaurant menus and wine lists, not generic pairings", "Personal wine library that learns your preferences"];

const BeforeAfterSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Your Wine Journey Simplified
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From restaurant confusion to wine confidence in minutes – no expertise required
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Before Wine-Wize */}
          <div className="bg-pink-50 rounded-2xl p-8 border border-pink-100">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-pink-500">
              <X className="w-6 h-6" style={{ color: '#EC4899' }} />
              Before Wine-Wize
            </h3>
            <div className="space-y-6">
              {beforeItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <X className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#EC4899' }} />
                  <p className="leading-relaxed text-pink-500">{item}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* With Wine-Wize */}
          <div className="bg-amber-50 rounded-2xl p-8 border border-amber-100">
            <h3 className="text-2xl font-bold text-amber-800 mb-8 flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              With Wine-Wize
            </h3>
            <div className="space-y-6">
              {afterItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-700 mt-1 flex-shrink-0" />
                  <p className="text-amber-800 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Unique Features */}
          <div className="bg-purple-50 rounded-2xl p-8 border border-purple-100">
            <h3 className="text-2xl font-bold text-purple-800 mb-8 flex items-center gap-3">
              <Star className="w-6 h-6" />
              Unique Features
            </h3>
            <div className="space-y-6">
              {uniqueFeatures.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                  <p className="text-purple-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
