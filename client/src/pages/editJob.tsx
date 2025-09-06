import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/instances/axiosInstance';
import { ChevronDown, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
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

    fetchJobs();
  }, []);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Edit Job Application</h2>

        <form className="space-y-4">
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
                  value={selectedJob?.status || ''}
                  onChange={(e) =>
                    setSelectedJob((prev) => (prev ? { ...prev, status: e.target.value } : prev))
                  }
                  className="w-full justify-between px-3 py-2 rounded-md border border-gray-300 shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                 transition-all duration-200"
                >
                  Select Status
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full rounded-md border border-gray-200 shadow-md">
                {['applied', 'interviewing', 'offer', 'rejected', 'declined', 'pending'].map(
                  (status) => (
                    <DropdownMenuItem
                      key={status}
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
                  Select Job Type
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full rounded-md border border-gray-200 shadow-md">
                {['full-time', 'part-time', 'remote', 'internship'].map((jobType) => (
                  <DropdownMenuItem
                    key={status}
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
              className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Enter the location"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
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
                        onClick={() => setSelectedJob(job)}
                        className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200"
                        title="Edit Job"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(job._id)}
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
