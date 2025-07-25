// Simplified response streaming module

interface StreamOptions {
  chunkSize: number;
  delayMs: number;
  enableStreaming: boolean;
}

export const streamResponse = async <T>(
  data: T,
  onChunk: (chunk: Partial<T>) => void,
  onComplete: (fullData: T) => void,
  options: Partial<StreamOptions> = {}
): Promise<T> => {
  const {
    chunkSize = 5,
    delayMs = 100,
    enableStreaming = true
  } = options;
  
  // If streaming disabled, return full data immediately
  if (!enableStreaming) {
    onComplete(data);
    return data;
  }
  
  if (Array.isArray(data)) {
    // Stream array data in chunks
    const totalItems = data.length;
    
    for (let i = 0; i < totalItems; i += chunkSize) {
      const chunk = data.slice(0, i + chunkSize);
      onChunk(chunk as Partial<T>);
      
      if (i + chunkSize < totalItems) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  } else if (typeof data === 'object' && data !== null) {
    // Stream object data by adding properties incrementally
    const keys = Object.keys(data as object);
    const totalKeys = keys.length;
    
    for (let i = 0; i < totalKeys; i += chunkSize) {
      const partialObj: Record<string, any> = {};
      
      for (let j = 0; j <= i; j++) {
        if (j < totalKeys) {
          const key = keys[j];
          partialObj[key] = (data as Record<string, any>)[key];
        }
      }
      
      onChunk(partialObj as Partial<T>);
      
      if (i + chunkSize < totalKeys) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  } else {
    // Non-streamable data type, return as-is
    onChunk(data);
  }
  
  onComplete(data);
  return data;
};

export const createStreamingResponse = <T>() => {
  let isStreaming = false;
  let latestData: T | null = null;
  
  const streamData = async (
    getData: () => Promise<T>,
    onChunk: (chunk: Partial<T>) => void,
    onComplete: (fullData: T) => void,
    options?: Partial<StreamOptions>
  ): Promise<T> => {
    if (isStreaming) {
      console.warn('Streaming already in progress, returning latest data');
      if (latestData) {
        onComplete(latestData);
        return latestData;
      }
    }
    
    isStreaming = true;
    
    try {
      const data = await getData();
      latestData = data;
      
      return streamResponse(data, onChunk, onComplete, options);
    } catch (error) {
      console.error('Error in streaming response:', error);
      throw error;
    } finally {
      isStreaming = false;
    }
  };
  
  return {
    streamData,
    isStreaming: () => isStreaming,
    getLatestData: () => latestData
  };
};
