// Simplified performance utilities without experimental features
export interface SpeedMetrics {
  imageOptimizationTime: number;
  conversionTime: number;
  analysisTime: number;
  totalTime: number;
  compressionRatio: number;
  imagesProcessed: number;
}

export const measurePerformance = () => {
  const startTime = performance.now();
  
  return {
    mark: (label: string) => {
      return performance.now() - startTime;
    },
    
    end: () => {
      return performance.now() - startTime;
    }
  };
};

export const createImageHash = async (file: File): Promise<string> => {
  // Simple identifier without expensive crypto
  return `${file.name}-${file.size}-${file.lastModified}`;
};

export const batchProcessImages = async <T>(
  images: File[],
  processor: (file: File, index: number) => Promise<T>,
  batchSize: number = 3
): Promise<T[]> => {
  const results: T[] = [];
  
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    const batchPromises = batch.map((file, batchIndex) => 
      processor(file, i + batchIndex)
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
};

// FIXED: Don't modify payload - return as is
export const optimizeRequestPayload = (payload: any): any => {
  return payload;
};

export const estimateProcessingTime = (
  menuImageCount: number, 
  wineImageCount: number
): number => {
  const baseTime = 3;
  const menuTime = menuImageCount * 2;
  const wineTime = wineImageCount * 1.5;
  
  return Math.max(baseTime + menuTime + wineTime, 5);
};

export const logOptimizationMetrics = (metrics: SpeedMetrics) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Speed metrics:', {
      totalTime: `${metrics.totalTime.toFixed(0)}ms`,
      imagesProcessed: metrics.imagesProcessed
    });
  }
};
