import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FitScoreResult = {
  score: number;
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    keywordOverlap: number;
  };
  suggestions: string[];
};

type FitScoreStore = {
  resumeText: string;
  fitScores: Record<string, FitScoreResult>;
  setResumeText: (text: string) => void;
  setFitScores: (scores: Record<string, FitScoreResult>) => void;
  getFitScore: (jobId: string) => FitScoreResult | undefined;
  clearFitScores: () => void;
};

export const useFitScoreStore = create<FitScoreStore>()(
  persist(
    (set, get) => ({
      resumeText: '',
      fitScores: {},
      setResumeText: (text) => set({ resumeText: text }),
      setFitScores: (scores) => set({ fitScores: scores }),
      getFitScore: (jobId) => get().fitScores[jobId],
      clearFitScores: () => set({ fitScores: {}, resumeText: '' }),
    }),
    {
      name: 'fit-score-storage', // localStorage key
    }
  )
);
