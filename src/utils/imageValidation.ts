
import { logger } from './logger';

export const validateImagePayload = (allImages: File[]) => {
  const totalSize = allImages.reduce((sum, file) => sum + file.size, 0);
  logger.info('Validating image payload', { 
    imageCount: allImages.length,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
  });
  
  if (totalSize > 25 * 1024 * 1024) {
    logger.error('Total payload too large', { totalSize, imageCount: allImages.length });
    throw new Error('Total image size too large. Please use fewer or smaller images.');
  }

  return totalSize;
};

export const validateRequestPayload = (requestPayload: any) => {
  if (!requestPayload.images || !Array.isArray(requestPayload.images) || requestPayload.images.length === 0) {
    throw new Error('Invalid request payload: images array is empty or malformed');
  }

  const payloadSizeCheck = JSON.stringify(requestPayload);
  const payloadSize = payloadSizeCheck.length;
  logger.info('Request payload validated', { 
    payloadSizeKB: (payloadSize / 1024).toFixed(0),
    imageCount: requestPayload.images?.length
  });
  
  if (payloadSize > 25 * 1024 * 1024) {
    logger.error('Request payload too large', { payloadSize });
    throw new Error('Request too large. Please use fewer or smaller images.');
  }

  return payloadSize;
};
