import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import Dashboard from './app_components/Dashboard';
import { AppSidebar } from './components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { setAccessToken } from './instances/axiosInstance';
import CreateJob from './pages/createJob';
import Login from './pages/Login';
import Register from './pages/Register';
import { isLoggedIn } from './utils/auth';

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RedirectToLoginOrDashboard />} />{' '}
          {/* default to login or dashboard */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/createJob" element={<CreateJob />} />
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  );
}

export default App;
