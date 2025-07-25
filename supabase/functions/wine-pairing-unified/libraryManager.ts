export async function savePairingsToLibrary(
  pairings: any[], 
  userId: string, 
  serviceClient: any
): Promise<void> {
  console.log(`📚 Saving ${pairings.length} pairings to user wine library`);
  
  try {
    // Extract unique wines from pairings
    const uniqueWines = new Map<string, any>();
    
    pairings.forEach(pairing => {
      if (pairing.pairings && Array.isArray(pairing.pairings)) {
        pairing.pairings.forEach((p: any) => {
          if (p.wines && Array.isArray(p.wines)) {
            p.wines.forEach((wine: any) => {
              const key = wine.wineName || wine.name;
              if (key && !uniqueWines.has(key)) {
                uniqueWines.set(key, {
                  wine_name: wine.wineName || wine.name,
                  wine_description: wine.description || p.description || '',
                  wine_style: wine.wineStyle || wine.wine_style || '',
                  confidence_level: p.confidenceLevel || 'Medium',
                  price: wine.price || '',
                  dish_paired_with: pairing.dish || pairing.dish_name || '',
                  user_id: userId
                });
              }
            });
          }
        });
      }
      
      // Handle consolidated pairings format
      if (pairing.consolidatedPairings && Array.isArray(pairing.consolidatedPairings)) {
        pairing.consolidatedPairings.forEach((cp: any) => {
          const key = cp.wineName || cp.name;
          if (key && !uniqueWines.has(key)) {
            uniqueWines.set(key, {
              wine_name: cp.wineName || cp.name,
              wine_description: cp.description || '',
              wine_style: cp.wineStyle || cp.wine_style || '',
              confidence_level: cp.confidenceLevel || 'Medium',
              price: cp.price || '',
              dish_paired_with: cp.dishCompatibility?.join(', ') || 'Multiple dishes',
              user_id: userId
            });
          }
        });
      }
    });
    
    const winesToSave = Array.from(uniqueWines.values());
    
    if (winesToSave.length === 0) {
      console.log('⚠️ No wines found to save to library');
      return;
    }
    
    console.log(`💾 Attempting to save ${winesToSave.length} unique wines to library`);
    
    // Save wines to user wine library (using upsert to avoid duplicates)
    for (const wine of winesToSave) {
      try {
        const { error } = await serviceClient
          .from('user_wine_library')
          .upsert(wine, { 
            onConflict: 'user_id,wine_name',
            ignoreDuplicates: true 
          });
          
        if (error) {
          console.warn(`⚠️ Failed to save wine "${wine.wine_name}":`, error.message);
        }
      } catch (wineError) {
        console.warn(`⚠️ Error saving individual wine "${wine.wine_name}":`, wineError);
      }
    }
    
    console.log('✅ Wine library update completed');
    
  } catch (error) {
    console.error('❌ Failed to save pairings to wine library:', error);
    throw error;
  }
}
