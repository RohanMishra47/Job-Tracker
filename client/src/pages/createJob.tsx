import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/instances/axiosInstance';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

const CreateJob = () => {
  const initialFormData = { company: '', position: '', status: '', jobType: '', location: '' };
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Select Status <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {['applied', 'interviewing', 'offer', 'rejected', 'declined', 'pending'].map(
              (status) => (
                <DropdownMenuItem
                  key={status}
                  onSelect={() => {
                    // Manually update formData via your handleChange
                    setFormData((prev) => ({ ...prev, status }));
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Select Job Type <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {['full-time', 'part-time', 'remote', 'internship'].map((jobType) => (
              <DropdownMenuItem
                key={status}
                onSelect={() => {
                  // Manually update formData via your handleChange
                  setFormData((prev) => ({ ...prev, jobType }));
                }}
              >
                {jobType.charAt(0).toUpperCase() + jobType.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
          type="button"
          onClick={() => setFormData(initialFormData)}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateJob;
