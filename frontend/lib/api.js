import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach JWT to every request automatically
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('devmatch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Users
export const getUsers = () => API.get('/users');
export const getUserById = (id) => API.get(`/users/${id}`);
export const updateProfile = (data) => API.put('/users/profile', data);
export const uploadProfilePicture = (formData) => API.put('/users/profile/picture', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Matches
export const getMatches = (params) => API.get('/matches', { params });
export const recordSwipe = (data) => API.post('/matches/swipe', data);
export const demoCompare = (data) => API.post('/matches/demo-compare', data);

// Teams
export const getTeams = () => API.get('/teams');
export const getTeamById = (id) => API.get(`/teams/${id}`);
export const createTeam = (data) => API.post('/teams', data);
export const sendJoinRequest = (data) => API.post('/teams/request', data);
export const getTeamRequests = (id) => API.get(`/teams/${id}/requests`);
export const respondJoinRequest = (id, data) => API.put(`/teams/request/${id}`, data);

// Hackathon
export const joinHackathon = (data) => API.post('/hackathon/join', data);
export const getHackathonMatches = (id) => API.get(`/hackathon/${id}/matches`);
export const getSuggestedTeams = (id) => API.get(`/hackathon/${id}/teams`);

export default API;
