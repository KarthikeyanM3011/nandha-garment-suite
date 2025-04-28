
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  signup: (userData: any) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  resetPassword: (email: string) => api.post('/auth/reset-password', { email }),
  verifyResetToken: (token: string) => api.get(`/auth/reset-password/verify?token=${token}`),
  updatePassword: (token: string, password: string) => api.post('/auth/update-password', { token, password }),
  getMe: () => api.get('/auth/me'),
};

// Organization service
export const organizationService = {
  getAllOrganizations: () => api.get('/organizations'),
  createOrganization: (data: any) => api.post('/organizations', data),
  getOrganizationById: (id: string) => api.get(`/organizations/${id}`),
  updateOrganization: (id: string, data: any) => api.put(`/organizations/${id}`, data),
  deleteOrganization: (id: string) => api.delete(`/organizations/${id}`),
};

// Product service
export const productService = {
  getAllProducts: () => api.get('/products'),
  createProduct: (data: any) => api.post('/products', data),
  getProductById: (id: string) => api.get(`/products/${id}`),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  
  getProductCategories: () => api.get('/product-categories'),
  createProductCategory: (data: { name: string; description?: string }) => api.post('/product-categories', data),
  updateProductCategory: (categoryId: string, data: { name?: string; description?: string }) => api.put(`/product-categories/${categoryId}`, data),
  deleteProductCategory: (categoryId: string) => api.delete(`/product-categories/${categoryId}`),
};

// Order service
export const orderService = {
  getOrders: (queryString: string) => api.get(`/orders?${queryString}`),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  createOrder: (data: { 
    user_id: string; 
    user_type: string; 
    product_id?: string;
    org_user_id?: string; 
    measurement_id?: string;
    quantity?: number;
    notes?: string;
    total_amount: number; 
  }) => api.post('/orders', data),
  updateOrderStatus: (id: string, status: { status: string }) => api.put(`/orders/${id}/status`, status),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),
  getAllOrders: () => api.get('/orders'),
};

// Measurement service extensions
export const measurementService = {
  getMeasurementTypes: () => api.get('/measurement-types'),
  createMeasurementType: (data: { name: string; description?: string }) => api.post('/measurement-types', data),
  getMeasurementType: (typeId: string) => api.get(`/measurement-types/${typeId}`),
  updateMeasurementType: (typeId: string, data: { name?: string; description?: string }) => api.put(`/measurement-types/${typeId}`, data),
  deleteMeasurementType: (typeId: string) => api.delete(`/measurement-types/${typeId}`),
  
  // Updated measurement methods to align with errors
  getMeasurement: (measurementId: string) => api.get(`/measurements/${measurementId}`),
  getMeasurements: (userId: string, userType: string) => api.get(`/measurements?user_id=${userId}&user_type=${userType}`),
  getMeasurementsByUser: (userId: string, userType: string) => api.get(`/measurements?user_id=${userId}&user_type=${userType}`),
  createMeasurement: (data: {
    user_id: string;
    user_type: string;
    measurement_type_id: string;
    values: Array<{ field_id: string; value: string }>;
  }) => api.post('/measurements', data),
  updateMeasurement: (measurementId: string, data: {
    values: Array<{ field_id: string; value: string }>;
  }) => api.put(`/measurements/${measurementId}`, data),
  deleteMeasurement: (measurementId: string) => api.delete(`/measurements/${measurementId}`),
  getAllMeasurements: () => api.get('/measurements'),
};

// Extend userService with additional methods
export const userService = {
  getUsers: () => api.get('/users'),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  
  getAllOrgUsers: (orgId: string) => api.get(`/org-users?org_id=${orgId}`),
  getOrgUsers: (orgId: string) => api.get(`/org-users?org_id=${orgId}`),
  createOrgUser: (data: {
    org_id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
    department?: string;
    is_admin?: boolean;
    created_by: string;
  }) => api.post('/org-users', data),
  updateOrgUser: (userId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    password?: string;
    department?: string;
    is_admin?: boolean;
  }) => api.put(`/org-users/${userId}`, data),
  deleteOrgUser: (userId: string) => api.delete(`/org-users/${userId}`),
  
  getIndividualUsers: () => api.get('/individuals'),
  createIndividual: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    age?: number;
  }) => api.post('/individuals', data),
  updateIndividualUser: (userId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    password?: string;
  }) => api.put(`/individuals/${userId}`, data),
  deleteIndividualUser: (userId: string) => api.delete(`/individuals/${userId}`),
};
