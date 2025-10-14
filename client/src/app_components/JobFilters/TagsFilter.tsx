import Select, { type MultiValue, type StylesConfig } from 'react-select';

type TagsFilterProps = {
  allTags: string[]; // List of all available tags
  selectedTags: string[]; // List of currently selected tags
  onChange: (tags: string[]) => void; // Callback to update selected tags when user interacts
};

type OptionType = { label: string; value: string }; // Type for react-select options

export function TagsFilter({ allTags, selectedTags, onChange }: TagsFilterProps) {
  // Component for filterring jobs by tags
  // Transform tags into react-select options
  const options = allTags.map((tag) => ({ label: tag, value: tag }));

  // Determine which options are currently selected
  const selectedOptions = options.filter((opt) => selectedTags.includes(opt.value));

  // Handle changes in selection
  const handleChange = (selected: MultiValue<OptionType>) => {
    // selected is a parameter of type MultiValue<OptionType>, which means: It could be an array of { label, value } objects.
    const values = selected ? selected.map((opt: OptionType) => opt.value) : [];
    onChange(values);
  };

  // Custom styles for react-select to match the application's design
  const customStyles: StylesConfig<OptionType, true> = {
    control: (base) => ({
      ...base,
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      backgroundColor: '#ffffff',
      padding: '0.25rem',
      boxShadow: 'none',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      '&:hover': {
        borderColor: '#d1d5db',
        backgroundColor: '#f9fafb',
      },
      '&:focus-within': {
        borderColor: '#a855f7',
        boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.1)',
      },
    }),
    input: (base) => ({
      ...base,
      color: '#111827',
      fontSize: '0.875rem',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
      fontSize: '0.875rem',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#f3e8ff',
      borderRadius: '0.375rem',
      padding: '0.125rem 0.375rem',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#6b21a8',
      fontSize: '0.875rem',
      fontWeight: '500',
      padding: '0.25rem 0.375rem',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#a855f7',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      '&:hover': {
        backgroundColor: '#ddd6fe',
        color: '#6b21a8',
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      marginTop: '0.5rem',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#a855f7' : state.isFocused ? '#f3e8ff' : '#ffffff',
      color: state.isSelected ? '#ffffff' : '#111827',
      cursor: 'pointer',
      fontSize: '0.875rem',
      padding: '0.625rem 0.75rem',
      transition: 'all 0.15s ease',
      '&:active': {
        backgroundColor: '#a855f7',
      },
    }),
    menuList: (base) => ({
      ...base,
      padding: '0.5rem 0',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#9ca3af',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: '#6b21a8',
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#9ca3af',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      '&:hover': {
        color: '#6b21a8',
      },
    }),
  };

  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-2">
        Tags
      </label>
      <Select
        isMulti // Enable multi-select
        options={options} // All available tag options
        value={selectedOptions} // Currently selected options
        onChange={handleChange} // Handle selection changes
        placeholder="Select tags..."
        styles={customStyles} // Apply custom styles
        classNamePrefix="react-select" // Prefix for custom class names
        isClearable // Enable clearable
        isSearchable // Enable search functionality
      />
    </div>
  );
}
