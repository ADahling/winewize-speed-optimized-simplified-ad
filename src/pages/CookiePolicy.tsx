
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wine } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Wine className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Wine Wize
              </span>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy for WINE WIZE LLC</h1>
          
          <p className="text-gray-600 mb-8">
            <strong>Last Updated:</strong> June 11, 2025
          </p>

          <div className="prose prose-gray max-w-none">
            <p className="mb-6">
              This Cookie Policy explains how WINE WIZE LLC ("we," "us," or "our") uses cookies and similar technologies on our website and services (the "Service").
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. What are Cookies?</h2>
            <p className="mb-6">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Cookies</h2>
            <p className="mb-4">We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Essential Cookies:</strong> These cookies are strictly necessary to provide you with services available through our Service and to enable you to use some of its features. For example, they help us to ensure the age gate functions correctly.</li>
              <li><strong>Analytics Cookies:</strong> These cookies allow us to analyze how our Service is being accessed and used, or to track the performance of the Service. We use this information to maintain, operate, and improve the Service.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Your Choices Regarding Cookies</h2>
            <p className="mb-6">
              You have the right to decide whether to accept or reject cookies. You can set your web browser to refuse all cookies or to indicate when a cookie is being sent. The Help feature on most browsers provides information on how to accept cookies, disable cookies, or to notify you when receiving a new cookie.
            </p>
            <p className="mb-6">
              Please note that if you choose to disable cookies, some parts of the Service may not function properly or may become inaccessible.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Changes to This Cookie Policy</h2>
            <p className="mb-6">
              We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page. You are advised to review this Cookie Policy periodically for any changes. Changes to this Cookie Policy are effective when they are posted on this page.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Contact Us</h2>
            <p className="mb-6">
              If you have any questions about this Cookie Policy, please contact us at: admin@wine-wize.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
