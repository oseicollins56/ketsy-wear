import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage if exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.get('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/updateprofile', data),
  changePassword: (data) => API.put('/auth/changepassword', data),
  forgotPassword: (data) => API.post('/auth/forgotpassword', data),
  resetPassword: (token, data) => API.put(`/auth/resetpassword/${token}`, data),
  toggleWishlist: (productId) => API.post(`/auth/wishlist/${productId}`),
  getWishlist: () => API.get('/auth/wishlist'),
};

// Products
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getOne: (id) => API.get(`/products/${id}`),
  getFeatured: () => API.get('/products/featured'),
  getCategories: () => API.get('/products/categories'),
  addReview: (id, data) => API.post(`/products/${id}/reviews`, data),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
  uploadImages: (id, formData) =>
    API.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Orders
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getOne: (id) => API.get(`/orders/${id}`),
  getMyOrders: (params) => API.get('/orders/myorders', { params }),
  getAllOrders: (params) => API.get('/orders', { params }),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  uploadTransferProof: (id, data) => API.put(`/orders/${id}/transfer-proof`, data),
  getAnalytics: (params) => API.get('/orders/analytics', { params }),
};

// Payments — Mobile Money only
export const paymentAPI = {
  initiateMobileMoney: (data) => API.post('/payment/mobile-money/initiate', data),
  verifyMobileMoney: (ref) => API.get(`/payment/mobile-money/verify/${ref}`),
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getUsers: (params) => API.get('/admin/users', { params }),
  updateUserRole: (id, role) => API.put(`/admin/users/${id}/role`, { role }),
  getCoupons: () => API.get('/admin/coupons'),
  createCoupon: (data) => API.post('/admin/coupons', data),
  updateCoupon: (id, data) => API.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => API.delete(`/admin/coupons/${id}`),
  validateCoupon: (data) => API.post('/admin/coupons/validate', data),
  getStockAlerts: () => API.get('/admin/stock-alerts'),
  bulkUpload: (formData) =>
    API.post('/admin/products/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default API;
