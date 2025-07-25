import type { Restaurant } from './types.ts';

export const createOrFindRestaurant = async (
  restaurantName: string,
  supabaseClient: any,
  userId: string
): Promise<Restaurant> => {
  console.log(`Attempting to find or create restaurant: ${restaurantName}`);

  // First, try to find the restaurant by name
  let { data: existingRestaurants, error: findError } = await supabaseClient
    .from('restaurants')
    .select('*')
    .eq('name', restaurantName);

  if (findError) {
    console.error('Error finding restaurant:', findError);
    throw new Error(`Failed to find restaurant: ${findError.message}`);
  }

  if (existingRestaurants && existingRestaurants.length > 0) {
    const restaurant = existingRestaurants[0];
    console.log(`Restaurant found: ${restaurant.name} (ID: ${restaurant.id})`);
    return restaurant;
  }

  // If not found, create a new restaurant
  const newRestaurant = {
    name: restaurantName,
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  let { data: createdRestaurant, error: createError } = await supabaseClient
    .from('restaurants')
    .insert([newRestaurant])
    .select('*');

  if (createError) {
    console.error('Error creating restaurant:', createError);
    throw new Error(`Failed to create restaurant: ${createError.message}`);
  }

  if (createdRestaurant && createdRestaurant.length > 0) {
    const restaurant = createdRestaurant[0];
    console.log(`Restaurant created: ${restaurant.name} (ID: ${restaurant.id})`);
    return restaurant;
  }

  throw new Error('Failed to create or find restaurant');
};
