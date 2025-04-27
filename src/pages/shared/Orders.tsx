import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/api-extensions';
import { productService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DataState, TableRowSkeleton } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, SearchIcon, Plus, ShoppingBag, ArrowRight, CheckCircle, Clock, XCircle, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { userService } from '@/services/api';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define types
interface Order {
  id: string;
  user_id: string;
  user_type: string;
  org_user_id?: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  category_name: string;
  description?: string;
  image?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
}

// Define form schema for new order
const newOrderSchema = z.object({
  user_id: z.string().optional(),
  products: z.array(
    z.object({
      product_id: z.string(),
      quantity: z.coerce.number().int().positive(),
      price: z.coerce.number().positive()
    })
  ).min(1, { message: "Select at least one product" }),
  total_amount: z.coerce.number().positive()
});

const Orders = ({ isOrgAdmin = false }) => {
  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Array<{product: Product, quantity: number}>>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Get user ID and organization ID from context
  const userId = userData?.id;
  const orgId = userData?.org_id;

  // Fetch orders based on user role
  const { 
    data: orders, 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useQuery({
    queryKey: ['orders', userId, isOrgAdmin, orgId],
    queryFn: async () => {
      try {
        let response;
        if (isOrgAdmin && orgId) {
          response = await orderService.getOrdersByOrganization(orgId);
        } else if (userId) {
          response = await orderService.getOrdersByUser(userId, "individual");
        } else {
          throw new Error('User ID or Organization ID is required');
        }
        return response.data.orders || [];
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        throw new Error('Failed to fetch orders');
      }
    },
    enabled: !!(userId || (isOrgAdmin && orgId)),
  });

  // Fetch organization users if org admin
  const { 
    data: orgUsers, 
    isLoading: orgUsersLoading, 
    error: orgUsersError 
  } = useQuery({
    queryKey: ['orgUsers', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID is required');
      try {
        const response = await userService.getOrgUsersByOrg(orgId);
        return response.data.users || [];
      } catch (err) {
        console.error('Failed to fetch organization users:', err);
        throw new Error('Failed to fetch organization users');
      }
    },
    enabled: !!(isOrgAdmin && orgId),
  });

  // Fetch products for order creation
  const { 
    data: products, 
    isLoading: productsLoading, 
    error: productsError 
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const response = await productService.getAllProducts();
        return response.data.products || [];
      } catch (err) {
        console.error('Failed to fetch products:', err);
        throw new Error('Failed to fetch products');
      }
    }
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      return await orderService.createOrder(data);
    },
    onSuccess: () => {
      toast.success('Order created successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsNewOrderDialogOpen(false);
      setSelectedProducts([]);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to create order: ${error.message}`);
    }
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      return await orderService.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      toast.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update order status: ${error.message}`);
    }
  });

  // Filter orders based on search term and status
  const filteredOrders = orders ? orders.filter((order: Order) => {
    const matchesSearch = searchTerm === '' || 
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user_name && order.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  }) : [];

  // Add product to order
  const addProductToOrder = (product: Product) => {
    setSelectedProducts((prev) => {
      const existingProduct = prev.find(item => item.product.id === product.id);
      if (existingProduct) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Update product quantity in order
  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      setSelectedProducts(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    
    setSelectedProducts(prev => 
      prev.map(item => 
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Handle order submission
  const handleCreateOrder = () => {
    if (!userId) {
      toast.error('User ID is required');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('Please add at least one product to the order');
      return;
    }

    const orderItems = selectedProducts.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalAmount = selectedProducts.reduce(
      (sum, item) => sum + (item.product.price * item.quantity), 
      0
    );

    const orderData = {
      user_id: isOrgAdmin ? (selectedUser?.id || '') : userId,
      user_type: isOrgAdmin ? "org_user" : "individual",
      org_user_id: isOrgAdmin ? selectedUser?.id : undefined,
      items: orderItems,
      total_amount: totalAmount
    };

    createOrderMutation.mutate(orderData);
  };

  // Handle updating order status
  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  // Handle viewing order details
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsDialogOpen(true);
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

  // Calculate total amount for selected products
  const calculateTotalAmount = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h2>
          <p className="text-muted-foreground">
            {isOrgAdmin ? 'Manage all orders for your organization' : 'View and manage your orders'}
          </p>
        </div>
        <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                {isOrgAdmin 
                  ? 'Select a user and products to create an order for your organization.' 
                  : 'Select products to place a new order.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* User selection for org admin */}
              {isOrgAdmin && (
                <div className="space-y-2">
                  <FormLabel>Select User</FormLabel>
                  <Select
                    value={selectedUser?.id || ''}
                    onValueChange={(value) => {
                      const user = orgUsers?.find((u: User) => u.id === value);
                      setSelectedUser(user || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgUsers?.map((user: User) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isOrgAdmin && !selectedUser && (
                    <p className="text-sm text-red-500">Please select a user before adding products</p>
                  )}
                </div>
              )}

              {/* Product selection */}
              {(!isOrgAdmin || (isOrgAdmin && selectedUser)) && (
                <>
                  <div className="space-y-2">
                    <FormLabel>Add Products</FormLabel>
                    <div className="border rounded-md max-h-[200px] overflow-y-auto p-2">
                      <DataState
                        isLoading={productsLoading}
                        error={productsError}
                        isEmpty={!products || products.length === 0}
                        emptyMessage="No products available."
                      >
                        <div className="space-y-2">
                          {products?.map((product: Product) => (
                            <div 
                              key={product.id} 
                              className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                              onClick={() => addProductToOrder(product)}
                            >
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.category_name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-brand-blue">{formatPrice(product.price)}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                >
                                  <Plus size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </DataState>
                    </div>
                  </div>

                  {/* Selected products */}
                  <div>
                    <FormLabel>Selected Products</FormLabel>
                    {selectedProducts.length === 0 ? (
                      <div className="border rounded-md p-6 text-center">
                        <p className="text-muted-foreground">No products selected</p>
                      </div>
                    ) : (
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedProducts.map(({product, quantity}) => (
                              <TableRow key={product.id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{formatPrice(product.price)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center border rounded-md w-24">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-none"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateProductQuantity(product.id, quantity - 1);
                                      }}
                                    >
                                      <Minus size={14} />
                                    </Button>
                                    <span className="flex-1 text-center">{quantity}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-none"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateProductQuantity(product.id, quantity + 1);
                                      }}
                                    >
                                      <Plus size={14} />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatPrice(product.price * quantity)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  {/* Order total */}
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-brand-blue">
                        {formatPrice(calculateTotalAmount())}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsNewOrderDialogOpen(false);
                  setSelectedProducts([]);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateOrder}
                disabled={
                  (isOrgAdmin && !selectedUser) || 
                  selectedProducts.length === 0 ||
                  createOrderMutation.isPending
                }
              >
                {createOrderMutation.isPending ? 'Creating Order...' : 'Create Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
          <CardTitle className="text-lg">Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataState 
            isLoading={ordersLoading || (isOrgAdmin && orgUsersLoading)} 
            error={ordersError || (isOrgAdmin && orgUsersError)}
            isEmpty={!filteredOrders || filteredOrders.length === 0}
            emptyMessage="No orders found. Create a new order to get started."
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
                {ordersLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRowSkeleton key={index} cols={isOrgAdmin ? 6 : 5} />
                  ))
                ) : (
                  filteredOrders.map((order: Order) => (
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
                          className="h-8 px-2 gap-1"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          <Eye size={16} />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </DataState>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsDialogOpen} onOpenChange={setIsOrderDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag size={20} />
              Order Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this order.
            </DialogDescription>
          </DialogHeader>
          
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
                    {(isOrgAdmin || selectedOrder.status === 'pending') && (
                      <Select
                        defaultValue={selectedOrder.status}
                        onValueChange={(value) => handleUpdateOrderStatus(selectedOrder.id, value)}
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
                <h3 className="text-lg font-medium mb-2">Order Status Timeline</h3>
                <div className="relative pl-8 border-l-2 border-gray-200 space-y-6">
                  {['placed', 'processing', 'shipped', 'delivered'].map((step, index) => {
                    const isCompleted = index === 0 || 
                      (selectedOrder.status === 'processing' && index <= 1) ||
                      (selectedOrder.status === 'shipped' && index <= 2) ||
                      (selectedOrder.status === 'delivered');

                    const isCurrent = 
                      (selectedOrder.status === 'pending' && index === 0) ||
                      (selectedOrder.status === 'processing' && index === 1) ||
                      (selectedOrder.status === 'shipped' && index === 2) ||
                      (selectedOrder.status === 'delivered' && index === 3);
                      
                    return (
                      <div key={step} className="relative">
                        <div className="absolute -left-10 mt-1">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : isCurrent ? (
                            <Clock className="h-5 w-5 text-blue-500" />
                          ) : selectedOrder.status === 'cancelled' ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300 bg-white" />
                          )}
                        </div>
                        <div>
                          <h4 className={`font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : ''}`}>
                            Order {step.charAt(0).toUpperCase() + step.slice(1)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {index === 0 ? 'Order has been placed' :
                             index === 1 ? 'Order is being processed' :
                             index === 2 ? 'Order has been shipped' :
                             'Order has been delivered'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-end">
                <div>
                  <Button variant="outline" className="gap-2" onClick={() => setIsOrderDetailsDialogOpen(false)}>
                    Close
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
