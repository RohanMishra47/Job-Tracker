export function buildArrayFilter(
  key: string,
  raw: string | string[]
): Record<string, any> {
  const values = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
    ? raw
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

  return values.length ? { [key]: { $in: values } } : {};
}
