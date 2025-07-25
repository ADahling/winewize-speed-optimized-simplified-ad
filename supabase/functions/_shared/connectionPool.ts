// Simplified request handling (removed connection pooling)

interface RequestBatch {
  requests: Promise<any>[];
  maxConcurrent: number;
  delay: number;
}

// Simplified stub class that maintains API compatibility
class APIConnectionPool {
  private static instance: APIConnectionPool;

  static getInstance(): APIConnectionPool {
    if (!APIConnectionPool.instance) {
      APIConnectionPool.instance = new APIConnectionPool();
    }
    return APIConnectionPool.instance;
  }

  // Stub methods that do nothing
  getConnection(): null {
    return null;
  }

  releaseConnection(): void {
    // Do nothing
  }

  // Simple batching without connection management
  async batchRequests<T>(
    requests: (() => Promise<T>)[],
    options: Partial<RequestBatch> = {}
  ): Promise<T[]> {
    const { maxConcurrent = 3, delay = 100 } = options;
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += maxConcurrent) {
      const batch = requests.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(request => request());
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('Batch request failed:', result.reason);
        }
      }
      
      if (i + maxConcurrent < requests.length && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }

  destroy(): void {
    // Nothing to clean up
  }
}

// Simplified fetch with retry logic but no connection pooling
export const pooledFetch = async (
  url: string,
  options: RequestInit = {},
  retries: number = 2
): Promise<Response> => {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request to ${url}, ${retries} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return pooledFetch(url, options, retries - 1);
    }
    throw error;
  }
};

export { APIConnectionPool };
