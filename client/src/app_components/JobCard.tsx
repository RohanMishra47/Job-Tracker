import { useFitScoreStore } from '@/store/useFitScoreStore';
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
  source: 'LinkedIn' | 'Referral' | 'Company Site' | 'other' | string;
  notes: string;
  isFavorite: boolean;
};
type Props = {
  job: Job;
  index: number;
};

const JobCard: React.FC<Props> = ({ job, index }) => {
  const fitScore = useFitScoreStore((s) => s.getFitScore(job._id));
  return (
    <Link to={`/fit-score/${job._id}`}>
      <Draggable draggableId={job._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={clsx(
              'group relative p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-300 ease-out',
              snapshot.isDragging
                ? [
                    'bg-white',
                    'scale-105',
                    'shadow-2xl',
                    'ring-4',
                    'ring-blue-400',
                    'ring-opacity-50',
                    'rotate-2',
                    'z-50',
                  ]
                : [
                    'bg-white',
                    'shadow-md',
                    'hover:shadow-lg',
                    'hover:scale-[1.02]',
                    'border',
                    'border-gray-200',
                    'hover:border-blue-300',
                  ]
            )}
            style={{
              ...provided.draggableProps.style,
              transitionTimingFunction: snapshot.isDragging
                ? 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                : 'cubic-bezier(0.4, 0, 0.2, 1)',
              transform: snapshot.isDragging
                ? `${provided.draggableProps.style?.transform} scale(1.05) rotate(2deg)`
                : provided.draggableProps.style?.transform,
            }}
          >
            {/* Drag Handle Indicator */}
            <div
              className={clsx(
                'absolute top-3 right-3 transition-opacity duration-200',
                snapshot.isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
              )}
            >
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </div>

            {/* Job Content */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-base leading-tight pr-6">
                {job.position}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <p className="text-gray-700 font-medium">{job.company}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-gray-600">{job.location}</p>
              </div>
            </div>

            {fitScore && (
              <span
                className={`px-2 py-1 rounded text-white text-sm font-semibold ${
                  fitScore.score >= 80
                    ? 'bg-green-500'
                    : fitScore.score >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              >
                Fit Score: {fitScore.score}
              </span>
            )}

            {/* Dragging Indicator */}
            {snapshot.isDragging && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                Moving
              </div>
            )}
          </div>
        )}
      </Draggable>
    </Link>
  );
};

export default React.memo(JobCard);
