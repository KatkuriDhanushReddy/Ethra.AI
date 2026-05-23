import axios from 'axios';
import { getApiBaseUrl } from '../config/env.js';

const API_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const method = err.config?.method?.toUpperCase() || 'REQUEST';
    const path = err.config?.url || '';
    const fullUrl = `${err.config?.baseURL || API_URL}${path}`;

    console.error('[API Error]', {
      method,
      url: fullUrl,
      status: status ?? 'network',
      message: err.response?.data?.message || err.message,
      data: err.response?.data,
    });

    const message =
      err.response?.data?.message ||
      (status === 404
        ? `API not found (${fullUrl}). Check VITE_API_URL on Vercel.`
        : err.message) ||
      'Request failed';

    return Promise.reject(new Error(message));
  }
);

export { API_URL };
export default api;

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
};

export const usersAPI = {
  list: (params) => api.get('/users', { params }),
};

export const projectsAPI = {
  list: (params) => api.get('/projects', { params }),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
};

export const tasksAPI = {
  list: (params) => api.get('/tasks', { params }),
  get: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  reorder: (taskId, status) => api.patch('/tasks/reorder/status', { taskId, status }),
  upload: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/tasks/${id}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const commentsAPI = {
  list: (taskId) => api.get(`/tasks/${taskId}/comments`),
  create: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }),
  delete: (id) => api.delete(`/tasks/comments/${id}`),
};

export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};
