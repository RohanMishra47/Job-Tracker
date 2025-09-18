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

type FilterPreset = {
  name: string;
  searchQuery: string;
  statuses: string[];
  jobTypes: string[];
};

const allStatuses = ['applied', 'pending', 'interviewing', 'offer', 'rejected'];
const allJobTypes = ['internship', 'full-time', 'part-time', 'remote'];

const JobBoard: React.FC = () => {
  const [jobs, setJobs] = useState<JobMap>({});
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const getInitialFilters = () => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    const status = params.get('status')?.split(',').filter(Boolean) || [];
    const type = params.get('type')?.split(',').filter(Boolean) || [];

    return { search, status, type };
  };

  const initialFilters = getInitialFilters();

  const [searchQueryInput, setSearchQueryInput] = useState(initialFilters.search);
  const [searchQuery, setSearchQuery] = useState(initialFilters.search);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialFilters.status);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(initialFilters.type);
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem('jobFilterPresets');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('jobFilterPresets', JSON.stringify(presets));
  }, [presets]);

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
    setIsInitialized(true);
  }, []);

  const debouncedUpdate = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 250),
    []
  );

  useEffect(() => {
    debouncedUpdate(searchQueryInput);

    return () => {
      debouncedUpdate.cancel();
    };
  }, [searchQueryInput, debouncedUpdate]);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesSearch =
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.position.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(job.status);

      const matchesJobType =
        selectedJobTypes.length === 0 || selectedJobTypes.includes(job.jobType);

      return matchesSearch && matchesStatus && matchesJobType;
    });
  }, [allJobs, searchQuery, selectedStatuses, selectedJobTypes]);

  const filteredJobsByStatus = useMemo(() => {
    const grouped: Record<string, Job[]> = {};
    filteredJobs.forEach((job) => {
      if (!grouped[job.status]) grouped[job.status] = [];
      grouped[job.status].push(job);
    });
    return grouped;
  }, [filteredJobs]);

  // Only update URL after initialization to avoid overwriting initial URL params
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();

    if (searchQuery) params.set('search', searchQuery);
    if (selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));
    if (selectedJobTypes.length > 0) params.set('type', selectedJobTypes.join(','));

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, selectedStatuses, selectedJobTypes, isInitialized]);

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

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedJobTypes([]);
    setSearchQuery('');
    setSearchQueryInput(''); // Also clear the input
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search by company or position"
        value={searchQueryInput}
        onChange={(e) => setSearchQueryInput(e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
      />

      {allStatuses.map((status) => (
        <label key={status} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedStatuses.includes(status)}
            onChange={(e) => {
              setSelectedStatuses((prev) =>
                e.target.checked ? [...prev, status] : prev.filter((s) => s !== status)
              );
            }}
          />
          {status}
        </label>
      ))}

      {allJobTypes.map((jobType) => (
        <label key={jobType} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedJobTypes.includes(jobType)}
            onChange={(e) => {
              setSelectedJobTypes((prev) =>
                e.target.checked ? [...prev, jobType] : prev.filter((s) => s !== jobType)
              );
            }}
          />
          {jobType}
        </label>
      ))}

      <button onClick={clearAllFilters}>Clear All Filters</button>

      {searchQuery && (
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-gray-500">Search:</span>
          <span className="tag transition-opacity duration-300 ease-in-out opacity-100">
            {searchQuery}
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchQueryInput(''); // Also clear the input
              }}
            >
              ×
            </button>
          </span>
        </div>
      )}

      {selectedStatuses.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-gray-500">Status:</span>
          {selectedStatuses.map((status) => (
            <span
              key={status}
              className="tag transition-opacity duration-300 ease-in-out opacity-100"
            >
              {status}
              <button
                onClick={() => setSelectedStatuses((prev) => prev.filter((s) => s !== status))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {selectedJobTypes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-gray-500">Job Type:</span>
          {selectedJobTypes.map((type) => (
            <span
              key={type}
              className="tag transition-opacity duration-300 ease-in-out opacity-100"
            >
              {type}
              <button onClick={() => setSelectedJobTypes((prev) => prev.filter((t) => t !== type))}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <select
        onChange={(e) => {
          const selected = presets.find((p) => p.name === e.target.value);
          if (selected) {
            setSearchQuery(selected.searchQuery);
            setSearchQueryInput(selected.searchQuery); // Sync input as well
            setSelectedStatuses(selected.statuses);
            setSelectedJobTypes(selected.jobTypes);
          }
        }}
      >
        <option value="">Select Preset</option>
        {presets.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      <ul className="space-y-2">
        {presets.map((p) => (
          <li key={p.name} className="flex items-center gap-2">
            <span>{p.name}</span>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => setPresets((prev) => prev.filter((preset) => preset.name !== p.name))}
            >
              x
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          const name = prompt('Name this preset');
          if (!name) return;

          const newPreset: FilterPreset = {
            name,
            searchQuery,
            statuses: selectedStatuses,
            jobTypes: selectedJobTypes,
          };

          setPresets((prev) => [...prev, newPreset]);
        }}
      >
        Save Current Filters
      </button>

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
