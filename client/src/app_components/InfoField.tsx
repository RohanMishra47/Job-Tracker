import { capitalize } from '@/utils/capitalize';

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  const isString = typeof value === 'string';
  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <div className="border-b border-border w-full" />
      <span className="text-base font-semibold text-foreground">
        {isString ? capitalize(value) : (value ?? 'N/A')}
      </span>
    </div>
  );
}
export default InfoField;
