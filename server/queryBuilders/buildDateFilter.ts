export function buildDateFilter(dateKey: string): Record<string, any> {
  const now = new Date();

  switch (dateKey) {
    case "next7": {
      const next7 = new Date();
      next7.setDate(now.getDate() + 7);
      return { deadline: { $gte: now, $lte: next7 } };
    }
    case "next30": {
      const next30 = new Date();
      next30.setDate(now.getDate() + 30);
      return { deadline: { $gte: now, $lte: next30 } };
    }
    case "overdue":
      return { deadline: { $lt: now } };
    case "none":
      return { deadline: { $exists: false } };
    default:
      return {}; // no filter applied
  }
}
