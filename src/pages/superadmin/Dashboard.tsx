
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { organizationService } from '@/services/api-extensions';
import { Button } from '@/components/ui/button';
import { Building2, Users, ShoppingBag, ClipboardList, ArrowRight, AlertCircle, Calendar } from 'lucide-react';
import { userService, productService } from '../../services/api';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const SuperAdminDashboard: React.FC = () => {
  // Fetch organizations data
  const {
    data: organizationsData,
    isLoading: isLoadingOrgs,
    error: orgsError
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        console.log('Fetching organizations...');   
        const response = await organizationService.getAllOrganizations();
        console.log('Organizations fetched:', response.data);
        return response.data.organizations || [];
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
        throw new Error('Failed to fetch organizations');
      }
    }
  });

  // Fetch individual users data
  const {
    data: individualsData,
    isLoading: isLoadingIndividuals,
    error: individualsError
  } = useQuery({
    queryKey: ['individuals'],
    queryFn: async () => {
      try {
        // In a real implementation, you would have an endpoint to get individual users
        // For now, we'll return a simple mock
        return { count: 48 };
      } catch (error) {
        console.error('Failed to fetch individuals:', error);
        toast.error('Failed to fetch individuals data');
        throw error;
      }
    }
  });

  // Fetch products data
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

  // Fetch orders data
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError
  } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        // In a real implementation, you would have an endpoint to get all orders
        // For now, we'll return a simple mock
        return { count: 124 };
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        toast.error('Failed to fetch orders data');
        throw error;
      }
    }
  });

  const isLoading = isLoadingOrgs || isLoadingIndividuals || isLoadingProducts || isLoadingOrders;
  const hasError = orgsError || individualsError || productsError || ordersError;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Super Admin Dashboard</h1>
          <p className="text-gray-500">Welcome to the command center. Manage everything from here.</p>
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
        {/* Organizations Card */}
        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-lg font-medium flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-brand-blue" />
              <span>Organizations</span>
            </CardTitle>
            <CardDescription>Total registered organizations</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-800">
                {isLoadingOrgs ? (
                  <Skeleton className="h-9 w-16 bg-gray-200" />
                ) : (
                  organizationsData?.length || 0
                )}
              </div>
              <div className="p-2 bg-blue-50 rounded-full text-brand-blue">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <Link to="/super-admin/organizations" className="w-full">
              <Button variant="ghost" className="w-full justify-between text-brand-blue hover:text-brand-dark hover:bg-blue-50 group-hover:bg-blue-50/50 transition-colors">
                <span>View Organizations</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Individuals Card */}
        <Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-lg font-medium flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Individuals</span>
            </CardTitle>
            <CardDescription>Total individual users</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-800">
                {isLoadingIndividuals ? (
                  <Skeleton className="h-9 w-16 bg-gray-200" />
                ) : (
                  individualsData?.count || 0
                )}
              </div>
              <div className="p-2 bg-green-50 rounded-full text-green-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <Link to="/super-admin/individuals" className="w-full">
              <Button variant="ghost" className="w-full justify-between text-green-600 hover:text-green-700 hover:bg-green-50 group-hover:bg-green-50/50 transition-colors">
                <span>View Individuals</span>
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
            <CardDescription>Total available products</CardDescription>
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
            <Link to="/super-admin/products" className="w-full">
              <Button variant="ghost" className="w-full justify-between text-purple-600 hover:text-purple-700 hover:bg-purple-50 group-hover:bg-purple-50/50 transition-colors">
                <span>View Products</span>
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
            <CardDescription>Total orders processed</CardDescription>
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
            <Link to="/super-admin/orders" className="w-full">
              <Button variant="ghost" className="w-full justify-between text-amber-600 hover:text-amber-700 hover:bg-amber-50 group-hover:bg-amber-50/50 transition-colors">
                <span>View Orders</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-brand-blue" />
              <span>Recent Organizations</span>
            </CardTitle>
            <CardDescription>
              Latest organizations registered on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOrgs ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-12 w-full bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : organizationsData && organizationsData.length > 0 ? (
              <div className="space-y-4">
                {organizationsData.slice(0, 3).map((org: any) => (
                  <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-brand-blue/20 hover:bg-blue-50/30 transition-colors group">
                    <div>
                      <p className="font-medium text-gray-800 group-hover:text-brand-blue transition-colors">{org.name}</p>
                      <p className="text-sm text-gray-500">{org.adminCount} {org.adminCount === 1 ? 'admin' : 'admins'}</p>
                    </div>
                    <Link to={`/super-admin/organizations/${org.id}`}>
                      <Button size="sm" variant="ghost" className="text-gray-500 hover:text-brand-blue">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
                {organizationsData.length > 3 && (
                  <div className="text-center pt-2">
                    <Link to="/super-admin/organizations">
                      <Button variant="link" className="text-brand-blue hover:text-brand-dark">
                        View all organizations
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No organizations found</p>
                <div className="mt-4">
                  <Link to="/super-admin/organizations/new">
                    <Button variant="outline" className="text-brand-blue border-brand-blue hover:bg-brand-blue/5">
                      Create Organization
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
              <span>Recent Products</span>
            </CardTitle>
            <CardDescription>
              Latest products added to the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-12 w-full bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : productsData && productsData.length > 0 ? (
              <div className="space-y-4">
                {productsData.slice(0, 3).map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-purple-300/20 hover:bg-purple-50/30 transition-colors group">
                    <div>
                      <p className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category_name} - ₹{product.price}</p>
                    </div>
                    <Link to={`/super-admin/products/${product.id}`}>
                      <Button size="sm" variant="ghost" className="text-gray-500 hover:text-purple-600">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
                {productsData.length > 3 && (
                  <div className="text-center pt-2">
                    <Link to="/super-admin/products">
                      <Button variant="link" className="text-purple-600 hover:text-purple-700">
                        View all products
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No products found</p>
                <div className="mt-4">
                  <Link to="/super-admin/products/new">
                    <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50">
                      Add Product
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

export default SuperAdminDashboard;
