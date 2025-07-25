import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Wine review schema
export const wineReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(10, 'Review must be at least 10 characters').max(1000),
  purchasePrice: z.number().positive().optional(),
  purchaseLocation: z.string().max(200).optional(),
  wouldBuyAgain: z.boolean().optional()
});

// Profile update schema
export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100),
  favoriteTypes: z.array(z.enum(['red', 'white', 'rose', 'sparkling', 'dessert', 'fortified'])),
  preferredRegions: z.array(z.string()),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$', '$$$$$'])
});

// Scanner file upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      file => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'File must be an image (JPEG, PNG, or WebP)'
    )
});

// API configuration schema
export const apiConfigSchema = z.object({
  openaiKey: z.string().min(1, 'OpenAI API key is required'),
  perplexityKey: z.string().optional(),
  spoonacularKey: z.string().optional()
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type WineReviewInput = z.infer<typeof wineReviewSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type ApiConfigInput = z.infer<typeof apiConfigSchema>;
