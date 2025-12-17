import axios from 'axios';

// API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create a custom axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add authorization headers or other logic here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
// Request interceptor
// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers = config.headers || {}
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)



export default apiClient; 