
export function createPairingPrompt(
  dishes: any[],
  wines: any[],
  userPreferences: any,
  budget: any,
  restaurantName: string
): string {
  console.log(`🍷 Creating enhanced pairing prompt for ${dishes.length} dishes and ${wines.length} wines`);
  
  const dishList = dishes.map(dish => {
    const dishName = dish.dish_name || dish.name || 'Unknown Dish';
    const description = dish.description || 'No description';
    const ingredients = Array.isArray(dish.ingredients) ? dish.ingredients.join(', ') : (dish.ingredients || '');
    const dishType = dish.dish_type || dish.type || '';
    const price = dish.price || 'Price not listed';
    
    return `- DISH: "${dishName}" | DESCRIPTION: "${description}" | INGREDIENTS: "${ingredients}" | TYPE: "${dishType}" | PRICE: "${price}"`;
  }).join('\n');
  
  const wineList = wines.map(wine => {
    const wineName = wine.name || wine.wine_name || 'Unknown Wine';
    const wineType = wine.wine_type || wine.wineType || 'Unknown type';
    const varietal = wine.varietal || '';
    const region = wine.region || '';
    const vintage = wine.vintage || '';
    const description = wine.description || '';
    const priceInfo = [];
    if (wine.price_glass) priceInfo.push(`Glass: $${wine.price_glass}`);
    if (wine.price_bottle) priceInfo.push(`Bottle: $${wine.price_bottle}`);
    const pricing = priceInfo.length > 0 ? ` (${priceInfo.join(', ')})` : (wine.price || wine.formattedPrice || 'Price not listed');
    
    return `- "${wineName}"${vintage ? ` ${vintage}` : ''}: ${wineType}${varietal ? ` - ${varietal}` : ''}${region ? ` from ${region}` : ''}${pricing}${description ? ` | NOTES: ${description}` : ''}`;
  }).join('\n');
  
  console.log(`📋 Enhanced wine list preview: ${wineList.split('\n').slice(0, 3).join('; ')}`);
  
  // Format user preferences for analysis
  const preferencesText = userPreferences ? [
    userPreferences.ww_white_style ? `White Wine Style: ${userPreferences.ww_white_style}` : '',
    userPreferences.ww_red_style ? `Red Wine Style: ${userPreferences.ww_red_style}` : '',
    userPreferences.sweetness ? `Sweetness: ${userPreferences.sweetness}` : '',
    userPreferences.acidity ? `Acidity: ${userPreferences.acidity}` : '',
    userPreferences.tannin ? `Tannin: ${userPreferences.tannin}` : '',
    userPreferences.alcohol ? `Alcohol: ${userPreferences.alcohol}` : '',
  ].filter(Boolean).join(', ') : 'No specific preferences';

  return `You are a Master Sommelier with decades of experience in fine wine pairing. Your expertise lies in creating harmonious flavor experiences that elevate both food and wine through sophisticated analysis of structural compatibility, regional harmony, and innovative pairing approaches.

**RESTAURANT**: ${restaurantName}
**BUDGET CONSIDERATION**: Up to $${budget || 50} per bottle

**CRITICAL PAIRING REQUIREMENTS**:
For each dish below, you MUST recommend EXACTLY 3 wines using these specific approaches:

1. **TRADITIONAL PAIRING** - Classic, time-tested pairing based on established sommelier principles
2. **REGIONAL PAIRING** - Wine from the same region or complementary regional style that enhances cultural harmony  
3. **CREATIVE PAIRING** - Innovative, unexpected combination that creates surprising but harmonious flavor interactions

**SELECTED DISHES**:
${dishList}

**AVAILABLE WINES** (USE EXACT NAMES ONLY):
${wineList}

**USER PREFERENCES FOR ANALYSIS**:
${preferencesText}

**MASTER SOMMELIER ANALYSIS REQUIREMENTS**:

For each wine recommendation, provide comprehensive analysis including:
- **Structural Compatibility**: How the wine's acidity, tannin, sweetness, and body interact with the dish
- **Flavor Interaction**: Specific explanation of how wine flavors complement, contrast, or enhance dish elements
- **Confidence Reasoning**: Professional justification for why this pairing works at a sommelier level
- **Preference Alignment**: How well this matches the diner's stated preferences

**WINE STYLE CATEGORIZATION** (CRITICAL):
You MUST categorize each wine into one of these 6 Wine Wize styles:

**WHITE WINES:**
- "Fresh & Crisp" - Light, acidic whites (Sauvignon Blanc, Pinot Grigio, Albariño)
- "Funky & Floral" - Aromatic, unique whites (Gewürztraminer, Orange wines, Natural wines)  
- "Rich & Creamy" - Full-bodied, oak-aged whites (Chardonnay, White Rioja, Viognier)

**RED WINES:**
- "Fresh & Fruity" - Light, fruit-forward reds (Pinot Noir, Beaujolais, light Sangiovese)
- "Dry & Dirty" - Medium-bodied, earthy reds (Malbec, Tempranillo, Chianti)
- "Packed with a Punch" - Full-bodied, intense reds (Cabernet Sauvignon, Syrah, Barolo)

**RESPONSE FORMAT** (EXACT JSON STRUCTURE REQUIRED):
{
  "pairings": [
    {
      "dish": "EXACT dish name from list",
      "dishDescription": "Brief description of the dish",
      "dishPrice": "Price from dish list",
      "pairings": [
        {
          "wineName": "EXACT wine name from available list",
          "wineType": "Red/White/Rosé/Sparkling",
          "wineStyle": "ONE OF THE 6 WINE WIZE STYLES ABOVE",
          "price": "Price from wine list",
          "description": "Detailed Master Sommelier explanation of the pairing, including specific flavor interactions, structural compatibility, and why this combination creates harmony",
          "pairingType": "Traditional/Regional/Creative",
          "confidenceLevel": "High/Medium/Low",
          "preferenceMatch": true/false,
          "structuralCompatibility": {
            "acidity": "How wine's acidity interacts with dish",
            "tannin": "How tannins complement or contrast with dish elements",
            "sweetness": "Sweetness balance analysis",
            "body": "Wine body compatibility with dish weight"
          },
          "flavorInteraction": "Specific analysis of how wine flavors enhance, complement, or create interesting contrasts with dish flavors",
          "confidenceReasoning": "Professional sommelier justification for this pairing choice"
        }
      ]
    }
  ]
}

**CRITICAL INSTRUCTIONS**:
- Each dish MUST have exactly 3 different wines with different pairing approaches (Traditional, Regional, Creative)
- Use ONLY wines from the available list above with EXACT names
- Provide sophisticated, detailed descriptions worthy of a Master Sommelier
- Analyze structural compatibility in detail for each pairing
- Consider user preferences when determining preferenceMatch value
- If a wine doesn't perfectly match user preferences but creates an excellent pairing, explain why in the description

Return ONLY the JSON response with no additional text.`;
}

