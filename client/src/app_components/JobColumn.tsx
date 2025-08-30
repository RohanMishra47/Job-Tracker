import { Droppable } from '@hello-pangea/dnd';
import React from 'react';
import JobCard from './JobCard';

type Job = {
  _id: string;
  company: string;
  position: string;
  status: string;
  jobType: string;
  location: string;
};

type Props = {
  title: string;
  jobs: Job[];
};

const JobColumn: React.FC<Props> = ({ title, jobs }) => {
  return (
    <Droppable droppableId={title}>
      {(provided) => (
        <div
          className="bg-gray-100 rounded-xl shadow-md p-4 min-h-[300px] flex flex-col"
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          <h2 className="text-lg font-semibold text-center mb-2">{title}</h2>
          <div className="flex-1 space-y-2">
            {jobs.map((job, index) => (
              <JobCard key={job._id} job={job} index={index} />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default JobColumn;
