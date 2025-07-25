import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import LocationAutocomplete from '@/components/location/LocationAutocomplete';
import { Database } from '@/integrations/supabase/types';

interface AddRestaurantFormProps {
  onSuccess?: (restaurant: any) => void;
  onCancel?: () => void;
  onRestaurantAdded?: (restaurant: any) => void;
}

const AddRestaurantForm: React.FC<AddRestaurantFormProps> = ({
  onSuccess,
  onCancel,
  onRestaurantAdded
}) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    cuisine_type: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const cuisineTypes = ['Italian', 'French', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'American', 'Greek', 'Korean', 'Vietnamese', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add a restaurant",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim() || !formData.location.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in restaurant name and location",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check for duplicates
      const { data: existingData } = await supabase.rpc('check_restaurant_duplicate', {
        check_name: formData.name.trim(),
        check_location: formData.location.trim()
      });

      if (existingData) {
        toast({
          title: "Restaurant already exists",
          description: "A restaurant with this name and location already exists",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Create new restaurant
      const { data: newRestaurant, error } = await supabase
        .from('restaurants')
        .insert({
          name: formData.name.trim(),
          location: formData.location.trim(),
          cuisine_type: formData.cuisine_type || null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Restaurant added successfully",
        description: `${formData.name} has been added to the database`
      });

      if (onSuccess) {
        onSuccess(newRestaurant);
      }
      if (onRestaurantAdded) {
        onRestaurantAdded(newRestaurant);
      }

      // Reset form
      setFormData({
        name: '',
        location: '',
        cuisine_type: ''
      });
    } catch (error) {
      console.error('Error adding restaurant:', error);
      toast({
        title: "Error adding restaurant",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-purple-600">Add New Restaurant</CardTitle>
        <CardDescription>
          Add a restaurant that's not in our database yet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter restaurant name"
              required
              className="bg-purple-100"
            />
          </div>

          <div className="space-y-2">
            <LocationAutocomplete
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              placeholder="Enter city, state or full address"
              required
              label="Location *"
              allowUnauthenticated={true}
              className="bg-purple-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuisine">Cuisine Type</Label>
            <Select
              value={formData.cuisine_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, cuisine_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine type (optional)" />
              </SelectTrigger>
              <SelectContent>
                {cuisineTypes.map(cuisine => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-800 hover:to-pink-800"
            >
              {isSubmitting ? 'Adding...' : 'Add Restaurant'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddRestaurantForm;
