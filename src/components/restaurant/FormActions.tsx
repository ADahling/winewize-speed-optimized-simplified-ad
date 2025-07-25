
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isValidating: boolean;
  isFormValid: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  isValidating,
  isFormValid
}) => {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        type="submit"
        disabled={isSubmitting || isValidating || !isFormValid}
        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        onClick={onSubmit}
      >
        {isSubmitting ? 'Adding...' : isValidating ? 'Checking...' : 'Add Restaurant'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting || isValidating}
        className="border-slate-300"
      >
        Cancel
      </Button>
    </div>
  );
};

export default FormActions;
