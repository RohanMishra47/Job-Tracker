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
import { createDebouncedValidate } from '@/utils/validation';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { z } from 'zod'; // Add explicit Zod import for v3/v4 consistency
// For Zod v3: Use ZodError and err.errors
// If v4: import { ZodError, ZodIssue } from 'zod'; and use err.issues

type Job = {
  _id: string;
  company: string;
  position: string;
  status: string;
  jobType: string;
  location: string;
};

const initialFormData = { company: '', position: '', status: '', jobType: '', location: '' };

const CreateJob = () => {
  // Fix: Use initialFormData for useState
  const [formData, setFormData] = useState(initialFormData);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Fix: Use ZodIssue (standard) and ensure array
  const [errorMessages, setErrorMessages] = useState<z.core.$ZodIssue[]>([]);
  const [isValid, setIsValid] = useState(false);

  const debouncedValidate = useMemo(
    () => createDebouncedValidate(setIsValid, setErrorMessages),
    []
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        const jobList: Job[] = response.data ?? [];
        setJobs(jobList);
      } catch (error) {
        console.error('Error fetching jobs', error);
        setJobs([]); // Ensure array
      }
    };

    fetchJobs();
  }, []);

  // Helper: Safe array for errorMessages (prevents .some errors)
  const safeErrorMessages = Array.isArray(errorMessages) ? errorMessages : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    // Clear field-specific errors on change (UX improvement)
    setErrorMessages((prev) => prev.filter((issue) => issue.path[0] !== name));
    debouncedValidate(updatedForm);
  };

  // Fix: Handle dropdown changes (already in onSelect, but add clear errors)
  const handleDropdownChange = (field: 'status' | 'jobType', value: string) => {
    const updatedForm = { ...formData, [field]: value };
    setFormData(updatedForm);
    setErrorMessages((prev) => prev.filter((issue) => issue.path[0] !== field));
    debouncedValidate(updatedForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Note: FormEvent only
    e.preventDefault();
    setError('');
    setErrorMessages([]);
    setIsSubmitting(true);

    console.log('Submit started with formData:', formData); // Debug: Check if reached

    try {
      // Use safeParse to avoid throw (more reliable than parse)
      const parseResult = jobSchema.safeParse(formData);
      if (!parseResult.success) {
        throw new z.ZodError(parseResult.error.issues || []); // v3: .errors; v4: .issues
      }

      // Duplicate check (jobs is always array)
      const isDuplicateCompany = jobs.some(
        (job) => job.company.trim().toLowerCase() === formData.company.trim().toLowerCase()
      );

      if (isDuplicateCompany) {
        setError('Company already exists');
        return;
      }

      console.log('About to send formData:', formData);
      console.log('API base URL:', api.defaults.baseURL);

      const { data } = await api.post('/jobs', formData);
      console.log('Response data:', data);

      // Success: Reset form and feedback
      setFormData(initialFormData);
      setErrorMessages([]);
      setIsValid(false); // Reset for next use
      alert('Job created successfully!'); // Or use toast/redirect: e.g., navigate('/dashboard');
      // If you want redirect: import { useNavigate } from 'react-router-dom'; const navigate = useNavigate(); navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Full error object:', err);
      console.error('Error type:', typeof err);
      console.error('Error constructor:', err?.constructor?.name);

      if (err instanceof z.ZodError) {
        // v3: setErrorMessages(err.errors || []);
        // v4: setErrorMessages(err.issues || []);
        setErrorMessages(err.issues || []); // Adjust to .issues if v4
        setError('Please fix the validation errors.');
        return;
      }
      if (axios.isAxiosError(err) && err.response) {
        console.error('Axios error response:', err.response);
        setError(err.response.data?.message || err.response.data?.error || 'Job Creation Failed');
      } else {
        console.error('Non-axios error:', err);
        setError(`An unknown error occurred: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    } finally {
      setIsSubmitting(false); // Remove timeout—simple and immediate
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-xl bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Create Job</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            id="company"
            name="company"
            value={formData.company}
            type="text"
            onChange={handleInputChange}
            placeholder="Company name"
            required
            className={cn(
              'w-full rounded-md border px-4 py-2',
              safeErrorMessages.some((e) => e.path[0] === 'company')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-indigo-500'
            )}
          />
          {safeErrorMessages
            .filter((issue) => issue.path[0] === 'company')
            .map((issue, index) => (
              <p key={index} className="text-sm text-red-500 mt-1">
                {issue.message}
              </p>
            ))}
        </div>

        {/* Position */}
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
            Position
          </label>
          <input
            id="position"
            name="position"
            value={formData.position}
            type="text"
            onChange={handleInputChange}
            placeholder="Job position"
            required
            className={cn(
              'w-full rounded-md border px-4 py-2',
              safeErrorMessages.some((e) => e.path[0] === 'position')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-indigo-500'
            )}
          />
          {safeErrorMessages
            .filter((issue) => issue.path[0] === 'position')
            .map((issue, index) => (
              <p key={index} className="text-sm text-red-500 mt-1">
                {issue.message}
              </p>
            ))}
        </div>

        {/* Status Dropdown */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full rounded-md border px-4 py-2',
                  safeErrorMessages.some((e) => e.path[0] === 'status')
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
                    onSelect={() => handleDropdownChange('status', status)} // Use helper
                    className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 transition-colors duration-150"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {safeErrorMessages
            .filter((issue) => issue.path[0] === 'status')
            .map((issue, index) => (
              <p key={index} className="text-sm text-red-500 mt-1">
                {issue.message}
              </p>
            ))}
        </div>

        {/* JobType Dropdown - Similar */}
        <div>
          <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
            Job Type
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full rounded-md border px-4 py-2',
                  safeErrorMessages.some((e) => e.path[0] === 'jobType')
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
                  onSelect={() => handleDropdownChange('jobType', jobType)}
                  className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 transition-colors duration-150"
                >
                  {jobType.charAt(0).toUpperCase() + jobType.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {safeErrorMessages
            .filter((issue) => issue.path[0] === 'jobType')
            .map((issue, index) => (
              <p key={index} className="text-sm text-red-500 mt-1">
                {issue.message}
              </p>
            ))}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="location"
            name="location"
            value={formData.location}
            type="text"
            onChange={handleInputChange}
            placeholder="Job location"
            required
            className={cn(
              'w-full rounded-md border px-4 py-2',
              safeErrorMessages.some((e) => e.path[0] === 'location')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-indigo-500'
            )}
          />
          {safeErrorMessages
            .filter((issue) => issue.path[0] === 'location')
            .map((issue, index) => (
              <p key={index} className="text-sm text-red-500 mt-1">
                {issue.message}
              </p>
            ))}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Submit Button: Remove onClick to prevent double-call */}
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={cn(
            'w-full rounded-md px-4 py-2 text-white transition',
            isValid && !isSubmitting
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-gray-300 cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 00-4 4H4z"
                />
              </svg>
              Creating...
            </span>
          ) : (
            'Create'
          )}
        </Button>

        {!isValid && !isSubmitting && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Please fill the fields correctly to enable submission.
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setFormData(initialFormData);
            setError('');
            setErrorMessages([]);
            setIsValid(false);
          }}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateJob;
