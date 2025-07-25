import React from 'react';
import { Link } from 'react-router-dom';
import { Wine, Star, Utensils, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import ProgressSteps from '@/components/ProgressSteps';
const Welcome = () => {
  return <div className="min-h-screen bg-white pb-32 md:pb-8">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-28 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/home">
            <ArrowLeft className="w-6 h-6 text-slate-600 hover:text-slate-800" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Welcome</h1>
        </div>

        {/* Progress Indicator with Step Labels */}
        <ProgressSteps currentStep={1} />

        {/* Main Content */}
        <div className="text-center">
          {/* Icon Header */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Wine className="w-8 h-8 text-purple-500" />
            <Star className="w-6 h-6 text-amber-500" />
            <Utensils className="w-8 h-8 text-purple-500" />
          </div>

          {/* Hero Section */}
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Welcome to WINE WIZE
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
              Your AI-powered Wine Advisor that creates perfect pairings for your dining experience
            </p>
            
            {/* Simplified Wine Pairing Experience Section */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
                <Utensils className="w-6 h-6 text-purple-500" />
                Simplified Wine Pairing Experience
              </h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-2xl mx-auto">
                Snap a pic of the restaurant menu and wine list and upload the images, select up to 3 dishes, and get personalized wine recommendations powered by AI sommelier expertise.
              </p>

              {/* 3-Step Process */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    <Wine className="w-8 h-8" />
                  </div>
                  <div className="text-sm text-purple-600 font-medium mb-2">Step 1</div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">Upload or Import Menu & Wine List</h4>
                </div>
                
                <div className="bg-pink-50 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    <Utensils className="w-8 h-8" />
                  </div>
                  <div className="text-sm text-pink-600 font-medium mb-2">Step 2</div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">Select Up to 4 Dishes</h4>
                </div>
                
                <div className="bg-amber-50 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    <Star className="w-8 h-8" />
                  </div>
                  <div className="text-sm text-amber-600 font-medium mb-2">Step 3</div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">Get Wine Pairings</h4>
                </div>
              </div>

              {/* Features */}
              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  🚀 Fast AI processing • ⭐ Expert recommendations • 🤖 Powered by OpenAI
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 max-w-md mx-auto">
            <Link to="/restaurant" className="block">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                Start Your Wine Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <Link to="/home">
              <Button variant="outline" className="w-full border-gray-300 transition-all duration-300 px-0 py-[11px] my-[20px] rounded-xl bg-violet-100 font-semibold text-lg text-purple-900">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
export default Welcome;