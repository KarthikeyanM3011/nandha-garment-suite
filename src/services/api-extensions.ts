
import api from './api';

// Organization Extensions
export const organizationService = {
  getAllOrganizations: () => 
    api.get('/api/organizations/'),
  
  getOrganizationById: (orgId: string) => 
    api.get(`/api/organizations/${orgId}`),
  
  deleteOrganization: (orgId: string) => 
    api.delete(`/api/organizations/${orgId}`),
  
  updateOrganization: (orgId: string, data: any) => 
    api.put(`/api/organizations/${orgId}`, data),
};

// Orders Extensions
export const orderService = {
  getAllOrders: () => 
    api.get('/api/orders/all'),
  
  getOrdersByOrganization: (orgId: string) => 
    api.get(`/api/orders/by_organization/${orgId}`),
  
  getOrdersByUser: (userId: string, userType: string) => 
    api.get(`/api/orders/by_user/${userId}/${userType}`),
  
  createOrder: (data: {
    user_id: string;
    user_type: string;
    org_user_id?: string;
    items: Array<{ product_id: string; quantity: number; price: number }>;
    total_amount: number;
  }) => api.post('/api/orders/create', data),
  
  updateOrderStatus: (orderId: string, status: string) => 
    api.post('/api/orders/update_status', { order_id: orderId, status }),
  
  getOrderDetails: (orderId: string) => 
    api.get(`/api/orders/details/${orderId}`),
};
