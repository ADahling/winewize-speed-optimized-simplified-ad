import type { AnalysisResult } from './types.ts';

export const validateAnalysisResults = (analysisResults: AnalysisResult): boolean => {
  if (!analysisResults) {
    console.error('Analysis results are null or undefined');
    return false;
  }

  if (!analysisResults.menuItems && !analysisResults.wines) {
    console.warn('No menu items or wines found in analysis results');
    return true;
  }

  if (analysisResults.menuItems) {
    if (!Array.isArray(analysisResults.menuItems)) {
      console.error('Menu items is not an array');
      return false;
    }
    analysisResults.menuItems.forEach(item => {
      if (!item.dish_name || typeof item.dish_name !== 'string') {
        console.error('Invalid menu item:', item);
      }
    });
  }

  if (analysisResults.wines) {
    if (!Array.isArray(analysisResults.wines)) {
      console.error('Wines is not an array');
      return false;
    }
    analysisResults.wines.forEach(wine => {
      if (!wine.name || typeof wine.name !== 'string') {
        console.error('Invalid wine:', wine);
      }
    });
  }

  console.log('Analysis results validation passed');
  return true;
};
