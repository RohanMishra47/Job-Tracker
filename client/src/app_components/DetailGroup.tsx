import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

function DetailGroup({
  items,
}: {
  items: {
    label: string;
    value: React.ReactNode;
    isLink?: boolean;
  }[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {items.map(({ label, value, isLink }, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground font-medium">{label}</span>
          <div className="border-b border-border w-full" />
          {isLink ? (
            <a
              href={String(value)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 break-all"
            >
              {value}
              <ExternalLink size={14} />
            </a>
          ) : (
            <span className="text-base font-semibold text-foreground">{value}</span>
          )}
        </div>
      ))}
    </motion.div>
  );
}

export default DetailGroup;
