import { capitalize } from '@/utils/capitalize';
import { motion } from 'framer-motion';

type PriorityLevel = 'low' | 'medium' | 'high' | number;

export function PriorityBadge({ level }: { level: PriorityLevel }) {
  const colorMap = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
        typeof level === 'string' && colorMap[level] ? colorMap[level] : 'bg-gray-100 text-gray-800'
      }`}
    >
      Priority: {typeof level === 'string' ? capitalize(level) : 'N/A'}
    </motion.span>
  );
}
