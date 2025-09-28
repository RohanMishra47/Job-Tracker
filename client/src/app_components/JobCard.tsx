import { Draggable } from '@hello-pangea/dnd';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router-dom';

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
  job: Job;
  index: number;
};

const JobCard: React.FC<Props> = ({ job, index }) => {
  return (
    <Link to={`/jobs/${job._id}`}>
      <Draggable draggableId={job._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={clsx(
              'p-3 mb-3 rounded cursor-move transition-all duration-300 ease-in-out',
              snapshot.isDragging
                ? [
                    'bg-blue-50',
                    'scale-105',
                    'shadow-xl',
                    'shadow-blue-200',
                    'rotate-[1deg]',
                    'z-50',
                  ]
                : ['bg-white', 'shadow']
            )}
            style={{
              ...provided.draggableProps.style,
              transitionTimingFunction: snapshot.isDragging
                ? 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                : 'ease',
              transform: snapshot.isDragging
                ? `${provided.draggableProps.style?.transform} scale(1.05)`
                : provided.draggableProps.style?.transform,
              transition: snapshot.isDragging ? 'transform 0.2s ease' : 'transform 0.3s ease',
            }}
          >
            <h3 className="font-medium">{job.position}</h3>
            <p className="text-gray-600">{job.company}</p>
            <p className="text-gray-400">{job.location}</p>
          </div>
        )}
      </Draggable>
    </Link>
  );
};

export default React.memo(JobCard);
