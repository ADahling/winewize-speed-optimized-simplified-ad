// Simple menu format detection
// No longer forces processing methods

interface MenuFormatAnalysis {
  format: 'standard' | 'prix_fixe' | 'tasting_menu' | 'wine_list' | 'complex_layout';
  complexity: number; // 0-1 scale
  confidence: number;
  indicators: string[];
}

/**
 * Analyze image to detect menu format and complexity
 * Note: This is only used for informational purposes now
 */
export function detectMenuFormat(imageBase64: string, ocrText?: string): MenuFormatAnalysis {
  const analysis: MenuFormatAnalysis = {
    format: 'standard',
    complexity: 0.5,
    confidence: 0.8,
    indicators: []
  };

  // If we have OCR text, use it for format detection
  if (ocrText && ocrText.length > 50) {
    return analyzeTextFormat(ocrText, analysis);
  }

  // Otherwise, estimate based on image characteristics
  return analyzeImageCharacteristics(imageBase64, analysis);
}

/**
 * Analyze OCR text to determine menu format
 */
function analyzeTextFormat(text: string, analysis: MenuFormatAnalysis): MenuFormatAnalysis {
  const textLower = text.toLowerCase();
  const textLength = text.length;
  
  // Format detection keywords
  const prixFixeIndicators = [
    'tasting menu', 'prix fixe', 'chef menu', 'course', 'courses',
    'amuse bouche', 'degustation', 'omakase'
  ];
  
  const wineListIndicators = [
    'wine list', 'by the glass', 'by the bottle', 'vintage',
    'sommelier', 'cellar', 'varietal', 'appellation'
  ];

  // Check for prix fixe/tasting menu format
  const prixFixeMatches = prixFixeIndicators.filter(indicator => 
    textLower.includes(indicator)
  );
  
  if (prixFixeMatches.length >= 2) {
    analysis.format = 'tasting_menu';
    analysis.complexity = 0.8;
    analysis.indicators.push(...prixFixeMatches);
    analysis.confidence = 0.9;
    return analysis;
  }

  // Check for wine list
  const wineMatches = wineListIndicators.filter(indicator => 
    textLower.includes(indicator)
  );
  
  if (wineMatches.length >= 2) {
    analysis.format = 'wine_list';
    analysis.complexity = 0.6;
    analysis.indicators.push(...wineMatches);
    analysis.confidence = 0.85;
    return analysis;
  }

  // Default to standard menu
  analysis.format = 'standard';
  analysis.complexity = Math.min(0.6, textLength / 2000);
  analysis.indicators.push('standard menu format');
  analysis.confidence = 0.7;
  
  return analysis;
}

/**
 * Analyze image characteristics when OCR text is not available
 */
function analyzeImageCharacteristics(imageBase64: string, analysis: MenuFormatAnalysis): MenuFormatAnalysis {
  const imageSize = imageBase64.length;
  
  // Estimate complexity based on image size
  const sizeComplexity = Math.min(0.8, imageSize / 2000000);
  
  analysis.complexity = sizeComplexity;
  analysis.indicators.push(`Image size: ${Math.floor(imageSize / 1024)}KB`);
  analysis.confidence = 0.6;
  
  return analysis;
}

/**
 * Simple validation for extraction completeness
 */
export function validateExtractionCompleteness(
  items: any[], 
  analysisType: 'menu' | 'wine'
): { isValid: boolean; shouldFallback: boolean; reason?: string } {
  
  const itemCount = items.length;
  
  // Simple validation thresholds
  const minimumThreshold = analysisType === 'menu' ? 5 : 10;
  const recommendedThreshold = analysisType === 'menu' ? 10 : 20;
  
  if (itemCount < minimumThreshold) {
    const reason = `Only ${itemCount} ${analysisType} items extracted, minimum threshold is ${minimumThreshold}`;
    console.log(`Extraction below minimum threshold: ${reason}`);
    return { isValid: false, shouldFallback: true, reason };
  }
  
  if (itemCount < recommendedThreshold) {
    const reason = `Only ${itemCount} ${analysisType} items extracted, recommended minimum is ${recommendedThreshold}`;
    console.log(`Extraction below recommended threshold: ${reason}`);
    return { isValid: true, shouldFallback: false, reason };
  }
  
  return { isValid: true, shouldFallback: false };
}
