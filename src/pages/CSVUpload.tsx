import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CSVUploader from '@/components/CSVUploader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Copyright from '@/components/Copyright';

const CSVUpload = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-4">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
        <Copyright />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Authentication Required</h1>
          <p className="text-slate-600 mb-6">Please log in to upload CSV files.</p>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
        <Copyright />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">CSV Upload</h1>
          <p className="text-slate-600">Upload CSV data to your Quick Vino Tips table</p>
        </div>

        <CSVUploader />
      </div>
      <Copyright />
    </div>
  );
};

export default CSVUpload;
