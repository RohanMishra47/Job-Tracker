import { api } from '@/instances/axiosInstance';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState({
    company: '',
    position: '',
    status: '',
    jobType: '',
    location: '',
  });

  useEffect(() => {
    const fetchJob = async () => {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.job);
    };
    fetchJob();
  }, [id]);

  if (!job) return <p>Loading...</p>;

  return (
    <div>
      <h2>{job.position}</h2>
      <p>{job.company}</p>
      <p>{job.status}</p>
      <p>{job.jobType}</p>
      <p>{job.location}</p>
      {/* Add more fields as needed */}
      <Link to="/">← Back to dashboard</Link>
    </div>
  );
};

export default JobDetail;
