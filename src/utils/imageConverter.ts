
import { logger } from './logger';

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    logger.info('Converting file to base64', { fileName: file.name, fileSize: file.size });
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      logger.info('Base64 conversion complete', { dataLength: base64Data.length });
      resolve(base64Data);
    };
    reader.onerror = error => {
      logger.error('Base64 conversion failed', { error, fileName: file.name });
      reject(error);
    };
  });
};
