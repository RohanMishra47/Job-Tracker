import React from 'react';
import JobBoard from '../app_components/JobBoard';
import Navbar from './Navbar';

const Dashboard: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Job Tracker</h1>
        <JobBoard />
      </div>
    </>
  );
};

export default Dashboard;
