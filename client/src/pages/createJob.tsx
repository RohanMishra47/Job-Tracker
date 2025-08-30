import { api } from '@/instances/axiosInstance';
import axios from 'axios';
import React, { useState } from 'react';

const CreateJob = () => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: '',
    jobType: '',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { data } = await api.post('/jobs', formData);
      console.log('response data:', data);
      setFormData({
        company: '',
        position: '',
        status: '',
        jobType: '',
        location: '',
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Login failed');
      } else {
        setError('An unknown error occured');
      }
    }
  };
  return (
    <div className="mx-auto mt-10 flex min-h-[300px] max-w-md flex-col rounded-xl bg-gray-100 p-4 text-center shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Create Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="company"
          value={formData.company}
          type="text"
          onChange={handleChange}
          placeholder="Company name:"
          required
          className="w-full rounded border px-4 py-2"
        />
        <input
          name="position"
          value={formData.position}
          type="text"
          onChange={handleChange}
          placeholder="Job Postion:"
          required
          className="w-full rounded border px-4 py-2"
        />
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full rounded border px-4 py-2"
        >
          <option value="rejected">Rejected</option>
          <option value="offer">Offer</option>
          <option value="interviewing">Interviewing</option>
          <option value="declined">Declined</option>
          <option value="applied">Applied</option>
          <option value="pending">Pending</option>
        </select>
        <select
          name="jobType"
          value={formData.jobType}
          onChange={handleChange}
          className="w-full rounded border px-4 py-2"
        >
          <option value="internship">Internship</option>
          <option value="remote">Remote</option>
          <option value="part-time">Part-Time</option>
          <option value="full-time">Full-Time</option>
        </select>
        <input
          name="location"
          value={formData.location}
          type="text"
          onChange={handleChange}
          placeholder="Job location:"
          required
          className="w-full rounded border px-4 py-2"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Create
        </button>
        <button
          type="reset"
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateJob;
