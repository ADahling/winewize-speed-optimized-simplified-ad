import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProgressSteps from '@/components/ProgressSteps';
import Header from '@/components/Header';
import BackButton from '@/components/navigation/BackButton';
const UploadHeader = () => {
  const navigate = useNavigate();
  const startOver = () => {
    navigate('/welcome');
  };
  return <div className="pb-2">
      <Header />
      <div className="container mx-auto px-4 py-2 pt-20">
        {/* Header with back button and title */}
        <div className="flex items-center mb-4">
          <BackButton fallbackPath="/restaurant" />
          <h1 className="text-2xl font-bold text-purple-600 ml-4">Capture Menu & Wine List</h1>
        </div>

        <ProgressSteps currentStep={3} />
      </div>
    </div>;
};
export default UploadHeader;