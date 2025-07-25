import type { MenuItem, Wine } from './types.ts';

export const saveMenuItemsToDatabase = async (
  supabaseClient: any,
  restaurantId: string,
  menuItems: MenuItem[]
): Promise<MenuItem[]> => {
  console.log(`Saving ${menuItems.length} menu items to database...`);

  // Deduplicate menu items based on dish_name and description
  const uniqueMenuItems = menuItems.reduce((acc: MenuItem[], item: MenuItem) => {
    const existingItem = acc.find(
      (existing: MenuItem) =>
        existing.dish_name === item.dish_name && existing.description === item.description
    );
    if (!existingItem) {
      acc.push(item);
    }
    return acc;
  }, []);

  console.log(`Saving ${uniqueMenuItems.length} unique menu items to database...`);

  // Prepare menu items for database insertion
  const menuItemsToInsert = uniqueMenuItems.map((item: MenuItem) => ({
    restaurant_id: restaurantId,
    dish_name: item.dish_name,
    description: item.description,
    price: item.price,
    dish_type: item.dish_type,
    ingredients: item.ingredients,
  }));

  // Insert menu items into the database
  const { data, error } = await supabaseClient
    .from('menu_items')
    .insert(menuItemsToInsert)
    .select();

  if (error) {
    console.error('Error saving menu items to database:', error);
    throw new Error('Failed to save menu items to database');
  }

  console.log('Menu items saved successfully');
  return uniqueMenuItems;
};

export const saveWinesToDatabase = async (
  supabaseClient: any,
  restaurantId: string,
  wines: Wine[]
): Promise<Wine[]> => {
  console.log(`Saving ${wines.length} wines to database...`);

  // Deduplicate wines based on name, varietal, and vintage
  const uniqueWines = wines.reduce((acc: Wine[], item: Wine) => {
    const existingWine = acc.find(
      (existing: Wine) =>
        existing.name === item.name &&
        existing.varietal === item.varietal &&
        existing.vintage === item.vintage
    );
    if (!existingWine) {
      acc.push(item);
    }
    return acc;
  }, []);

  console.log(`Saving ${uniqueWines.length} unique wines to database...`);

  // Prepare wines for database insertion
  const winesToInsert = uniqueWines.map((wine: Wine) => ({
    restaurant_id: restaurantId,
    name: wine.name,
    vintage: wine.vintage,
    varietal: wine.varietal,
    region: wine.region,
    price_glass: wine.price_glass,
    price_bottle: wine.price_bottle,
    wine_type: wine.wine_type,
    wine_style: wine.wine_style,
    description: wine.description,
  }));

  // Insert wines into the database
  const { data, error } = await supabaseClient
    .from('restaurant_wines')
    .insert(winesToInsert)
    .select();

  if (error) {
    console.error('Error saving wines to database:', error);
    throw new Error('Failed to save wines to database');
  }

  console.log('Wines saved successfully');
  return uniqueWines;
};
