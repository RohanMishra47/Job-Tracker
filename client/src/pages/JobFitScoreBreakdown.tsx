import { useFitScoreStore } from '@/store/useFitScoreStore';
import { motion } from 'framer-motion';
import { Briefcase, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function JobFitScoreBreakdown() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const fitResult = useFitScoreStore((s) => s.getFitScore(jobId || ''));

  if (!fitResult) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
        <Lightbulb className="text-yellow-500 mb-3" size={36} />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
          Fit score not available
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please upload your resume to see how well you match this job.
        </p>
      </div>
    );
  }

  const { score, breakdown, suggestions } = fitResult;
  const circleRadius = 60;
  const circumference = 2 * Math.PI * circleRadius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-8 border border-gray-200 dark:border-gray-700 relative overflow-hidden"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 dark:from-indigo-900/10 dark:to-purple-900/10 pointer-events-none"></div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Briefcase size={28} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Job Fit Overview</h2>
        </div>
      </div>

      {/* Circular Score Indicator */}
      <div className="relative flex flex-col items-center justify-center mb-8">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Background Circle */}
          <svg className="absolute inset-0 transform -rotate-90" width="160" height="160">
            <circle
              cx="80"
              cy="80"
              r={circleRadius}
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="10"
              fill="none"
            />
            {/* Animated Stroke */}
            <motion.circle
              cx="80"
              cy="80"
              r={circleRadius}
              stroke="url(#gradient)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Score Text */}
          <div className="absolute text-center">
            <motion.span
              key={score}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={`text-4xl font-extrabold ${
                score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-500' : 'text-red-500'
              }`}
            >
              {score}%
            </motion.span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall Fit</p>
          </div>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="relative space-y-5">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <TrendingUp size={18} className="text-purple-600 dark:text-purple-400" />
          Breakdown
        </h3>

        {[
          { label: 'Skills Match', value: breakdown.skillsMatch, color: 'bg-indigo-500' },
          { label: 'Experience Match', value: breakdown.experienceMatch, color: 'bg-purple-500' },
          { label: 'Keyword Overlap', value: breakdown.keywordOverlap, color: 'bg-pink-500' },
        ].map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>{item.label}</span>
              <span className="font-medium">{item.value}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                className={`${item.color} h-2 rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions Section */}
      <div className="relative mt-8">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
          <Target size={18} className="text-indigo-600 dark:text-indigo-400" />
          Suggestions for Improvement
        </h3>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 pl-2">
          {suggestions.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
            >
              {s}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <div className="relative mt-10 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="px-6 py-2.5 text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-md transition duration-300"
        >
          View Full Job Details
        </motion.button>
      </div>
    </motion.div>
  );
}
