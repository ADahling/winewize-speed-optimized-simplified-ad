// Wine App Performance Metrics for Phase 4
interface WineAppMetrics {
  processingStartTime: number | null;
  processingEndTime: number | null;
  winesFetchedCount: number;
  errorCount: number;
  lastError: string | null;
  pairingMode: string | null;
  sessionId: string;
}

// Initialize global metrics
declare global {
  interface Window {
    WINE_APP_METRICS: WineAppMetrics;
  }
}

export const initializeMetrics = () => {
  if (typeof window !== 'undefined') {
    window.WINE_APP_METRICS = {
      processingStartTime: null,
      processingEndTime: null,
      winesFetchedCount: 0,
      errorCount: 0,
      lastError: null,
      pairingMode: null,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
};

export const startProcessingTimer = (mode: string) => {
  if (typeof window !== 'undefined' && window.WINE_APP_METRICS) {
    window.WINE_APP_METRICS.processingStartTime = Date.now();
    window.WINE_APP_METRICS.pairingMode = mode;
  }
};

export const endProcessingTimer = () => {
  if (typeof window !== 'undefined' && window.WINE_APP_METRICS) {
    window.WINE_APP_METRICS.processingEndTime = Date.now();
  }
};

export const recordWinesFetched = (count: number) => {
  if (typeof window !== 'undefined' && window.WINE_APP_METRICS) {
    window.WINE_APP_METRICS.winesFetchedCount = count;
  }
};

export const recordError = (error: string) => {
  if (typeof window !== 'undefined' && window.WINE_APP_METRICS) {
    window.WINE_APP_METRICS.errorCount += 1;
    window.WINE_APP_METRICS.lastError = error;
  }
};

export const getProcessingTime = (): number | null => {
  if (typeof window !== 'undefined' && window.WINE_APP_METRICS) {
    const { processingStartTime, processingEndTime } = window.WINE_APP_METRICS;
    if (processingStartTime && processingEndTime) {
      return processingEndTime - processingStartTime;
    }
  }
  return null;
};

export const getMetricsSummary = () => {
  if (typeof window !== 'undefined' && window.WINE_APP_METRICS) {
    const metrics = window.WINE_APP_METRICS;
    const processingTime = getProcessingTime();
    
    return {
      sessionId: metrics.sessionId,
      processingTimeMs: processingTime,
      processingTimeSec: processingTime ? (processingTime / 1000).toFixed(2) : null,
      winesFetched: metrics.winesFetchedCount,
      errorCount: metrics.errorCount,
      lastError: metrics.lastError,
      pairingMode: metrics.pairingMode,
      timestamp: new Date().toISOString()
    };
  }
  return null;
};

// Log metrics after processing completes (for Phase 4)
export const logMetrics = () => {
  const summary = getMetricsSummary();
  if (summary) {
    console.log('🍷 Wine App Processing Metrics:', summary);
    
    // Only log performance issues in production
    if (summary.processingTimeMs && summary.processingTimeMs > 25000) {
      console.warn('⚠️ Slow processing detected:', `${summary.processingTimeSec}s`);
    }
    
    if (summary.errorCount > 0) {
      console.warn('⚠️ Errors during processing:', summary.errorCount, summary.lastError);
    }
  }
};