import { jobSchema } from '@/schemas/jobSchema';
import { ZodError } from 'zod';
import type { $ZodIssue } from 'zod/v4/core';

type Job = {
  company: string;
  position: string;
  status: string;
  jobType: string;
  location: string;
};

export function debounce<T extends (...args: Job[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export const validateForm = (
  formData: Job,
  setIsValid: (v: boolean) => void,
  setErrorMessages: (e: $ZodIssue[]) => void
) => {
  try {
    jobSchema.parse(formData);
    setIsValid(true);
    setErrorMessages([]);
  } catch (err) {
    setIsValid(false);
    if (err instanceof ZodError) {
      setErrorMessages(err.issues);
    }
  }
};

export const createDebouncedValidate = (
  setIsValid: (v: boolean) => void,
  setErrorMessages: (e: $ZodIssue[]) => void
) => {
  return debounce((formData) => validateForm(formData, setIsValid, setErrorMessages), 3000);
};
