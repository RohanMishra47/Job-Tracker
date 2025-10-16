import { type FilterState } from '../JobBoard';
import { ActiveFilter } from './ActiveFilter';
import { DATE_LABELS, FILTER_CONFIG } from './types';

type ActiveFiltersProps = {
  searchQuery: string;
  searchQueryInput: string;
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setSearchQueryInput: (query: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
};

export const ActiveFilters = ({
  searchQuery,
  filters,
  setSearchQuery,
  setSearchQueryInput,
  setFilters,
}: ActiveFiltersProps) => {
  const handleRemoveFilter = (filterKey: string, value: string) => {
    if (filterKey === 'searchQuery') {
      setSearchQuery('');
      setSearchQueryInput('');
      return;
    }

    setFilters((prev) => {
      const config = Object.values(FILTER_CONFIG).find((c) => c.key === filterKey);

      if (!config) return prev;

      if (config.isArray) {
        const current = prev[filterKey as keyof FilterState];
        return {
          ...prev,
          [filterKey]: Array.isArray(current)
            ? current.filter((item: string) => item !== value)
            : [],
        };
      } else {
        return {
          ...prev,
          [filterKey]: '',
        };
      }
    });
  };

  const getFilterValue = (key: string) => {
    if (key === 'searchQuery') return searchQuery;
    return filters[key as keyof FilterState];
  };

  return (
    <div className="space-y-2">
      {Object.entries(FILTER_CONFIG).map(([filterId, config]) => {
        const rawValue = getFilterValue(config.key);
        let value: string | string[] = '';

        if (typeof rawValue === 'string') {
          if (config.key === 'date') {
            value = DATE_LABELS[rawValue] ?? rawValue;
          } else {
            value = rawValue;
          }
        } else if (Array.isArray(rawValue)) {
          value = rawValue;
        } else if (typeof rawValue === 'boolean') {
          value = rawValue ? 'Yes' : 'No';
        } else if (
          rawValue &&
          typeof rawValue === 'object' &&
          'min' in rawValue &&
          'max' in rawValue
        ) {
          const { min, max } = rawValue;
          value = [`Min: ${min ?? ''}`, `Max: ${max ?? ''}`].filter(
            (v) => v !== 'Min: ' && v !== 'Max: '
          );
        }

        return (
          <ActiveFilter
            key={filterId}
            label={config.label}
            values={value}
            onRemove={(val) => handleRemoveFilter(config.key, val)}
          />
        );
      })}
    </div>
  );
};
