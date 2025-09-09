import { z } from 'zod';

export const jobSchema = z.object({
  company: z.string().trim().min(2, { message: 'Company name must be at least 2 characters' }),
  position: z.string().trim().min(2, { message: 'Position is required' }),
  status: z.enum(['applied', 'interviewing', 'offer', 'rejected', 'declined', 'pending'], {
    message: 'Please select a valid status',
  }),
  jobType: z.enum(['full-time', 'part-time', 'remote', 'internship'], {
    message: 'Please select a valid Job-Type',
  }),
  location: z.string().trim().min(2, { message: 'Loation is required' }),
});
