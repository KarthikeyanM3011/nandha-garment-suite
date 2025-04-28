import api from './api';

// Organization Extensions
export const organizationService = {
  getAllOrganizations: async () => {
    console.log('Fetching all organizations');
    return api.get('/api/users/org/all');
  },

  getOrganizationById: async (orgId: string) => {
    console.log(`Fetching organization with ID: ${orgId}`);
    return api.get(`/api/users/org_admin/${orgId}`);
  },

  deleteOrganization: async (orgId: string) => {
    console.log(`Deleting organization with ID: ${orgId}`);
    return api.delete(`/api/users/org_admin/${orgId}`);
  },

  updateOrganization: async (orgId: string, data: any) => {
    console.log(`Updating organization with ID: ${orgId}`, data);
    return api.put(`/api/users/org_admin/${orgId}`, data);
  },
};

// Orders Extensions
export const orderService = {
  getAllOrders: async () => {
    console.log('Fetching all orders');
    return api.get('/orders/all');
  },

  getOrdersByOrganization: async (orgId: string) => {
    console.log(`Fetching orders for organization ID: ${orgId}`);
    return api.get(`/api/orders/by_organization/${orgId}`);
  },

  getOrdersByUser: async (userId: string, userType: string) => {
    console.log(`Fetching orders for user ID: ${userId} and user type: ${userType}`);
    return api.get(`/api/orders/by_user/${userId}/${userType}`);
  },

  createOrder: async (data: {
    user_id: string;
    user_type: string;
    org_user_id?: string;
    items: Array<{ product_id: string; quantity: number; price: number }>;
    total_amount: number;
  }) => {
    console.log('Creating order with data:', data);
    return api.post('/api/orders/create', data);
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    console.log(`Updating order status. Order ID: ${orderId}, New Status: ${status}`);
    return api.post('/api/orders/update_status', { order_id: orderId, status });
  },

  getOrderDetails: async (orderId: string) => {
    console.log(`Fetching order details for Order ID: ${orderId}`);
    return api.get(`/api/orders/details/${orderId}`);
  },
};
