
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-32 md:pb-8">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Main Content */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Welcome to Your AI
            <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Wine Journey
            </span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Ready to discover the perfect wine for your meal? Let's get started!
          </p>
          
          <Link to="/welcome">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
              Find Your Perfect Wine
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-lg mb-2 text-center text-purple-600 font-bold">MENU MATCH</h3>
            <p className="text-slate-600 mb-4 text-center">Get instant wine pairing recommendations</p>
            <Link to="/welcome">
              <Button variant="outline" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 text-center text-sm px-[72px]">
                Start Now
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-lg mb-2 text-center font-bold text-purple-600">WINE LIBRARY</h3>
            <p className="text-slate-600 mb-4 text-center">Browse your saved wines, ratings, and pairings</p>
            <Link to="/profile">
              <Button variant="outline" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 text-center text-sm px-[72px]">
                View Library
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-lg mb-2 font-bold text-purple-600 text-center">DASHBOARD</h3>
            <p className="text-slate-600 mb-4 text-center">Track your wine journey, from purchase to preference</p>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 text-center text-sm px-[72px]">
                View Stats
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
