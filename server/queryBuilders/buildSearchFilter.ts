export function buildSearchFilter(searchQuery: string): Record<string, any> {
  if (!searchQuery?.trim()) return {};

  const regex = new RegExp(searchQuery.trim(), "i"); // case-insensitive partial match

  return {
    $or: [{ company: regex }, { position: regex }, { location: regex }],
  };
}
