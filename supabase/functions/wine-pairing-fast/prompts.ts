import { formatPreferences } from './utils.ts';

export const createPairingPrompt = (
  dishes: any[],
  wines: any[],
  userPreferences: any,
  budget: number,
  restaurantName: string,
  sessionPreferences?: any
): string => {
  // Create a numbered, structured wine list for clarity
  const wineList = wines.map((wine, index) => {
    const name = wine.name || wine.wine_name || 'Unnamed Wine';
    const vintage = wine.vintage ? ` ${wine.vintage}` : '';
    const varietal = wine.varietal ? ` (${wine.varietal})` : '';
    const region = wine.region ? ` from ${wine.region}` : '';
    const price = wine.price_bottle ? ` - $${wine.price_bottle}` : '';
    
    return `${index + 1}. "${name}${vintage}"${varietal}${region}${price}`;
  }).join('\n');

  const dishList = dishes.map(dish => 
    `"${dish.dish_name || dish.name}" - ${dish.description || 'No description'}`
  ).join('\n');

  // Much stricter prompt with emphasis on ONLY using exact wines
  return `You are a Master Sommelier at ${restaurantName}. Your task is to recommend ONLY wines that EXACTLY MATCH wines from our available list. This is CRITICAL.

**STRICT WINE SELECTION RULES - FOLLOW THESE EXACTLY:**
1. You MUST ONLY recommend wines that appear EXACTLY as listed in our "AVAILABLE WINES" section below
2. DO NOT create, invent, or modify ANY wine names - use ONLY the exact names as they appear in the list
3. If you cannot find a suitable wine for a pairing type, use "No suitable pairing available"
4. VERIFY each wine name against the provided list before recommending it
5. Each dish must receive exactly 3 pairing recommendations using the Traditional/Regional/Creative approach

**AVAILABLE WINES (USE ONLY THESE EXACT NAMES - NO EXCEPTIONS):**
${wineList}

**DISHES TO PAIR:**
${dishList}

**USER PREFERENCES:**
- Budget: $${budget} per bottle
- Tonight's wine style: ${sessionPreferences?.wineType || 'Any'}
- Service preference: ${sessionPreferences?.serviceType || 'Either'}
- Tonight's budget: ${sessionPreferences?.budget || 'No specific limit'}
${formatPreferences(userPreferences)}

**PAIRING STRATEGY:**
For each dish, provide exactly 3 wine recommendations:

1. **TRADITIONAL PAIRING** - Classic pairing following established principles
2. **REGIONAL PAIRING** - Wine from the same region/cuisine as the dish
3. **CREATIVE PAIRING** - Innovative choice that creates surprising harmony

**CRITICAL: Before finalizing each recommendation, verify the exact wine name appears in the AVAILABLE WINES list above.**

For each dish, provide exactly 3 wines in this JSON format:
{
  "dish": "exact dish name",
  "pairings": [
    {
      "wineName": "EXACT name from wine list above - MUST MATCH EXACTLY",
      "wineType": "Red/White/Rosé/Sparkling",
      "wineStyle": "Fresh & Crisp/Funky & Floral/Rich & Creamy/Fresh & Fruity/Dry & Dirty/Packed with a Punch",
      "pairingType": "Traditional/Regional/Creative",
      "description": "Explanation of pairing rationale",
      "confidenceLevel": "High/Medium/Low",
      "price": "from wine list",
      "preferenceMatch": "true/false"
    }
  ]
}

**WINE STYLES:**
- White: Fresh & Crisp, Funky & Floral, Rich & Creamy
- Red: Fresh & Fruity, Dry & Dirty, Packed with a Punch

Return valid JSON array with exactly 3 pairings per dish, using ONLY wines from the provided list.`;
};

export const createConsolidatedPairingPrompt = (
  dishes: any[],
  wines: any[],
  userPreferences: any,
  budget: number,
  restaurantName: string,
  sessionPreferences?: any
): string => {
  // Create a numbered, structured wine list for clarity
  const wineList = wines.map((wine, index) => {
    const name = wine.name || wine.wine_name || 'Unnamed Wine';
    const details = [
      wine.vintage && `${wine.vintage}`,
      wine.varietal && `(${wine.varietal})`,
      wine.region && `from ${wine.region}`,
      wine.price_bottle && `$${wine.price_bottle}`
    ].filter(Boolean).join(' ');
    
    return `${index + 1}. "${name}" ${details}`;
  }).join('\n');

  const dishList = dishes.map(dish => 
    `"${dish.dish_name || dish.name}"`
  ).join(', ');

  // Much stricter prompt with emphasis on ONLY using exact wines
  return `You are a Master Sommelier at ${restaurantName}. You MUST ONLY recommend wines that EXACTLY MATCH wines from our available list.

**STRICT WINE SELECTION RULES - FOLLOW THESE EXACTLY:**
1. Select exactly 3-4 versatile wines from our list below
2. You MUST ONLY use wines that appear EXACTLY in the "AVAILABLE WINES" section below
3. DO NOT create, invent, or modify ANY wine names - use ONLY the exact names as they appear in the list
4. VERIFY each wine name against the provided list before recommending it

**AVAILABLE WINES (USE ONLY THESE EXACT NAMES - NO EXCEPTIONS):**
${wineList}

**DISHES FOR THE MEAL:**
${dishList}

**USER PREFERENCES:**
- Budget: $${budget} per bottle
- Tonight's wine style: ${sessionPreferences?.wineType || 'Any'}
- Service preference: ${sessionPreferences?.serviceType || 'Either'}
- Tonight's budget: ${sessionPreferences?.budget || 'No specific limit'}
${formatPreferences(userPreferences)}

**SELECTION STRATEGY:**
Select exactly 3-4 wines that provide:

1. **TRADITIONAL CHOICE** - A classic, versatile wine that pairs traditionally with most dishes
2. **REGIONAL HARMONY** - A wine that connects to the regional themes of the meal
3. **CREATIVE BRIDGE** - An unexpected wine that creates surprising harmony across dishes
4. **SAFE ALTERNATIVE** (Optional) - A crowd-pleasing backup

**CRITICAL: Before finalizing each recommendation, verify the exact wine name appears in the AVAILABLE WINES list above.**

Create a consolidated pairing in this JSON format:
{
  "consolidatedPairings": [
    {
      "wineName": "EXACT name from available wines - MUST MATCH EXACTLY",
      "wineType": "Red/White/Rosé/Sparkling",
      "wineStyle": "appropriate wine style",
      "pairingType": "Traditional/Regional/Creative/Safe Alternative",
      "description": "Explanation of why this wine works across multiple dishes",
      "dishCompatibility": ["dish1", "dish2", "dish3"],
      "confidenceLevel": "High/Medium/Low",
      "price": "from wine list",
      "preferenceMatch": "true/false"
    }
  ],
  "pairingStrategy": "Brief explanation of the overall approach"
}

Return valid JSON only, using ONLY wines from the provided list.`;
};

const formatPreferences = (preferences: any): string => {
  if (!preferences) return '';
  const { sweetness, acidity, tannin, alcohol } = preferences;
  let result = '';
  if (sweetness) result += `- Sweetness: ${sweetness}\n`;
  if (acidity) result += `- Acidity: ${acidity}\n`;
  if (tannin) result += `- Tannin: ${tannin}\n`;
  if (alcohol) result += `- Alcohol: ${alcohol}\n`;
  return result;
};
