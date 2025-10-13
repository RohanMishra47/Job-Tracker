import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { AxiosError } from 'axios';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../instances/axiosInstance';
import JobColumn from './JobColumn';
import { ArrayFilters } from './JobFilters/ArrayFilters';
import { SalaryFilter } from './JobFilters/SalaryFilter';
import { SearchBar } from './JobFilters/SearchBarFilter';
import { TagsFilter } from './JobFilters/TagsFilter';
import { FILTER_GROUPS } from './JobFilters/types';

// Types
type Job = {
  _id: string;
  company: string;
  position: string;
  status: string;
  jobType: string;
  location: string;
  description: string;
  salary: number | [number, number];
  experienceLevel: 'junion' | 'mid' | 'senior';
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

type FilterPreset = {
  name: string;
  searchQuery: string;
  statuses: string[];
  jobTypes: string[];
  priorities: string[];
  experienceLevel: string[];
  sources: string[];
  tags: string[];
  date?: string;
  isFavorite?: boolean;
  salary?: { min: number | null; max: number | null };
  sortBy: string;
  page: number;
  limit: number;
};

export type FilterState = {
  priorities: string[];
  jobTypes: string[];
  statuses: string[];
  experienceLevel: string[];
  sources: string[];
  tags: string[];
  date: string | '';
  isFavorite: boolean;
  salary: { min: number | null; max: number | null };
};

const allStatuses =
  FILTER_GROUPS.find((g) => g.key === 'statuses')?.options.map((o) => o.value) ?? [];

const JobBoard: React.FC = () => {
  // Helper functions
  const getInitialFilters = () => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    const status = params.get('status')?.split(',').filter(Boolean);
    const type = params.get('type')?.split(',').filter(Boolean);
    const priority = params.get('priority')?.split(',').filter(Boolean);
    const sort = params.get('sort') === 'oldest' ? 'oldest' : 'newest';
    const experienceLevel = params.get('experienceLevel')?.split(',').filter(Boolean);
    const tags = params.get('tags')?.split(',').filter(Boolean);
    const date = params.get('date');
    const isFavorite = params.get('isFavorite') === 'true';
    const salary = {
      min: params.get('salaryMin') ? parseInt(params.get('salaryMin') ?? '', 10) : null,
      max: params.get('salaryMax') ? parseInt(params.get('salaryMax') ?? '', 10) : null,
    };
    const sources = params.get('sources')?.split(',').filter(Boolean);
    const page = params.get('page');
    const limit = params.get('limit');

    if (
      search ||
      status?.length ||
      type?.length ||
      priority?.length ||
      experienceLevel?.length ||
      sources?.length ||
      tags?.length ||
      date ||
      isFavorite ||
      salary.min !== null ||
      salary.max !== null ||
      sort ||
      page ||
      limit
    ) {
      return {
        search: search || '',
        status: status || [],
        type: type || [],
        priority: priority || [],
        experienceLevel: experienceLevel || [],
        sources: sources || [],
        tags: tags || [],
        date: date || '',
        isFavorite: isFavorite || false,
        salary: {
          min: salary.min !== null ? salary.min : undefined,
          max: salary.max !== null ? salary.max : undefined,
        },
        sort: sort || 'newest',
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      };
    }

    const saved = localStorage.getItem('activeFilters');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        search: parsed.searchQuery || '',
        status: parsed.selectedStatuses || [],
        type: parsed.selectedJobTypes || [],
        priority: parsed.selectedPriorities || [],
        experienceLevel: parsed.selectedExperienceLevels || [],
        sources: parsed.selectedSources || [],
        tags: parsed.selectedTags || [],
        date: parsed.date || '',
        isFavorite: parsed.isFavorite || false,
        salary: {
          min: parsed.salary?.min || undefined,
          max: parsed.salary?.max || undefined,
        },
        sort: parsed.sortBy || 'newest',
        page: parsed.currentPage ? parseInt(parsed.currentPage, 10) : 1,
        limit: parsed.limit ? parseInt(parsed.limit, 10) : 10,
      };
    }

    return {
      search: '',
      status: [],
      type: [],
      priority: [],
      experienceLevel: [],
      sources: [],
      tags: [],
      date: '',
      isFavorite: false,
      salary: { min: null, max: null },
      sort: 'newest',
      page: 1,
      limit: 10,
    };
  };

  const initialFilters = getInitialFilters();

  // State declarations
  const [jobs, setJobs] = useState<JobMap>({});
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQueryInput, setSearchQueryInput] = useState(initialFilters.search);
  const [searchQuery, setSearchQuery] = useState(initialFilters.search);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>(initialFilters.sort);
  const [currentPage, setCurrentPage] = useState<number>(initialFilters.page);
  const [limit] = useState<number>(initialFilters.limit);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  // or make it user-configurable
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem('jobFilterPresets');
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priorities: initialFilters.priority,
    jobTypes: initialFilters.type,
    statuses: initialFilters.status,
    experienceLevel: initialFilters.experienceLevel,
    sources: initialFilters.sources,
    tags: initialFilters.tags,
    date: initialFilters.date,
    isFavorite: initialFilters.isFavorite || false,
    salary: { min: initialFilters.salary.min || null, max: initialFilters.salary.max || null },
  });

  // Memoized values
  const debouncedUpdate = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 250),
    []
  );

  const filteredJobsByStatus = useMemo(() => {
    const grouped: Record<string, Job[]> = {};
    allJobs.forEach((job) => {
      if (!grouped[job.status]) grouped[job.status] = [];
      grouped[job.status].push(job);
    });
    return grouped;
  }, [allJobs]);

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
    setFilters({
      priorities: [],
      jobTypes: [],
      statuses: [],
      experienceLevel: [],
      sources: [],
      tags: [],
      date: '',
      isFavorite: false,
      salary: { min: null, max: null },
    });
    setSearchQuery('');
    setSearchQueryInput('');
    setSortBy('newest');
    setCurrentPage(1);
    localStorage.removeItem('activeFilters');
  };

  const isDefaultFilterState = () =>
    searchQuery === '' &&
    filters.statuses.length === 0 &&
    filters.jobTypes.length === 0 &&
    filters.priorities.length === 0 &&
    filters.experienceLevel.length === 0 &&
    filters.sources.length === 0 &&
    filters.tags.length === 0 &&
    filters.date === '' &&
    filters.isFavorite === false &&
    filters.salary.min === null &&
    filters.salary.max === null &&
    sortBy === 'newest';

  // Effects
  useEffect(() => {
    // API function
    const fetchJobs = async () => {
      try {
        console.log('Token read from storage:', localStorage.getItem('token'));

        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (filters.statuses.length) params.set('status', filters.statuses.join(','));
        if (filters.jobTypes.length) params.set('type', filters.jobTypes.join(','));
        if (filters.priorities.length) params.set('priority', filters.priorities.join(','));
        if (filters.experienceLevel.length)
          params.set('experienceLevel', filters.experienceLevel.join(','));
        if (filters.sources.length) params.set('sources', filters.sources.join(','));
        if (filters.tags.length) params.set('tags', filters.tags.join(','));
        if (filters.date) params.set('date', filters.date);
        if (filters.isFavorite) params.set('isFavorite', 'true');
        if (filters.salary.min !== null) params.set('salaryMin', String(filters.salary.min));
        if (filters.salary.max !== null) params.set('salaryMax', String(filters.salary.max));
        if (sortBy) params.set('sortBy', sortBy);
        if (currentPage) params.set('page', String(currentPage));
        if (limit) params.set('limit', String(limit));

        const response = await api.get(`/jobs?${params.toString()}`);

        const jobList: Job[] = response.data.jobs ?? [];
        setAllJobs(jobList);
        setTotalJobs(response.data.totalJobs);
        setTotalPages(response.data.totalPages);

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
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();
    setIsInitialized(true);
  }, [
    searchQuery,
    filters.statuses,
    filters.jobTypes,
    filters.priorities,
    filters.experienceLevel,
    filters.sources,
    filters.tags,
    filters.date,
    filters.isFavorite,
    filters.salary.min,
    filters.salary.max,
    sortBy,
    currentPage,
    limit,
  ]);

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
      statuses: filters.statuses,
      jobTypes: filters.jobTypes,
      priorities: filters.priorities,
      experienceLevel: filters.experienceLevel,
      sources: filters.sources,
      tags: filters.tags,
      date: filters.date,
      isFavorite: filters.isFavorite,
      salary: { min: filters.salary.min, max: filters.salary.max },
      sortBy,
      currentPage,
      limit,
    };

    localStorage.setItem('activeFilters', JSON.stringify(filterState));
  }, [
    searchQuery,
    filters.statuses,
    filters.jobTypes,
    filters.priorities,
    filters.experienceLevel,
    filters.sources,
    filters.tags,
    filters.date,
    filters.isFavorite,
    filters.salary.min,
    filters.salary.max,
    sortBy,
    currentPage,
    limit,
  ]);

  // Only update URL after initialization to avoid overwriting initial URL params
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();

    if (searchQuery) params.set('search', searchQuery);
    if (filters.statuses.length > 0) params.set('status', filters.statuses.join(','));
    if (filters.jobTypes.length > 0) params.set('type', filters.jobTypes.join(','));
    if (filters.priorities.length > 0) params.set('priority', filters.priorities.join(','));
    if (filters.experienceLevel.length > 0)
      params.set('experienceLevel', filters.experienceLevel.join(','));
    if (filters.sources.length > 0) params.set('sources', filters.sources.join(','));
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    if (filters.date) params.set('date', filters.date);
    if (filters.isFavorite) params.set('isFavorite', 'true');
    if (filters.salary.min !== null) params.set('salaryMin', String(filters.salary.min));
    if (filters.salary.max !== null) params.set('salaryMax', String(filters.salary.max));
    if (sortBy) params.set('sort', sortBy);
    if (currentPage) params.set('page', String(currentPage));
    if (limit) params.set('limit', String(limit));

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [
    searchQuery,
    filters.statuses,
    filters.jobTypes,
    filters.priorities,
    filters.experienceLevel,
    filters.sources,
    filters.tags,
    filters.date,
    filters.isFavorite,
    filters.salary.min,
    filters.salary.max,
    isInitialized,
    sortBy,
    currentPage,
    limit,
  ]);

  // Render
  return (
    <div>
      {/* Search Input */}
      <SearchBar value={searchQueryInput} onChange={setSearchQueryInput} />
      {/* Array Filters Component */}
      <ArrayFilters filters={filters} onFilterChange={setFilters} onClearAll={clearAllFilters} />

      {/* Tags Filter */}
      <TagsFilter
        allTags={Array.from(new Set(allJobs.flatMap((job) => job.tags)))}
        selectedTags={filters.tags}
        onChange={(newTags) => setFilters((prev) => ({ ...prev, tags: newTags }))}
      />

      {/* Salary Filter */}
      <SalaryFilter
        salary={filters.salary}
        onChange={(salary) => setFilters((prev) => ({ ...prev, salary }))}
      />

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

      {filters.statuses.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-gray-500">Status:</span>
          {filters.statuses.map((status) => (
            <span
              key={status}
              className="tag transition-opacity duration-300 ease-in-out opacity-100"
            >
              {status}
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    statuses: prev.statuses.filter((s) => s !== status),
                  }))
                }
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      {filters.jobTypes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-gray-500">Job Type:</span>
          {filters.jobTypes.map((type) => (
            <span
              key={type}
              className="tag transition-opacity duration-300 ease-in-out opacity-100"
            >
              {type}
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    jobTypes: prev.jobTypes.filter((t) => t !== type),
                  }))
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {filters.priorities.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-gray-500">Priority:</span>
          {filters.priorities.map((priority) => (
            <span
              key={priority}
              className="tag transition-opacity duration-300 ease-in-out opacity-100"
            >
              {priority}
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    priorities: prev.priorities.filter((p) => p !== priority),
                  }))
                }
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      {filters.experienceLevel.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-gray-500">Experience Level:</span>
          {filters.experienceLevel.map((level) => (
            <span
              key={level}
              className="tag transition-opacity duration-300 ease-in-out opacity-100"
            >
              {level}
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    experienceLevel: prev.experienceLevel.filter((e) => e !== level),
                  }))
                }
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      {filters.sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-gray-500">Source:</span>
          {filters.sources.map((source) => (
            <span
              key={source}
              className="tag transition-opacity duration-300 ease-in-out opacity-100"
            >
              {source}
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    sources: prev.sources.filter((s) => s !== source),
                  }))
                }
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      {filters.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-gray-500">Tags:</span>
          {filters.tags.map((tag) => (
            <span key={tag} className="tag transition-opacity duration-300 ease-in-out opacity-100">
              {tag}
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    tags: prev.tags.filter((t) => t !== tag),
                  }))
                }
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      {filters.date && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-gray-500">Date:</span>
          <span className="tag transition-opacity duration-300 ease-in-out opacity-100">
            {filters.date}
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  date: '',
                }))
              }
            >
              x
            </button>
          </span>
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
            setFilters({
              priorities: selected.priorities,
              jobTypes: selected.jobTypes,
              statuses: selected.statuses,
              experienceLevel: selected.experienceLevel,
              sources: selected.sources,
              tags: selected.tags,
              date: selected.date || '',
              isFavorite: selected.isFavorite || false,
              salary: { min: selected.salary?.min || null, max: selected.salary?.max || null },
            });
            setCurrentPage(selected.page || 1);
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
            statuses: filters.statuses,
            jobTypes: filters.jobTypes,
            priorities: filters.priorities,
            experienceLevel: filters.experienceLevel,
            sources: filters.sources,
            tags: filters.tags,
            date: filters.date,
            isFavorite: filters.isFavorite,
            salary: { min: filters.salary.min, max: filters.salary.max },
            sortBy,
            page: currentPage,
            limit: limit,
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
      <div className="flex gap-2 mt-4">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
        <span>Jobs {totalJobs}</span>
      </div>
    </div>
  );
};

export default JobBoard;
