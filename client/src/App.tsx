import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import Dashboard from './app_components/Dashboard';
import { restoreTokenFromStorage, setAccessToken } from './instances/axiosInstance';
import CreateJob from './pages/createJob';
import EditJob from './pages/editJob';
import JobDetail from './pages/JobDetail';
import JobFitScoreBreakdown from './pages/JobFitScoreBreakdown';
import Login from './pages/Login';
import Register from './pages/Register';
import { isLoggedIn } from './utils/auth';

restoreTokenFromStorage();
// Create a separate component for the redirection logic
const RedirectToLoginOrDashboard = () => {
  const navigate = useNavigate();

  const t = localStorage.getItem('token');
  if (t) setAccessToken(t);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null; // This component doesn't render anything
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectToLoginOrDashboard />} />{' '}
        {/* default to login or dashboard */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createJob" element={<CreateJob />} />
        <Route path="/editJob" element={<EditJob />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/fit-score/:jobId" element={<JobFitScoreBreakdown />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
