
import React from 'react';
import { Link } from 'react-router-dom';
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
import { Ruler, ShoppingBag, ClipboardList, ArrowRight, Package, Shirt, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { measurementService, productService } from '../../services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';

const IndividualDashboard: React.FC = () => {
  const { userData } = useAuth();

  // Fetch user measurements
  const {
    data: measurementsData,
    isLoading: isLoadingMeasurements,
    error: measurementsError
  } = useQuery({
    queryKey: ['userMeasurements', userData?.id],
    queryFn: async () => {
      if (!userData?.id) throw new Error("User ID not found");
      
      try {
        const response = await measurementService.getUserMeasurements(userData.id, 'individual');
        return {
          hasMeasurements: response.data.measurements && response.data.measurements.length > 0,
          measurements: response.data.measurements || []
        };
      } catch (error) {
        console.error('Failed to fetch user measurements:', error);
        toast.error('Failed to fetch measurements data');
        throw error;
      }
    },
    enabled: !!userData?.id
  });

  // Fetch featured products
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
    queryKey: ['userOrders', userData?.id],
    queryFn: async () => {
      // In a real app, you would fetch this from the API
      return { 
        totalOrders: 5,
        recentOrders: [
          { id: 'ORD-1234', product: 'Corporate Shirt (2 pcs)', status: 'Delivered', date: '2023-11-01' },
          { id: 'ORD-1235', product: 'Sports T-Shirt (1 pc)', status: 'Processing', date: '2023-11-05' },
        ]
      };
    },
    enabled: !!userData?.id
  });

  const isLoading = isLoadingMeasurements || isLoadingProducts || isLoadingOrders;
  const hasError = measurementsError || productsError || ordersError;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome, {userData?.name || 'Customer'}</h1>
          <p className="text-gray-500">
            Manage your measurements and orders
          </p>
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
            <h3 className="font-medium text-red-800">There was an error loading your dashboard</h3>
            <p className="text-sm text-red-600">Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Measurements Card */}
        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-blue-100 p-3 text-brand-blue">
                <Ruler className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-medium">My Measurements</CardTitle>
                <CardDescription>
                  {isLoadingMeasurements ? (
                    <Skeleton className="h-4 w-32 bg-gray-200 mt-1" />
                  ) : (
                    measurementsData?.hasMeasurements 
                      ? 'Your measurements are recorded'
                      : 'No measurements recorded yet'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter className="pt-4 pb-4">
            <Link to="/individual/measurements" className="w-full">
              <Button 
                variant="ghost" 
                className="w-full justify-between text-brand-blue hover:text-brand-dark hover:bg-blue-50 group-hover:bg-blue-50/50 transition-colors"
              >
                <span>Manage Measurements</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Products Card */}
        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-medium">Product Catalog</CardTitle>
                <CardDescription>
                  {isLoadingProducts ? (
                    <Skeleton className="h-4 w-32 bg-gray-200 mt-1" />
                  ) : (
                    `${productsData?.length || 0} products available`
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter className="pt-4 pb-4">
            <Link to="/individual/products" className="w-full">
              <Button 
                variant="ghost" 
                className="w-full justify-between text-purple-600 hover:text-purple-700 hover:bg-purple-50 group-hover:bg-purple-50/50 transition-colors"
              >
                <span>Browse Products</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Orders Card */}
        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-medium">My Orders</CardTitle>
                <CardDescription>
                  {isLoadingOrders ? (
                    <Skeleton className="h-4 w-32 bg-gray-200 mt-1" />
                  ) : (
                    `${ordersData?.totalOrders || 0} total orders`
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter className="pt-4 pb-4">
            <Link to="/individual/orders" className="w-full">
              <Button 
                variant="ghost" 
                className="w-full justify-between text-amber-600 hover:text-amber-700 hover:bg-amber-50 group-hover:bg-amber-50/50 transition-colors"
              >
                <span>View Orders</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Featured Products */}
      <div>
        <h2 className="text-xl font-semibold mb-5 text-gray-800">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoadingProducts ? (
            Array(3).fill(null).map((_, index) => (
              <Card key={index} className="border-0 shadow-card overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-24 bg-gray-200" />
                  <Skeleton className="h-4 w-32 bg-gray-200 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full bg-gray-200 rounded-lg" />
                </CardContent>
              </Card>
            ))
          ) : productsData && productsData.length > 0 ? (
            productsData.slice(0, 3).map((product: any) => (
              <Card key={product.id} className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
                <CardHeader className="pb-2 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-medium text-gray-800 group-hover:text-brand-blue transition-colors">{product.name}</CardTitle>
                      <CardDescription>{product.category_name}</CardDescription>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Shirt className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg text-brand-blue">₹{product.price}</p>
                    <Link to={`/individual/products/${product.id}`}>
                      <Button className="bg-brand-blue hover:bg-brand-dark shadow-button transition-all duration-200" size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 py-10 text-center text-gray-500">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="mb-4">No products available</p>
              <Link to="/individual/products">
                <Button variant="outline" className="text-brand-blue border-brand-blue hover:bg-brand-blue/5">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          )}
        </div>
        {productsData && productsData.length > 3 && (
          <div className="mt-4 text-center">
            <Link to="/individual/products">
              <Button variant="outline" className="text-brand-blue border-brand-blue hover:bg-brand-blue/5">
                View All Products
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-xl font-semibold mb-5 text-gray-800">Recent Orders</h2>
        <Card className="border-0 shadow-card">
          <CardContent className="pt-6">
            {isLoadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : ordersData?.recentOrders && ordersData.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {ordersData.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50/20 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 group-hover:text-amber-700 transition-colors">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.product}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{order.date}</div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center mt-4">
                  <Link to="/individual/orders">
                    <Button variant="link" className="text-amber-600 hover:text-amber-700">
                      View All Orders
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="mb-4">No orders yet</p>
                <Link to="/individual/products">
                  <Button className="bg-brand-blue hover:bg-brand-dark shadow-button transition-all duration-200">Shop Now</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IndividualDashboard;
