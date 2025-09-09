import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/instances/axiosInstance';
import { jobSchema } from '@/schemas/jobSchema';
import { cn } from '@/utils/cn';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ZodError } from 'zod';
import type { $ZodIssue } from 'zod/v4/core';

type Job = {
  _id: string;
  company: string;
  position: string;
  status: string;
  jobType: string;
  location: string;
};

const CreateJob = () => {
  const initialFormData = { company: '', position: '', status: '', jobType: '', location: '' };
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: '',
    jobType: '',
    location: '',
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errorMessages, setErrorMessages] = useState<$ZodIssue[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        const jobList: Job[] = response.data ?? [];

        setJobs(jobList);
      } catch (error) {
        console.error('Error fetching jobs', error);
      }
    };

    fetchJobs();
  }, []);

  const isFormValid = (formData: typeof initialFormData) => {
    try {
      jobSchema.parse(formData);
      return true;
    } catch (err) {
      console.error('Validation error:', err);
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedForm = { ...formData, [e.target.name]: e.target.value };
    setFormData(updatedForm);
    setIsValid(isFormValid(updatedForm));

    try {
      jobSchema.parse(updatedForm);
      setErrorMessages([]);
    } catch (err) {
      if (err instanceof ZodError) {
        setErrorMessages(err.issues);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorMessages([]);
    setIsSubmitting(true);

    try {
      const validatedData = jobSchema.parse(formData);

      const isDuplicateCompany = jobs.some(
        (job) => job.company.trim().toLowerCase() === formData.company.trim().toLowerCase()
      );

      if (isDuplicateCompany) {
        setError('Company already exists');
        return;
      }

      const { data } = await api.post('/jobs', validatedData);
      console.log('response data:', data);
      setFormData(initialFormData);

      setIsSubmitting(false);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setErrorMessages(err.issues);
        return;
      }
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Job Creation Failed');
      } else {
        setError('An unknown error occured');
      }
      setIsSubmitting(false);
    }
  };
  return (
    <div className="mx-auto mt-10 max-w-md rounded-xl bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Create Job</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="company"
          value={formData.company}
          type="text"
          onChange={handleChange}
          placeholder="Company name"
          required
          className={cn(
            'w-full rounded-md border px-4 py-2',
            errorMessages.some((e) => e.path[0] === 'company')
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-indigo-500'
          )}
        />
        {errorMessages
          .filter((issue) => issue.path[0] === 'company')
          .map((issue, index) => (
            <p key={index} className="text-sm text-red-500 mt-1">
              {issue.message}
            </p>
          ))}

        <input
          name="position"
          value={formData.position}
          type="text"
          onChange={handleChange}
          placeholder="Job position"
          required
          className={cn(
            'w-full rounded-md border px-4 py-2',
            errorMessages.some((e) => e.path[0] === 'position')
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-indigo-500'
          )}
        />
        {errorMessages
          .filter((issue) => issue.path[0] === 'position')
          .map((issue, index) => (
            <p key={index} className="text-sm text-red-500 mt-1">
              {issue.message}
            </p>
          ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full rounded-md border px-4 py-2',
                errorMessages.some((e) => e.path[0] === 'status')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-indigo-500'
              )}
            >
              {formData.status
                ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1)
                : 'Select Status'}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full rounded-md border border-gray-200 shadow-md">
            {['applied', 'interviewing', 'offer', 'rejected', 'declined', 'pending'].map(
              (status) => (
                <DropdownMenuItem
                  key={status}
                  onSelect={() => {
                    const updated = { ...formData, status };
                    setFormData(updated);
                    setIsValid(isFormValid(updated));

                    try {
                      jobSchema.parse(updated);
                      setErrorMessages([]);
                    } catch (err) {
                      if (err instanceof ZodError) {
                        setErrorMessages(err.issues);
                      }
                    }
                  }}
                  className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 transition-colors duration-150"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {errorMessages
          .filter((issue) => issue.path[0] === 'status')
          .map((issue, index) => (
            <p key={index} className="text-sm text-red-500 mt-1">
              {issue.message}
            </p>
          ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full rounded-md border px-4 py-2',
                errorMessages.some((e) => e.path[0] === 'jobType')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-indigo-500'
              )}
            >
              {formData.jobType
                ? formData.jobType.charAt(0).toUpperCase() + formData.jobType.slice(1)
                : 'Select Job Type'}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full rounded-md border border-gray-200 shadow-md">
            {['full-time', 'part-time', 'remote', 'internship'].map((jobType) => (
              <DropdownMenuItem
                key={jobType}
                onSelect={() => {
                  const updated = { ...formData, jobType };
                  setFormData(updated);
                  setIsValid(isFormValid(updated));

                  try {
                    jobSchema.parse(updated);
                    setErrorMessages([]);
                  } catch (err) {
                    if (err instanceof ZodError) {
                      setErrorMessages(err.issues);
                    }
                  }
                }}
                className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 transition-colors duration-150"
              >
                {jobType.charAt(0).toUpperCase() + jobType.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {errorMessages
          .filter((issue) => issue.path[0] === 'jobType')
          .map((issue, index) => (
            <p key={index} className="text-sm text-red-500 mt-1">
              {issue.message}
            </p>
          ))}

        <input
          name="location"
          value={formData.location}
          type="text"
          onChange={handleChange}
          placeholder="Job location"
          required
          className={cn(
            'w-full rounded-md border px-4 py-2',
            errorMessages.some((e) => e.path[0] === 'location')
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-indigo-500'
          )}
        />
        {errorMessages
          .filter((issue) => issue.path[0] === 'location')
          .map((issue, index) => (
            <p key={index} className="text-sm text-red-500 mt-1">
              {issue.message}
            </p>
          ))}

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className={cn(
            'w-full rounded-md px-4 py-2 text-white transition',
            isValid ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'
          )}
        >
          Create
        </button>
        {!isValid && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Please fill the fields to enable submission.
          </p>
        )}

        <button
          type="button"
          onClick={() => setFormData(initialFormData)}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateJob;
