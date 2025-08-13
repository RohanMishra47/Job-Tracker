import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../instances/axiosInstance';
import JobColumn from './JobColumn';

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

const JobBoard: React.FC = () => {
  const [jobs, setJobs] = useState<JobMap>({});
  // At the top of your component
  console.log('Using api instance:', typeof api); // Should log "function"
  console.log('API base URL:', api.defaults.baseURL); // Should log "/api"
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log('Token read from storage:', localStorage.getItem('token'));

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
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    if (sourceColumn === destColumn) {
      const copied = [...jobs[sourceColumn]];
      const [moved] = copied.splice(source.index, 1);
      copied.splice(destination.index, 0, moved);

      setJobs({ ...jobs, [sourceColumn]: copied });
    } else {
      const sourceJobs = [...jobs[sourceColumn]];
      const destJobs = [...jobs[destColumn]];
      const [moved] = sourceJobs.splice(source.index, 1);
      destJobs.splice(destination.index, 0, moved);

      setJobs({
        ...jobs,
        [sourceColumn]: sourceJobs,
        [destColumn]: destJobs,
      });
      updateJobStatus(moved._id, destColumn);
    }
  };

  const updateJobStatus = async (_id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token missing. Are you logged in?');
        return;
      }
      const response = await api.put(`/jobs/${_id}/status`, { status });
      toast.success(`Moved to ${status}`);
      console.log('Job updated:', response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;

      const errorMsg = axiosError.response?.data?.error || axiosError.message || 'Unknown error';
      toast.error('Failed to update job status');
      console.error('Frontend error updating job:', errorMsg);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {allStatuses.map((status) => (
          <JobColumn
            key={status}
            title={status}
            jobs={jobs[status] ?? []} // fallback to empty array
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default JobBoard;
