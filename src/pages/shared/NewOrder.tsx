import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { userService, productService, orderService, measurementService } from '@/services/api-extensions';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ShoppingBag, User, Ruler, ArrowRight } from 'lucide-react';

// Define schema for order creation
const orderFormSchema = z.object({
  user_id: z.string().min(1, { message: "User is required" }),
  product_id: z.string().min(1, { message: "Product is required" }),
  measurement_id: z.string().optional(),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface NewOrderProps {
  isOrgAdmin: boolean;
}

const NewOrder: React.FC<NewOrderProps> = ({ isOrgAdmin }) => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("user");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [productPrice, setProductPrice] = useState<number>(0);

  // Initialize form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      user_id: "",
      product_id: "",
      measurement_id: "",
      quantity: 1,
      notes: "",
    },
  });

  // Get org_id for organization admin
  const orgId = userData?.org_id;
  
  // Fetch users based on user role
  const {
    data: users,
    isLoading: isUsersLoading,
    error: usersError
  } = useQuery({
    queryKey: ['users', isOrgAdmin ? 'org' : 'individual', orgId],
    queryFn: async () => {
      try {
        if (isOrgAdmin) {
          if (!orgId) throw new Error("Organization ID is required");
          const response = await userService.getAllOrgUsers(orgId);
          return response.data.users || [];
        } else {
          // For individual users, we just return the current user
          return [userData];
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        throw new Error('Failed to fetch users');
      }
    },
    enabled: isOrgAdmin ? !!orgId : !!userData?.id
  });

  // Fetch products
  const {
    data: products,
    isLoading: isProductsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const response = await productService.getAllProducts();
        return response.data.products || [];
      } catch (error) {
        console.error('Failed to fetch products:', error);
        throw new Error('Failed to fetch products');
      }
    }
  });

  // Fetch measurements for selected user
  const {
    data: measurements,
    isLoading: isMeasurementsLoading,
    error: measurementsError
  } = useQuery({
    queryKey: ['measurements', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return [];
      
      try {
        // Get user type based on isOrgAdmin
        const userType = isOrgAdmin ? 'ORG_USER' : 'INDIVIDUAL';
        
        const response = await measurementService.getMeasurementsByUser(selectedUser, userType);
        return response.data.measurements || [];
      } catch (error) {
        console.error('Failed to fetch measurements:', error);
        throw new Error('Failed to fetch measurements');
      }
    },
    enabled: !!selectedUser
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      // Calculate the total amount based on product price and quantity
      const selectedProductData = products?.find((p: any) => p.id === data.product_id);
      const total = selectedProductData ? selectedProductData.price * data.quantity : 0;
      
      const orderData = {
        user_id: data.user_id,
        user_type: isOrgAdmin ? 'ORG_USER' : 'INDIVIDUAL',
        product_id: data.product_id,
        measurement_id: data.measurement_id || undefined,
        quantity: data.quantity,
        notes: data.notes,
        total_amount: total,
        org_user_id: isOrgAdmin ? data.user_id : undefined
      };
      
      return await orderService.createOrder(orderData);
    },
    onSuccess: () => {
      toast.success('Order created successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Navigate based on user role
      navigate(isOrgAdmin ? '/org-admin/orders' : '/individual/orders');
    },
    onError: (error: any) => {
      toast.error(`Failed to create order: ${error.message}`);
    }
  });

  // Handle form submission
  const onSubmit = (data: OrderFormValues) => {
    createOrderMutation.mutate(data);
  };

  // Update form value when user is selected
  useEffect(() => {
    if (selectedUser) {
      form.setValue('user_id', selectedUser);
    }
  }, [selectedUser, form]);

  // Update form value when product is selected
  useEffect(() => {
    if (selectedProduct) {
      form.setValue('product_id', selectedProduct);
      const product = products?.find((p: any) => p.id === selectedProduct);
      setProductPrice(product?.price || 0);
    }
  }, [selectedProduct, form, products]);

  // Handle back button
  const handleBack = () => {
    navigate(isOrgAdmin ? '/org-admin/orders' : '/individual/orders');
  };

  // Handle next step
  const handleNext = () => {
    if (activeTab === "user") {
      if (!selectedUser) {
        toast.error("Please select a user");
        return;
      }
      setActiveTab("product");
    } else if (activeTab === "product") {
      if (!selectedProduct) {
        toast.error("Please select a product");
        return;
      }
      setActiveTab("measurement");
    } else if (activeTab === "measurement") {
      setActiveTab("review");
    }
  };

  // Handle previous step
  const handlePrev = () => {
    if (activeTab === "product") {
      setActiveTab("user");
    } else if (activeTab === "measurement") {
      setActiveTab("product");
    } else if (activeTab === "review") {
      setActiveTab("measurement");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">New Order</h2>
          <p className="text-muted-foreground">Create a new order for a customer</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="user" className="gap-2">
                  <User size={16} /> Select User
                </TabsTrigger>
                <TabsTrigger value="product" className="gap-2">
                  <ShoppingBag size={16} /> Choose Product
                </TabsTrigger>
                <TabsTrigger value="measurement" className="gap-2">
                  <Ruler size={16} /> Select Measurements
                </TabsTrigger>
                <TabsTrigger value="review" className="gap-2">
                  Order Details
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <TabsContent value="user">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Select User</h3>
                      <p className="text-sm text-muted-foreground">
                        {isOrgAdmin ? "Choose the user for whom you're creating the order" : "Confirm your details for this order"}
                      </p>

                      <DataState
                        isLoading={isUsersLoading}
                        error={usersError}
                        isEmpty={!users || users.length === 0}
                        emptyMessage="No users available"
                      >
                        <div className="space-y-4">
                          {isOrgAdmin ? (
                            <RadioGroup
                              value={selectedUser || ""}
                              onValueChange={setSelectedUser}
                              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                            >
                              {users?.map((user: any) => (
                                <div key={user.id} className="relative">
                                  <RadioGroupItem
                                    value={user.id}
                                    id={`user-${user.id}`}
                                    className="absolute top-4 left-4 z-10"
                                  />
                                  <Label
                                    htmlFor={`user-${user.id}`}
                                    className={`block p-4 border rounded-md cursor-pointer ${selectedUser === user.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}
                                  >
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                    {user.department && (
                                      <div className="mt-1 text-xs bg-gray-100 inline-block px-2 py-1 rounded">
                                        {user.department}
                                      </div>
                                    )}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          ) : (
                            <div className="p-4 border rounded-md bg-gray-50">
                              <div className="font-medium">{userData?.name}</div>
                              <div className="text-sm text-muted-foreground">{userData?.email}</div>
                              {userData && userData.id && setSelectedUser(userData.id)}
                            </div>
                          )}
                        </div>
                      </DataState>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button type="button" onClick={handleNext} className="gap-2">
                        Next <ArrowRight size={16} />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="product">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Choose Product</h3>
                      <p className="text-sm text-muted-foreground">
                        Select the product you want to order
                      </p>

                      <DataState
                        isLoading={isProductsLoading}
                        error={productsError}
                        isEmpty={!products || products.length === 0}
                        emptyMessage="No products available"
                      >
                        <div className="space-y-4">
                          <RadioGroup
                            value={selectedProduct || ""}
                            onValueChange={setSelectedProduct}
                            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                          >
                            {products?.map((product: any) => (
                              <div key={product.id} className="relative">
                                <RadioGroupItem
                                  value={product.id}
                                  id={`product-${product.id}`}
                                  className="absolute top-4 left-4 z-10"
                                />
                                <Label
                                  htmlFor={`product-${product.id}`}
                                  className={`block p-4 border rounded-md cursor-pointer ${selectedProduct === product.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}
                                >
                                  {product.image && (
                                    <div className="w-full h-40 mb-2 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                      <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">₹{product.price}</div>
                                  {product.category && (
                                    <div className="mt-1 text-xs bg-gray-100 inline-block px-2 py-1 rounded">
                                      {product.category}
                                    </div>
                                  )}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </DataState>
                    </div>

                    <div className="flex justify-between mt-6">
                      <Button type="button" variant="outline" onClick={handlePrev} className="gap-2">
                        <ArrowLeft size={16} /> Back
                      </Button>
                      <Button type="button" onClick={handleNext} className="gap-2">
                        Next <ArrowRight size={16} />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="measurement">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Select Measurements</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose measurements for the product or skip this step if not needed
                      </p>

                      <FormField
                        control={form.control}
                        name="measurement_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Measurements</FormLabel>
                            <FormControl>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a measurement" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">None (Skip)</SelectItem>
                                  {measurements?.map((measurement: any) => (
                                    <SelectItem key={measurement.id} value={measurement.id}>
                                      {measurement.type_name || 'Measurement'} - {new Date(measurement.created_at).toLocaleDateString()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {isMeasurementsLoading && (
                        <div className="text-center p-4">Loading measurements...</div>
                      )}

                      {!isMeasurementsLoading && (!measurements || measurements.length === 0) && (
                        <div className="p-4 border rounded bg-yellow-50 text-yellow-800">
                          <p>No measurements found for this user.</p>
                          <p className="text-sm mt-1">You can continue without selecting measurements or add measurements first.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between mt-6">
                      <Button type="button" variant="outline" onClick={handlePrev} className="gap-2">
                        <ArrowLeft size={16} /> Back
                      </Button>
                      <Button type="button" onClick={handleNext} className="gap-2">
                        Next <ArrowRight size={16} />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="review">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Order Details</h3>
                      <p className="text-sm text-muted-foreground">
                        Review your order and add final details
                      </p>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  {...field} 
                                  onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Add any special instructions" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="border rounded-md p-4 space-y-2">
                        <h4 className="font-semibold">Order Summary</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">User:</div>
                          <div>{users?.find((user: any) => user.id === selectedUser)?.name || 'Unknown'}</div>
                          
                          <div className="text-muted-foreground">Product:</div>
                          <div>{products?.find((product: any) => product.id === selectedProduct)?.name || 'Unknown'}</div>
                          
                          <div className="text-muted-foreground">Price:</div>
                          <div>₹{productPrice}</div>

                          <div className="text-muted-foreground">Quantity:</div>
                          <div>{form.watch("quantity")}</div>

                          <div className="text-muted-foreground">Measurement:</div>
                          <div>
                            {form.watch("measurement_id") 
                              ? measurements?.find((m: any) => m.id === form.watch("measurement_id"))?.type_name || 'Selected'
                              : 'None'}
                          </div>

                          <div className="text-muted-foreground">Total:</div>
                          <div className="font-semibold">
                            ₹{(form.watch("quantity") || 1) * productPrice}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-6">
                      <Button type="button" variant="outline" onClick={handlePrev} className="gap-2">
                        <ArrowLeft size={16} /> Back
                      </Button>
                      <Button type="submit" disabled={createOrderMutation.isPending} className="gap-2">
                        {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
                      </Button>
                    </div>
                  </TabsContent>
                </form>
              </Form>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t bg-gray-50 flex justify-between">
            <p className="text-sm text-muted-foreground">
              {isOrgAdmin ? 'Creating order as organization admin' : 'Creating order for yourself'}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default NewOrder;
