
import { supabase } from '@/integrations/supabase/client';

export interface WineLibraryItem {
  id: string;
  user_id: string;
  wine_name: string;
  wine_style: string;
  confidence_level: string;
  wine_description: string;
  dish_paired_with: string;
  price: string;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export const addToWineLibrary = async (
  userId: string,
  wineName: string,
  wineType: string,
  wineStyle: string,
  restaurantName?: string,
  dishName?: string,
  price?: string,
  rating?: number,
  notes?: string
): Promise<{ success: boolean; error?: string; data?: WineLibraryItem }> => {
  try {
    const { data, error } = await supabase
      .from('user_wine_library')
      .insert({
        user_id: userId,
        wine_name: wineName,
        wine_style: wineStyle,
        confidence_level: 'Medium',
        wine_description: notes || '',
        dish_paired_with: dishName || '',
        price: price || '',
        rating: rating || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to wine library:', error);
      return { success: false, error: error.message };
    }

    // Create a rating reminder for 3 days from now if no rating was provided
    if (!rating && data?.id) {
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 3);

      const { error: reminderError } = await supabase
        .from('wine_rating_reminders')
        .insert({
          user_id: userId,
          wine_library_id: data.id,
          scheduled_for: reminderDate.toISOString(),
          sent: false
        });

      if (reminderError) {
        console.error('Error creating rating reminder:', reminderError);
        // Don't fail the whole operation if reminder creation fails
      } else {
        console.log(`Created rating reminder for wine ${wineName}, scheduled for ${reminderDate.toISOString()}`);
      }
    }

    return { 
      success: true, 
      data: data as WineLibraryItem 
    };
  } catch (error) {
    console.error('Error in addToWineLibrary:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Add the missing functions that WineCard expects
export const addWineToLibrary = async (userId: string, wine: any, dishName: string) => {
  return addToWineLibrary(
    userId,
    wine.wineName,
    wine.wineType,
    wine.wineStyle || '',
    wine.restaurantName,
    dishName,
    wine.price,
    wine.rating,
    wine.notes
  );
};

export const trackWineInteraction = async (
  userId: string,
  interactionType: string,
  wineName: string,
  wineStyle: string,
  dishName: string
) => {
  try {
    await supabase
      .from('wine_interactions')
      .insert({
        user_id: userId,
        interaction_type: interactionType,
        wine_name: wineName,
        notes: `${wineStyle} paired with ${dishName}`
      });
  } catch (error) {
    console.error('Error tracking wine interaction:', error);
  }
};

export const updateWineLibraryItem = async (
  itemId: string,
  updates: Partial<WineLibraryItem>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('user_wine_library')
      .update(updates)
      .eq('id', itemId);

    if (error) {
      console.error('Error updating wine library item:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateWineLibraryItem:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const fetchUserWineLibrary = async (userId: string): Promise<WineLibraryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('user_wine_library')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wine library:', error);
      return [];
    }

    return (data || []) as WineLibraryItem[];
  } catch (error) {
    console.error('Error in fetchUserWineLibrary:', error);
    return [];
  }
};

export const fetchMenuAndWinesFromDB = async (restaurantId: string) => {
  try {
    // Fetch menu items
    const { data: menu, error: menuError } = await supabase
      .from('restaurant_menus')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (menuError) {
      throw new Error('Error fetching menu: ' + menuError.message);
    }

    // Fetch wines
    const { data: wines, error: winesError } = await supabase
      .from('restaurant_wines')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (winesError) {
      throw new Error('Error fetching wines: ' + winesError.message);
    }

    return { menu: menu || [], wines: wines || [] };
  } catch (error: any) {
    throw new Error(error.message || 'Unknown error fetching menu/wines');
  }
};
