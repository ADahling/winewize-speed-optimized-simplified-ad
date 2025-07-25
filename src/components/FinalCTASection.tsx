
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wine, Smartphone, Plus, Rocket, Check } from 'lucide-react';

const FinalCTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-8 inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
            <Wine className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your Wine Journey
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Start your 7-day free trial with Menu Match and discover the perfect wine pairing experience.
          </p>
        </div>

        {/* Mobile App Download Steps */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-12">
            How to Access Menu Match
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div className="bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-3">
                STEP 1
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Sign Up Free</h4>
              <p className="text-purple-100">
                Create your account and start your 7-day free trial—no credit card required
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div className="bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-3">
                STEP 2
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Upload Menu</h4>
              <p className="text-purple-100">
                Take a photo of any restaurant menu and wine list for instant analysis
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div className="bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-3">
                STEP 3
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Get Perfect Pairings</h4>
              <p className="text-purple-100">
                Receive intelligent wine recommendations tailored to your meal and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white text-center mb-12">
            Subscription Plans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Glass Plan */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-white mb-2">Glass Plan</h4>
                <p className="text-purple-200 text-sm mb-4">For casual sippers</p>
                <div className="text-3xl font-bold text-white mb-1">$9.99<span className="text-lg font-normal">/month</span></div>
                <div className="text-purple-200 text-sm">or $99/year (save 17%)</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-purple-100">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  10 Wine Pairings per month
                </li>
                <li className="flex items-center text-purple-100">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  Basic Wine Library
                </li>
                <li className="flex items-center text-purple-100">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  Profile Dashboard
                </li>
              </ul>
              <Link to="/register">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30">
                  Start My 7 Day Taste Test
                </Button>
              </Link>
              <p className="text-purple-200 text-xs text-center mt-3">
                7-day no-risk guarantee. Cancel anytime.
              </p>
            </div>

            {/* Bottle Plan */}
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-amber-400/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  MOST POPULAR
                </span>
              </div>
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-white mb-2">Bottle Plan</h4>
                <p className="text-purple-200 text-sm mb-4">For foodies & date night heroes</p>
                <div className="text-3xl font-bold text-white mb-1">$24.99<span className="text-lg font-normal">/month</span></div>
                <div className="text-purple-200 text-sm">or $249/year (save 17%)</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-purple-100">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  Unlimited Wine Pairings
                </li>
                <li className="flex items-center text-purple-100">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  Advanced Wine Library
                </li>
                <li className="flex items-center text-purple-100">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  Blog Access
                </li>
                <li className="flex items-center text-purple-100">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  Advanced Dashboard with Preference Analysis
                </li>
                <li className="flex items-center text-purple-100">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  Access to Future Features
                </li>
              </ul>
              <Link to="/register">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold">
                  Start My 7 Day Taste Test
                </Button>
              </Link>
              <p className="text-purple-200 text-xs text-center mt-3">
                7-day no-risk guarantee. Cancel anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Free Trial CTA */}
        <div className="text-center">
          <p className="text-2xl font-semibold text-white mb-6">
            Ready to find your perfect wine match?
          </p>
          
          <Link to="/register">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-12 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 mb-4">
              Start My 7 Day Taste Test
            </Button>
          </Link>
          
          <p className="text-purple-200 text-sm">
            Start your 7-day free trial today. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
