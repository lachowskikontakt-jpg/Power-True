import axios from 'axios';

const api = axios.create({
  baseURL: 'https://power-true-wgda.onrender.com' // lub Twój dokładny adres backendu z Render
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
