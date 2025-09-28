import { Droppable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import React from 'react';
import JobCard from './JobCard';

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
              <motion.div
                key={job._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <JobCard job={job} index={index} />
              </motion.div>
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default React.memo(JobColumn);
