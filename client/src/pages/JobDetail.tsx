import { DetailCard } from '@/app_components/DetailCard';
import InfoField from '@/app_components/InfoField';
import { PriorityBadge } from '@/app_components/PriorityBadge';
import { api } from '@/instances/axiosInstance';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

type Job = {
  _id: string;
  company: string;
  position: string;
  status: string;
  jobType: string;
  location: string;
  description: string;
  salary: number | [number, number];
  experienceLevel: 'junion' | 'mid' | 'senior';
  tags: string[];
  applicationLink: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high' | number;
  source: 'LinkedIn' | 'Referral' | 'Company Site' | 'ohter' | 'other' | string;
  notes: string;
  isFavorite: boolean;
};

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No job ID provided');
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data);
      } catch (err) {
        console.error('Failed to fetch job:', err);
        setError('Failed to load job details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-page-bg">
        <div className="text-lg font-medium text-body-text">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">Error</div>
          <p className="text-body-text mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-heading text-page-bg rounded-md hover:opacity-90 transition-opacity duration-200"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );

  if (!job)
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="text-lg font-medium text-body-text">Job not found.</div>
      </div>
    );

  // Format salary based on whether it's a number or a range
  const formatSalary = (salary: number | [number, number]) => {
    if (Array.isArray(salary)) {
      return `$${salary[0].toLocaleString()} - $${salary[1].toLocaleString()}`;
    }
    return `$${salary.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 shadow-xl"
    >
      {/* Top Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-6 justify-between items-start p-4 bg-muted rounded-xl"
      >
        {/* Company Name */}
        <div className="text-2xl font-bold text-primary">{job.company}</div>

        {/* Structured Fields */}
        <div className="flex flex-wrap gap-4">
          <InfoField label="Status" value={job.status} />
          <InfoField label="Job Type" value={job.jobType} />
          <InfoField label="Location" value={job.location} />
          <InfoField label="Priority" value={<PriorityBadge level={job.priority} />} />
        </div>
      </motion.div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <DetailCard label="Experience Level" value={job.experienceLevel} />
        <DetailCard label="Salary" value={formatSalary(job.salary)} />
        <DetailCard
          label="Deadline"
          value={
            job.deadline
              ? new Date(job.deadline).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'No deadline'
          }
        />
        <DetailCard label="Tags" value={job.tags.join(', ')} />
        <DetailCard label="Application Link" value={job.applicationLink} />
        <DetailCard label="Job Description" value={job.description} />
        <DetailCard label="Job Notes" value={job.notes} />
      </div>
    </motion.div>
  );
};

export default JobDetail;
