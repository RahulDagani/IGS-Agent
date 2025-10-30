import { z } from 'zod';

export const countrySchema = z.object({
  country: z.string()
    .min(1, 'Country name is required')
    .max(255, 'Country name must be less than 255 characters')
    .regex(/^[a-zA-Z\s\-\.]+$/, 'Country name can only contain letters, spaces, hyphens, and periods'),
});

export type CountryInput = z.infer<typeof countrySchema>;