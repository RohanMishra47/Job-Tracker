import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/instances/axiosInstance';
import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/capitalize';
import axios from 'axios';
import { ChevronDown, Edit, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Job = {
  _id: string;
  company: string;
  position: string;
  status: string;
  jobType: string;
  location: string;
};

type JobMap = {
  [status: string]: Job[];
};

const allStatuses = ['applied', 'pending', 'interviewing', 'offer', 'rejected'];

const EditJob = () => {
  const [jobs, setJobs] = useState<JobMap>({});
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      const jobList: Job[] = response.data ?? [];
      const grouped: JobMap = allStatuses.reduce((acc, status) => {
        acc[status] = [];
        return acc;
      }, {} as JobMap);

      jobList.forEach((job) => {
        grouped[job.status].push(job);
      });

      setJobs(grouped);
    } catch (error) {
      console.error('Error fetching jobs', error);
    }
  };

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedJob || !selectedJob._id) {
      setError('No job selected for update');
      return;
    }

    try {
      const { data } = await api.put(`/jobs/${selectedJob._id}`, selectedJob);
      console.log('response data:', data);
      setSelectedJob(null);
      fetchJobs();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Edit failed');
      } else {
        setError('An unknown error occured');
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

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Edit Job Application</h2>

        <form ref={formRef} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              value={selectedJob?.company || ''}
              onChange={(e) =>
                setSelectedJob((prev) => (prev ? { ...prev, company: e.target.value } : prev))
              }
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              value={selectedJob?.position || ''}
              onChange={(e) =>
                setSelectedJob((prev) => (prev ? { ...prev, position: e.target.value } : prev))
              }
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Enter your position"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between px-3 py-2 rounded-md border border-gray-300 shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                 transition-all duration-200"
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
                      onSelect={() =>
                        setSelectedJob((prev) => (prev ? { ...prev, status: status } : prev))
                      }
                      className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 
                   transition-colors duration-150"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between px-3 py-2 rounded-md border border-gray-300 shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                 transition-all duration-200"
                >
                  {capitalize(selectedJob?.jobType) || 'Select Job Type'}{' '}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full rounded-md border border-gray-200 shadow-md">
                {['full-time', 'part-time', 'remote', 'internship'].map((jobType) => (
                  <DropdownMenuItem
                    key={jobType}
                    onSelect={() =>
                      setSelectedJob((prev) => (prev ? { ...prev, jobType: jobType } : prev))
                    }
                    className="px-3 py-2 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 
                   transition-colors duration-150"
                  >
                    {jobType.charAt(0).toUpperCase() + jobType.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={selectedJob?.location || ''}
              onChange={(e) =>
                setSelectedJob((prev) => (prev ? { ...prev, location: e.target.value } : prev))
              }
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Enter the location"
            />
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
              disabled={!selectedJob}
              className={cn(
                'rounded-md px-4 py-2',
                selectedJob
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
            >
              Submit
            </Button>
          </div>
        </form>
      </div>

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
    </div>
  );
};

export default EditJob;
