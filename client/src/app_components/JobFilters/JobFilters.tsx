import { FILTER_GROUPS, type JobFiltersProps } from './types';

export const JobFilters = ({
  priorities: selectedPriorities,
  jobTypes: selectedJobTypes,
  statuses: selectedStatuses,
  onFilterChange,
}: JobFiltersProps) => {
  // Handle filter changes for any group
  const handleFilterChange = (groupKey: string, value: string, isChecked: boolean) => {
    onFilterChange({
      priorities:
        groupKey === 'priorities'
          ? isChecked
            ? [...selectedPriorities, value]
            : selectedPriorities.filter((p) => p !== value)
          : selectedPriorities,
      jobTypes:
        groupKey === 'jobTypes'
          ? isChecked
            ? [...selectedJobTypes, value]
            : selectedJobTypes.filter((t) => t !== value)
          : selectedJobTypes,
      statuses:
        groupKey === 'statuses'
          ? isChecked
            ? [...selectedStatuses, value]
            : selectedStatuses.filter((s) => s !== value)
          : selectedStatuses,
    });
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800">Filters</h3>

      {FILTER_GROUPS.map((group) => (
        <div key={group.key} className="space-y-3">
          <h4 className="text-sm font-medium text-gray-600 capitalize">{group.label}</h4>

          <div className={`flex gap-3 ${group.key === 'statuses' ? 'flex-wrap' : 'flex-col'}`}>
            {group.options.map((option) => {
              const isChecked =
                group.key === 'priorities'
                  ? selectedPriorities.includes(option.value)
                  : group.key === 'jobTypes'
                    ? selectedJobTypes.includes(option.value)
                    : selectedStatuses.includes(option.value);

              return (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleFilterChange(group.key, option.value, e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() =>
            onFilterChange({
              priorities: [],
              jobTypes: [],
              statuses: [],
            })
          }
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
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
  );
};
