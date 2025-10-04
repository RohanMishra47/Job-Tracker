// Types for JobFilters component
export type FilterOption = {
  label: string;
  value: string;
};

export type FilterGroup = {
  key: string;
  label: string;
  options: FilterOption[];
};

export type JobFiltersProps = {
  priorities: string[];
  jobTypes: string[];
  statuses: string[];
  experienceLevel: string[];
  sources: string[];
  onFilterChange: (filters: {
    priorities: string[];
    jobTypes: string[];
    statuses: string[];
    experienceLevel: string[];
    sources: string[];
  }) => void;
  onClearAll: () => void;
};

// Filter groups configuration
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
] as const;
