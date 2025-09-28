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

  if (loading) return <p>Loading...</p>;
  if (error)
    return (
      <div>
        <p>Error: {error}</p>
        <Link to="/">← Back to dashboard</Link>
      </div>
    );
  if (!job) return <p>Job not found.</p>;

  return (
    <div>
      <h2>{job.position}</h2>
      <p>Company: {job.company}</p>
      <p>Status: {job.status}</p>
      <p>Type: {job.jobType}</p>
      <p>Location: {job.location}</p>
      <p>Description: {job.description}</p>
      <p>Salary: {job.salary}</p>
      <p>Experience Level: {job.experienceLevel}</p>
      <p>Tags: {job.tags}</p>
      <p>
        Application Link: <a href={job.applicationLink}>{job.applicationLink}</a>
      </p>
      <p>
        Deadline:
        {job.deadline
          ? new Date(job.deadline).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'No deadline'}
      </p>
      <p>Priority: {job.priority}</p>
      <p>Source: {job.source}</p>
      <p>Notes: {job.notes}</p>
      <Link to="/">← Back to dashboard</Link>
    </div>
  );
};

export default JobDetail;
