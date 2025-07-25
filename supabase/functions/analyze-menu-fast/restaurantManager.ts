
export async function findOrCreateRestaurant(restaurantName: string, supabaseClient: any, userId: string): Promise<string> {
  console.log(`Finding/creating restaurant: ${restaurantName}`);
  
  // Try to find existing restaurant
  const { data: existingRestaurant, error: findError } = await supabaseClient
    .from('restaurants')
    .select('id')
    .ilike('name', restaurantName)
    .limit(1)
    .single();

  if (existingRestaurant && !findError) {
    console.log(`Found existing restaurant: ${existingRestaurant.id}`);
    return existingRestaurant.id;
  }

  // Create new restaurant
  const { data: newRestaurant, error: createError } = await supabaseClient
    .from('restaurants')
    .insert({
      name: restaurantName,
      created_by: userId,
      manual_entry: true
    })
    .select('id')
    .single();

  if (createError || !newRestaurant) {
    throw new Error(`Failed to create restaurant: ${createError?.message || 'Unknown error'}`);
  }

  console.log(`Created new restaurant: ${newRestaurant.id}`);
  return newRestaurant.id;
}
