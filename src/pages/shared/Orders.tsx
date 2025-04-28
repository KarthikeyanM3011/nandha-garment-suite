
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/api-extensions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, FileText, Package, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

// Define types
interface Order {
  id: string;
  user_id: string;
  user_type: string;
  org_user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  org_name?: string;
}

interface OrdersProps {
  isOrgAdmin: boolean;
}

const Orders: React.FC<OrdersProps> = ({ isOrgAdmin }) => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Create query parameters based on user type
  const getQueryString = () => {
    if (isOrgAdmin) {
      return `org_id=${userData?.org_id}`;
    } else {
      return `user_id=${userData?.id}&user_type=INDIVIDUAL`;
    }
  };

  // Fetch orders
  const { 
    data: orders, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['orders', isOrgAdmin, userData?.id, userData?.org_id],
    queryFn: async () => {
      try {
        const queryString = getQueryString();
        const response = await orderService.getOrders(queryString);
        return response.data.orders || [];
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        throw new Error('Failed to fetch orders');
      }
    },
    enabled: isOrgAdmin ? !!userData?.org_id : !!userData?.id
  });

  // Fetch order details
  const { 
    data: orderDetails, 
    isLoading: isDetailsLoading,
    error: detailsError,
    refetch: refetchOrderDetails
  } = useQuery({
    queryKey: ['orderDetails', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.id) return null;
      try {
        const response = await orderService.getOrderById(selectedOrder.id);
        return response.data.order || null;
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        throw new Error('Failed to fetch order details');
      }
    },
    enabled: !!selectedOrder?.id,
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      return await orderService.updateOrderStatus(orderId, { status });
    },
    onSuccess: () => {
      toast.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (selectedOrder) {
        refetchOrderDetails();
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to update order status: ${error.message}`);
    }
  });

  // Filter orders based on search term and status
  const filteredOrders = orders ? orders.filter((order: Order) => {
    const matchesSearch = searchTerm === '' || 
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user_name && order.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.org_name && order.org_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  // Handle order details view
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  // Handle update status
  const handleUpdateStatus = (orderId: string, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  // Navigate to create new order
  const handleCreateNewOrder = () => {
    navigate(isOrgAdmin ? '/org-admin/orders/new' : '/individual/orders/new');
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h2>
          <p className="text-muted-foreground">
            {isOrgAdmin ? "Manage organization orders" : "View your orders"}
          </p>
        </div>
        <Button onClick={handleCreateNewOrder} className="gap-2">
          <Plus size={16} />
          New Order
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by order ID or customer name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg">Orders List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataState 
            isLoading={isLoading} 
            error={error} 
            isEmpty={!filteredOrders || filteredOrders.length === 0}
            emptyMessage="No orders found. Create your first order to get started."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  {isOrgAdmin && <TableHead>Customer</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    {isOrgAdmin && (
                      <TableCell>{order.user_name || 'Unknown'}</TableCell>
                    )}
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{formatPrice(order.total_amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => handleViewOrderDetails(order)}
                      >
                        <Eye size={16} className="mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataState>
        </CardContent>
      </Card>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about this order.
            </DialogDescription>
          </DialogHeader>
          
          <DataState
            isLoading={isDetailsLoading}
            error={detailsError}
            isEmpty={!orderDetails}
          >
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Order ID</h4>
                    <p className="font-medium">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Date</h4>
                    <p className="font-medium">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Customer</h4>
                    <p className="font-medium">{selectedOrder.user_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedOrder.status)}
                      {isOrgAdmin && (
                        <Select
                          defaultValue={selectedOrder.status}
                          onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[130px] text-xs">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Package size={18} />
                    Order Items
                  </h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="font-medium">Product: {orderDetails?.product_name || 'Unknown'}</p>
                    <p>Quantity: {orderDetails?.quantity || 1}</p>
                    {orderDetails?.notes && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">Notes:</h4>
                        <p className="text-sm text-muted-foreground">{orderDetails.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-end">
                  <div>
                    <Button variant="outline" className="gap-2">
                      <FileText size={16} />
                      Download Invoice
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-brand-blue">
                      {formatPrice(selectedOrder.total_amount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DataState>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
