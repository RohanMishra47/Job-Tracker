export function capitalize(word: unknown): string {
  if (typeof word !== 'string') return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}
