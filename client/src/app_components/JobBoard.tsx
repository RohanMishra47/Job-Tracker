import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { AxiosError } from 'axios';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
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
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [searchQueryInput, setSearchQueryInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      console.log('Token read from storage:', localStorage.getItem('token'));

      const response = await api.get('/jobs');

      const jobList: Job[] = response.data ?? [];
      setAllJobs(jobList);

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

  useEffect(() => {
    fetchJobs();
  }, []);

  const debouncedUpdate = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 300),
    []
  );

  useEffect(() => {
    debouncedUpdate(searchQueryInput);

    // cleanup to avoid memory leaks
    return () => {
      debouncedUpdate.cancel();
    };
  }, [searchQueryInput, debouncedUpdate]);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesSearch =
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.position.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus ? job.status === selectedStatus : true;
      const matchesJobType = selectedJobType ? job.jobType === selectedJobType : true;

      return matchesSearch && matchesStatus && matchesJobType;
    });
  }, [allJobs, searchQuery, selectedStatus, selectedJobType]);

  const filteredJobsByStatus = useMemo(() => {
    const grouped: Record<string, Job[]> = {};
    filteredJobs.forEach((job) => {
      if (!grouped[job.status]) grouped[job.status] = [];
      grouped[job.status].push(job);
    });
    return grouped;
  }, [filteredJobs]);

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
    <div>
      <input
        type="text"
        placeholder="Search by company or position"
        value={searchQuery}
        onChange={(e) => setSearchQueryInput(e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
      />

      <select
        value={selectedStatus ?? ''}
        onChange={(e) => setSelectedStatus(e.target.value || null)}
        className="px-3 py-2 border rounded-md"
      >
        <option value="">All Statuses</option>
        <option value="applied">Applied</option>
        <option value="offer">Offer</option>
        <option value="rejected">Rejected</option>
        <option value="interviewing">Interview</option>
        <option value="pending">Pending</option>
        <option value="declined">Declined</option>
      </select>

      <select
        value={selectedJobType ?? ''}
        onChange={(e) => setSelectedJobType(e.target.value || null)}
        className="px-3 py-2 border rounded-md"
      >
        <option value="">All Job Types</option>
        <option value="internship"> Internship</option>
        <option value="full-time">Full-time</option>
        <option value="part-time">Part-time</option>
        <option value="remote">Remote</option>
      </select>

      <button
        onClick={() => {
          setSearchQuery('');
          setSelectedStatus(null);
          setSelectedJobType(null);
        }}
        className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
      >
        Clear Filters
      </button>

      {selectedStatus && (
        <span className="tag">
          {selectedStatus}
          <button onClick={() => setSelectedStatus(null)}>×</button>
        </span>
      )}

      {Object.keys(filteredJobsByStatus).length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          No jobs match your filters. Try adjusting your search or clearing filters.
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(filteredJobsByStatus).map(([status, jobs]) => (
            <JobColumn key={status} title={status} jobs={jobs} />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default JobBoard;
