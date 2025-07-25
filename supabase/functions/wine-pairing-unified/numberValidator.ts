
export function validatePriceAccuracy(price: string, type: 'bottle' | 'glass'): { isValid: boolean; correctedPrice?: string; confidence: number } {
  if (!price) return { isValid: true, confidence: 1 };
  
  // Remove currency symbols and spaces
  const cleanPrice = price.replace(/[^0-9.]/g, '');
  const numericPrice = parseFloat(cleanPrice);
  
  if (isNaN(numericPrice)) {
    return { isValid: false, confidence: 0 };
  }
  
  // Define reasonable ranges
  const ranges = {
    bottle: { min: 20, max: 300, typical: { min: 25, max: 150 } },
    glass: { min: 6, max: 35, typical: { min: 8, max: 25 } }
  };
  
  const range = ranges[type];
  
  // Check if price is within reasonable bounds
  if (numericPrice < range.min || numericPrice > range.max) {
    return { isValid: false, confidence: 0.2 };
  }
  
  // Calculate confidence based on how typical the price is
  const isTypical = numericPrice >= range.typical.min && numericPrice <= range.typical.max;
  const confidence = isTypical ? 0.9 : 0.7;
  
  return { 
    isValid: true, 
    correctedPrice: `$${numericPrice.toFixed(2)}`,
    confidence 
  };
}

export function validateVintageAccuracy(vintage: string): { isValid: boolean; correctedVintage?: string; confidence: number } {
  if (!vintage) return { isValid: true, confidence: 1 };
  
  const currentYear = new Date().getFullYear();
  const numericVintage = parseInt(vintage);
  
  if (isNaN(numericVintage)) {
    return { isValid: false, confidence: 0 };
  }
  
  // Wine vintages should be between 1950 and current year
  if (numericVintage < 1950 || numericVintage > currentYear) {
    return { isValid: false, confidence: 0.1 };
  }
  
  // Most wines are from the last 20 years
  const isRecent = numericVintage >= (currentYear - 20);
  const confidence = isRecent ? 0.9 : 0.8;
  
  return { 
    isValid: true, 
    correctedVintage: numericVintage.toString(),
    confidence 
  };
}

export function validatePriceRatio(bottlePrice: string, glassPrice: string): { isValid: boolean; confidence: number; warning?: string } {
  if (!bottlePrice || !glassPrice) return { isValid: true, confidence: 1 };
  
  const bottle = parseFloat(bottlePrice.replace(/[^0-9.]/g, ''));
  const glass = parseFloat(glassPrice.replace(/[^0-9.]/g, ''));
  
  if (isNaN(bottle) || isNaN(glass)) {
    return { isValid: false, confidence: 0 };
  }
  
  const ratio = bottle / glass;
  
  // Typical ratio is 3.5-5.5 (bottle should be 3.5-5.5 times glass price)
  if (ratio < 3 || ratio > 6) {
    return { 
      isValid: false, 
      confidence: 0.3,
      warning: `Unusual price ratio: ${ratio.toFixed(1)}x (bottle/glass should be 3.5-5.5x)`
    };
  }
  
  const isTypical = ratio >= 3.5 && ratio <= 5.5;
  const confidence = isTypical ? 0.95 : 0.8;
  
  return { isValid: true, confidence };
}
