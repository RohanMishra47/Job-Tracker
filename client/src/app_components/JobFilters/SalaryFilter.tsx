import { DollarSign } from 'lucide-react';

type SalaryFilterProps = {
  salary: { min: number | null; max: number | null };
  onChange: (salary: { min: number | null; max: number | null }) => void;
};

export function SalaryFilter({ salary, onChange }: SalaryFilterProps) {
  return (
    <div className="flex flex-col gap-3 mt-2.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
        <DollarSign size={16} className="text-gray-500" />
        Salary Range
      </label>
      <div className="flex gap-2.5">
        <div className="relative flex-1">
          <input
            type="number"
            placeholder="Min"
            value={salary.min ?? ''}
            onChange={(e) =>
              onChange({
                ...salary,
                min: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center text-gray-400 text-sm font-medium">—</div>
        <div className="relative flex-1">
          <input
            type="number"
            placeholder="Max"
            value={salary.max ?? ''}
            onChange={(e) =>
              onChange({
                ...salary,
                max: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  );
}
