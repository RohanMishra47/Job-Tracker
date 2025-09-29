import { jobSchema } from '@/schemas/jobSchema';
// import { z } from 'zod'; // Standard import
import type { ZodIssue } from 'zod'; // Public type (drop $ZodIssue)

// type Job = {
//   _id: string;
//   company: string;
//   position: string;
//   status: string;
//   jobType: string;
//   location: string;
//   description: string;
//   salary: number | [number, number];
//   experienceLevel: 'junior' | 'mid' | 'senior';
//   tags: string[];
//   applicationLink: string;
//   deadline: Date;
//   priority: 'low' | 'medium' | 'high' | number;
//   source: 'LinkedIn' | 'Referral' | 'Company Site' | 'other' | string;
//   notes: string;
//   isFavorite: boolean;
// };

// Simplified debounce that accepts a single parameter function
export function debounce<T>(fn: (arg: T) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (arg: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(arg), delay);
  };
}

// Change validateForm to accept unknown data
export const validateForm = (
  formData: Record<string, unknown>, // Changed from any to Record<string, unknown>
  setIsValid: (v: boolean) => void,
  setErrorMessages: (e: ZodIssue[]) => void
) => {
  const parseResult = jobSchema.safeParse(formData);
  setIsValid(parseResult.success);
  setErrorMessages(parseResult.success ? [] : parseResult.error?.issues || []);
};

// createDebouncedValidate now accepts Record<string, unknown>
export const createDebouncedValidate = (
  setIsValid: (v: boolean) => void,
  setErrorMessages: (e: ZodIssue[]) => void
) => {
  return debounce(
    (formData: Record<string, unknown>) => validateForm(formData, setIsValid, setErrorMessages),
    500
  );
};
