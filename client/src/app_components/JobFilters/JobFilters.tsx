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
    </div>
  );
};
