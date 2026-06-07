import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000
});

export const tripApi = {
  getAll: () => api.get('/trips'),
  getById: (id) => api.get(`/trips/${id}`),
  create: (trip) => api.post('/trips', trip),
  update: (id, trip) => api.put(`/trips/${id}`, trip),
  remove: (id, email) => api.delete(`/trips/${id}`, { params: email ? { email } : {} }),
  addMember: (tripId, userId) => api.post(`/trips/${tripId}/members/${userId}`),
  invite: (tripId, email) => api.post(`/trips/${tripId}/invite`, { email }),
  getMembers: (tripId) => api.get(`/trips/${tripId}/members`),
  removeMember: (tripId, userId, email) => api.delete(`/trips/${tripId}/members/${userId}`, { params: email ? { email } : {} }),
  joinTrip: (tripId, email, password) => api.post(`/trips/${tripId}/join`, { email, password }),
  setPassword: (tripId, password) => api.put(`/trips/${tripId}/password`, { password }),
};

export const ideaApi = {
  getByTrip: (tripId, category) => api.get(`/trips/${tripId}/ideas`, { params: category ? { category } : {} }),
  submit: (tripId, idea) => api.post(`/trips/${tripId}/ideas`, idea),
  vote: (tripId, ideaId) => api.post(`/trips/${tripId}/ideas/${ideaId}/vote`),
  remove: (tripId, ideaId) => api.delete(`/trips/${tripId}/ideas/${ideaId}`),
  analyze: (tripId, ideaId) => api.post(`/trips/${tripId}/ideas/${ideaId}/analyze`),
  comment: (tripId, ideaId, userName, text) => api.post(`/trips/${tripId}/ideas/${ideaId}/comment`, { userName, text }),
};

export const chatApi = {
  getHistory: (tripId) => api.get(`/trips/${tripId}/chat`),
  send: (tripId, message, userId, userName) => api.post(`/trips/${tripId}/chat`, { message, userId: String(userId || ''), userName: userName || '' }),
  clearHistory: (tripId, email) => api.delete(`/trips/${tripId}/chat`, { params: email ? { email } : {} }),
  curate: (tripId) => api.post(`/trips/${tripId}/curate`),
  getSeason: (tripId) => api.get(`/trips/${tripId}/season`),
  getAISummary: (tripId) => api.get(`/trips/${tripId}/ai-summary`),
};

export const userApi = {
  register: (user) => api.post('/users/register', user),
  login: (credentials) => api.post('/users/login', credentials),
  sendOtp: (email, name) => api.post('/users/send-otp', { email, name }),
  verifyOtp: (email, otp) => api.post('/users/verify-otp', { email, otp }),
  getAll: () => api.get('/users'),
};

export const bookingApi = {
  create: (booking) => api.post('/bookings', booking),
  getByTrip: (tripId, type) => api.get(`/bookings/trip/${tripId}`, { params: type ? { type } : {} }),
  confirm: (id) => api.put(`/bookings/${id}/confirm`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

export const cartApi = {
  add: (item) => api.post('/cart', item),
  getItems: (tripId, userId) => api.get(`/cart/trip/${tripId}/user/${userId}`),
  remove: (id) => api.delete(`/cart/${id}`),
  negotiate: (id, offeredPrice) => api.post(`/cart/${id}/negotiate`, { offeredPrice }),
  checkout: (tripId, userId) => api.post('/cart/checkout', { tripId, userId }),
};

export const walletApi = {
  getBalance: (userId) => api.get(`/wallet/${userId}`),
  addFunds: (userId, amount) => api.post(`/wallet/${userId}/add`, { amount }),
};

export const proposalApi = {
  getAll: (tripId) => api.get(`/trips/${tripId}/proposals`),
  create: (tripId, data) => api.post(`/trips/${tripId}/proposals`, data),
  vote: (tripId, proposalId, userId, userName, vote) => api.post(`/trips/${tripId}/proposals/${proposalId}/vote`, { userId: String(userId), userName, vote }),
};

export const WS_BASE = (() => {
  const loc = window.location;
  const base = import.meta.env.VITE_API_URL;
  if (base && base.startsWith('http')) {
    return base.replace('/api', '');
  }
  return loc.origin;
})();

export default api;
