// Minimal version to maintain compatibility

export interface ImageCacheEntry {
  hash: string;
  result: any;
  timestamp: number;
  analysisType: 'menu' | 'wine';
}

// Disabled in-memory cache
const imageCache = new Map<string, ImageCacheEntry>();

/**
 * Create a simple hash for image content (for compatibility)
 */
export async function createImageHash(imageBase64: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(imageBase64.substring(0, 1000));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

/**
 * Stub for compatibility - always returns null to disable caching
 */
export async function getCachedResult(imageBase64: string, analysisType: 'menu' | 'wine'): Promise<any | null> {
  return null; // Disable caching to ensure fresh results
}

/**
 * Stub for compatibility - does nothing
 */
export async function setCachedResult(imageBase64: string, analysisType: 'menu' | 'wine', result: any): Promise<void> {
  // Do nothing - disable caching
}

/**
 * Pass-through function
 */
export function optimizeImageForOCR(imageBase64: string): string {
  return imageBase64;
}

/**
 * Process items with limited concurrency (2 max)
 */
export async function processBatch<T>(
  items: Array<{ image: string; type: 'menu' | 'wine'; index: number }>,
  processor: (image: string, type: 'menu' | 'wine', index: number, total: number) => Promise<T>,
  maxConcurrent: number = 2 // RESTORED: Back to original stable value
): Promise<T[]> {
  const results: T[] = [];
  const total = items.length;
  
  for (let i = 0; i < items.length; i += maxConcurrent) {
    const batch = items.slice(i, i + maxConcurrent);
    const batchPromises = batch.map(item => 
      processor(item.image, item.type, item.index, total)
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Simplified performance monitoring
 */
export class PerformanceMonitor {
  private startTime: number;
  private marks: Array<{ label: string; time: number }> = [];
  
  constructor() {
    this.startTime = Date.now();
  }
  
  mark(label: string): void {
    const currentTime = Date.now();
    this.marks.push({ label, time: currentTime - this.startTime });
  }
  
  finish(): { totalTime: number; marks: Array<{ label: string; time: number }> } {
    const totalTime = Date.now() - this.startTime;
    return { totalTime, marks: this.marks };
  }
  
  log(): void {
    const { totalTime } = this.finish();
    console.log(`Performance Summary: ${totalTime}ms total`);
  }
}
