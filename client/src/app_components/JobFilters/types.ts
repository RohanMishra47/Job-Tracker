import type { FilterState } from '../JobBoard';

// Types for JobFilters component
export type FilterOption = {
  label: string;
  value: string;
};

// Define the structure of each filter group
export type FilterGroup = {
  key: keyof FilterState;
  label: string;
  options: FilterOption[];
};

// Props for the JobFilters component
export type JobFiltersProps = {
  filters: FilterState; // ✅ one source of truth
  onFilterChange: (filters: FilterState) => void;
  onClearAll: () => void;
};

// Predefined filter groups and their options
export const FILTER_GROUPS: FilterGroup[] = [
  {
    key: 'priorities',
    label: 'Priority',
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
    ],
  },
  {
    key: 'jobTypes',
    label: 'Job Type',
    options: [
      { label: 'Full-time', value: 'full-time' },
      { label: 'Part-time', value: 'part-time' },
      { label: 'Remote', value: 'remote' },
      { label: 'Internship', value: 'internship' },
    ],
  },
  {
    key: 'statuses',
    label: 'Status',
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Applied', value: 'applied' },
      { label: 'Interviewing', value: 'interviewing' },
      { label: 'Offer', value: 'offer' },
      { label: 'Rejected', value: 'rejected' },
    ],
  },
  {
    key: 'experienceLevel',
    label: 'Experience Level',
    options: [
      { label: 'Junior', value: 'junior' },
      { label: 'Mid', value: 'mid' },
      { label: 'Senior', value: 'senior' },
    ],
  },
  {
    key: 'sources',
    label: 'Source',
    options: [
      { label: 'LinkedIn', value: 'LinkedIn' },
      { label: 'Referral', value: 'Referral' },
      { label: 'Company Site', value: 'Company Site' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    key: 'date',
    label: 'Date',
    options: [
      { label: 'Next 7 days', value: 'next7' },
      { label: 'Next 30 days', value: 'next30' },
      { label: 'Overdue', value: 'overdue' },
      { label: 'No deadline', value: 'none' },
    ],
  },
] as const;

// creating a configuration object to dynamically render all active filters
export const FILTER_CONFIG = {
  search: {
    key: 'searchQuery',
    label: 'Search',
    isArray: false,
  },
  statuses: {
    key: 'statuses',
    label: 'Status',
    isArray: true,
  },
  jobTypes: {
    key: 'jobTypes',
    label: 'Job Type',
    isArray: true,
  },
  priorities: {
    key: 'priorities',
    label: 'Priority',
    isArray: true,
  },
  experienceLevel: {
    key: 'experienceLevel',
    label: 'Experience Level',
    isArray: true,
  },
  sources: {
    key: 'sources',
    label: 'Source',
    isArray: true,
  },
  date: {
    key: 'date',
    label: 'Date',
    isArray: false,
  },
  isFavorite: {
    key: 'isFavorite',
    label: 'Favorites',
    isArray: false,
  },
} as const;

export const DATE_LABELS: Record<string, string> = {
  none: 'No Deadline',
  next7: 'Next 7 Days',
  next30: 'Next 30 Days',
  overdue: 'Overdue',
};
