import React from 'react';
import JobBoard from '../app_components/JobBoard';
import Navbar from './Navbar';

const Dashboard: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="p-4">
        <JobBoard />
      </div>
    </>
  );
};

export default Dashboard;
