
import React from 'react';

interface Step {
  number: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

interface ProgressStepsProps {
  currentStep: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  const steps: Step[] = [
    { number: 1, label: 'Welcome', isActive: currentStep === 1, isCompleted: currentStep > 1 },
    { number: 2, label: 'Restaurant', isActive: currentStep === 2, isCompleted: currentStep > 2 },
    { number: 3, label: 'Uploads', isActive: currentStep === 3, isCompleted: currentStep > 3 },
    { number: 4, label: 'Select Dishes', isActive: currentStep === 4, isCompleted: currentStep > 4 },
    { number: 5, label: 'Wine Pairings', isActive: currentStep === 5, isCompleted: currentStep > 5 },
  ];

  const getStepColor = (step: Step) => {
    if (step.isCompleted) return 'bg-[#00E599]';
    if (step.isActive) return 'bg-purple-600';
    return 'bg-slate-300';
  };

  const getStepTextColor = (step: Step) => {
    if (step.isCompleted || step.isActive) return 'text-white';
    return 'text-slate-500';
  };

  const getConnectorColor = (index: number) => {
    return steps[index].isCompleted ? 'bg-[#00E599]' : 'bg-slate-300';
  };

  const renderStepGroup = (stepsToRender: Step[], startIndex: number) => (
    <div className="flex items-center justify-center gap-1 md:gap-2">
      {stepsToRender.map((step, index) => {
        const actualIndex = startIndex + index;
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                className={`w-6 h-6 md:w-8 md:h-8 ${getStepColor(step)} rounded-full flex items-center justify-center ${getStepTextColor(step)} font-bold text-xs md:text-sm`}
              >
                {step.number}
              </div>
              <div className="text-xs text-slate-600 mt-1 text-center whitespace-nowrap max-w-16 md:max-w-none truncate md:truncate-none">
                {step.label}
              </div>
            </div>
            {index < stepsToRender.length - 1 && (
              <div className={`w-8 md:w-12 h-1 ${getConnectorColor(actualIndex)} mt-[-12px]`}></div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex justify-center mb-8 overflow-x-auto px-4">
      {/* Mobile: Two rows with steps 1-2-3 and 4-5 */}
      <div className="md:hidden flex flex-col items-center gap-4">
        {/* First row: Steps 1-2-3 */}
        {renderStepGroup(steps.slice(0, 3), 0)}
        {/* Second row: Steps 4-5 */}
        {renderStepGroup(steps.slice(3, 5), 3)}
      </div>

      {/* Desktop/Tablet: Single row with all steps */}
      <div className="hidden md:flex items-center gap-2 min-w-max">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 ${getStepColor(step)} rounded-full flex items-center justify-center ${getStepTextColor(step)} font-bold text-sm`}
              >
                {step.number}
              </div>
              <div className="text-xs text-slate-600 mt-1 text-center whitespace-nowrap">
                {step.label}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-1 ${getConnectorColor(index)} mt-[-12px]`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;
