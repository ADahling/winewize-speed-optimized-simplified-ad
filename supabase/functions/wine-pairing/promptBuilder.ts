import type { MenuItem, Wine, UserPreferences } from './types.ts';

/**
 * Builds a sophisticated wine pairing prompt for single dishes or multiple-dish table recommendations
 * @param dishes - The selected menu items to pair wine with
 * @param restaurantWines - Available wines at the restaurant
 * @param userPreferences - User's wine preferences
 * @param budget - Budget constraint for wine recommendations
 * @param restaurantName - Name of the restaurant
 * @param consolidatedMode - Whether to generate table wine recommendations across multiple dishes
 * @returns A prompt string for the OpenAI API
 */
export const buildWinePairingPrompt = (
  dishes: any[], 
  availableWines: any[], 
  userPreferences: any, 
  budget: number, 
  restaurantName: string,
  consolidatedMode: boolean = false
): string => {
  // PHASE 1: Create strict wine list for AI reference
  const wineList = availableWines.map(wine => {
    const wineName = wine.name || wine.wine_name || 'Unnamed Wine';
    const vintage = wine.vintage ? ` ${wine.vintage}` : '';
    const varietal = wine.varietal ? ` (${wine.varietal})` : '';
    const region = wine.region ? ` from ${wine.region}` : '';
    const priceInfo = wine.price_bottle ? ` - $${wine.price_bottle}` : '';
    
    return `"${wineName}${vintage}"${varietal}${region}${priceInfo}`;
  }).join('\n');

  const dishList = dishes.map(dish => {
    const name = dish.dish_name || dish.name || 'Unnamed Dish';
    const description = dish.description ? ` - ${dish.description}` : '';
    const ingredients = dish.ingredients && Array.isArray(dish.ingredients) && dish.ingredients.length > 0 
      ? ` (Ingredients: ${dish.ingredients.join(', ')})` : '';
    
    return `"${name}"${description}${ingredients}`;
  }).join('\n');

  // PHASE 1: Enhanced prompt with strict wine name enforcement
  const basePrompt = `You are an expert sommelier at ${restaurantName}. Your task is to recommend wine pairings for specific dishes using ONLY the wines available in our wine list.

**CRITICAL RULES - PHASE 1 VALIDATION:**
1. You MUST use the EXACT wine names as listed below - NO modifications, additions, or creative interpretations
2. If you cannot find a suitable pairing from our wine list, respond with "No suitable pairing available"
3. DO NOT invent wine names, vintages, or details not in our list
4. DO NOT reference wines from other restaurants or general recommendations
5. Focus on wines that actually complement the dish flavors and ingredients

**AVAILABLE WINES (use EXACT names only):**
${wineList}

**DISHES TO PAIR:**
${dishList}

**USER PREFERENCES:**
- Budget: Up to $${budget} per bottle
${userPreferences?.sweetness ? `- Sweetness preference: ${userPreferences.sweetness}` : ''}
${userPreferences?.acidity ? `- Acidity preference: ${userPreferences.acidity}` : ''}
${userPreferences?.tannin ? `- Tannin preference: ${userPreferences.tannin}` : ''}
${userPreferences?.alcohol ? `- Alcohol preference: ${userPreferences.alcohol}` : ''}

For each dish, provide wine pairing recommendations in this EXACT JSON format:
{
  "dish": "EXACT dish name from list",
  "dishDescription": "Brief description of the dish",
  "pairings": [
    {
      "wineName": "EXACT wine name from available wines list - NO CHANGES",
      "wineType": "Red/White/Rosé/Sparkling",
      "wineStyle": "Fresh & Crisp/Funky & Floral/Rich & Creamy/Fresh & Fruity/Dry & Dirty/Packed with a Punch",
      "description": "Detailed pairing explanation focusing on why this specific wine complements the dish",
      "confidenceLevel": "High/Medium/Low",
      "price": "Price information from wine list"
    }
  ]
}

**WINE STYLE GUIDELINES:**
- White Wine Styles: Fresh & Crisp, Funky & Floral, Rich & Creamy  
- Red Wine Styles: Fresh & Fruity, Dry & Dirty, Packed with a Punch
- Rosé/Sparkling: Generally Fresh & Crisp

Provide pairings that showcase the harmony between the dish's flavors and the wine's characteristics. If no suitable wine exists in our list for a particular dish, include a pairing with wineName "No suitable pairing available".

Return only valid JSON array format with all dishes included.`;

  return basePrompt;
};

