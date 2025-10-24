type FitBreakdown = {
  skillsMatch: number; // % of required skills found
  experienceMatch: number; // % relevance based on roles, years, seniority
  keywordOverlap: number; // % of job keywords found in resume
  suggestions: string[]; // Tips to improve resume fit
};

import { extractKeywords } from "./extractKeywords";
import { matchExperience } from "./matchExperience";
import { matchSkills } from "./matchSkills";

export const analyzeFit = (
  resumeText: string,
  jobText: string
): FitBreakdown => {
  const jobKeywords = extractKeywords(jobText);
  const resumeKeywords = extractKeywords(resumeText);

  const skillsScore = matchSkills(resumeText, jobText);
  const experienceScore = matchExperience(resumeText, jobText);

  const overlapCount = jobKeywords.filter((k) =>
    resumeKeywords.includes(k)
  ).length;
  const keywordOverlap = Math.round((overlapCount / jobKeywords.length) * 100);

  const suggestions: string[] = [];

  if (skillsScore < 70)
    suggestions.push("Add more relevant skills from the job description.");
  if (experienceScore < 60)
    suggestions.push(
      "Highlight roles and achievements that match the job level."
    );
  if (keywordOverlap < 50)
    suggestions.push(
      "Include more keywords from the job post to improve visibility."
    );

  return {
    skillsMatch: skillsScore,
    experienceMatch: experienceScore,
    keywordOverlap,
    suggestions,
  };
};
