
import { createPairingPrompt, createConsolidatedPairingPrompt } from './prompts.ts';
import { normalizePairings, normalizeConsolidatedPairings } from './normalizer.ts';

export async function processPairingRequest(
  dishes: any[],
  wines: any[],
  options: any
) {
  const { consolidatedMode, userPreferences, budget, restaurantName, restaurantId } = options;

  console.log(`🍷 PROCESSING ENHANCED PAIRING REQUEST:`);
  console.log(`📊 Input: ${dishes.length} dishes, ${wines.length} wines`);
  console.log(`🎯 Mode: ${consolidatedMode ? 'CONSOLIDATED' : 'INDIVIDUAL'}`);
  console.log(`🏢 Restaurant: ${restaurantName}`);
  console.log(`👤 User Preferences: ${JSON.stringify(userPreferences)}`);
  console.log(`💰 Budget: $${budget || 'Not specified'}`);
  
  // Enhanced wine data logging
  console.log(`🍷 Wine data sample (first 5):`);
  wines.slice(0, 5).forEach((wine, idx) => {
    const wineName = wine.name || wine.wine_name;
    const wineType = wine.wine_type || wine.wineType;
    const varietal = wine.varietal || '';
    const region = wine.region || '';
    console.log(`  ${idx + 1}. ${wineName} (${wineType}${varietal ? ` - ${varietal}` : ''}${region ? ` from ${region}` : ''})`);
  });
  
  if (wines.length < 10) {
    console.warn(`⚠️ WARNING: Only ${wines.length} wines available - this may limit pairing quality`);
  }

  // Generate enhanced prompts with sophisticated sommelier instructions
  const prompt = consolidatedMode
    ? createConsolidatedPairingPrompt(dishes, wines, userPreferences, budget, restaurantName)
    : createPairingPrompt(dishes, wines, userPreferences, budget, restaurantName);

  console.log(`📝 Generated enhanced prompt length: ${prompt.length} characters`);
  console.log(`📝 Enhanced prompt preview: ${prompt.substring(0, 300)}...`);

  try {
    // Always use the OpenAI API key from the environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured in environment variables');
    }
    // Enhanced OpenAI parameters for sophisticated pairing analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ 
          role: 'system', 
          content: 'You are a Master Sommelier with expertise in sophisticated wine pairing analysis and detailed structural compatibility assessment.'
        }, { 
          role: 'user', 
          content: prompt 
        }],
        temperature: 0.8, // Increased for more creative and personalized pairings
        max_tokens: 8000   // Increased for comprehensive Master Sommelier-level responses
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const openAIData = await response.json();
    const content = openAIData.choices[0]?.message?.content;
    
    console.log(`🤖 Enhanced AI Response length: ${content?.length || 0} characters`);
    console.log(`🤖 Enhanced AI Response preview: ${content?.substring(0, 400)}...`);
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse JSON response with enhanced error handling
    let parsedResponse;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      parsedResponse = JSON.parse(jsonMatch[0]);
      console.log(`✅ Successfully parsed enhanced AI response`);
      
      // Log structure for debugging
      if (consolidatedMode) {
        console.log(`📊 Consolidated response structure: ${parsedResponse.tablePairings?.length || 0} table wines`);
      } else {
        console.log(`📊 Individual response structure: ${parsedResponse.pairings?.length || 0} dish pairings`);
        parsedResponse.pairings?.forEach((pairing: any, idx: number) => {
          console.log(`  Dish ${idx + 1}: ${pairing.dish} - ${pairing.pairings?.length || 0} wines`);
        });
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw content that failed to parse:', content);
      throw new Error('Failed to parse AI response');
    }

    // Normalize using appropriate normalizer
    const normalizedPairings = consolidatedMode 
      ? normalizeConsolidatedPairings(parsedResponse, wines)
      : normalizePairings(parsedResponse, wines);

    console.log(`✅ Normalized ${normalizedPairings.length} enhanced pairings`);

    // Enhanced validation logging
    if (!consolidatedMode) {
      normalizedPairings.forEach((pairing, idx) => {
        const wineCount = pairing.pairings?.length || 0;
        if (wineCount < 3) {
          console.warn(`⚠️ Dish ${idx + 1} (${pairing.dish}) only has ${wineCount} wines - expected 3`);
        } else {
          console.log(`✅ Dish ${idx + 1} (${pairing.dish}) has ${wineCount} wines - Perfect!`);
        }
      });
    } else {
      console.log(`📊 Consolidated pairings: ${normalizedPairings.length} table wines for sharing`);
    }

    const tokenUsage = {
      promptTokens: openAIData.usage?.prompt_tokens || 0,
      completionTokens: openAIData.usage?.completion_tokens || 0,
      totalTokens: openAIData.usage?.total_tokens || 0,
      estimatedCost: ((openAIData.usage?.total_tokens || 0) * 0.0001)
    };

    console.log(`💰 Enhanced Token Usage: ${JSON.stringify(tokenUsage)}`);

    return {
      pairings: normalizedPairings,
      tokenUsage
    };

  } catch (error) {
    console.error('Error in enhanced processPairingRequest:', error);
    throw error;
  }
}
