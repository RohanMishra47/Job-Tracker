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
    <div className={`flex flex-wrap items-center gap-2 mb-2 ${className}`}>
      <span className="font-semibold text-sm text-gray-500">{label}:</span>

      {Array.isArray(values) ? (
        values.map((value) => (
          <span key={value} className="tag transition-opacity duration-300 ease-in-out opacity-100">
            {value}
            <button
              onClick={() => onRemove(value)}
              aria-label={`Remove ${value} filter`}
              className="ml-1"
            >
              <X size={14} />
            </button>
          </span>
        ))
      ) : (
        <span className="tag transition-opacity duration-300 ease-in-out opacity-100">
          {values}
          <button
            onClick={() => onRemove(values)}
            aria-label={`Remove ${values} filter`}
            className="ml-1"
          >
            <X size={14} />
          </button>
        </span>
      )}
    </div>
  );
};
