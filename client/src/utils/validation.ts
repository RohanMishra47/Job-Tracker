import { jobSchema } from '@/schemas/jobSchema';
// import { z } from 'zod'; // Standard import
import type { ZodIssue } from 'zod'; // Public type (drop $ZodIssue)

type Job = {
  company: string;
  position: string;
  status: string;
  jobType: string;
  location: string;
};

// Fixed typing: Expects single Job, not Job[]
export function debounce<T extends (formData: Job) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (formData: Job) => {
    // Single arg
    clearTimeout(timer);
    timer = setTimeout(() => fn(formData), delay);
  };
}

// Updated: Use safeParse (no throw/catch needed)
export const validateForm = (
  formData: Job,
  setIsValid: (v: boolean) => void,
  setErrorMessages: (e: ZodIssue[]) => void // Standard type
) => {
  const parseResult = jobSchema.safeParse(formData);
  setIsValid(parseResult.success);
  setErrorMessages(parseResult.success ? [] : parseResult.error?.issues || []); // Safe array
};

// Create debounced version (500ms delay for better UX)
export const createDebouncedValidate = (
  setIsValid: (v: boolean) => void,
  setErrorMessages: (e: ZodIssue[]) => void
) => {
  return debounce((formData) => validateForm(formData, setIsValid, setErrorMessages), 500);
};
