import { useRef, useState } from 'react';
import type { FilterState } from '../JobBoard';
import { FILTER_GROUPS, type JobFiltersProps } from './types';

export const ArrayFilters = ({ filters, onFilterChange, onClearAll }: JobFiltersProps) => {
  const [open, setOpen] = useState(true);
  const filterRef = useRef<HTMLDivElement>(null);

  // Smooth scroll into view when opening filters
  const handleToggleFilters = (isOpening: boolean) => {
    setOpen(isOpening);
    if (isOpening && filterRef.current) {
      setTimeout(() => {
        filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  // Handle changes for checkboxes and radio buttons
  const handleFilterChange = (
    groupKey: keyof FilterState,
    value: string | boolean,
    isChecked?: boolean
  ) => {
    if (groupKey === 'isFavorite') {
      onFilterChange({ ...filters, isFavorite: value as boolean });
      return;
    }
    if (groupKey === 'date') {
      onFilterChange({ ...filters, date: value as string });
      return;
    }
    onFilterChange({
      ...filters,
      [groupKey]: isChecked
        ? [...(filters[groupKey] as string[]), value as string]
        : (filters[groupKey] as string[]).filter((v) => v !== value),
    });
  };

  const activeCount =
    (Array.isArray(filters.statuses) ? filters.statuses.length : 0) +
    (Array.isArray(filters.priorities) ? filters.priorities.length : 0) +
    (Array.isArray(filters.sources) ? filters.sources.length : 0) +
    (Array.isArray(filters.jobTypes) ? filters.jobTypes.length : 0) +
    (Array.isArray(filters.experienceLevel) ? filters.experienceLevel.length : 0) +
    (Array.isArray(filters.tags) ? filters.tags.length : 0) +
    (filters.date ? 1 : 0) +
    (filters.isFavorite ? 1 : 0) +
    (filters.salary.min ? 1 : 0) +
    (filters.salary.max ? 1 : 0);

  return (
    <>
      {/* Main filters container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200" ref={filterRef}>
        {/* Sticky summary bar (desktop) */}
        <div className="sticky top-20 z-20 bg-white/90 backdrop-blur-sm border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
            <span className="text-xs text-gray-500">
              {activeCount > 0 ? `${activeCount} active` : 'No active filters'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggleFilters(!open)}
              className="text-sm text-gray-700 hover:text-purple-700 px-2 py-1 rounded transition hidden md:inline-block"
              aria-expanded={open}
              aria-controls="filters-panel"
            >
              {open ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Collapsible panel */}
        <div
          id="filters-panel"
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-6 p-4">
              {FILTER_GROUPS.map((group) => (
                <div key={group.key} className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-600 capitalize">{group.label}</h4>
                  <div
                    className={`flex gap-3 ${group.key === 'statuses' ? 'flex-wrap' : 'flex-col'}`}
                  >
                    {group.options.map((option) => {
                      const isChecked =
                        group.key === 'date'
                          ? filters.date === option.value
                          : (filters[group.key] as string[]).includes(option.value);

                      return (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type={group.key === 'date' ? 'radio' : 'checkbox'}
                            name={group.key}
                            checked={isChecked}
                            onChange={(e) =>
                              handleFilterChange(group.key, option.value, e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Favorites toggle */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFavorite"
                    checked={filters.isFavorite}
                    onChange={(e) => handleFilterChange('isFavorite', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show Favorites Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end">
          <button
            onClick={onClearAll}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Floating toggle (mobile only) - OUTSIDE the main container */}
      <button
        onClick={() => handleToggleFilters(!open)}
        className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-purple-700 transition md:hidden font-medium text-sm"
      >
        {open ? 'Hide Filters' : 'Show Filters'}
      </button>
    </>
  );
};
