import { X } from 'lucide-react';

type ActiveFilterProps = {
  label: string;
  values: string | string[];
  onRemove: (value: string) => void;
  className?: string;
};

export const ActiveFilter = ({ label, values, onRemove, className = '' }: ActiveFilterProps) => {
  if (!values || (Array.isArray(values) && values.length === 0)) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 mb-3 ${className}`}>
      <span className="font-medium text-xs uppercase tracking-wide text-gray-600">{label}:</span>

      {Array.isArray(values) ? (
        values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 transition-all duration-200 ease-in-out hover:bg-blue-100 hover:border-blue-300 shadow-sm"
          >
            {value}
            <button
              onClick={() => onRemove(value)}
              aria-label={`Remove ${value} filter`}
              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-150"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </span>
        ))
      ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 transition-all duration-200 ease-in-out hover:bg-blue-100 hover:border-blue-300 shadow-sm">
          {values}
          <button
            onClick={() => onRemove(values)}
            aria-label={`Remove ${values} filter`}
            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-150"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </span>
      )}
    </div>
  );
};
