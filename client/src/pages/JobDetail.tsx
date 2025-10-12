import { DetailCard } from '@/app_components/DetailCard';
import DetailGroup from '@/app_components/DetailGroup';
import InfoField from '@/app_components/InfoField';
import { PriorityBadge } from '@/app_components/PriorityBadge';
import Section from '@/app_components/Section';
import { api } from '@/instances/axiosInstance';
import { motion } from 'framer-motion';
import { capitalize } from 'lodash';
import { Building2, Star } from 'lucide-react';
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
        className="flex flex-wrap gap-4 p-4 bg-muted rounded-xl"
      >
        {/* Company Name and logo*/}
        <div className="w-full flex justify-center items-center gap-2">
          <Building2 className="w-6 h-6 text-muted-foreground" />
          <span className="text-2xl font-bold text-primary">{job.company}</span>
          {job.isFavorite && (
            <div className="relative inline-block group w-[100px] h-6">
              {/* Star Icon */}
              <motion.div
                whileHover={{ scale: 1.2, boxShadow: '0 0 8px #facc15' }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="absolute left-0 top-0"
              >
                <Star className="w-6 h-6 fill-yellow-400 stroke-yellow-600" />
              </motion.div>

              {/* Sliding Text */}
              <motion.span
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute left-8 top-0 text-sm font-medium text-yellow-700 group-hover:inline-block hidden"
              >
                Favorite
              </motion.span>
            </div>
          )}
        </div>
        <div className="border-b border-border w-full" />

        {/* Structured Fields */}
        <div className="flex flex-wrap gap-4 justify-evenly w-full">
          <InfoField label="Status" value={job.status} />
          <InfoField label="Job Type" value={job.jobType} />
          <InfoField label="Location" value={job.location} />
          <InfoField label="Priority" value={<PriorityBadge level={job.priority} />} />
        </div>
      </motion.div>

      {/* Bottom Section */}
      <div className="space-y-6 mt-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <div>
              <Section title="Job Info">
                <DetailGroup
                  items={[
                    { label: 'Experience Level', value: capitalize(job.experienceLevel) },
                    { label: 'Salary', value: formatSalary(job.salary) },
                    {
                      label: 'Deadline',
                      value: job.deadline
                        ? new Date(job.deadline).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'No deadline',
                    },
                  ]}
                />
              </Section>
            </div>

            <div>
              <Section title="Application Details">
                <DetailGroup
                  items={[
                    { label: 'Tags', value: job.tags.join(', ') },
                    { label: 'Source', value: job.source },
                    {
                      label: 'Application Link',
                      value: job.applicationLink,
                      isLink: true,
                    },
                  ]}
                />
              </Section>
            </div>
          </div>
        </div>

        <Section title="Notes">
          <DetailCard label="Job Description" value={job.description} />
          <DetailCard label="Job Notes" value={job.notes} />
        </Section>
      </div>
    </motion.div>
  );
};

export default JobDetail;
