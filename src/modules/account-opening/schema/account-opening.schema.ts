import { z } from 'zod';

export const identitySchema = z.object({
  verificationMethod: z.enum(['BVN', 'NIN']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  identityValue: z
    .string()
    .min(11, 'Must be exactly 11 digits')
    .max(11, 'Must be exactly 11 digits')
    .regex(/^\d+$/, 'Numbers only'),
});

export const otpSchema = z.object({
  otpValue: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'Numbers only'),
});

export const tier2Schema = z.object({
  secondaryIdMethod: z.enum(['BVN', 'NIN']),
  secondaryIdValue: z
    .string()
    .min(11, 'Must be 11 digits')
    .max(11, 'Must be 11 digits')
    .regex(/^\d+$/, 'Numbers only'),
});

export const tier3AddressSchema = z.object({
  address: z.string().min(10, 'Enter a valid address'),
});

export const additionalInfoSchema = z.object({
  email: z.string().email('Enter a valid email').or(z.literal('')),
  secondPhone: z.string().min(11, 'Must be 11 digits').max(11, 'Must be 11 digits').regex(/^\d+$/, 'Numbers only').or(z.literal('')),
  secondaryIdMethod: z.enum(['BVN', 'NIN']),
  secondaryIdValue: z
    .string()
    .min(11, 'Must be 11 digits')
    .max(11, 'Must be 11 digits')
    .regex(/^\d+$/, 'Numbers only'),
  address: z.string().min(10, 'Enter a valid address'),
});

export type AdditionalInfoSchemaValues = z.infer<typeof additionalInfoSchema>;


export type IdentitySchemaValues = z.infer<typeof identitySchema>;
export type OtpSchemaValues = z.infer<typeof otpSchema>;
export type Tier2SchemaValues = z.infer<typeof tier2Schema>;
export type Tier3AddressSchemaValues = z.infer<typeof tier3AddressSchema>;
