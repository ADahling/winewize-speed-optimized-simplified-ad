
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const AgeRestricted = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Wine Wize
            </h1>
          </div>

          {/* Main Message */}
          <div className="space-y-6 mb-8">
            <h2 className="text-3xl font-bold text-slate-800">
              Age Restriction Notice
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              We're sorry, but you must be 21 years of age or older to access Wine Wize. 
              This restriction is in place to comply with alcohol-related content regulations.
            </p>
          </div>

          {/* Alternative Suggestions */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Meanwhile, you might enjoy these alternatives:
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <h4 className="font-medium text-slate-700">Food & Cooking</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Recipe discovery apps</li>
                  <li>• Cooking technique guides</li>
                  <li>• Food photography tips</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-slate-700">Non-Alcoholic Pairings</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Mocktail recipes</li>
                  <li>• Tea and coffee pairings</li>
                  <li>• Artisanal sodas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Questions or Concerns?
            </h3>
            <p className="text-slate-600">
              If you believe this is an error or have questions about our age verification process, 
              please contact our support team.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl"
            >
              Go Back
            </Button>
            
            <Button
              onClick={() => window.open('https://www.allrecipes.com', '_blank')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl"
            >
              Explore Recipes
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Come back when you're 21! We'll be here with personalized wine recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeRestricted;
