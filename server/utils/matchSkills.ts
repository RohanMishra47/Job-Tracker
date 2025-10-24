const extractSkillPhrases = (text: string): string[] => {
  const skillRegex =
    /\b(JavaScript|React|Node\.js|TypeScript|Python|SQL|Docker|AWS|Tailwind|Figma|Git)\b/gi;
  return Array.from(new Set(text.match(skillRegex) || [])).map((s) =>
    s.toLowerCase()
  );
};

export const matchSkills = (resumeText: string, jobText: string): number => {
  const jobSkills = extractSkillPhrases(jobText);
  const resumeSkills = extractSkillPhrases(resumeText);

  const matched = jobSkills.filter((skill) => resumeSkills.includes(skill));
  const score = Math.round((matched.length / jobSkills.length) * 100);

  return score;
};
