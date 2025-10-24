export const matchExperience = (
  resumeText: string,
  jobText: string
): number => {
  const seniorityTerms = [
    "intern",
    "fresher",
    "junior",
    "mid-level",
    "senior",
    "lead",
    "manager",
  ];
  const yearsRegex = /\b(\d{1,2})\s+(years|yrs)\s+(of\s+)?experience\b/gi;

  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobText.toLowerCase();

  let score = 50;

  // Match seniority
  const jobSeniority = seniorityTerms.find((term) => jobLower.includes(term));
  const resumeSeniority = seniorityTerms.find((term) =>
    resumeLower.includes(term)
  );
  if (jobSeniority && resumeSeniority && jobSeniority === resumeSeniority) {
    score += 20;
  }

  // Match years of experience
  const jobYearsMatch = jobLower.match(yearsRegex);
  const resumeYearsMatch = resumeLower.match(yearsRegex);
  if (jobYearsMatch && resumeYearsMatch) {
    const jobYears = parseInt(jobYearsMatch[0]);
    const resumeYears = parseInt(resumeYearsMatch[0]);
    if (resumeYears >= jobYears) score += 30;
  }

  return Math.min(score, 100);
};
