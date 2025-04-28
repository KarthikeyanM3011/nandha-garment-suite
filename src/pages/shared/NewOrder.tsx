
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/services/api';
import { orderService } from '@/services/api-extensions';
import { userService } from '@/services/api';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Search, Plus, Minus, ArrowLeft, Users, Trash2, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NewOrderProps {
  isOrgAdmin: boolean;
}

interface Product {
  id: string;
  name: string;
  category_id: string;
  description: string;
  price: number;
  image: string;
  created_at: string;
  updated_at: string;
  category_name: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface OrgUser {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const NewOrder = ({ isOrgAdmin }: NewOrderProps) => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<OrgUser | null>(null);

  // If individual user, set their ID as the selected user
  useEffect(() => {
    if (!isOrgAdmin && userData?.id) {
      setSelectedUserId(userData.id);
    }
  }, [isOrgAdmin, userData?.id]);

  // Fetch all products
  const { 
    data: products, 
    isLoading: productsLoading, 
    error: productsError 
  } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      try {
        let response;
        if (selectedCategory === 'all') {
          response = await productService.getAllProducts();
        } else {
          response = await productService.getProductsByCategory(selectedCategory);
        }
        return response.data.products || [];
      } catch (err) {
        console.error('Failed to fetch products:', err);
        throw new Error('Failed to fetch products');
      }
    }
  });

  // Fetch product categories
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useQuery({
    queryKey: ['productCategories'],
    queryFn: async () => {
      try {
        const response = await productService.getProductCategories();
        return response.data.categories || [];
      } catch (err) {
        console.error('Failed to fetch product categories:', err);
        throw new Error('Failed to fetch product categories');
      }
    }
  });

  // Fetch organization users (only for org admin)
  const { 
    data: orgUsers, 
    isLoading: orgUsersLoading, 
    error: orgUsersError 
  } = useQuery({
    queryKey: ['orgUsers', userData?.org_id],
    queryFn: async () => {
      if (!userData?.org_id) throw new Error('Organization ID is required');
      
      try {
        const response = await userService.getOrgUsers(userData.org_id);
        return response.data.users || [];
      } catch (err) {
        console.error('Failed to fetch organization users:', err);
        throw new Error('Failed to fetch organization users');
      }
    },
    enabled: isOrgAdmin && !!userData?.org_id,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!userData?.id) throw new Error('User ID is required');
      if (isOrgAdmin && !selectedUserId) throw new Error('Please select a user to place an order');
      if (cart.length === 0) throw new Error('Cart cannot be empty');

      const userId = isOrgAdmin ? selectedUserId : userData.id;
      const userType = isOrgAdmin ? 'ORG_USER' : 'INDIVIDUAL';
      
      const orderData = {
        user_id: userId!,
        user_type: userType,
        org_user_id: isOrgAdmin ? userData.id : undefined,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        total_amount: cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      };

      return await orderService.createOrder(orderData);
    },
    onSuccess: () => {
      toast.success('Order placed successfully!');
      navigate(isOrgAdmin ? '/org-admin/orders' : '/individual/orders');
    },
    onError: (error: any) => {
      toast.error(`Failed to place order: ${error.message}`);
    }
  });

  // Filter products based on search term
  const filteredProducts = products ? products.filter((product: Product) => {
    return searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category_name.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  // Filter users based on search term
  const filteredUsers = orgUsers ? orgUsers.filter((user: OrgUser) => {
    return searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  // Update cart item quantity
  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    
    setCart((prev) => 
      prev.map((item) => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    toast.success("Item removed from cart");
  };

  // Handle user selection (for org admin)
  const handleUserSelect = (userId: string) => {
    const user = orgUsers?.find((u: OrgUser) => u.id === userId);
    if (user) {
      setSelectedUserId(userId);
      setSelectedUser(user);
    }
  };

  // Calculate total cart value
  const cartTotal = cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  // Handle place order
  const handlePlaceOrder = () => {
    createOrderMutation.mutate();
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(isOrgAdmin ? '/org-admin/orders' : '/individual/orders');
  };

  const isLoading = productsLoading || categoriesLoading || (isOrgAdmin && orgUsersLoading);
  const error = productsError || categoriesError || (isOrgAdmin && orgUsersError);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Place New Order</h2>
            <p className="text-muted-foreground">
              {isOrgAdmin 
                ? 'Create a new order for a user in your organization' 
                : 'Browse products and place your order'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{cart.length}</span> items
          </div>
          <Badge variant="outline" className="gap-1 px-3 py-1 text-brand-blue border-brand-blue">
            <ShoppingCart size={14} />
            <span className="font-bold">{formatPrice(cartTotal)}</span>
          </Badge>
        </div>
      </div>

      {/* For org admin: User selection */}
      {isOrgAdmin && (
        <Card className="mb-6">
          <CardHeader className="bg-gray-50 border-b py-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users size={18} />
              Select User
            </CardTitle>
            <CardDescription>
              Select the user you want to place this order for
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <DataState
              isLoading={orgUsersLoading}
              error={orgUsersError}
              isEmpty={!filteredUsers || filteredUsers.length === 0}
              emptyMessage="No users found in your organization"
            >
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search users by name or department"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredUsers?.map((user: OrgUser) => (
                    <button
                      key={user.id}
                      className={`p-4 rounded-lg border ${selectedUserId === user.id ? 'border-brand-blue bg-brand-blue/5' : 'hover:border-gray-300'} text-left transition-colors`}
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.department && (
                        <Badge variant="outline" className="mt-2">
                          {user.department}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </DataState>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Browse Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-gray-50 border-b py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag size={18} />
                Products
              </CardTitle>
              <CardDescription>
                Browse products and add them to your cart
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Search products by name or description"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DataState
                  isLoading={isLoading}
                  error={error}
                  isEmpty={!filteredProducts || filteredProducts.length === 0}
                  emptyMessage="No products found. Try adjusting your search or filter."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredProducts.map((product: Product) => (
                      <Card key={product.id} className="overflow-hidden hover:shadow-md transition-all">
                        <div className="flex h-full">
                          {product.image && (
                            <div className="w-1/3 bg-gray-100">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://placehold.co/300x200?text=No+Image';
                                }}
                              />
                            </div>
                          )}
                          <div className="w-2/3 flex flex-col">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between">
                                <Badge variant="outline" className="bg-blue-50">
                                  {product.category_name}
                                </Badge>
                              </div>
                              <CardTitle className="mt-2 text-lg">{product.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="py-2">
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {product.description || "No description available"}
                              </p>
                              <p className="text-xl font-bold text-brand-blue mt-2">
                                {formatPrice(product.price)}
                              </p>
                            </CardContent>
                            <CardFooter className="mt-auto">
                              <Button 
                                onClick={() => addToCart(product)} 
                                className="w-full gap-2"
                                size="sm"
                              >
                                <Plus size={14} />
                                Add to Cart
                              </Button>
                            </CardFooter>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </DataState>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div>
          <Card className="sticky top-24">
            <CardHeader className="bg-gray-50 border-b py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart size={18} />
                Your Cart
              </CardTitle>
              <CardDescription>
                Review your items before placing the order
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-md">
                  <ShoppingBag size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-muted-foreground">Your cart is empty.</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Browse products and add them to your cart.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-[400px] overflow-auto pr-1">
                    {cart.map((item) => (
                      <div 
                        key={item.product.id}
                        className="flex justify-between p-3 border rounded-md hover:bg-gray-50"
                      >
                        <div className="flex gap-3">
                          <img
                            src={item.product.image || 'https://placehold.co/100?text=No+Image'}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/100?text=No+Image';
                            }}
                          />
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-brand-blue font-medium text-sm">
                              {formatPrice(item.product.price)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none text-gray-500"
                              onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus size={14} />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none text-gray-500"
                              onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-xl font-bold text-brand-blue">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-gray-50 p-4">
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handlePlaceOrder}
                disabled={
                  cart.length === 0 || 
                  createOrderMutation.isPending ||
                  (isOrgAdmin && !selectedUserId)
                }
              >
                {createOrderMutation.isPending ? (
                  'Processing...'
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    Place Order
                  </>
                )}
              </Button>
              {isOrgAdmin && !selectedUserId && (
                <p className="text-xs text-red-500 mt-2 text-center w-full">
                  Please select a user before placing the order
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;
