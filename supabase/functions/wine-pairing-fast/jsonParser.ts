
export const parseOpenAIResponse = (content: string): any[] => {
  console.log('Raw OpenAI response content:', content.substring(0, 1000) + '...');
  
  try {
    // Try to extract JSON from response - handle multiple possible formats
    let jsonString = content;
    
    // CRITICAL FIX: Sanitize control characters BEFORE any other processing
    // This fixes the "Bad control character in string literal" error
    jsonString = jsonString
      .replace(/\n/g, '\\n')    // Escape newlines
      .replace(/\r/g, '\\r')    // Escape carriage returns  
      .replace(/\t/g, '\\t')    // Escape tabs
      .replace(/\f/g, '\\f')    // Escape form feeds
      .replace(/\b/g, '\\b')    // Escape backspaces
      .replace(/\\/g, '\\\\')   // Escape backslashes (must be last)
      .replace(/\\\\n/g, '\\n') // Fix double-escaped newlines
      .replace(/\\\\r/g, '\\r') // Fix double-escaped carriage returns
      .replace(/\\\\t/g, '\\t') // Fix double-escaped tabs;
    
    // Remove markdown code blocks if present
    jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // ENHANCED: Comprehensive wine name cleanup for complex patterns
    // Fix pattern like: "wineName": "Wine Name" NV: type - variety from region (pricing) - description,
    jsonString = jsonString.replace(
      /"wineName":\s*"([^"]*?)"\s+([^"]*?)(?=",|\n)/g, 
      '"wineName": "$1 $2",'
    );
    
    // ENHANCED: Fix wine names with embedded descriptions and pricing
    // Pattern: "wineName": "Name" Additional Text: more - info (Glass: X, Bottle: Y) - description,
    jsonString = jsonString.replace(
      /"wineName":\s*"([^"]*?)"\s+([^"]*?)\s*:\s*([^"]*?)\s*-\s*([^"]*?)\s*\(([^)]*?)\)\s*-\s*([^",\n]*?)(?=",|\n)/g,
      '"wineName": "$1 $2: $3 - $4 ($5) - $6",'
    );
    
    // ENHANCED: Handle wine names with NV and region info
    // Pattern: "wineName": "Name" NV: type - variety from region
    jsonString = jsonString.replace(
      /"wineName":\s*"([^"]*?)"\s+(NV|[0-9]{4}):\s*([^"]*?)(?=",|\n)/g,
      '"wineName": "$1 $2: $3",'
    );
    
    // ENHANCED: Clean up any remaining unescaped content after wine names
    jsonString = jsonString.replace(
      /"wineName":\s*"([^"]*?)"\s+([A-Za-z0-9\s:()-]+)(?=",|\n)/g,
      '"wineName": "$1 $2",'
    );
    
    // ENHANCED: Fix dish descriptions that might be cut off mid-JSON
    jsonString = jsonString.replace(
      /"dishDescription":\s*"([^"]*?)"\s*\n\s*"dishPrice":/g,
      '"dishDescription": "$1",\n    "dishPrice":'
    );
    
    // ENHANCED: Fix price fields that might be incomplete
    jsonString = jsonString.replace(
      /"dishPrice":\s*"\$\s*$/gm,
      '"dishPrice": "Price not available"'
    );
    
    // ENHANCED: Fix incomplete JSON objects at the end
    jsonString = jsonString.replace(/,\s*$/, '');
    
    // Try to find JSON array or object in the response
    const jsonMatch = jsonString.match(/\[[\s\S]*\]/) || jsonString.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response. Full content:', content);
      throw new Error('No JSON array or object found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    console.log('Parsed JSON structure:', JSON.stringify(parsed, null, 2));
    
    // Handle different response structures with better validation
    let pairingsArray = [];
    
    if (Array.isArray(parsed)) {
      pairingsArray = parsed;
    } else if (parsed.pairings && Array.isArray(parsed.pairings)) {
      pairingsArray = parsed.pairings;
    } else if (parsed.dishes && Array.isArray(parsed.dishes)) {
      pairingsArray = parsed.dishes;
    } else if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
      pairingsArray = parsed.recommendations;
    } else {
      console.error('Unexpected JSON structure, attempting to extract pairings:', parsed);
      // Try to find any array in the response
      for (const [key, value] of Object.entries(parsed)) {
        if (Array.isArray(value) && value.length > 0) {
          console.log(`Found array in key "${key}":`, value);
          pairingsArray = value;
          break;
        }
      }
      
      if (pairingsArray.length === 0) {
        throw new Error('No valid pairings array found in response structure');
      }
    }
    
    console.log(`Successfully extracted ${pairingsArray.length} pairing items`);
    return pairingsArray;
    
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    console.error('Full response content:', content);
    
    // ENHANCED: Improved error recovery with better regex patterns
    try {
      console.log('Attempting enhanced error recovery...');
      
      // Try to find individual dish objects with more flexible regex
      const dishMatches = content.match(/\{\s*"dish"[\s\S]*?"pairings":\s*\[[\s\S]*?\]\s*\}/g);
      if (dishMatches) {
        console.log(`Found ${dishMatches.length} potential dish objects, attempting to parse individually`);
        const recoveredDishes = [];
        
        for (const dishMatch of dishMatches) {
          try {
            // ENHANCED: Apply the same comprehensive cleaning to individual dishes
            let cleanDish = dishMatch
              // CRITICAL FIX: Apply control character sanitization first
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r') 
              .replace(/\t/g, '\\t')
              .replace(/\f/g, '\\f')
              .replace(/\b/g, '\\b')
              .replace(/\\/g, '\\\\')
              .replace(/\\\\n/g, '\\n')
              .replace(/\\\\r/g, '\\r')
              .replace(/\\\\t/g, '\\t')
              // Apply all the same wine name cleaning patterns
              .replace(/"wineName":\s*"([^"]*?)"\s+([^"]*?)(?=",|\n)/g, '"wineName": "$1 $2",')
              .replace(/"wineName":\s*"([^"]*?)"\s+([A-Za-z0-9\s:()-]+)(?=",|\n)/g, '"wineName": "$1 $2",')
              // Fix incomplete dish descriptions
              .replace(/"dishDescription":\s*"([^"]*?)"\s*\n/g, '"dishDescription": "$1",')
              // Fix incomplete prices
              .replace(/"dishPrice":\s*"\$\s*$/gm, '"dishPrice": "Price not available"')
              // Ensure proper closing
              .replace(/,\s*$/, '');
            
            const dish = JSON.parse(cleanDish);
            recoveredDishes.push(dish);
            console.log(`Successfully recovered dish: ${dish.dish}`);
          } catch (individualError) {
            console.warn('Could not parse individual dish:', dishMatch.substring(0, 100));
          }
        }
        
        if (recoveredDishes.length > 0) {
          console.log(`Successfully recovered ${recoveredDishes.length} dishes from malformed JSON`);
          return recoveredDishes;
        }
      }
      
      // ENHANCED: Try to extract partial data even from severely malformed JSON
      const fallbackMatches = content.match(/"dish":\s*"([^"]+)"/g);
      if (fallbackMatches && fallbackMatches.length > 0) {
        console.log('Attempting basic dish extraction as final fallback');
        const basicDishes = fallbackMatches.map((match, index) => {
          const dishName = match.match(/"dish":\s*"([^"]+)"/)?.[1] || `Dish ${index + 1}`;
          return {
            dish: dishName,
            dishDescription: 'Description not available due to parsing error',
            dishPrice: 'Price not available',
            pairings: []
          };
        });
        
        if (basicDishes.length > 0) {
          console.log(`Final fallback: extracted ${basicDishes.length} basic dish structures`);
          return basicDishes;
        }
      }
      
    } catch (recoveryError) {
      console.error('Enhanced error recovery also failed:', recoveryError);
    }
    
    throw new Error(`Failed to parse OpenAI response: ${error.message}`);
  }
};
