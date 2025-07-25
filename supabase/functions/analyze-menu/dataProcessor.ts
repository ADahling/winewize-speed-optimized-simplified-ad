// Enhanced restaurant lookup and creation functions
export async function createOrFindRestaurant(restaurantName: string, supabaseClient: any, userId: string): Promise<string> {
  try {
    console.log(`Looking up restaurant: "${restaurantName}" for user: ${userId}`);
    
    // Clean and normalize the restaurant name for better matching
    const normalizedName = restaurantName.trim();
    
    if (!normalizedName || normalizedName === 'Unknown Restaurant') {
      console.log('Invalid restaurant name provided, skipping restaurant creation');
      return null;
    }

    // First, try to find existing restaurant by exact name match (case insensitive)
    console.log('Attempting exact name match...');
    const { data: exactMatch, error: exactMatchError } = await supabaseClient
      .from('restaurants')
      .select('id, name')
      .ilike('name', normalizedName)
      .limit(1);

    if (exactMatchError) {
      console.error('Error in exact match lookup:', exactMatchError);
    } else if (exactMatch && exactMatch.length > 0) {
      console.log(`Found existing restaurant by exact match: ${exactMatch[0].name} (${exactMatch[0].id})`);
      return exactMatch[0].id;
    }

    // Second, try fuzzy matching for restaurants created by this user
    console.log('Attempting fuzzy match for user-created restaurants...');
    const { data: userRestaurants, error: userRestaurantsError } = await supabaseClient
      .from('restaurants')
      .select('id, name')
      .eq('created_by', userId)
      .eq('manual_entry', true);

    if (userRestaurantsError) {
      console.error('Error in user restaurants lookup:', userRestaurantsError);
    } else if (userRestaurants && userRestaurants.length > 0) {
      // Simple fuzzy matching - check if names are similar
      const fuzzyMatch = userRestaurants.find(restaurant => {
        const similarity = calculateSimilarity(normalizedName.toLowerCase(), restaurant.name.toLowerCase());
        console.log(`Similarity between "${normalizedName}" and "${restaurant.name}": ${similarity}`);
        return similarity > 0.8; // 80% similarity threshold
      });

      if (fuzzyMatch) {
        console.log(`Found existing restaurant by fuzzy match: ${fuzzyMatch.name} (${fuzzyMatch.id})`);
        return fuzzyMatch.id;
      }
    }

    // Third, create new restaurant using the database function
    console.log('Creating new restaurant...');
    const { data: newRestaurantId, error: createError } = await supabaseClient
      .rpc('create_or_find_restaurant_by_user', {
        restaurant_name: normalizedName,
        restaurant_address: null,
        restaurant_cuisine: null,
        user_id_param: userId
      });

    if (createError) {
      console.error('Error creating restaurant:', createError);
      throw createError;
    }

    console.log(`Successfully created new restaurant: ${normalizedName} (${newRestaurantId})`);
    return newRestaurantId;

  } catch (error) {
    console.error('Error in createOrFindRestaurant:', error);
    // Don't throw error, return null to continue without restaurant context
    return null;
  }
}

// Simple string similarity calculation
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export function deduplicateMenuItems(menuItems: any[]): any[] {
  const seen = new Set();
  const deduped = [];
  
  for (const item of menuItems) {
    // Create a unique key based on dish name and price
    const key = `${item.dish_name?.toLowerCase() || ''}-${item.price || ''}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }
  
  console.log(`Deduplicated menu items: ${menuItems.length} -> ${deduped.length}`);
  return deduped;
}

export function deduplicateWines(wines: any[]): any[] {
  const seen = new Set();
  const deduped = [];
  
  for (const wine of wines) {
    // Create a unique key based on wine name and vintage
    const key = `${wine.name?.toLowerCase() || ''}-${wine.vintage || ''}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(wine);
    }
  }
  
  console.log(`Deduplicated wines: ${wines.length} -> ${deduped.length}`);
  return deduped;
}

export function prepareRestaurantMenuItems(menuItems: any[], restaurantId: string): any[] {
  return menuItems.map(item => ({
    restaurant_id: restaurantId,
    dish_name: item.dish_name || item.name || 'Unknown Dish',
    description: item.description || null,
    price: item.price || null,
    dish_type: item.dish_type || item.type || null,
    ingredients: item.ingredients || null
  }));
}

export function prepareRestaurantWines(wines: any[], restaurantId: string): any[] {
  return wines.map(wine => ({
    restaurant_id: restaurantId,
    name: wine.name || 'Unknown Wine',
    varietal: wine.varietal || null,
    region: wine.region || null,
    price_bottle: wine.price_bottle || wine.price || null,
    price_glass: wine.price_glass || null,
    wine_type: wine.wine_type || wine.type || null,
    ww_style: wine.ww_style || wine.wine_style || wine.style || null,
    description: wine.description || null,
    vintage: wine.vintage || null
  }));
}
