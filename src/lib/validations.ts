import { z } from 'zod';

export const repairRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide a detailed description (at least 20 characters)'),
  category: z.enum([
    'SMARTPHONE',
    'LAPTOP',
    'TABLET',
    'DESKTOP',
    'TV',
    'APPLIANCE',
    'AUTOMOTIVE',
    'HVAC',
    'PLUMBING',
    'ELECTRICAL',
    'OTHER',
  ]),
  urgency: z.enum(['LOW', 'NORMAL', 'HIGH', 'EMERGENCY']).default('NORMAL'),
  deviceType: z.string().optional(),
  deviceBrand: z.string().optional(),
  deviceModel: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const shopSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters'),
  description: z.string().optional(),
  address: z.string().min(5, 'Please provide a valid address'),
  city: z.string().min(2, 'Please provide a valid city'),
  state: z.string().min(2, 'Please provide a valid state'),
  zipCode: z.string().min(5, 'Please provide a valid zip code'),
  phone: z.string().min(10, 'Please provide a valid phone number'),
  email: z.string().email('Please provide a valid email'),
  specialties: z.array(z.string()).optional(),
});

export const userRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['CUSTOMER', 'SHOP_OWNER']).default('CUSTOMER'),
  phone: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  repairRequestId: z.string(),
});

export type RepairRequestInput = z.infer<typeof repairRequestSchema>;
export type ShopInput = z.infer<typeof shopSchema>;
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
