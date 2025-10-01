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

type JobMap = {
  [status: string]: Job[];
};

const allStatuses = ['applied', 'pending', 'interviewing', 'offer', 'rejected'];

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
  const formRef = useRef<HTMLFormElement>(null);

  const debouncedValidate = useMemo(
    () => createDebouncedValidate(setIsValid, setErrorMessages),
    []
  );

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedJob) return;
    const updatedJob: Job = { ...selectedJob, [e.target.name]: e.target.value };
    setSelectedJob(updatedJob);
    debouncedValidate(updatedJob);
  };

  const handleEdit = (job: Job) => {
    setSelectedJob({ ...job });
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorMessages([]);
    setIsSubmitting(true);

    const startTime = Date.now();

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

      const { data } = await api.put(`/jobs/${selectedJob._id}`, selectedJob);
      console.log('response data:', data);
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
      const elapsed = Date.now() - startTime;
      const remaining = 1000 - elapsed;

      if (remaining > 0) {
        setTimeout(() => setIsSubmitting(false), remaining);
      } else {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async (jobId: string) => {
    setError('');

    if (!jobId) {
      setError('No job selected for deletion');
      return;
    }

    try {
      const { data } = await api.delete(`/jobs/${jobId}`);
      console.log('response data:', data);
      fetchJobs();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Deletion failed');
      } else {
        setError('An unknown error occured');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Edit Job Application</h2>

        <form ref={formRef} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              name="company"
              value={selectedJob?.company || ''}
              onChange={handleChange}
              required
              className={cn(
                'w-full px-3 py-2 rounded-md border',
                errorMessages.some((e) => e.path[0] === 'company')
                  ? 'border-red-500 focus:ring-red-500 transition-all duration-200'
                  : 'border-gray-300 shadow-sm  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200'
              )}
              placeholder="Enter company name"
            />
            {errorMessages
              .filter((issue) => issue.path[0] === 'company')
              .map((issue, index) => (
                <p key={index} className="text-sm text-red-500 mt-1">
                  {issue.message}
                </p>
              ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              name="position"
              value={selectedJob?.position || ''}
              onChange={handleChange}
              required
              className={cn(
                'w-full px-3 py-2 rounded-md border',
                errorMessages.some((e) => e.path[0] === 'position')
                  ? 'border-red-500 focus:ring-red-500 transition-all duration-200'
                  : 'border-gray-300 shadow-sm  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200'
              )}
              placeholder="Enter your position"
            />
            {errorMessages
              .filter((issue) => issue.path[0] === 'position')
              .map((issue, index) => (
                <p key={index} className="text-sm text-red-500 mt-1">
                  {issue.message}
                </p>
              ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full px-3 py-2 rounded-md border',
                    errorMessages.some((e) => e.path[0] === 'status')
                      ? 'border-red-500 focus:ring-red-500 transition-all duration-200'
                      : 'border-gray-300 shadow-sm  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200'
                  )}
                >
                  {capitalize(selectedJob?.status) || 'Select status'}{' '}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full rounded-md border border-gray-200 shadow-md">
                {['applied', 'interviewing', 'offer', 'rejected', 'declined', 'pending'].map(
                  (status) => (
                    <DropdownMenuItem
                      key={status}
                      onSelect={() => {
                        if (!selectedJob) return;
                        const updated: Job = { ...selectedJob, status };
                        setSelectedJob(updated);
                        debouncedValidate(updated);
                      }}
                      className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 
                   transition-colors duration-150"
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full px-3 py-2 rounded-md border',
                    errorMessages.some((e) => e.path[0] === 'jobType')
                      ? 'border-red-500 focus:ring-red-500 transition-all duration-200'
                      : 'border-gray-300 shadow-sm  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200'
                  )}
                >
                  {capitalize(selectedJob?.jobType) || 'Select Job Type'}{' '}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full rounded-md border border-gray-200 shadow-md">
                {['full-time', 'part-time', 'remote', 'internship'].map((jobType) => (
                  <DropdownMenuItem
                    key={jobType}
                    onSelect={() => {
                      if (!selectedJob) return;
                      const updated: Job = { ...selectedJob, jobType };
                      setSelectedJob(updated);
                      debouncedValidate(updated);
                    }}
                    className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 
                   transition-colors duration-150"
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={selectedJob?.location || ''}
              onChange={handleChange}
              required
              className={cn(
                'w-full px-3 py-2 rounded-md border',
                errorMessages.some((e) => e.path[0] === 'location')
                  ? 'border-red-500 focus:ring-red-500 transition-all duration-200'
                  : 'border-gray-300 shadow-sm  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200'
              )}
            />
            {errorMessages
              .filter((issue) => issue.path[0] === 'location')
              .map((issue, index) => (
                <p key={index} className="text-sm text-red-500 mt-1">
                  {issue.message}
                </p>
              ))}
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedJob(null)}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting || !selectedJob}
              className={cn(
                'rounded-md px-4 py-2',
                selectedJob
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading jobs...</span>
        </div>
      )}
      {fetchError && (
        <div className="mx-auto max-w-2xl p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{fetchError}</p>
          <button onClick={fetchJobs} className="mt-2 text-indigo-600 hover:underline">
            Try Again
          </button>
        </div>
      )}
      {!loading && !fetchError && (
        <div className="mt-10 w-full max-w-6xl space-y-8">
          {Object.entries(jobs).map(([status, jobsArray]) => (
            <section key={status}>
              <h2 className="text-xl font-bold capitalize mb-4">{status}</h2>

              {jobsArray.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobsArray.map((job) => (
                    <div
                      key={job._id}
                      className="flex flex-col gap-2 rounded-lg bg-white p-4 shadow-md"
                    >
                      <p className="text-gray-600">{job.company}</p>
                      <p className="text-gray-500">{job.position}</p>
                      <p className="text-gray-500">{job.jobType}</p>
                      <p className="text-gray-500">{job.location}</p>

                      <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEdit(job)}
                          className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200"
                          title="Edit Job"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors duration-200"
                          title="Delete Job"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No jobs in this category</p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditJob;
