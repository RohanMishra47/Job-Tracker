import { api } from '@/instances/axiosInstance';
import axios from 'axios';
import { UploadCloud, XCircle } from 'lucide-react';
import { useState } from 'react';

type ResumeUploaderProps = {
  onResumeUploaded: (text: string) => void;
};

const ResumeUploader = ({ onResumeUploaded }: ResumeUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a resume file');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setLoading(true);
      const res = await api.post('/resume/upload', formData);
      onResumeUploaded(res.data.resumeText);
      setFile(null); // reset file after upload
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Upload failed');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Upload failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <UploadCloud size={20} className="text-indigo-600 dark:text-indigo-400" />
        Upload Your Resume
      </h2>

      {/* File Input */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 cursor-pointer hover:border-indigo-500 transition-colors">
        <span className="text-gray-500 dark:text-gray-400 text-sm mb-2">
          {file ? file.name : 'Click to select a PDF, DOCX, or TXT file'}
        </span>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
          <XCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className={`w-full px-4 py-2 font-semibold text-white rounded-xl transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
        }`}
      >
        {loading ? 'Uploading...' : 'Upload Resume'}
      </button>

      {/* File Name */}
      {file && (
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          Selected file: <span className="font-medium">{file.name}</span>
        </p>
      )}
    </div>
  );
};

export default ResumeUploader;
