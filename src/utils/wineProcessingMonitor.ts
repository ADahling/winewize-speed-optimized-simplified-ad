// Emergency performance monitoring for wine processing
export const wineProcessingMonitor = {
  startTime: 0,
  
  start() {
    this.startTime = Date.now();
    console.log('🍷 WINE PROCESSING STARTED:', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 50),
      isMobile: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
    });
  },
  
  logProgress(step: string, details?: any) {
    const elapsed = Date.now() - this.startTime;
    console.log(`🍷 WINE PROCESSING - ${step}:`, {
      step,
      elapsedTime: `${elapsed}ms`,
      details,
      timestamp: new Date().toISOString()
    });
  },
  
  complete(pairingCount: number) {
    const totalTime = Date.now() - this.startTime;
    console.log('🍷 WINE PROCESSING COMPLETE:', {
      totalTime: `${totalTime}ms`,
      pairingCount,
      performance: totalTime < 8000 ? 'EXCELLENT' : totalTime < 15000 ? 'GOOD' : 'SLOW',
      timestamp: new Date().toISOString()
    });
    
    return totalTime;
  },
  
  error(errorMessage: string) {
    const totalTime = Date.now() - this.startTime;
    console.error('❌ WINE PROCESSING ERROR:', {
      errorMessage,
      totalTime: `${totalTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
};