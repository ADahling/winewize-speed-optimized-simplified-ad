export async function saveAnalysisResults(
  menuItems: any[],
  wines: any[],
  restaurantName: string,
  supabaseClient: any,
  userId: string
) {
  console.log(`💾 Starting database save for ${restaurantName}`);
  
  // Find or create restaurant
  let restaurantId: string;
  
  try {
    // Try to find existing restaurant
    const { data: existingRestaurant, error: findError } = await supabaseClient
      .from('restaurants')
      .select('id')
      .ilike('name', restaurantName)
      .limit(1)
      .maybeSingle();

    if (existingRestaurant && !findError) {
      restaurantId = existingRestaurant.id;
      console.log(`📍 Found existing restaurant: ${restaurantId}`);
    } else {
      // Create new restaurant
      const { data: newRestaurant, error: createError } = await supabaseClient
        .from('restaurants')
        .insert({
          name: restaurantName,
          created_by: userId,
          manual_entry: true,
          last_menu_update: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createError || !newRestaurant) {
        throw new Error(`Failed to create restaurant: ${createError?.message || 'Unknown error'}`);
      }

      restaurantId = newRestaurant.id;
      console.log(`🏪 Created new restaurant: ${restaurantId}`);
    }
  } catch (error) {
    console.error('❌ Restaurant creation/finding failed:', error);
    throw new Error(`Restaurant operation failed: ${error.message}`);
  }

  // Save menu items
  const uniqueMenuItems = [];
  if (menuItems && menuItems.length > 0) {
    console.log(`📋 Saving ${menuItems.length} menu items...`);
    
    for (const item of menuItems) {
      if (item.dish_name && item.dish_name.trim()) {
        try {
          const menuItem = {
            restaurant_id: restaurantId,
            dish_name: item.dish_name.trim(),
            description: item.description || '',
            price: item.price || '',
            dish_type: item.dish_type || '',
            ingredients: Array.isArray(item.ingredients) ? item.ingredients : []
          };

          const { data, error } = await supabaseClient
            .from('restaurant_menus')
            .insert(menuItem)
            .select('id')
            .single();

          if (!error && data) {
            uniqueMenuItems.push({ ...menuItem, id: data.id });
          } else {
            console.warn(`Failed to save menu item "${item.dish_name}":`, error?.message);
          }
        } catch (itemError) {
          console.warn(`Error processing menu item "${item.dish_name}":`, itemError);
        }
      }
    }
  }

  // Save wines
  const uniqueWines = [];
  if (wines && wines.length > 0) {
    console.log(`🍷 Saving ${wines.length} wines...`);
    
    for (const wine of wines) {
      if (wine.name && wine.name.trim()) {
        try {
          const wineItem = {
            restaurant_id: restaurantId,
            name: wine.name.trim(),
            vintage: wine.vintage || '',
            varietal: wine.varietal || '',
            region: wine.region || '',
            price_bottle: wine.price_bottle || '',
            price_glass: wine.price_glass || '',
            wine_type: wine.wine_type || '',
            ww_style: wine.ww_style || '',
            description: wine.description || ''
          };

          const { data, error } = await supabaseClient
            .from('restaurant_wines')
            .insert(wineItem)  
            .select('id')
            .single();

          if (!error && data) {
            uniqueWines.push({ ...wineItem, id: data.id });
          } else {
            console.warn(`Failed to save wine "${wine.name}":`, error?.message);
          }
        } catch (wineError) {
          console.warn(`Error processing wine "${wine.name}":`, wineError);
        }
      }
    }
  }

  // Update restaurant's last menu update timestamp
  try {
    await supabaseClient
      .from('restaurants')
      .update({ 
        last_menu_update: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurantId);
  } catch (updateError) {
    console.warn('Failed to update restaurant timestamp:', updateError);
  }

  console.log(`✅ Database save complete: ${uniqueMenuItems.length} menu items, ${uniqueWines.length} wines`);

  return {
    restaurantId,
    uniqueMenuItems,
    uniqueWines
  };
}