import { motion } from 'framer-motion';

export function DetailCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition"
    >
      <div className="text-sm text-muted-foreground font-medium mb-1">{label}</div>
      <div className="text-base font-semibold text-foreground">{value}</div>
    </motion.div>
  );
}
