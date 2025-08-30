import React from 'react';
import JobBoard from '../app_components/JobBoard';

const Dashboard: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Job Tracker</h1>
      <JobBoard />
    </div>
  );
};

export default Dashboard;
