
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Building2, Users, ShoppingBag, ClipboardList } from 'lucide-react';
import { userService, productService, orderService } from '../../services/api';

interface StatsData {
  totalOrganizations: number;
  totalIndividuals: number;
  totalProducts: number;
  totalOrders: number;
}

const SuperAdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalOrganizations: 0,
    totalIndividuals: 0,
    totalProducts: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // These would be actual API calls in a real scenario
        // For now, we'll simulate some data
        // const orgAdmins = await userService.getAllOrgAdmins();
        // const individuals = await userService.getAllIndividuals();
        // const products = await productService.getAllProducts();
        // const orders = await orderService.getAllOrders();
        
        // Simulate data
        setStats({
          totalOrganizations: 12,
          totalIndividuals: 48,
          totalProducts: 35,
          totalOrders: 124,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Organizations Card */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Organizations</CardTitle>
            <CardDescription>Total registered organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalOrganizations
                )}
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Building2 className="h-5 w-5 text-brand-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individuals Card */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Individuals</CardTitle>
            <CardDescription>Total individual users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalIndividuals
                )}
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Products</CardTitle>
            <CardDescription>Total available products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalProducts
                )}
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Orders</CardTitle>
            <CardDescription>Total orders processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalOrders
                )}
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <ClipboardList className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Organizations</CardTitle>
            <CardDescription>
              Latest organizations registered on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* This would be a real data list in a real app */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">ABC Corporation</p>
                    <p className="text-sm text-gray-500">Registered 3 days ago</p>
                  </div>
                  <div className="text-sm text-gray-500">5 users</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">XYZ Industries</p>
                    <p className="text-sm text-gray-500">Registered 5 days ago</p>
                  </div>
                  <div className="text-sm text-gray-500">8 users</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Tech Solutions Ltd</p>
                    <p className="text-sm text-gray-500">Registered 1 week ago</p>
                  </div>
                  <div className="text-sm text-gray-500">12 users</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders placed on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* This would be a real data list in a real app */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Order #12345</p>
                    <p className="text-sm text-gray-500">ABC Corporation</p>
                  </div>
                  <div className="text-sm font-medium text-green-600">Completed</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Order #12344</p>
                    <p className="text-sm text-gray-500">John Doe (Individual)</p>
                  </div>
                  <div className="text-sm font-medium text-blue-600">Processing</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Order #12343</p>
                    <p className="text-sm text-gray-500">XYZ Industries</p>
                  </div>
                  <div className="text-sm font-medium text-amber-600">Pending</div>
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
