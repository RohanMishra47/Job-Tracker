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
import { z } from 'zod';

// For API responses (strict types)
type Job = {
  _id: string;
  company: string;
  position: string;
  status: string;
  jobType: string;
  location: string;
  description: string;
  salary: number | [number, number];
  experienceLevel: 'junior' | 'mid' | 'senior';
  tags: string[];
  applicationLink: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high' | number;
  source: 'LinkedIn' | 'Referral' | 'Company Site' | 'other' | string;
  notes: string;
  isFavorite: boolean;
};

// For form inputs (more flexible)
type CreateJobFormData = {
  company: string;
  position: string;
  status: string;
  jobType: string;
  location: string;
  description?: string;
  salary?: number | [number, number];
  experienceLevel?: string;
  tags?: string[];
  applicationLink?: string;
  deadline?: Date;
  priority?: string;
  source?: string;
  notes?: string;
  isFavorite?: boolean;
};

const initialFormData: CreateJobFormData = {
  company: '',
  position: '',
  status: '',
  jobType: '',
  location: '',
  description: '',
  salary: 0,
  experienceLevel: 'junior',
  tags: [],
  applicationLink: '',
  deadline: new Date(),
  priority: 'medium',
  source: 'other',
  notes: '',
  isFavorite: false,
};

const CreateJob = () => {
  const [formData, setFormData] = useState<CreateJobFormData>(initialFormData);
  const [isRange, setIsRange] = useState(false);
  const [tag, setTag] = useState(''); // Current input text
  const [tags, setTags] = useState<string[]>([]); // Array of added tags
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errorMessages, setErrorMessages] = useState<z.ZodIssue[]>([]);
  const [isValid, setIsValid] = useState(false);

  const debouncedValidate = useMemo(
    () => createDebouncedValidate(setIsValid, setErrorMessages),
    []
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        // Extra safety: Ensure array even if data is unexpected
        const jobList: Job[] = Array.isArray(response.data) ? response.data : [];
        setJobs(jobList);
      } catch (error) {
        console.error('Error fetching jobs', error);
        setJobs([]);
      }
    };

    fetchJobs();
  }, []);

  // Safe errorMessages
  const safeErrorMessages = Array.isArray(errorMessages) ? errorMessages : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    setErrorMessages((prev) => prev.filter((issue) => issue.path[0] !== name));
    debouncedValidate(updatedForm);
  };

  // Modify your handleSalaryInputChange to ensure proper updates
  const handleSalaryInputChange =
    (field: 'single' | 'min' | 'max') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const parsedValue = value === '' ? undefined : Number(value);
      const isValidNumber = parsedValue !== undefined && !isNaN(parsedValue);

      let newSalary: number | [number, number] | undefined;

      if (field === 'single') {
        newSalary = isValidNumber ? parsedValue : undefined;
      } else {
        const currentSalary = formData.salary;
        const currentMin = Array.isArray(currentSalary) ? currentSalary[0] : 0;
        const currentMax = Array.isArray(currentSalary) ? currentSalary[1] : 0;

        if (field === 'min') {
          newSalary = isValidNumber ? [parsedValue, currentMax] : [0, currentMax];
        } else if (field === 'max') {
          newSalary = isValidNumber ? [currentMin, parsedValue] : [currentMin, 0];
        }
      }

      // Only update if we have valid values
      if (newSalary !== undefined) {
        const updatedForm = { ...formData, salary: newSalary };
        setFormData(updatedForm);
        debouncedValidate(updatedForm);
      }
    };

  // New helper for keydown events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tag.trim()) {
        const newTags = [...(formData.tags ?? []), tag.trim()];
        setFormData((prev) => ({
          ...prev,
          tags: newTags,
        }));
        setTag('');
      }
    }
  };

  const handleDropdownChange = (
    field: 'status' | 'jobType' | 'priority' | 'source',
    value: string
  ) => {
    const updatedForm = { ...formData, [field]: value };
    setFormData(updatedForm);
    setErrorMessages((prev) => prev.filter((issue) => issue.path[0] !== field));
    debouncedValidate(updatedForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorMessages([]);
    setIsSubmitting(true);

    console.log('Submit started with formData:', formData); // Your confirmed log
    console.log(formData.tags);
    // Validation: Use safeParse directly (no throw/catch for Zod)
    console.log('Running validation...'); // Debug
    const parseResult = jobSchema.safeParse(formData);
    if (!parseResult.success) {
      console.log('Validation failed, setting errors'); // Debug
      setErrorMessages(parseResult.error.issues || []);
      setError('Please fix the validation errors.');
      setIsSubmitting(false);
      return;
    }
    console.log('Validation passed'); // Debug

    // Safe duplicate check
    console.log('Checking duplicates...'); // Debug
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    const isDuplicateCompany = safeJobs.some(
      (job) => job.company?.trim().toLowerCase() === formData.company.trim().toLowerCase()
    );
    if (isDuplicateCompany) {
      console.log('Duplicate found'); // Debug
      setError('Company already exists');
      setIsSubmitting(false);
      return;
    }
    console.log('No duplicate, proceeding to API'); // Debug

    try {
      console.log('About to send formData:', formData);
      console.log('API base URL:', api.defaults.baseURL);

      const { data } = await api.post('/jobs', formData);
      console.log('Response data:', data);

      // Success
      setFormData(initialFormData);
      setIsSubmitting(false);
      alert('Job created successfully!'); // Or toast
      // Optional: const navigate = useNavigate(); navigate('/dashboard');
    } catch (err: unknown) {
      console.error('API/Non-Zod error:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || err.response.data?.error || 'Job Creation Failed');
      } else {
        setError(`An unknown error occurred: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-xl bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Create Job</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company - Same structure as before, using safeErrorMessages */}
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

        {/* Position - Identical pattern */}
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
                    onSelect={() => handleDropdownChange('status', status)}
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

        {/* Job Type Dropdown - Same */}
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

        <div>
          <label>
            <input
              type="checkbox"
              checked={isRange}
              onChange={() => {
                setIsRange(!isRange);
              }}
            />
            Salary as Range
          </label>

          {isRange ? (
            <div>
              <input type="number" placeholder="Min" onChange={handleSalaryInputChange('min')} />
              <input type="number" placeholder="Max" onChange={handleSalaryInputChange('max')} />
            </div>
          ) : (
            <input
              type="number"
              placeholder="Salary"
              onChange={handleSalaryInputChange('single')}
            />
          )}

          {safeErrorMessages
            .filter((issue) => issue.path[0] === 'salary')
            .map((issue, index) => (
              <p key={index} className="text-sm text-red-500 mt-1">
                {issue.message}
              </p>
            ))}
        </div>

        {/* New Deadline field (placed below Salary) */}
        <div className="mt-4">
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
            Deadline
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            value={formData.deadline?.toISOString().split('T')[0] ?? ''}
            onChange={(e) => {
              const updatedForm = {
                ...formData,
                deadline: e.target.value ? new Date(e.target.value) : undefined,
              };
              setFormData(updatedForm);
              setErrorMessages((prev) => prev.filter((issue) => issue.path[0] !== 'deadline'));
              debouncedValidate(updatedForm);
            }}
            className={cn(
              'w-full rounded-md border px-4 py-2',
              safeErrorMessages.some((e) => e.path[0] === 'deadline')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-indigo-500'
            )}
          />

          {safeErrorMessages
            .filter((issue) => issue.path[0] === 'deadline')
            .map((issue, index) => (
              <p key={index} className="text-sm text-red-500 mt-1">
                {issue.message}
              </p>
            ))}
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full rounded-md border px-4 py-2',
                  safeErrorMessages.some((e) => e.path[0] === 'priority')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500'
                )}
              >
                {formData.priority
                  ? formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)
                  : 'Select Priority'}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full rounded-md border border-gray-200 shadow-md">
              {['low', 'medium', 'high'].map((priority) => (
                <DropdownMenuItem
                  key={priority}
                  onSelect={() => handleDropdownChange('priority', priority)}
                  className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 transition-colors duration-150"
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {safeErrorMessages
            .filter((issue) => issue.path[0] === 'priority')
            .map((issue, index) => (
              <p key={index} className="text-sm text-red-500 mt-1">
                {issue.message}
              </p>
            ))}
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full rounded-md border px-4 py-2',
                  safeErrorMessages.some((e) => e.path[0] === 'source')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500'
                )}
              >
                {formData.source === 'LinkedIn' ||
                formData.source === 'Referral' ||
                formData.source === 'Company Site'
                  ? formData.source
                  : formData.source && formData.source !== ''
                    ? 'Other'
                    : 'Select Source'}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full rounded-md border border-gray-200 shadow-md">
              {['LinkedIn', 'Referral', 'Company Site', 'other'].map((source) => (
                <DropdownMenuItem
                  key={source}
                  onSelect={() => handleDropdownChange('source', source)}
                  className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 transition-colors duration-150"
                >
                  {source === 'other' ? 'Other' : source}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {formData.source &&
            formData.source !== 'LinkedIn' &&
            formData.source !== 'Referral' &&
            formData.source !== 'Company Site' && (
              <input
                type="text"
                placeholder="Specify source"
                value={formData.source === 'other' ? '' : formData.source}
                onChange={(e) => handleDropdownChange('source', e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}

          {safeErrorMessages
            .filter((issue) => issue.path[0] === 'source')
            .map((issue, index) => (
              <p key={index} className="text-sm text-red-500 mt-1">
                {issue.message}
              </p>
            ))}
        </div>

        <div>
          <input
            type="text"
            placeholder="Add a tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={handleKeyDown} // Replaced with helper
          />
          <div>
            {tags.map((t, i) => (
              <span key={i}>
                {t} <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))}>x</button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <label
            htmlFor="isFavorite"
            className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer"
          >
            Mark as Favorite
          </label>
          <input
            id="isFavorite"
            type="checkbox"
            checked={formData.isFavorite || false}
            onChange={(e) => {
              const updatedForm = { ...formData, isFavorite: e.target.checked };
              setFormData(updatedForm);
              setErrorMessages((prev) => prev.filter((issue) => issue.path[0] !== 'isFavorite'));
              debouncedValidate(updatedForm);
            }}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

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
                  d="M4 12a8 8 0 018-8V8a4 4 0 00-4 4H4z"
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
