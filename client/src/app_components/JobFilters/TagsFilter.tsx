import Select, { type MultiValue } from 'react-select';

type TagsFilterProps = {
  allTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
};

type OptionType = { label: string; value: string };

export function TagsFilter({ allTags, selectedTags, onChange }: TagsFilterProps) {
  const options = allTags.map((tag) => ({ label: tag, value: tag }));

  const selectedOptions = options.filter((opt) => selectedTags.includes(opt.value));

  const handleChange = (selected: MultiValue<OptionType>) => {
    const values = selected ? selected.map((opt: OptionType) => opt.value) : [];
    onChange(values);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Tags</label>
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder="Select tags..."
        className="text-sm"
      />
    </div>
  );
}
