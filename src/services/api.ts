
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  loginSuperAdmin: (credentials: { email: string; password: string }) => 
    api.post('/api/auth/login/super_admin', credentials),
  
  loginOrgAdmin: (credentials: { email: string; password: string }) => 
    api.post('/api/auth/login/org_admin', credentials),
  
  loginIndividual: (credentials: { email: string; password: string }) => 
    api.post('/api/auth/login/individual', credentials),
  
  resetPassword: (data: { user_type: string; email: string; new_password: string }) => 
    api.post('/api/auth/reset_password', data)
};

// Users services
export const userService = {
  // Super Admin
  createSuperAdmin: (data: { name: string; email: string; password: string }) => 
    api.post('/api/users/super_admin', data),
  
  updateSuperAdmin: (adminId: string, data: { name?: string; email?: string; password?: string }) => 
    api.put(`/api/users/super_admin/${adminId}`, data),
  
  deleteSuperAdmin: (adminId: string) => 
    api.delete(`/api/users/super_admin/${adminId}`),
  
  getAllSuperAdmins: () => 
    api.get('/api/users/super_admin/all'),
  
  // Organizations
  createOrganization: (data: {
    name: string;
    pan: string;
    email: string;
    phone: string;
    address: string;
    gstin: string;
    logo?: string;
    created_by: string;
  }) => api.post('/api/users/organization', data),
  
  // Organization Admins
  createOrgAdmin: (data: { org_id: string; name: string; email: string; password: string }) => 
    api.post('/api/users/org_admin', data),
  
  updateOrgAdmin: (adminId: string, data: { org_id?: string; name?: string; email?: string; password?: string }) => 
    api.put(`/api/users/org_admin/${adminId}`, data),
  
  deleteOrgAdmin: (adminId: string) => 
    api.delete(`/api/users/org_admin/${adminId}`),
  
  getAllOrgAdmins: () => 
    api.get('/api/users/org_admin/all'),
  
  getOrgAdminsByOrg: (orgId: string) => 
    api.get(`/api/users/org_admin/by_org/${orgId}`),
  
  // Organization Users
  createOrgUser: (data: {
    org_id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    age?: number;
    department?: string;
    created_by: string;
  }) => api.post('/api/users/org_user', data),
  
  updateOrgUser: (userId: string, data: {
    org_id?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    age?: number;
    department?: string;
  }) => api.put(`/api/users/org_user/${userId}`, data),
  
  deleteOrgUser: (userId: string) => 
    api.delete(`/api/users/org_user/${userId}`),
  
  getAllOrgUsers: () => 
    api.get('/api/users/org_user/all'),
  
  getOrgUsersByOrg: (orgId: string) => 
    api.get(`/api/users/org_user/by_org/${orgId}`),
  
  // Individual Users
  createIndividual: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    age?: number;
  }) => api.post('/api/users/individual', data)
};

// Measurements services
export const measurementService = {
  getMeasurementTypes: () => 
    api.get('/api/measurements/types'),
  
  createMeasurementType: (data: { name: string; description?: string }) => 
    api.post('/api/measurements/type', data),
  
  getMeasurementTypeSection: (typeId: string) => 
    api.get(`/api/measurements/type/${typeId}/sections`),
  
  getUserMeasurements: (userId: string, userType: string) => 
    api.get(`/api/measurements/${userId}/${userType}`),
  
  getOrgMeasurements: (orgId: string) => 
    api.get(`/api/measurements/${orgId}/org_measurements`),
  
  getMeasurement: (measurementId: string) => 
    api.get(`/api/measurements/${measurementId}`),
  
  createMeasurement: (data: {
    user_id: string;
    user_type: string;
    measurement_type_id: string;
    values: Array<{ field_id: string; value: string }>;
  }) => api.post('/api/measurements/', data),
  
  updateMeasurement: (measurementId: string, data: {
    values: Array<{ id?: string; field_id?: string; value: string }>;
  }) => api.put(`/api/measurements/${measurementId}`, data),
  
  deleteMeasurement: (measurementId: string) => 
    api.delete(`/api/measurements/${measurementId}`),
  
  getAllMeasurements: () => 
    api.get('/api/measurements/all'),
};

// Products services
export const productService = {
  getProductCategories: () => 
    api.get('/api/products/categories'),
  
  createProductCategory: (data: { name: string; description?: string }) => 
    api.post('/api/products/category', data),
  
  getAllProducts: () => 
    api.get('/api/products/'),
  
  getProduct: (productId: string) => 
    api.get(`/api/products/${productId}`),
  
  getProductsByCategory: (categoryId: string) => 
    api.get(`/api/products/category/${categoryId}`),
  
  createProduct: (data: {
    name: string;
    category_id: string;
    price: number;
    description?: string;
    image?: string;
  }) => api.post('/api/products/', data),
  
  updateProduct: (productId: string, data: {
    name?: string;
    category_id?: string;
    description?: string;
    price?: number;
    image?: string;
  }) => api.put(`/api/products/${productId}`, data),
  
  deleteProduct: (productId: string) => 
    api.delete(`/api/products/${productId}`),
};

// Orders services
export const orderService = {
  createOrder: (data: {
    user_id: string;
    user_type: string;
    org_user_id?: string;
    total_amount: number;
  }) => api.post('/orders/create', data),
  
  getOrderDetails: (orderId: string) => 
    api.get(`/orders/details/${orderId}`),
  
  updateOrderStatus: (data: { order_id: string; status: string }) => 
    api.post('/orders/update_status', data)
};

export default api;
