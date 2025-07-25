
import React from 'react';

interface UploadInstructionsProps {
  totalImages: number;
}

const UploadInstructions = ({ totalImages }: UploadInstructionsProps) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-purple-600 mb-4">Capture Menu & Wine List</h2>
      <p className="text-slate-600 text-lg mb-2">
        Use your camera to capture clear photos of your restaurant menu and wine list.
      </p>
      <p className="text-sm text-slate-500">
        Our AI will analyze both simultaneously for the best wine pairings.
      </p>
      
      {/* Large Menu Warning */}
      {totalImages > 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip for large menus:</strong> If your menu has 50+ items, consider taking multiple photos of different sections for better results.
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadInstructions;
