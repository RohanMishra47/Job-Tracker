import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/instances/axiosInstance';
import { cn } from '@/lib/utils';
import { jobSchema } from '@/schemas/jobSchema';
import { capitalize } from '@/utils/capitalize';
import { createDebouncedValidate } from '@/utils/validation';
import axios from 'axios';
import { ChevronDown, Edit, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ZodError } from 'zod';
import type { $ZodIssue } from 'zod/v4/core';

type Job = {
  _id: string;
  company: string;
  position: string;
  status: string;
  jobType: string;
  location: string;
  description?: string;
  salary?: number | [number, number];
  experienceLevel?: 'junior' | 'mid' | 'senior';
  tags?: string[];
  applicationLink?: string;
  deadline?: Date;
  priority?: 'low' | 'medium' | 'high' | number;
  source?: 'LinkedIn' | 'Referral' | 'Company Site' | 'other' | string;
  notes?: string;
  isFavorite?: boolean;
};

type JobMap = {
  [status: string]: Job[];
};

const allStatuses = ['applied', 'declined', 'pending', 'interviewing', 'offer', 'rejected'];

const EditJob = () => {
  const [existingJobs, SetExistingJobs] = useState<Job[]>([]);
  const [jobs, setJobs] = useState<JobMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [errorMessages, setErrorMessages] = useState<$ZodIssue[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [salaryType, setSalaryType] = useState<'single' | 'range'>('single');
  const formRef = useRef<HTMLFormElement>(null);

  const debouncedValidate = useMemo(
    () => createDebouncedValidate(setIsValid, setErrorMessages),
    []
  );

  const safeErrorMessages = errorMessages || [];

  const fetchJobs = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const response = await api.get('/jobs?limit=1000');
      const jobList: Job[] = response.data.jobs || [];
      SetExistingJobs(jobList);
      const grouped: JobMap = allStatuses.reduce((acc, status) => {
        acc[status] = [];
        return acc;
      }, {} as JobMap);

      jobList.forEach((job) => {
        if (!grouped[job.status]) {
          grouped[job.status] = [];
        }
        grouped[job.status].push(job);
      });

      setJobs(grouped);
    } catch (error) {
      console.error('Error fetching jobs', error);
      setFetchError('Failed to load jobs. Please check your connection or login status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Set salary type when job is selected
  useEffect(() => {
    if (selectedJob?.salary) {
      setSalaryType(Array.isArray(selectedJob.salary) ? 'range' : 'single');
    }
  }, [selectedJob]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedJob) return;
    const updatedJob: Job = { ...selectedJob, [e.target.name]: e.target.value };
    setSelectedJob(updatedJob);
    setErrorMessages((prev) => prev.filter((issue) => issue.path[0] !== e.target.name));
    debouncedValidate(updatedJob);
  };

  const handleSalaryChange =
    (field: 'single' | 'min' | 'max') => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedJob) return;
      const value = e.target.value;
      const parsed = value === '' ? undefined : Number(value);
      let newSalary: number | [number, number] | undefined = selectedJob.salary;

      if (field === 'single') {
        newSalary = parsed;
      } else {
        const [min, max] = Array.isArray(selectedJob.salary) ? selectedJob.salary : [0, 0];
        newSalary = field === 'min' ? [parsed ?? 0, max] : [min, parsed ?? 0];
      }
      const updated = { ...selectedJob, salary: newSalary };
      setSelectedJob(updated);
      setErrorMessages((prev) => prev.filter((issue) => issue.path[0] !== 'salary'));
      debouncedValidate(updated);
    };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!selectedJob) return;
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const updated = { ...selectedJob, tags: [...(selectedJob.tags || []), tagInput.trim()] };
      setSelectedJob(updated);
      setTagInput('');
      debouncedValidate(updated);
    }
  };

  const handleDropdownChange = (
    field: keyof Job,
    value: string | number | boolean | Date | undefined
  ) => {
    if (!selectedJob) return;
    const updated = { ...selectedJob, [field]: value };
    setSelectedJob(updated);
    setErrorMessages((prev) => prev.filter((issue) => issue.path[0] !== field));
    debouncedValidate(updated);
  };

  const handleEdit = (job: Job) => {
    setSelectedJob({ ...job });
    setErrorMessages([]);
    setError('');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorMessages([]);
    setIsSubmitting(true);

    try {
      if (!selectedJob || !selectedJob._id) {
        setError('No job selected for update');
        return;
      }

      jobSchema.parse(selectedJob);

      const isDuplicateCompany = existingJobs
        .filter((job) => job._id !== selectedJob._id)
        .some(
          (job) => job.company.trim().toLowerCase() === selectedJob.company.trim().toLowerCase()
        );

      if (isDuplicateCompany) {
        setError('Company already exists');
        return;
      }

      await api.put(`/jobs/${selectedJob._id}`, selectedJob);
      setSelectedJob(null);
      fetchJobs();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setErrorMessages(err.issues);
      } else if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Edit failed');
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    setError('');
    if (!jobId) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      fetchJobs();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Deletion failed');
      } else {
        setError('An unknown error occured');
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    if (!selectedJob) return;
    const updated = {
      ...selectedJob,
      tags: selectedJob.tags?.filter((_, idx) => idx !== indexToRemove),
    };
    setSelectedJob(updated);
    debouncedValidate(updated);
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Edit Job Application</h2>

        {selectedJob && (
          <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={selectedJob.company || ''}
                onChange={handleChange}
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
                type="text"
                id="position"
                name="position"
                value={selectedJob.position || ''}
                onChange={handleChange}
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

            {/* Status */}
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
                    {selectedJob.status ? capitalize(selectedJob.status) : 'Select Status'}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full rounded-md border border-gray-200 shadow-md">
                  {allStatuses.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onSelect={() => handleDropdownChange('status', status)}
                      className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 transition-colors duration-150"
                    >
                      {capitalize(status)}
                    </DropdownMenuItem>
                  ))}
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

            {/* Job Type */}
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
                    {selectedJob.jobType ? capitalize(selectedJob.jobType) : 'Select Job Type'}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full rounded-md border border-gray-200 shadow-md">
                  {['full-time', 'part-time', 'remote', 'internship'].map((type) => (
                    <DropdownMenuItem
                      key={type}
                      onSelect={() => handleDropdownChange('jobType', type)}
                      className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 transition-colors duration-150"
                    >
                      {capitalize(type)}
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
                type="text"
                id="location"
                name="location"
                value={selectedJob.location || ''}
                onChange={handleChange}
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

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={selectedJob.description || ''}
                onChange={handleChange}
                rows={3}
                className={cn(
                  'w-full rounded-md border px-4 py-2',
                  safeErrorMessages.some((e) => e.path[0] === 'description')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500'
                )}
              />
              {safeErrorMessages
                .filter((issue) => issue.path[0] === 'description')
                .map((issue, index) => (
                  <p key={index} className="text-sm text-red-500 mt-1">
                    {issue.message}
                  </p>
                ))}
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setSalaryType('single')}
                  className={cn(
                    'px-3 py-1 rounded-md text-sm',
                    salaryType === 'single'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  )}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setSalaryType('range')}
                  className={cn(
                    'px-3 py-1 rounded-md text-sm',
                    salaryType === 'range'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  )}
                >
                  Range
                </button>
              </div>
              {salaryType === 'single' ? (
                <input
                  type="number"
                  placeholder="Salary"
                  value={typeof selectedJob.salary === 'number' ? selectedJob.salary : ''}
                  onChange={handleSalaryChange('single')}
                  className={cn(
                    'w-full rounded-md border px-4 py-2',
                    safeErrorMessages.some((e) => e.path[0] === 'salary')
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-indigo-500'
                  )}
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={Array.isArray(selectedJob.salary) ? selectedJob.salary[0] : ''}
                    onChange={handleSalaryChange('min')}
                    className={cn(
                      'rounded-md border px-4 py-2',
                      safeErrorMessages.some((e) => e.path[0] === 'salary')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    )}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={Array.isArray(selectedJob.salary) ? selectedJob.salary[1] : ''}
                    onChange={handleSalaryChange('max')}
                    className={cn(
                      'rounded-md border px-4 py-2',
                      safeErrorMessages.some((e) => e.path[0] === 'salary')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    )}
                  />
                </div>
              )}
              {safeErrorMessages
                .filter((issue) => issue.path[0] === 'salary')
                .map((issue, index) => (
                  <p key={index} className="text-sm text-red-500 mt-1">
                    {issue.message}
                  </p>
                ))}
            </div>

            {/* Experience Level */}
            <div>
              <label
                htmlFor="experienceLevel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Experience Level
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full rounded-md border px-4 py-2',
                      safeErrorMessages.some((e) => e.path[0] === 'experienceLevel')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    )}
                  >
                    {selectedJob.experienceLevel
                      ? capitalize(selectedJob.experienceLevel)
                      : 'Select Experience Level'}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full rounded-md border border-gray-200 shadow-md">
                  {['junior', 'mid', 'senior'].map((lvl) => (
                    <DropdownMenuItem
                      key={lvl}
                      onSelect={() => handleDropdownChange('experienceLevel', lvl)}
                      className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 transition-colors duration-150"
                    >
                      {capitalize(lvl)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {safeErrorMessages
                .filter((issue) => issue.path[0] === 'experienceLevel')
                .map((issue, index) => (
                  <p key={index} className="text-sm text-red-500 mt-1">
                    {issue.message}
                  </p>
                ))}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Press Enter to add tag"
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {selectedJob.tags && selectedJob.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedJob.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-indigo-500 hover:text-indigo-700 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Application Link */}
            <div>
              <label
                htmlFor="applicationLink"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Application Link
              </label>
              <input
                type="url"
                id="applicationLink"
                name="applicationLink"
                value={selectedJob.applicationLink || ''}
                onChange={handleChange}
                placeholder="https://example.com/apply"
                className={cn(
                  'w-full rounded-md border px-4 py-2',
                  safeErrorMessages.some((e) => e.path[0] === 'applicationLink')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500'
                )}
              />
              {safeErrorMessages
                .filter((issue) => issue.path[0] === 'applicationLink')
                .map((issue, index) => (
                  <p key={index} className="text-sm text-red-500 mt-1">
                    {issue.message}
                  </p>
                ))}
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="date"
                id="deadline"
                value={
                  selectedJob.deadline
                    ? new Date(selectedJob.deadline).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  handleDropdownChange(
                    'deadline',
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
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

            {/* Priority */}
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
                    {typeof selectedJob.priority === 'string'
                      ? capitalize(selectedJob.priority)
                      : selectedJob.priority
                        ? `Custom: ${selectedJob.priority}`
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
                      {capitalize(priority)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                type="number"
                placeholder="Or enter custom numeric priority"
                value={typeof selectedJob.priority === 'number' ? selectedJob.priority : ''}
                onChange={(e) =>
                  handleDropdownChange(
                    'priority',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {safeErrorMessages
                .filter((issue) => issue.path[0] === 'priority')
                .map((issue, index) => (
                  <p key={index} className="text-sm text-red-500 mt-1">
                    {issue.message}
                  </p>
                ))}
            </div>

            {/* Source */}
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
                    {selectedJob.source === 'LinkedIn' ||
                    selectedJob.source === 'Referral' ||
                    selectedJob.source === 'Company Site'
                      ? selectedJob.source
                      : selectedJob.source && selectedJob.source !== ''
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

              {selectedJob.source &&
                selectedJob.source !== 'LinkedIn' &&
                selectedJob.source !== 'Referral' &&
                selectedJob.source !== 'Company Site' && (
                  <input
                    type="text"
                    placeholder="Specify source"
                    value={selectedJob.source === 'other' ? '' : selectedJob.source}
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

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={selectedJob.notes || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes about this application..."
                className={cn(
                  'w-full rounded-md border px-4 py-2',
                  safeErrorMessages.some((e) => e.path[0] === 'notes')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500'
                )}
              />
              {safeErrorMessages
                .filter((issue) => issue.path[0] === 'notes')
                .map((issue, index) => (
                  <p key={index} className="text-sm text-red-500 mt-1">
                    {issue.message}
                  </p>
                ))}
            </div>

            {/* Favorite */}
            <div className="flex items-center">
              <input
                id="isFavorite"
                type="checkbox"
                checked={selectedJob.isFavorite || false}
                onChange={(e) => handleDropdownChange('isFavorite', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
              />
              <label
                htmlFor="isFavorite"
                className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer"
              >
                Mark as Favorite
              </label>
            </div>

            {/* General Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit/Cancel Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedJob(null);
                  setErrorMessages([]);
                  setError('');
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={cn(
                  'rounded-md px-4 py-2',
                  isValid && !isSubmitting
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                )}
              >
                {isSubmitting ? 'Updating...' : 'Update Job'}
              </Button>
            </div>
          </form>
        )}

        {/* No Job Selected State */}
        {!selectedJob && !loading && (
          <p className="text-center text-gray-500 py-8">Select a job from below to edit</p>
        )}
      </div>

      {/* Job Listings by Status */}
      <div className="mx-auto max-w-6xl mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Job Applications</h3>

        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading jobs...</p>
          </div>
        )}

        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {fetchError}
          </div>
        )}

        {!loading && !fetchError && (
          <div className="space-y-6">
            {allStatuses.map((status) => {
              const statusJobs = jobs[status] || [];
              if (statusJobs.length === 0) return null;

              return (
                <div key={status} className="bg-white rounded-lg shadow p-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3 capitalize">
                    {status} ({statusJobs.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statusJobs.map((job) => (
                      <div
                        key={job._id}
                        className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800">{job.company}</h5>
                            <p className="text-sm text-gray-600">{job.position}</p>
                            <p className="text-xs text-gray-500 mt-1">{job.location}</p>
                          </div>
                          {job.isFavorite && <span className="text-yellow-500 text-xl">★</span>}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {capitalize(job.jobType)}
                          </span>
                          {job.experienceLevel && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {capitalize(job.experienceLevel)}
                            </span>
                          )}
                          {job.priority && (
                            <span
                              className={cn(
                                'text-xs px-2 py-1 rounded',
                                job.priority === 'high'
                                  ? 'bg-red-100 text-red-700'
                                  : job.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                              )}
                            >
                              {typeof job.priority === 'string'
                                ? capitalize(job.priority)
                                : `P${job.priority}`}
                            </span>
                          )}
                        </div>

                        {job.salary && (
                          <p className="text-sm text-gray-600 mb-2">
                            💰{' '}
                            {Array.isArray(job.salary)
                              ? `$${job.salary[0].toLocaleString()} - $${job.salary[1].toLocaleString()}`
                              : `$${job.salary.toLocaleString()}`}
                          </p>
                        )}

                        {job.deadline && (
                          <p className="text-xs text-gray-500 mb-2">
                            📅 Deadline: {new Date(job.deadline).toLocaleDateString()}
                          </p>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleEdit(job)}
                            variant="outline"
                            size="sm"
                            className="flex-1 flex items-center justify-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(job._id)}
                            variant="destructive"
                            size="sm"
                            className="flex items-center justify-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {existingJobs.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg">No jobs found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Create your first job application to get started
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditJob;
