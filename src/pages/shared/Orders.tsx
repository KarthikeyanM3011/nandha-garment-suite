
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { orderService } from '@/services/api-extensions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Plus, Eye, Pencil, Trash2, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface OrdersProps {
  isOrgAdmin: boolean;
}

interface Order {
  id: string;
  user_id: string;
  org_id: string;
  product_id: string;
  measurement_id?: string;
  status: string;
  quantity: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  product_name: string;
  product_price: number;
  user_name: string;
  user_email: string;
  user_phone: string;
}

const Orders: React.FC<OrdersProps> = ({ isOrgAdmin }) => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch orders
  const { 
    data: orders, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['orders', isOrgAdmin, userData?.id, userData?.org_id, statusFilter],
    queryFn: async () => {
      try {
        // Build query string based on filters
        let queryString = '';
        
        if (isOrgAdmin && userData?.org_id) {
          queryString += `org_id=${userData.org_id}&`;
        } else if (!isOrgAdmin && userData?.id) {
          queryString += `user_id=${userData.id}&`;
        }
        
        if (statusFilter) {
          queryString += `status=${statusFilter}`;
        }
        
        // Remove trailing & if present
        queryString = queryString.endsWith('&') ? queryString.slice(0, -1) : queryString;
        
        const response = await orderService.getOrders(queryString);
        return response.data.orders || [];
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        throw new Error('Failed to fetch orders');
      }
    },
    enabled: isOrgAdmin ? !!userData?.org_id : !!userData?.id,
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { orderId: string; status: string }) => {
      return await orderService.updateOrderStatus(data.orderId, { status: data.status });
    },
    onSuccess: () => {
      toast.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsStatusDialogOpen(false);
      setSelectedOrder(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to update order status: ${error.message}`);
    }
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await orderService.deleteOrder(orderId);
    },
    onSuccess: () => {
      toast.success('Order deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete order: ${error.message}`);
    }
  });

  // Handle adding a new order
  const handleAddOrder = () => {
    navigate(isOrgAdmin ? '/org-admin/orders/new' : '/individual/orders/new');
  };

  // Handle viewing an order
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  // Handle updating order status
  const handleStatusUpdate = (status: string) => {
    if (!selectedOrder) return;
    
    updateStatusMutation.mutate({
      orderId: selectedOrder.id,
      status
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!selectedOrder) return;
    deleteOrderMutation.mutate(selectedOrder.id);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort orders
  const sortedOrders = orders ? [...orders].sort((a: any, b: any) => {
    if (sortField === 'created_at') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'product_price') {
      const priceA = a.product_price * a.quantity;
      const priceB = b.product_price * b.quantity;
      return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
    } else {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
  }) : [];

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h2>
          <p className="text-muted-foreground">
            {isOrgAdmin ? "Manage all orders for your organization" : "View and track your orders"}
          </p>
        </div>
        <Button onClick={handleAddOrder} className="gap-2">
          <Plus size={16} />
          New Order
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || null)}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Filter size={16} />
              {statusFilter ? `Status: ${statusFilter}` : 'Filter by Status'}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataState 
        isLoading={isLoading} 
        error={error} 
        isEmpty={!orders || orders.length === 0}
        emptyMessage="No orders found."
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList size={18} />
              Order List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Order ID</TableHead>
                  {isOrgAdmin && <TableHead>Customer</TableHead>}
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('product_name')}
                  >
                    <div className="flex items-center gap-1">
                      Product
                      {sortField === 'product_name' && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('product_price')}
                  >
                    <div className="flex items-center gap-1">
                      Amount
                      {sortField === 'product_price' && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{order.id.substring(0, 8)}</TableCell>
                    {isOrgAdmin && <TableCell>{order.user_name}</TableCell>}
                    <TableCell>{order.product_name}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>₹{(order.product_price * order.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye size={16} />
                        </Button>
                        {isOrgAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsStatusDialogOpen(true);
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataState>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View detailed information about this order.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                  <p className="font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p>{format(new Date(selectedOrder.created_at), 'PPP')}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={`${getStatusColor(selectedOrder.status)} mt-1`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                <p className="font-medium">{selectedOrder.user_name}</p>
                <p className="text-sm">{selectedOrder.user_email}</p>
                <p className="text-sm">{selectedOrder.user_phone}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product</p>
                <p className="font-medium">{selectedOrder.product_name}</p>
                <p className="text-sm">Quantity: {selectedOrder.quantity}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment</p>
                <p className="text-lg font-semibold">
                  ₹{(selectedOrder.product_price * selectedOrder.quantity).toFixed(2)}
                </p>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the current status of this order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="font-medium">Order: {selectedOrder?.id?.substring(0, 8)}</p>
            <p className="text-sm">Current Status: 
              <span className={`${selectedOrder ? getStatusColor(selectedOrder.status) : ''} px-2 py-0.5 rounded ml-2`}>
                {selectedOrder?.status.charAt(0).toUpperCase() + selectedOrder?.status.slice(1)}
              </span>
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Select New Status:</p>
              <div className="grid grid-cols-1 gap-2">
                {['pending', 'accepted', 'processing', 'delivered', 'cancelled'].map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    className={`justify-start ${getStatusColor(status)} hover:bg-opacity-80`}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updateStatusMutation.isPending}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteOrderMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Orders;
