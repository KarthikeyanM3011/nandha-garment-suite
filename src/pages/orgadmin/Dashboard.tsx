
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Ruler, ShoppingBag, ClipboardList } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface OrgStatsData {
  totalUsers: number;
  totalMeasurements: number;
  totalProducts: number;
  totalOrders: number;
  recentUsers: Array<{ id: string; name: string; department: string; registered: string }>;
  recentOrders: Array<{ id: string; product: string; status: string; date: string }>;
}

const OrgAdminDashboard: React.FC = () => {
  const { userData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<OrgStatsData>({
    totalUsers: 0,
    totalMeasurements: 0,
    totalProducts: 0,
    totalOrders: 0,
    recentUsers: [],
    recentOrders: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // These would be actual API calls in a real scenario
        // For now, we'll simulate some data
        setTimeout(() => {
          setStats({
            totalUsers: 24,
            totalMeasurements: 18,
            totalProducts: 35,
            totalOrders: 42,
            recentUsers: [
              { id: '1', name: 'John Smith', department: 'Sales', registered: '3 days ago' },
              { id: '2', name: 'Mary Johnson', department: 'Marketing', registered: '5 days ago' },
              { id: '3', name: 'Robert Williams', department: 'Engineering', registered: '1 week ago' },
            ],
            recentOrders: [
              { id: 'ORD-2345', product: 'Corporate Uniform (5 sets)', status: 'Processing', date: '2023-11-08' },
              { id: 'ORD-2344', product: 'Sports Wear (10 sets)', status: 'Completed', date: '2023-11-05' },
              { id: 'ORD-2343', product: 'School Uniform (15 sets)', status: 'Pending', date: '2023-11-03' },
            ],
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organization Admin Dashboard</h1>
        {userData?.org_name && (
          <p className="text-gray-500 mt-1">
            Managing {userData.org_name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Users</CardTitle>
            <CardDescription>Total organization users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalUsers
                )}
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-brand-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Measurements Card */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Measurements</CardTitle>
            <CardDescription>Recorded measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalMeasurements
                )}
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Ruler className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Products</CardTitle>
            <CardDescription>Available for ordering</CardDescription>
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
            <CardDescription>Total placed orders</CardDescription>
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
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Recently added users in your organization
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
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">Added {user.registered}</p>
                    </div>
                    <div className="text-sm text-gray-500">{user.department}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders placed by your organization
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
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.product}</p>
                    </div>
                    <div className={`text-sm font-medium ${
                      order.status === 'Completed' ? 'text-green-600' :
                      order.status === 'Processing' ? 'text-blue-600' : 'text-amber-600'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrgAdminDashboard;
