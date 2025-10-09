import { api } from '@/instances/axiosInstance';
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

  // Format priority with color coding
  const getPriorityClass = (priority: 'low' | 'medium' | 'high' | number) => {
    if (typeof priority === 'number') {
      return 'bg-blue-100 text-blue-800';
    }
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-card-bg text-heading';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] py-8">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center bg-heading text-page-bg hover:text-body-text transition-colors duration-200 mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to dashboard
          </Link>

          {/* Job title and company - highlighted section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-card-bg">
            <h1 className="text-3xl font-bold text-heading mb-2">{job.position}</h1>
            <h2 className="text-xl text-body-text mb-4">{job.company}</h2>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-heading/10 text-heading rounded-full text-sm font-medium">
                {job.jobType}
              </span>
              <span className="px-3 py-1 bg-card-bg text-body-text rounded-full text-sm font-medium">
                {job.location}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityClass(job.priority)}`}
              >
                Priority: {job.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Main content with two-column layout */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-card-bg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - labels */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-subtle uppercase tracking-wider">Status</h3>
              </div>
              <div>
                <h3 className="text-sm font-medium text-subtle uppercase tracking-wider">
                  Experience Level
                </h3>
              </div>
              <div>
                <h3 className="text-sm font-medium text-subtle uppercase tracking-wider">Salary</h3>
              </div>
              <div>
                <h3 className="text-sm font-medium text-subtle uppercase tracking-wider">
                  Application Deadline
                </h3>
              </div>
              <div>
                <h3 className="text-sm font-medium text-subtle uppercase tracking-wider">Source</h3>
              </div>
              <div>
                <h3 className="text-sm font-medium text-subtle uppercase tracking-wider">
                  Application Link
                </h3>
              </div>
            </div>

            {/* Right column - values */}
            <div className="space-y-4">
              <div>
                <p className="text-heading">{job.status}</p>
              </div>
              <div>
                <p className="text-heading capitalize">{job.experienceLevel}</p>
              </div>
              <div>
                <p className="text-heading">{formatSalary(job.salary)}</p>
              </div>
              <div>
                <p className="text-heading">
                  {job.deadline
                    ? new Date(job.deadline).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'No deadline'}
                </p>
              </div>
              <div>
                <p className="text-heading">{job.source}</p>
              </div>
              <div>
                <a
                  href={job.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-heading hover:text-body-text hover:underline transition-colors duration-200"
                >
                  Apply Now
                </a>
              </div>
            </div>
          </div>

          {/* Tags section */}
          {job.tags && job.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-card-bg">
              <h3 className="text-sm font-medium text-subtle uppercase tracking-wider mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-card-bg text-body-text rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description section */}
          <div className="mt-8 pt-6 border-t border-card-bg">
            <h3 className="text-sm font-medium text-subtle uppercase tracking-wider mb-3">
              Job Description
            </h3>
            <p className="text-body-text whitespace-pre-line">{job.description}</p>
          </div>

          {/* Notes section */}
          {job.notes && (
            <div className="mt-8 pt-6 border-t border-card-bg">
              <h3 className="text-sm font-medium text-subtle uppercase tracking-wider mb-3">
                Notes
              </h3>
              <p className="text-body-text whitespace-pre-line">{job.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
