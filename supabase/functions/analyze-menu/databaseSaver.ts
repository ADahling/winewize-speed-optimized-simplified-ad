import { createOrFindRestaurant } from './restaurantManager.ts';
import { saveMenuItemsToDatabase, saveWinesToDatabase } from './databaseTransactions.ts';
import type { MenuItem, Wine } from './types.ts';

export const saveAnalysisResults = async (
  menuItems: MenuItem[],
  wines: Wine[],
  restaurantName: string,
  supabaseClient: any,
  userId: string
): Promise<{ restaurantId: string; uniqueMenuItems: MenuItem[]; uniqueWines: Wine[] }> => {
  console.log('Starting to save analysis results...');

  // Create or find the restaurant
  const { restaurantId, restaurantExists } = await createOrFindRestaurant(restaurantName, supabaseClient, userId);

  if (!restaurantId) {
    throw new Error('Failed to create or find restaurant');
  }

  console.log(`Restaurant ${restaurantExists ? 'found' : 'created'} with ID: ${restaurantId}`);

  // Save menu items to the database
  const uniqueMenuItems = await saveMenuItemsToDatabase(menuItems, restaurantId, supabaseClient);
  console.log(`Saved ${uniqueMenuItems.length} unique menu items`);

  // Save wines to the database
  const uniqueWines = await saveWinesToDatabase(wines, restaurantId, supabaseClient);
  console.log(`Saved ${uniqueWines.length} unique wines`);

  console.log('Successfully saved analysis results.');

  return { restaurantId, uniqueMenuItems, uniqueWines };
};
