import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { type FilterPreset } from './JobBoard';

type PresetDropdownProps = {
  presets: FilterPreset[];
  selectedPreset: FilterPreset | null;
  setSelectedPreset: React.Dispatch<React.SetStateAction<FilterPreset | null>>;
};

function PresetDropdown({ presets, selectedPreset, setSelectedPreset }: PresetDropdownProps) {
  return (
    <div className="flex flex-col gap-1 w-full max-w-xs">
      <label
        htmlFor="preset-select"
        className="text-xs font-semibold uppercase tracking-wide text-gray-500"
      >
        Preset Selection
      </label>

      <Listbox value={selectedPreset} onChange={setSelectedPreset}>
        <div className="relative">
          <ListboxButton className="w-full rounded-xl border border-gray-200 bg-white/90 px-4 py-2 pr-10 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 hover:border-gray-300 hover:shadow">
            {selectedPreset?.name || 'Select Preset'}
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
              <ChevronDown className="h-4 w-4" />
            </span>
          </ListboxButton>

          <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
            {presets.map((preset: FilterPreset) => (
              <ListboxOption
                key={preset.name}
                value={preset}
                className={({ active }) =>
                  `cursor-pointer select-none px-4 py-2 ${
                    active ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                  }`
                }
              >
                {({ selected }) => (
                  <span className="flex items-center justify-between">
                    {preset.name}
                    {selected && <Check className="h-4 w-4 text-blue-500" />}
                  </span>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
}
export default PresetDropdown;
