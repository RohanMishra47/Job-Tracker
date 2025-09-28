import { z } from 'zod';

export const jobSchema = z.object({
  // --- Form Fields (Required in UI) ---
  company: z.string().trim().min(2, { message: 'Company name must be at least 2 characters' }),
  position: z
    .string()
    .trim()
    .min(2, { message: 'Position is required and must be at least 2 characters' }),
  status: z.enum(['applied', 'interviewing', 'offer', 'rejected', 'declined', 'pending'], {
    message: 'Please select a valid status',
  }),
  jobType: z.enum(['full-time', 'part-time', 'remote', 'internship'], {
    message: 'Please select a valid Job-Type',
  }),
  location: z
    .string()
    .trim()
    .min(2, { message: 'Location is required and must be at least 2 characters' }),
  description: z
    .string()
    .trim()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(2000, { message: 'Description cannot exceed 2000 characters' }),
  salary: z.union([
    z.number().positive({ message: 'Salary must be a positive number' }),
    z
      .tuple([
        z.number().positive({ message: 'Minimum salary must be positive' }),
        z.number().positive({ message: 'Maximum salary must be positive' }),
      ])
      .refine((val) => val[0] <= val[1], {
        message: 'Minimum salary cannot exceed maximum salary',
      }),
  ]),
  experienceLevel: z.enum(['junior', 'mid', 'senior'], {
    message: 'Experience level must be junior, mid, or senior',
  }),
  applicationLink: z
    .string()
    .url({ message: 'Application link must be a valid URL' })
    .optional()
    .or(z.literal('')), // Allow empty string as "not set"
  deadline: z
    .string()
    .datetime({ message: 'Deadline must be a valid ISO datetime string' })
    .transform((str) => new Date(str)) // Convert to Date object
    .refine((date) => date > new Date(), {
      message: 'Deadline must be in the future',
    }),
  priority: z
    .union([z.enum(['low', 'medium', 'high']), z.number().int().min(1).max(10)])
    .optional()
    .default('medium'),
  source: z
    .union([
      z.enum(['LinkedIn', 'Referral', 'Company Site', 'other']),
      z.string().min(1, { message: 'Source must be at least 1 character if custom' }),
    ])
    .optional()
    .default('other'),
  tags: z
    .array(z.string().trim().min(1))
    .min(0)
    .max(10, { message: 'You can have at most 10 tags' })
    .optional()
    .default([]),
  notes: z.string().optional().default(''),
  isFavorite: z.boolean().optional().default(false),
});
