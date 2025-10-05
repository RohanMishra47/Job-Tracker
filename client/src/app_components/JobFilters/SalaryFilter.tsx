type SalaryFilterProps = {
  salary: { min: number | null; max: number | null };
  onChange: (salary: { min: number | null; max: number | null }) => void;
};

export function SalaryFilter({ salary, onChange }: SalaryFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Salary Range</label>
      <div className="flex gap-2">
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
          className="border rounded px-2 py-1 w-24"
        />
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
          className="border rounded px-2 py-1 w-24"
        />
      </div>
    </div>
  );
}
