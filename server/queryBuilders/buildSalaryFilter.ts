export function buildSalaryFilter(min?: string, max?: string) {
  const filter: Record<string, any> = {};

  if (min || max) {
    filter.salary = {};
    if (min) filter.salary.$gte = Number(min);
    if (max) filter.salary.$lte = Number(max);
  }

  return filter;
}
