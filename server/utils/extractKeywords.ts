const stopwords = require("stopwords-en"); // or use your own list

export const extractKeywords = (text: string): string[] => {
  if (!text) return [];

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopwords.includes(word));
};
