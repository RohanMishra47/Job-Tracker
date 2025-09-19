import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { AxiosError } from 'axios';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../instances/axiosInstance';
import JobColumn from './JobColumn';

// Types
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
  sortBy: string;
};

// Constants
const allStatuses = ['applied', 'pending', 'interviewing', 'offer', 'rejected'];
const allJobTypes = ['internship', 'full-time', 'part-time', 'remote'];

const JobBoard: React.FC = () => {
  // Helper functions
  const getInitialFilters = () => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    const status = params.get('status')?.split(',').filter(Boolean);
    const type = params.get('type')?.split(',').filter(Boolean);
    const sort = params.get('sort') === 'oldest' ? 'oldest' : 'newest';

    if (search || status?.length || type?.length || sort) {
      return {
        search: search || '',
        status: status || [],
        type: type || [],
        sort: sort || 'newest',
      };
    }

    const saved = localStorage.getItem('activeFilters');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        search: parsed.searchQuery || '',
        status: parsed.selectedStatuses || [],
        type: parsed.selectedJobTypes || [],
        sort: parsed.sortBy || '',
      };
    }

    return { search: '', status: [], type: [] };
  };

  const initialFilters = getInitialFilters();

  // State declarations
  const [jobs, setJobs] = useState<JobMap>({});
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQueryInput, setSearchQueryInput] = useState(initialFilters.search);
  const [searchQuery, setSearchQuery] = useState(initialFilters.search);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialFilters.status);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(initialFilters.type);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>(initialFilters.sort);
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem('jobFilterPresets');
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);

  // Memoized values
  const debouncedUpdate = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 250),
    []
  );

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

  // Event handlers
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedJobTypes([]);
    setSearchQuery('');
    setSearchQueryInput('');
    setSortBy('newest');
    localStorage.removeItem('activeFilters');
  };

  const isDefaultFilterState = () =>
    searchQuery === '' &&
    selectedStatuses.length === 0 &&
    selectedJobTypes.length === 0 &&
    sortBy === 'newest';

  // Effects
  useEffect(() => {
    // API function
    const fetchJobs = async () => {
      try {
        console.log('Token read from storage:', localStorage.getItem('token'));

        const params = new URLSearchParams();
        params.set('sortBy', sortBy);

        const response = await api.get(`/jobs?${params.toString()}`);

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
    fetchJobs();
    setIsInitialized(true);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('jobFilterPresets', JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    debouncedUpdate(searchQueryInput);

    return () => {
      debouncedUpdate.cancel();
    };
  }, [searchQueryInput, debouncedUpdate]);

  useEffect(() => {
    const filterState = {
      searchQuery,
      selectedStatuses,
      selectedJobTypes,
      sortBy,
    };

    localStorage.setItem('activeFilters', JSON.stringify(filterState));
  }, [searchQuery, selectedStatuses, selectedJobTypes, sortBy]);

  // Only update URL after initialization to avoid overwriting initial URL params
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();

    if (searchQuery) params.set('search', searchQuery);
    if (selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));
    if (selectedJobTypes.length > 0) params.set('type', selectedJobTypes.join(','));
    if (sortBy) params.set('sort', sortBy);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, selectedStatuses, selectedJobTypes, isInitialized, sortBy]);

  // Render
  return (
    <div>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by company or position"
        value={searchQueryInput}
        onChange={(e) => setSearchQueryInput(e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
      />

      {/* Status Filters */}
      <h3>Status Filters</h3>
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

      {/* Job Type Filters */}
      <h3>JobType Filters</h3>
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

      {/* Clear Filters Button */}
      <button onClick={clearAllFilters}>Clear All Filters</button>

      {/* Active Filter Tags */}
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
              x
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
                x
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

      {/* Copy Link Button */}
      <div className="relative group inline-block">
        <button
          onClick={handleCopy}
          disabled={isDefaultFilterState()}
          className={`px-3 py-1 text-sm rounded transition ${
            isDefaultFilterState()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {copied ? 'Link Copied!' : 'Copy Link'}
        </button>
        {isDefaultFilterState() && (
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-500 pointer-events-none">
            Apply filters to enable sharing
          </span>
        )}
      </div>

      {/* Preset Selection */}
      <select
        onChange={(e) => {
          const selected = presets.find((p) => p.name === e.target.value);
          if (selected) {
            setSearchQuery(selected.searchQuery);
            setSearchQueryInput(selected.searchQuery);
            setSelectedStatuses(selected.statuses);
            setSelectedJobTypes(selected.jobTypes);
            if (selected.sortBy === 'newest' || selected.sortBy === 'oldest') {
              setSortBy(selected.sortBy);
            }
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

      <div className="flex gap-2">
        <button
          onClick={() => setSortBy('newest')}
          className={`px-3 py-1 rounded text-sm ${
            sortBy === 'newest' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Newest
        </button>
        <button
          onClick={() => setSortBy('oldest')}
          className={`px-3 py-1 rounded text-sm ${
            sortBy === 'oldest' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Oldest
        </button>
      </div>

      {/* Preset List */}
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

      {/* Save Preset Button */}
      <button
        onClick={() => {
          const name = prompt('Name this preset');
          if (!name) return;

          const newPreset: FilterPreset = {
            name,
            searchQuery,
            statuses: selectedStatuses,
            jobTypes: selectedJobTypes,
            sortBy,
          };

          setPresets((prev) => [...prev, newPreset]);
        }}
      >
        Save Current Filters
      </button>

      {/* No Results Message */}
      {Object.keys(filteredJobsByStatus).length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          No jobs match your filters. Try adjusting your search or clearing filters.
        </div>
      )}

      {/* Job Columns */}
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
