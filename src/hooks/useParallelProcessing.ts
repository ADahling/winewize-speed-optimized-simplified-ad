import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProcessingTask<T> {
  id: string;
  data: T;
  processor: (data: T) => Promise<any>;
}

interface ProcessingResult<T> {
  id: string;
  data: T;
  result?: any;
  error?: Error;
  duration: number;
}

export const useParallelProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<ProcessingResult<any>[]>([]);
  const { toast } = useToast();

  const processInParallel = useCallback(async <T>(
    tasks: ProcessingTask<T>[],
    options: {
      maxConcurrency?: number;
      onProgress?: (completed: number, total: number) => void;
      onTaskComplete?: (result: ProcessingResult<T>) => void;
    } = {}
  ): Promise<ProcessingResult<T>[]> => {
    const { maxConcurrency = 3, onProgress, onTaskComplete } = options;
    
    setIsProcessing(true);
    setProgress(0);
    setCompletedTasks([]);

    const results: ProcessingResult<T>[] = [];
    const executing: Promise<void>[] = [];
    let completed = 0;

    for (const task of tasks) {
      const promise = (async () => {
        const startTime = performance.now();
        try {
          const result = await task.processor(task.data);
          const duration = performance.now() - startTime;
          
          const processedResult: ProcessingResult<T> = {
            id: task.id,
            data: task.data,
            result,
            duration
          };
          
          results.push(processedResult);
          setCompletedTasks(prev => [...prev, processedResult]);
          
          completed++;
          const progressPercent = Math.round((completed / tasks.length) * 100);
          setProgress(progressPercent);
          
          onProgress?.(completed, tasks.length);
          onTaskComplete?.(processedResult);
          
        } catch (error) {
          const duration = performance.now() - startTime;
          const errorResult: ProcessingResult<T> = {
            id: task.id,
            data: task.data,
            error: error as Error,
            duration
          };
          
          results.push(errorResult);
          completed++;
          setProgress(Math.round((completed / tasks.length) * 100));
          
          console.error(`Task ${task.id} failed:`, error);
        }
      })();

      executing.push(promise);

      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    setIsProcessing(false);
    
    return results;
  }, [toast]);

  const resetProcessing = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setCompletedTasks([]);
  }, []);

  return {
    isProcessing,
    progress,
    completedTasks,
    processInParallel,
    resetProcessing
  };
};