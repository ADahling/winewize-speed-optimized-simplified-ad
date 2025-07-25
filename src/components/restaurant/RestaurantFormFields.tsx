
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LocationAutocomplete from '@/components/location/LocationAutocomplete';

interface RestaurantFormFieldsProps {
  name: string;
  location: string;
  cuisineType: string;
  onNameChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onCuisineTypeChange: (value: string) => void;
  isDisabled: boolean;
}

const RestaurantFormFields: React.FC<RestaurantFormFieldsProps> = ({
  name,
  location,
  cuisineType,
  onNameChange,
  onLocationChange,
  onCuisineTypeChange,
  isDisabled
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-slate-700">
          Restaurant Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter restaurant name"
          required
          disabled={isDisabled}
        />
      </div>

      <LocationAutocomplete
        value={location}
        onChange={onLocationChange}
        placeholder="Enter restaurant location"
        label="Location"
        required
        disabled={isDisabled}
      />

      <div className="space-y-2">
        <Label htmlFor="cuisineType" className="text-sm font-medium text-slate-700">
          Cuisine Type
        </Label>
        <Input
          id="cuisineType"
          type="text"
          value={cuisineType}
          onChange={(e) => onCuisineTypeChange(e.target.value)}
          placeholder="e.g., Italian, Mexican, Asian Fusion"
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default RestaurantFormFields;
