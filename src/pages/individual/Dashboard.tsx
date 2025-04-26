
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ruler, ShoppingBag, ClipboardList, ArrowRight, Package, Shirt } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface IndividualStatsData {
  hasMeasurements: boolean;
  totalOrders: number;
  featuredProducts: Array<{ id: string; name: string; category: string; price: number }>;
  recentOrders: Array<{ id: string; product: string; status: string; date: string }>;
}

const IndividualDashboard: React.FC = () => {
  const { userData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<IndividualStatsData>({
    hasMeasurements: false,
    totalOrders: 0,
    featuredProducts: [],
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
            hasMeasurements: true,
            totalOrders: 5,
            featuredProducts: [
              { id: '1', name: 'Corporate Shirt', category: 'Corporate Wear', price: 1200 },
              { id: '2', name: 'School Uniform', category: 'School Uniforms', price: 950 },
              { id: '3', name: 'Sports T-Shirt', category: 'Sports Wear', price: 850 },
            ],
            recentOrders: [
              { id: 'ORD-1234', product: 'Corporate Shirt (2 pcs)', status: 'Delivered', date: '2023-11-01' },
              { id: 'ORD-1235', product: 'Sports T-Shirt (1 pc)', status: 'Processing', date: '2023-11-05' },
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
        <h1 className="text-2xl font-bold">Welcome, {userData?.name || 'Customer'}</h1>
        <p className="text-gray-500 mt-1">
          Manage your measurements and orders
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Measurements Card */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <div className="rounded-full bg-blue-100 p-2 w-10 h-10 flex items-center justify-center mb-2">
              <Ruler className="h-5 w-5 text-brand-blue" />
            </div>
            <CardTitle className="text-lg font-medium">My Measurements</CardTitle>
            <CardDescription>
              {stats.hasMeasurements 
                ? 'Your measurements are recorded'
                : 'No measurements recorded yet'}
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Link to="/individual/measurements" className="w-full">
              <Button variant="outline" className="w-full justify-between">
                <span>Manage Measurements</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Products Card */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <div className="rounded-full bg-purple-100 p-2 w-10 h-10 flex items-center justify-center mb-2">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
            <CardTitle className="text-lg font-medium">Product Catalog</CardTitle>
            <CardDescription>Browse available products</CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Link to="/individual/products" className="w-full">
              <Button variant="outline" className="w-full justify-between">
                <span>Browse Products</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Orders Card */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <div className="rounded-full bg-amber-100 p-2 w-10 h-10 flex items-center justify-center mb-2">
              <ClipboardList className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle className="text-lg font-medium">My Orders</CardTitle>
            <CardDescription>
              {isLoading ? (
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                `${stats.totalOrders} total orders`
              )}
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Link to="/individual/orders" className="w-full">
              <Button variant="outline" className="w-full justify-between">
                <span>View Orders</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Featured Products */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(null).map((_, index) => (
              <Card key={index} className="card-hover">
                <CardHeader className="pb-2">
                  <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            stats.featuredProducts.map((product) => (
              <Card key={product.id} className="card-hover">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-medium">{product.name}</CardTitle>
                      <CardDescription>{product.category}</CardDescription>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Shirt className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg">₹{product.price}</p>
                    <Link to={`/individual/products/${product.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
                ))}
              </div>
            ) : stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.product}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`text-sm font-medium ${
                        order.status === 'Delivered' ? 'text-green-600' :
                        order.status === 'Processing' ? 'text-blue-600' : 'text-amber-600'
                      }`}>
                        {order.status}
                      </div>
                      <div className="text-xs text-gray-500">{order.date}</div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center mt-4">
                  <Link to="/individual/orders">
                    <Button variant="link" className="text-brand-blue">
                      View All Orders
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders yet</p>
                <div className="mt-4">
                  <Link to="/individual/products">
                    <Button>Shop Now</Button>
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

export default IndividualDashboard;