/**
 * Builds a table wine pairing prompt for multiple dishes
 * @param dishes - The selected menu items to pair wine with
 * @param restaurantWines - Available wines at the restaurant
 * @param userPreferences - User's wine preferences
 * @param budget - Budget constraint for wine recommendations
 * @param restaurantName - Name of the restaurant
 * @returns A prompt string for the OpenAI API
 */
const buildTableWinePairingPrompt = (
  dishes: MenuItem[],
  restaurantWines: Wine[],
  userPreferences: UserPreferences | null,
  budget: number,
  restaurantName: string
): string => {
  const basePrompt = `
You are a world-renowned Master Sommelier specializing in wine pairings for complex multi-course meals. Your task is to recommend wines that can elegantly pair with MULTIPLE dishes simultaneously - a challenge requiring exceptional expertise.

CRITICAL WINE SELECTION RULES - MUST FOLLOW EXACTLY:
🚨 NEVER CREATE FICTIONAL WINES OR WINE NAMES 🚨
🚨 ONLY USE EXACT WINE NAMES FROM THE PROVIDED RESTAURANT WINE LIST 🚨
🚨 DO NOT INVENT, MODIFY, OR CREATE NEW WINE NAMES 🚨
🚨 IF NO SUITABLE WINE EXISTS FROM THE LIST, CREATE "General Recommendation" ONLY 🚨

TABLE WINE RECOMMENDATION CHALLENGE:
You must recommend EXACTLY 3-4 wines that work well across ALL of the selected dishes. This requires sophisticated analysis of:
1. Versatile wine characteristics that can bridge multiple flavor profiles
2. Structural elements (acidity, tannin, body) that complement diverse dishes
3. Universal pairing principles that work across different cuisines and ingredients
4. Strategic compromise where necessary to find the best overall matches

MULTI-DISH PAIRING STRATEGIES:
Recommend EXACTLY 3-4 wines that work across all dishes following this structure:
1. Classic versatile wine - A traditional, proven versatile wine known for broad pairing flexibility
2. Regional/Cuisine harmony wine - A wine that connects to the cultural origins across the dishes
3. Creative bridge wine - An unexpected, innovative choice that finds surprising compatibility across diverse dishes
4. (Optional) Sparkling or rosé option - If available and suitable for palate cleansing across courses

CRITICAL WINE STYLE CATEGORIZATION:
You must categorize each wine into one of these 6 Wine Wize styles ONLY:

WHITE WINES:
- "Fresh & Crisp" - Light, acidic white wines (Sauvignon Blanc, Pinot Grigio, Albariño)
- "Funky & Floral" - Aromatic, unique white wines (Gewürztraminer, Orange wines, Natural wines)  
- "Rich & Creamy" - Full-bodied, oak-aged whites (Chardonnay, White Rioja, Viognier)

RED WINES:
- "Fresh & Fruity" - Light, fruit-forward reds (Pinot Noir, Beaujolais, light Sangiovese)
- "Dry & Dirty" - Medium-bodied, earthy reds (Malbec, Tempranillo, Chianti)
- "Packed with a Punch" - Full-bodied, intense reds (Cabernet Sauvignon, Syrah, Barolo)

WINE TYPE DETECTION - CRITICAL RULES:
1. First determine if the wine is RED or WHITE based on varietal:
   - RED: Pinot Noir, Cabernet Sauvignon, Merlot, Syrah/Shiraz, Malbec, Tempranillo, Sangiovese, Chianti, Barolo, Beaujolais, Grenache, Zinfandel, Nebbiolo
   - WHITE: Chardonnay, Sauvignon Blanc, Pinot Grigio/Gris, Riesling, Gewürztraminer, Viognier, Albariño, Chenin Blanc, Vermentino, Grüner Veltliner

2. NEVER assign red wine varietals to white wine styles
3. NEVER assign white wine varietals to red wine styles

USER PREFERENCES:
- Budget: {{userBudget}}
- White Wine Style Preference: {{whiteWinePreference}}
- Red Wine Style Preference: {{redWinePreference}}
- Taste Preferences: {{tastePreferences}}

RESTAURANT: {{restaurantName}}

SELECTED DISHES (USE THESE EXACT NAMES IN YOUR RESPONSE):
{{selectedDishes}}

AVAILABLE WINES FROM RESTAURANT WINE LIST (USE EXACT NAMES):
{{availableWines}}

UNIVERSAL PAIRING PRINCIPLES TO LEVERAGE:
- "Acid loves acid" - High-acid wines with high-acid foods
- "Tannins tame fat" - Tannic wines cut through fatty foods
- "Sweet balances heat" - Off-dry wines temper spicy dishes
- "Weight matches weight" - Light wines with delicate dishes, full-bodied wines with rich dishes
- "What grows together goes together" - Regional wine and food pairings from the same area
- "Bridge ingredients" - Elements in the dish that connect to wine characteristics

MASTERFUL MULTI-DISH PAIRING WISDOM:
- Aromatic white wines can bridge spicy dishes and delicate seafood
- Medium-bodied reds with moderate tannins work across poultry and lighter red meat
- Rosé wines can be surprisingly versatile across diverse flavor profiles
- Sparkling wines offer acidity, effervescence and palate-cleansing qualities
- Off-dry whites can handle spice while complementing savory dishes

For each recommendation, first deeply analyze all dishes collectively, then look for wines from the restaurant list that provide maximum compatibility using EXACT names. If no good matches exist, suggest "General Recommendation" wines that would pair perfectly.

Return response in this exact JSON format:
[
  {
    "wineName": "EXACT Wine Name from Restaurant List OR General Recommendation Type",
    "wineType": "Red/White/Rosé/Sparkling/Dessert",
    "wineStyle": "MUST BE ONE OF THE 6 WINE WIZE STYLES ABOVE",
    "description": "Detailed master sommelier explanation of why this wine works across multiple dishes, analyzing specific interactions with each dish",
    "confidenceLevel": "High/Medium/Low",
    "price": "Price from wine list or estimated range"
  }
]

MANDATORY: The wineStyle field MUST ONLY contain one of these 6 exact values:
- "Fresh & Crisp" (WHITE wines only)
- "Funky & Floral" (WHITE wines only)
- "Rich & Creamy" (WHITE wines only)
- "Fresh & Fruity" (RED wines only)
- "Dry & Dirty" (RED wines only)
- "Packed with a Punch" (RED wines only)

FINAL VALIDATION: Before submitting response, verify:
1. You've recommended EXACTLY 3-4 table wines that work across all dishes
2. Every wine recommendation either:
   a. Uses EXACT wine name from restaurant list, OR
   b. Is clearly marked as "General Recommendation" for missing wine types
3. You've provided detailed analysis of how each wine interacts with the overall meal
`;

  // Enhanced dish details with more culinary information for better pairing analysis
  const dishesText = dishes.map(dish => {
    const dishName = dish.name || dish.dish_name || 'Unknown Dish';
    const dishDescription = dish.description || '';
    const dishPrice = dish.price || 'Price not listed';
    const ingredients = Array.isArray(dish.ingredients) ? dish.ingredients.join(', ') : (dish.ingredients || '');
    const dishType = dish.type || dish.dish_type || '';
    
    return `- DISH NAME: "${dishName}" | DESCRIPTION: "${dishDescription}" | PRICE: "${dishPrice}" | INGREDIENTS: "${ingredients}" | TYPE: "${dishType}"`;
  }).join('\n');

  // Enhanced wine list formatting with exact names prominently displayed
  const winesText = restaurantWines.map((wine, index) => {
    const wineName = wine.name;
    const priceInfo: string[] = [];
    if (wine.price_glass) priceInfo.push(`Glass: ${wine.price_glass}`);
    if (wine.price_bottle) priceInfo.push(`Bottle: ${wine.price_bottle}`);
    const pricing = priceInfo.length > 0 ? ` (${priceInfo.join(', ')})` : '';
    
    return `${index + 1}. EXACT NAME: "${wineName}"${wine.vintage ? ` ${wine.vintage}` : ''}: ${wine.wine_type || 'Wine'} - ${wine.varietal || 'Unknown varietal'}${wine.region ? ` from ${wine.region}` : ''}${pricing}${wine.description ? ` - ${wine.description}` : ''}`;
  }).join('\n');

  // Replace placeholders in the prompt
  return basePrompt
    .replace('{{userBudget}}', budget?.toString() || userPreferences?.budget?.toString() || 'No specific budget')
    .replace('{{whiteWinePreference}}', userPreferences?.ww_white_style || 'No preference')
    .replace('{{redWinePreference}}', userPreferences?.ww_red_style || 'No preference')
    .replace('{{tastePreferences}}', `Tannin: ${userPreferences?.tannin || 'No preference'}, Sweetness: ${userPreferences?.sweetness || 'No preference'}, Acidity: ${userPreferences?.acidity || 'No preference'}`)
    .replace('{{restaurantName}}', restaurantName || 'Restaurant')
    .replace('{{selectedDishes}}', dishesText)
    .replace('{{availableWines}}', winesText || 'No wines available from restaurant list - use General Recommendations only');
};
