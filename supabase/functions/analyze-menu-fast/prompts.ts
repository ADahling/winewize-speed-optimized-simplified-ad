export const menuAnalysisPrompt = `
Extract ALL food items from this restaurant menu. Work systematically through EVERY section.

For each food item, capture:
- The exact dish name
- Complete description 
- Exact price (with $ symbol)
- Any dietary information

Format your response as this JSON:
{
  "menuItems": [
    {
      "dishName": "Exact dish name",
      "description": "Complete description",
      "price": "Price with $ symbol",
      "dishType": "appetizer/entree/etc"
    }
  ]
}

CRITICAL: Extract EVERY single food item visible on the menu - be thorough and complete.
Scan systematically from top to bottom, left to right. Count items as you go.
`;

export const wineListAnalysisPrompt = `
Extract ALL wines from this wine list. Work systematically through EVERY section.

For each wine, capture:
- Complete wine name (including producer)
- Vintage year (if shown)
- Varietal/grape variety
- Region/appellation
- Bottle price and glass price (with $ symbol)
- Wine type (red/white/sparkling/etc)

Format your response as this JSON:
{
  "wines": [
    {
      "name": "Complete wine name",
      "vintage": "Year if shown",
      "varietal": "Grape variety",
      "region": "Wine region",
      "price_bottle": "Bottle price with $",
      "price_glass": "Glass price with $",
      "wineType": "red/white/etc"
    }
  ]
}

CRITICAL: Extract EVERY single wine visible on the list - be thorough and complete.
Scan systematically from top to bottom, left to right. Count wines as you go.
`;

export const createDishAnalysisPrompt = (menuItems: any[]): string => {
  const formattedItems = menuItems.map(item => {
    return `- Name: ${item.dish_name}
  Description: ${item.description || 'No description provided'}
  Price: ${item.price || 'Price not provided'}
  Section: ${item.section || 'Section not specified'}`;
  }).join('\n\n');
  
  return `You are a culinary expert analyzing menu dishes to extract key ingredients, flavors, and characteristics.

ANALYZE EACH OF THESE MENU ITEMS:
${formattedItems}

For each dish, provide this information:
1. Primary protein (if any)
2. Primary starch (if any)
3. Sauce components (if any)
4. Key flavors (sweet, spicy, savory, acidic, etc.)
5. Cooking method (grilled, roasted, fried, etc.)
6. Dominant herbs/spices
7. Region/cuisine (if identifiable)

Return your analysis in JSON format with the original dish name and your detailed analysis.`;
};

export const createMenuAnalysisPrompt = (menuItems: any[]): string => {
  const formattedItems = menuItems.map(item => {
    return `- "${item.dish_name}": ${item.description || 'No description'}`;
  }).join('\n');
  
  return `You are a restaurant consultant analyzing this menu to identify cuisine type, price point, and style.

MENU ITEMS:
${formattedItems}

Provide a comprehensive analysis including:
1. Overall cuisine type(s)
2. Price point category (budget, mid-range, upscale, luxury)
3. Menu style (traditional, fusion, modern, farm-to-table, etc.)
4. Recommendations for wine list focus based on menu style
5. Key ingredient trends across the menu

Return your analysis in a detailed format that would be useful for a restaurant owner.`;
};
