import { useFitScoreStore } from '@/store/useFitScoreStore';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { AxiosError } from 'axios';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../instances/axiosInstance';
import JobColumn from './JobColumn';
import { ActiveFilters } from './JobFilters/ActiveFilters';
import { ArrayFilters } from './JobFilters/ArrayFilters';
import { SalaryFilter } from './JobFilters/SalaryFilter';
import { SearchBar } from './JobFilters/SearchBarFilter';
import { TagsFilter } from './JobFilters/TagsFilter';
import { FILTER_GROUPS } from './JobFilters/types';
import PresetDropdown from './PresetDropdown';
import ResumeUploader from './ResumeUploader';

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

export type FilterPreset = {
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
  sortBy: 'newest' | 'oldest';
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

export type FitScoreResult = {
  score: number;
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    keywordOverlap: number;
  };
  suggestions: string[];
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
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem('jobFilterPresets');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPreset, setSelectedPreset] = useState<FilterPreset | null>(null);
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
  const setResumeText = useFitScoreStore((s) => s.setResumeText);
  const setFitScores = useFitScoreStore((s) => s.setFitScores);

  // resume upload handler
  const handleResumeUploaded = async (text: string) => {
    setResumeText(text);
    const skippedJobs = allJobs
      .filter((job) => !job.description || job.description.trim().length === 0)
      .map((job) => ({
        id: job._id,
        company: job.company || 'Untitled Company',
      }));

    const validJobs = allJobs.filter((job) => job.description && job.description.trim().length > 0);

    // Log summary
    console.log(
      `📊 Processing ${validJobs.length} of ${allJobs.length} jobs (${skippedJobs.length} skipped)`
    );

    // Log skipped jobs if any
    if (skippedJobs.length > 0) {
      console.log('⚠️ Jobs with missing descriptions:');
      skippedJobs.forEach((job) => {
        console.log(`  - ID: ${job.id}, Company: "${job.company}"`);
      });
    }
    const scores: Record<string, FitScoreResult> = {};

    for (const job of validJobs) {
      console.log('📤 Sending to /fit-score:', {
        resumeTextLength: text.length,
        jobId: job._id,
        jobTitle: job.position, // for debugging
      });

      const res = await api.post('/fit-score', {
        resumeText: text,
        jobId: job._id,
      });
      scores[job._id] = res.data;
    }
    console.log('🎯 Fit scores to save:', scores);
    console.log('🔑 Job IDs:', Object.keys(scores));
    setFitScores(scores);
    console.log('✅ Scores after saving:', useFitScoreStore.getState().fitScores);
  };

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

      setAllJobs((prevAllJobs) =>
        prevAllJobs.map((job) => (job._id === moved._id ? { ...job, status: destColumn } : job))
      );
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
    if (selectedPreset) {
      setSearchQuery(selectedPreset.searchQuery);
      setSearchQueryInput(selectedPreset.searchQuery);
      setFilters({
        priorities: selectedPreset.priorities,
        jobTypes: selectedPreset.jobTypes,
        statuses: selectedPreset.statuses,
        experienceLevel: selectedPreset.experienceLevel,
        sources: selectedPreset.sources,
        tags: selectedPreset.tags,
        date: selectedPreset.date || '',
        isFavorite: selectedPreset.isFavorite || false,
        salary: {
          min: selectedPreset.salary?.min || null,
          max: selectedPreset.salary?.max || null,
        },
      });
      setCurrentPage(selectedPreset.page || 1);
      if (['newest', 'oldest'].includes(selectedPreset.sortBy)) {
        setSortBy(selectedPreset.sortBy);
      }
    }
  }, [selectedPreset]);

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
      {/* Resume Uploader */}
      <ResumeUploader onResumeUploaded={handleResumeUploaded} />
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
      <ActiveFilters
        searchQuery={searchQuery}
        searchQueryInput={searchQueryInput}
        filters={filters}
        setSearchQuery={setSearchQuery}
        setSearchQueryInput={setSearchQueryInput}
        setFilters={setFilters}
      />

      {/* Copy Link Button */}
      <div className="relative group inline-block mr-2">
        <button
          onClick={handleCopy}
          disabled={isDefaultFilterState()}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
            isDefaultFilterState()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95'
          }`}
        >
          {copied ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Link Copied!
            </span>
          ) : (
            'Copy Link'
          )}
        </button>
        {isDefaultFilterState() && (
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
            Apply filters to enable sharing
            <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></span>
          </span>
        )}
      </div>

      {/* Preset Dropdown */}
      <PresetDropdown
        presets={presets}
        selectedPreset={selectedPreset}
        setSelectedPreset={setSelectedPreset}
      />
      {/* Sort Buttons */}
      <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-lg shadow-sm">
        <button
          onClick={() => setSortBy('newest')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            sortBy === 'newest'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Newest
        </button>
        <button
          onClick={() => setSortBy('oldest')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            sortBy === 'oldest'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Oldest
        </button>
      </div>

      {/* Preset List */}
      <ul className="space-y-2">
        {presets.map((p) => (
          <li
            key={p.name}
            className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-150"
          >
            <span className="text-sm font-medium text-gray-700">{p.name}</span>
            <button
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-1.5 transition-all duration-150"
              onClick={() => setPresets((prev) => prev.filter((preset) => preset.name !== p.name))}
              aria-label={`Delete ${p.name} preset`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {/* Save Preset Button */}
      <button
        onClick={() => {
          const name = prompt('Name this preset');
          if (!name || name.length > 10) {
            alert('Please enter a name under 50 characters.');
            return;
          }

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
        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow active:scale-95"
      >
        Save Current Filters
      </button>

      {/* No Results Message */}
      {Object.keys(filteredJobsByStatus).length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="bg-gray-50 rounded-full p-4 mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No jobs found</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            No jobs match your current filters. Try adjusting your search criteria or clearing some
            filters.
          </p>
        </div>
      )}

      {/* Job Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {Object.entries(filteredJobsByStatus).map(([status, jobs]) => (
            <JobColumn key={status} title={status} jobs={jobs} />
          ))}
        </div>
      </DragDropContext>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Left side - Navigation */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:scale-95'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </span>
          </button>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:scale-95'
            }`}
          >
            <span className="flex items-center gap-1.5">
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </button>
        </div>

        {/* Center - Page Info */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-500 font-medium">Page</span>
          <span className="text-sm font-bold text-gray-900">{currentPage}</span>
          <span className="text-sm text-gray-400">of</span>
          <span className="text-sm font-semibold text-gray-700">{totalPages}</span>
        </div>

        {/* Right side - Total Jobs */}
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-semibold text-blue-700">{totalJobs}</span>
          <span className="text-sm text-blue-600">jobs</span>
        </div>
      </div>
    </div>
  );
};

export default JobBoard;
