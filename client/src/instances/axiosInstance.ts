import axios, { AxiosError } from 'axios';

let accessToken: string | null = null;
export const setAccessToken = (t: string) => {
  accessToken = t;
  console.log('Access token set:', t ? 'Token exists' : 'Token is empty');
};

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api`,
  withCredentials: true,
});

export const refreshClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  console.log('Making request to:', config.url);
  config.headers = config.headers ?? {};
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    console.log('Added access token to request');
  } else {
    console.log('No access token available');
  }
  return config;
});

let refreshPromise: Promise<{ data: { accessToken: string } }> | null = null;

api.interceptors.response.use(
  (response) => {
    console.log('Request successful:', response.config.url);
    return response;
  },
  async (error) => {
    console.log('Request failed:', error.config?.url, 'Status:', error.response?.status);

    const { config, response } = error;

    if (!response) {
      console.log('No response object - network error');
      return Promise.reject(error);
    }

    const status = response.status;
    const isAuthRefresh = config.url?.includes('/auth/refresh');

    console.log('Error details:', {
      status,
      isAuthRefresh,
      hasRetryFlag: !!config._retry,
      url: config.url,
    });

    if (status !== 401 || config._retry || isAuthRefresh) {
      console.log('Not attempting refresh - conditions not met');
      return Promise.reject(error);
    }

    console.log('Attempting token refresh...');
    config._retry = true;

    try {
      if (!refreshPromise) {
        console.log('Creating new refresh request');
        refreshPromise = refreshClient.post('/auth/refresh');
      } else {
        console.log('Using existing refresh promise');
      }

      const response = await refreshPromise;
      console.log('Refresh response:', response.data);

      const { accessToken: newToken } = response.data;
      refreshPromise = null;

      if (!newToken) {
        console.error('No access token in refresh response');
        return Promise.reject(new Error('No access token received'));
      }

      setAccessToken(newToken);
      localStorage.setItem('token', newToken);
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;

      console.log('Retrying original request with new token');
      return api(config);
    } catch (refreshError: unknown) {
      let errorMessage = 'Unknown error';

      if (refreshError instanceof AxiosError) {
        errorMessage = refreshError.response?.data || refreshError.message;
      } else if (refreshError instanceof Error) {
        errorMessage = refreshError.message;
      }

      console.error('Refresh failed:', errorMessage);
      refreshPromise = null;
      setAccessToken('');
      return Promise.reject(refreshError);
    }
  }
);
