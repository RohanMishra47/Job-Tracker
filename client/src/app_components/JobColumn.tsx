import { Droppable } from '@hello-pangea/dnd';
import clsx from 'clsx';
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
  source: 'LinkedIn' | 'Referral' | 'Company Site' | 'other' | string;
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
      {(provided, snapshot) => (
        <div
          className={clsx(
            'bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl shadow-lg p-5 h-[600px] flex flex-col border-2 transition-all duration-300',
            snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50 shadow-xl' : 'border-gray-200'
          )}
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          {/* Column Header */}
          <div className="mb-4 pb-3 border-b-2 border-gray-300 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide flex items-center justify-between">
              <span>{title}</span>
              <span className="text-sm font-semibold text-white bg-blue-600 px-3 py-1 rounded-full">
                {jobs.length}
              </span>
            </h2>
          </div>

          {/* Jobs Container with Scroll */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500 pr-2">
            <div className="space-y-3">
              {jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <JobCard job={job} index={index} />
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 min-h-[400px]">
                  <div className="text-center">
                    <svg
                      className="w-12 h-12 mx-auto mb-2 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-sm font-medium">No jobs</p>
                  </div>
                </div>
              )}
              {provided.placeholder}
            </div>
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default React.memo(JobColumn);
