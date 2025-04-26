
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Ruler, ShoppingBag, ClipboardList, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userService, measurementService, productService } from '../../services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

const OrgAdminDashboard: React.FC = () => {
  const { userData } = useAuth();
  
  // Fetch organization users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery({
    queryKey: ['orgUsers', userData?.org_id],
    queryFn: async () => {
      if (!userData?.org_id) throw new Error("Organization ID not found");
      
      try {
        const response = await userService.getOrgUsersByOrg(userData.org_id);
        return response.data.users || [];
      } catch (error) {
        console.error('Failed to fetch organization users:', error);
        toast.error('Failed to fetch organization users');
        throw error;
      }
    },
    enabled: !!userData?.org_id
  });

  // Fetch organization measurements
  const {
    data: measurementsData,
    isLoading: isLoadingMeasurements,
    error: measurementsError
  } = useQuery({
    queryKey: ['orgMeasurements', userData?.org_id],
    queryFn: async () => {
      if (!userData?.org_id) throw new Error("Organization ID not found");
      
      try {
        const response = await measurementService.getOrgMeasurements(userData.org_id);
        return response.data.measurements || [];
      } catch (error) {
        console.error('Failed to fetch organization measurements:', error);
        toast.error('Failed to fetch measurements data');
        throw error;
      }
    },
    enabled: !!userData?.org_id
  });

  // Fetch products
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const response = await productService.getAllProducts();
        return response.data.products || [];
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Failed to fetch products data');
        throw error;
      }
    }
  });

  // For orders, we'll use a mock as there's no direct endpoint yet
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError
  } = useQuery({
    queryKey: ['orgOrders', userData?.org_id],
    queryFn: async () => {
      // In a real app, you would fetch this from the API
      return { 
        count: 42,
        recentOrders: [
          { id: 'ORD-2345', product: 'Corporate Uniform (5 sets)', status: 'Processing', date: '2023-11-08', user: 'John Smith' },
          { id: 'ORD-2344', product: 'Sports Wear (10 sets)', status: 'Completed', date: '2023-11-05', user: 'Team C' },
          { id: 'ORD-2343', product: 'School Uniform (15 sets)', status: 'Pending', date: '2023-11-03', user: 'Marketing Dept' },
        ]
      };
    },
    enabled: !!userData?.org_id
  });

  const isLoading = isLoadingUsers || isLoadingMeasurements || isLoadingProducts || isLoadingOrders;
  const hasError = usersError || measurementsError || productsError || ordersError;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Organization Dashboard</h1>
          {userData?.org_name && (
            <p className="text-gray-500">
              Managing {userData.org_name}
            </p>
          )}
        </div>
        
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4 text-brand-blue" />
          <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
        </div>
      </div>

      {hasError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">There was an error loading dashboard data</h3>
            <p className="text-sm text-red-600">Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-lg font-medium flex items-center space-x-2">
              <Users className="h-5 w-5 text-brand-blue" />
              <span>Users</span>
            </CardTitle>
            <CardDescription>Total organization users</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-800">
                {isLoadingUsers ? (
                  <Skeleton className="h-9 w-16 bg-gray-200" />
                ) : (
                  usersData?.length || 0
                )}
              </div>
              <div className="p-2 bg-blue-50 rounded-full text-brand-blue">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <Link to="/org-admin/users" className="w-full">
              <Button variant="ghost" className="w-full justify-between text-brand-blue hover:text-brand-dark hover:bg-blue-50 group-hover:bg-blue-50/50 transition-colors">
                <span>Manage Users</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Measurements Card */}
        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-lg font-medium flex items-center space-x-2">
              <Ruler className="h-5 w-5 text-green-600" />
              <span>Measurements</span>
            </CardTitle>
            <CardDescription>Recorded measurements</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-800">
                {isLoadingMeasurements ? (
                  <Skeleton className="h-9 w-16 bg-gray-200" />
                ) : (
                  measurementsData?.length || 0
                )}
              </div>
              <div className="p-2 bg-green-50 rounded-full text-green-600">
                <Ruler className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <Link to="/org-admin/measurements" className="w-full">
              <Button variant="ghost" className="w-full justify-between text-green-600 hover:text-green-700 hover:bg-green-50 group-hover:bg-green-50/50 transition-colors">
                <span>Manage Measurements</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Products Card */}
        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-lg font-medium flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
              <span>Products</span>
            </CardTitle>
            <CardDescription>Available for ordering</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-800">
                {isLoadingProducts ? (
                  <Skeleton className="h-9 w-16 bg-gray-200" />
                ) : (
                  productsData?.length || 0
                )}
              </div>
              <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <Link to="/org-admin/products" className="w-full">
              <Button variant="ghost" className="w-full justify-between text-purple-600 hover:text-purple-700 hover:bg-purple-50 group-hover:bg-purple-50/50 transition-colors">
                <span>Browse Products</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Orders Card */}
        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-lg font-medium flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-amber-600" />
              <span>Orders</span>
            </CardTitle>
            <CardDescription>Total placed orders</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-800">
                {isLoadingOrders ? (
                  <Skeleton className="h-9 w-16 bg-gray-200" />
                ) : (
                  ordersData?.count || 0
                )}
              </div>
              <div className="p-2 bg-amber-50 rounded-full text-amber-600">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <Link to="/org-admin/orders" className="w-full">
              <Button variant="ghost" className="w-full justify-between text-amber-600 hover:text-amber-700 hover:bg-amber-50 group-hover:bg-amber-50/50 transition-colors">
                <span>Manage Orders</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-brand-blue" />
              <span>Recent Users</span>
            </CardTitle>
            <CardDescription>
              Recently added users in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : usersData && usersData.length > 0 ? (
              <div className="space-y-4">
                {usersData.slice(0, 3).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-brand-blue/20 hover:bg-blue-50/30 transition-colors group">
                    <div>
                      <p className="font-medium text-gray-800 group-hover:text-brand-blue transition-colors">{user.name}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 mr-3">{user.department || 'No department'}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          Added {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link to={`/org-admin/users/${user.id}`}>
                      <Button size="sm" variant="ghost" className="text-gray-500 hover:text-brand-blue">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
                {usersData.length > 3 && (
                  <div className="text-center pt-2">
                    <Link to="/org-admin/users">
                      <Button variant="link" className="text-brand-blue hover:text-brand-dark">
                        View all users
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No users found in your organization</p>
                <div className="mt-4">
                  <Link to="/org-admin/users/new">
                    <Button variant="outline" className="text-brand-blue border-brand-blue hover:bg-brand-blue/5">
                      Add User
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-amber-600" />
              <span>Recent Orders</span>
            </CardTitle>
            <CardDescription>
              Latest orders placed by your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : ordersData?.recentOrders && ordersData.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {ordersData.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50/20 transition-colors group">
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium text-gray-800 group-hover:text-amber-700 transition-colors">{order.id}</p>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{order.product} • {order.user}</p>
                    </div>
                    <Link to={`/org-admin/orders/${order.id}`}>
                      <Button size="sm" variant="ghost" className="text-gray-500 hover:text-amber-700">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Link to="/org-admin/orders">
                    <Button variant="link" className="text-amber-600 hover:text-amber-700">
                      View all orders
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No orders found</p>
                <div className="mt-4">
                  <Link to="/org-admin/products">
                    <Button variant="outline" className="text-amber-600 border-amber-600 hover:bg-amber-50">
                      Browse Products
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrgAdminDashboard;