export function createConsolidatedPairingPrompt(
  dishes: any[],
  wines: any[],
  userPreferences: any,
  budget: any,
  restaurantName: string
): string {
  console.log(`🍷 Creating enhanced consolidated prompt for ${dishes.length} dishes and ${wines.length} wines`);
  
  const dishList = dishes.map(dish => {
    const dishName = dish.dish_name || dish.name || 'Unknown Dish';
    const description = dish.description || 'No description';
    const ingredients = Array.isArray(dish.ingredients) ? dish.ingredients.join(', ') : (dish.ingredients || '');
    const dishType = dish.dish_type || dish.type || '';
    const price = dish.price || 'Price not listed';
    
    return `- DISH: "${dishName}" | DESCRIPTION: "${description}" | INGREDIENTS: "${ingredients}" | TYPE: "${dishType}" | PRICE: "${price}"`;
  }).join('\n');
  
  const wineList = wines.map(wine => {
    const wineName = wine.name || wine.wine_name || 'Unknown Wine';
    const wineType = wine.wine_type || wine.wineType || 'Unknown type';
    const varietal = wine.varietal || '';
    const region = wine.region || '';
    const vintage = wine.vintage || '';
    const description = wine.description || '';
    const priceInfo = [];
    if (wine.price_glass) priceInfo.push(`Glass: $${wine.price_glass}`);
    if (wine.price_bottle) priceInfo.push(`Bottle: $${wine.price_bottle}`);
    const pricing = priceInfo.length > 0 ? ` (${priceInfo.join(', ')})` : (wine.price || wine.formattedPrice || 'Price not listed');
    
    return `- "${wineName}"${vintage ? ` ${vintage}` : ''}: ${wineType}${varietal ? ` - ${varietal}` : ''}${region ? ` from ${region}` : ''}${pricing}${description ? ` | NOTES: ${description}` : ''}`;
  }).join('\n');
  
  console.log(`📋 Available wines count for enhanced consolidated pairing: ${wines.length}`);
  
  // Format user preferences for analysis
  const preferencesText = userPreferences ? [
    userPreferences.ww_white_style ? `White Wine Style: ${userPreferences.ww_white_style}` : '',
    userPreferences.ww_red_style ? `Red Wine Style: ${userPreferences.ww_red_style}` : '',
    userPreferences.sweetness ? `Sweetness: ${userPreferences.sweetness}` : '',
    userPreferences.acidity ? `Acidity: ${userPreferences.acidity}` : '',
    userPreferences.tannin ? `Tannin: ${userPreferences.tannin}` : '',
    userPreferences.alcohol ? `Alcohol: ${userPreferences.alcohol}` : '',
  ].filter(Boolean).join(', ') : 'No specific preferences';

  return `You are a Master Sommelier specializing in sophisticated multi-course wine programs. Your expertise lies in selecting versatile wines that create harmonious experiences across multiple dishes when sharing bottles at the table - a pinnacle skill in professional sommelier service.

**RESTAURANT**: ${restaurantName}
**BUDGET CONSIDERATION**: Up to $${budget || 50} per bottle

**MULTI-DISH TABLE WINE CHALLENGE**:
Analyze the flavor profiles, textures, and culinary styles of ALL selected dishes simultaneously. Recommend EXACTLY 3-4 wines that demonstrate exceptional versatility and cross-dish compatibility for table sharing.

**DISHES TO ANALYZE TOGETHER**:
${dishList}

**AVAILABLE WINES** (USE EXACT NAMES ONLY):
${wineList}

**USER PREFERENCES FOR ANALYSIS**:
${preferencesText}

**MASTER SOMMELIER TABLE WINE STRATEGY**:

You must recommend 3-4 wines using these sophisticated approaches:

1. **VERSATILE BRIDGE WINE** - A wine with structural flexibility that harmonizes with multiple flavor profiles
2. **CULTURAL HARMONY WINE** - A wine that connects to the regional or cultural origins across the dishes
3. **INNOVATIVE COMPLEMENT WINE** - A creative choice that finds unexpected compatibility across diverse dishes
4. **PALATE CLEANSER** (Optional 4th) - A sparkling or high-acid wine that refreshes between different dish flavors

**CRITICAL ANALYSIS REQUIREMENTS**:
- **Cross-Dish Compatibility**: Analyze how each wine's structure works with ALL dishes simultaneously
- **Versatility Assessment**: Explain why each wine can bridge different flavor profiles effectively
- **Table Dynamics**: Consider how wines enhance the overall dining experience when multiple dishes are present
- **Structural Flexibility**: Analyze acidity, tannin, body, and sweetness across multiple food interactions

**WINE STYLE CATEGORIZATION** (CRITICAL):
Categorize each wine into one of these 6 Wine Wize styles:

**WHITE WINES:**
- "Fresh & Crisp" - Light, acidic whites
- "Funky & Floral" - Aromatic, unique whites  
- "Rich & Creamy" - Full-bodied, oak-aged whites

**RED WINES:**
- "Fresh & Fruity" - Light, fruit-forward reds
- "Dry & Dirty" - Medium-bodied, earthy reds
- "Packed with a Punch" - Full-bodied, intense reds

**RESPONSE FORMAT** (EXACT JSON STRUCTURE REQUIRED):
{
  "tablePairings": [
    {
      "wineName": "EXACT wine name from available list",
      "wineType": "Red/White/Rosé/Sparkling",
      "wineStyle": "ONE OF THE 6 WINE WIZE STYLES ABOVE",
      "pairingApproach": "Versatile/Bridge/Cultural Harmony/Innovative Complement/Palate Cleanser",
      "description": "Master Sommelier explanation of why this wine works across ALL dishes, with specific analysis of versatility and cross-dish harmony",
      "structuralCompatibility": {
        "acidity": "How acidity works across all dishes simultaneously",
        "tannin": "How tannins complement the diverse dish collection",
        "sweetness": "Sweetness balance across different flavor profiles",
        "body": "Wine body flexibility with varied dish weights and textures"
      },
      "crossDishAnalysis": "Detailed analysis of how this wine interacts with each dish individually while maintaining overall harmony",
      "versatilityScore": "Excellent/Good/Fair",
      "confidenceLevel": "High/Medium/Low",
      "price": "Price from available list",
      "dishCompatibility": [
        {
          "dish": "EXACT dish name",
          "compatibilityScore": "Excellent/Good/Fair", 
          "interactionNotes": "Specific notes on how wine enhances this particular dish while maintaining table harmony"
        }
      ]
    }
  ]
}

**CRITICAL INSTRUCTIONS**:
- Recommend EXACTLY 3-4 wines total (NOT per dish)
- Each wine MUST work well with at least 2 of the selected dishes
- Use ONLY wines from the available list with EXACT names
- Focus on versatility and cross-dish compatibility rather than perfect individual pairings
- Provide sophisticated Master Sommelier-level analysis
- Analyze actual wine characteristics for multi-dish compatibility
- Consider user preferences while prioritizing table versatility

**FORBIDDEN**: Do NOT simply copy individual dish pairings. This requires genuine cross-dish analysis and strategic wine selection for table sharing.

Return ONLY the JSON response with no additional text.`;
}
