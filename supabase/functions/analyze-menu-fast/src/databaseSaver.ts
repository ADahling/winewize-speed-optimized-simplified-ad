
export async function saveAnalysisResults(
  menuItems: any[],
  wines: any[],
  restaurantName: string,
  supabaseClient: any,
  userId: string
) {
  console.log(`Saving analysis results for ${restaurantName}`);
  
  // Find or create restaurant
  let restaurantId: string;
  
  // Try to find existing restaurant
  const { data: existingRestaurant, error: findError } = await supabaseClient
    .from('restaurants')
    .select('id')
    .ilike('name', restaurantName)
    .limit(1)
    .single();

  if (existingRestaurant && !findError) {
    restaurantId = existingRestaurant.id;
    console.log(`Found existing restaurant: ${restaurantId}`);
  } else {
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

    restaurantId = newRestaurant.id;
    console.log(`Created new restaurant: ${restaurantId}`);
  }

  // Save menu items
  const uniqueMenuItems = [];
  if (menuItems && menuItems.length > 0) {
    for (const item of menuItems) {
      if (item.dish_name) {
        const menuItem = {
          restaurant_id: restaurantId,
          dish_name: item.dish_name,
          description: item.description || '',
          price: item.price || '',
          dish_type: item.dish_type || '',
          ingredients: item.ingredients || []
        };

        const { data, error } = await supabaseClient
          .from('restaurant_menus')
          .insert(menuItem)
          .select('id')
          .single();

        if (!error && data) {
          uniqueMenuItems.push({ ...menuItem, id: data.id });
        }
      }
    }
  }

  // Save wines
  const uniqueWines = [];
  if (wines && wines.length > 0) {
    for (const wine of wines) {
      if (wine.name) {
        const wineItem = {
          restaurant_id: restaurantId,
          name: wine.name,
          vintage: wine.vintage || '',
          varietal: wine.varietal || '',
          region: wine.region || '',
          price_bottle: wine.price_bottle || '',
          price_glass: wine.price_glass || '',
          wine_type: wine.wine_type || '',
          description: wine.description || ''
        };

        const { data, error } = await supabaseClient
          .from('restaurant_wines')
          .insert(wineItem)  
          .select('id')
          .single();

        if (!error && data) {
          uniqueWines.push({ ...wineItem, id: data.id });
        }
      }
    }
  }

  return {
    restaurantId,
    uniqueMenuItems,
    uniqueWines
  };
}
