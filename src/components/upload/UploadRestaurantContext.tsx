
import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSessionOnlyMode } from '@/hooks/useSessionOnlyMode';

interface UploadRestaurantContextProps {
  restaurant: { id: string; name: string } | null;
  onChangeRestaurant: () => void;
}

const UploadRestaurantContext = ({ restaurant, onChangeRestaurant }: UploadRestaurantContextProps) => {
  // Remove the large context card - it will be handled in the bottom actions
  return null;
};

export default UploadRestaurantContext;
