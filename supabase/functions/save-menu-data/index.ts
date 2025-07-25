import '../_shared/deno-types.ts';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://deno.land/x/supabase@1.0.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== BACKGROUND MENU SAVE STARTED ===');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    const { menuItems, wines, restaurantName, restaurantId, userId, sessionId } = requestBody;

    console.log(`Background save session ${sessionId}:`, {
      menuItems: menuItems?.length || 0,
      wines: wines?.length || 0,
      restaurantName,
      restaurantId,
      userId
    });

    if (!userId) {
      throw new Error('User ID is required for background save');
    }

    if (!restaurantId) {
      throw new Error('Restaurant ID is required for background save');
    }

    let savedMenuCount = 0;
    let savedWineCount = 0;

    // Save menu items to restaurant_menus table
    if (menuItems && menuItems.length > 0) {
      console.log(`Saving ${menuItems.length} menu items to restaurant_menus table...`);
      
      const menuItemsToInsert = menuItems.map((item) => ({
        restaurant_id: restaurantId,
        dish_name: item.dish_name || 'Unknown Dish',
        description: item.description || '',
        price: item.price || '',
        dish_type: item.dish_type || 'entree',
        ingredients: item.ingredients || []
      }));

      const { data: insertedMenuItems, error: menuError } = await supabaseClient
        .from('restaurant_menus')
        .insert(menuItemsToInsert)
        .select();

      if (menuError) {
        console.error('Menu items insert error:', menuError);
        throw new Error(`Failed to save menu items: ${menuError.message}`);
      }

      savedMenuCount = insertedMenuItems?.length || 0;
      console.log(`Successfully saved ${savedMenuCount} menu items`);
    }

    // Save wines to restaurant_wines table
    if (wines && wines.length > 0) {
      console.log(`Saving ${wines.length} wines to restaurant_wines table...`);
      
      const winesToInsert = wines.map((wine) => ({
        restaurant_id: restaurantId,
        name: wine.name || 'Unknown Wine',
        vintage: wine.vintage || '',
        varietal: wine.varietal || '',
        region: wine.region || '',
        price_glass: wine.price_glass || '',
        price_bottle: wine.price_bottle || '',
        wine_type: wine.wine_type || '',
        ww_style: wine.wine_style || '',
        description: wine.description || ''
      }));

      const { data: insertedWines, error: wineError } = await supabaseClient
        .from('restaurant_wines')
        .insert(winesToInsert)
        .select();

      if (wineError) {
        console.error('Wines insert error:', wineError);
        throw new Error(`Failed to save wines: ${wineError.message}`);
      }

      savedWineCount = insertedWines?.length || 0;
      console.log(`Successfully saved ${savedWineCount} wines`);
    }

    console.log(`=== BACKGROUND SAVE COMPLETED ===`);
    console.log(`Session ${sessionId}: ${savedMenuCount} menu items, ${savedWineCount} wines saved for restaurant ${restaurantId}`);

    return new Response(JSON.stringify({
      success: true,
      sessionId,
      savedMenuCount,
      savedWineCount,
      restaurantId,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== BACKGROUND SAVE FAILED ===');
    console.error('Background save error:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
