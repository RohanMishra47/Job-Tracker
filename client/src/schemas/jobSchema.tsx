import { z } from 'zod';

export const jobSchema = z.object({
  // Required fields (these are in your form)
  company: z.string().trim().min(2, { message: 'Company name must be at least 2 characters' }),
  position: z.string().trim().min(2, { message: 'Position must be at least 2 characters' }),
  status: z.enum(['applied', 'interviewing', 'offer', 'rejected', 'declined', 'pending']),
  jobType: z.enum(['full-time', 'part-time', 'remote', 'internship']),
  location: z.string().trim().min(2, { message: 'Location must be at least 2 characters' }),

  // Optional fields (make them truly optional)
  description: z.string().trim().min(10).max(2000).optional().or(z.literal('')),

  salary: z
    .union([
      z.number().positive(),
      z.tuple([z.number().positive(), z.number().positive()]).refine((val) => val[0] <= val[1], {
        message: 'Min salary cannot exceed max salary',
      }),
    ])
    .optional(),

  experienceLevel: z.enum(['junior', 'mid', 'senior']).optional(),

  applicationLink: z.string().url().optional().or(z.literal('')),

  deadline: z.date().optional(), // Change from string to date, and make optional

  priority: z
    .union([z.enum(['low', 'medium', 'high']), z.number().int().min(1).max(10)])
    .optional(),

  source: z
    .union([z.enum(['LinkedIn', 'Referral', 'Company Site', 'other']), z.string().min(1)])
    .optional(),

  tags: z.array(z.string().trim().min(1)).max(10).optional(),

  notes: z.string().optional(),

  isFavorite: z.boolean().optional(),
});
