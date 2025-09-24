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
    fetch(`/api/jobs/${id}`)
      .then((res) => res.json())
      .then((data) => setJob(data));
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
