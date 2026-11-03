import axios from 'axios';

const api = axios.create({
  baseURL: 'https://power-true.onrender.com', // Twój serwer z bazy danych
});

export default api;
