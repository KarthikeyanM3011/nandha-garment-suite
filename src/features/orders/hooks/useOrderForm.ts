
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userService, productService, orderService, measurementService } from '@/services/api-extensions';
import { OrderFormValues, orderFormSchema } from '../types';
import { toast } from 'sonner';

export const useOrderForm = (isOrgAdmin: boolean) => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("user");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [productPrice, setProductPrice] = useState<number>(0);

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

  const orgId = userData?.org_id;

  const { data: users, isLoading: isUsersLoading, error: usersError } = useQuery({
    queryKey: ['users', isOrgAdmin ? 'org' : 'individual', orgId],
    queryFn: async () => {
      if (isOrgAdmin) {
        if (!orgId) throw new Error("Organization ID is required");
        const response = await userService.getAllOrgUsers(orgId);
        return response.data.users || [];
      } else {
        return [userData];
      }
    },
    enabled: isOrgAdmin ? !!orgId : !!userData?.id
  });

  const { data: products, isLoading: isProductsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productService.getAllProducts();
      return response.data.products || [];
    }
  });

  const { data: measurements, isLoading: isMeasurementsLoading, error: measurementsError } = useQuery({
    queryKey: ['measurements', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return [];
      const userType = isOrgAdmin ? 'ORG_USER' : 'INDIVIDUAL';
      const response = await measurementService.getMeasurementsByUser(selectedUser, userType);
      return response.data.measurements || [];
    },
    enabled: !!selectedUser
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
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
      navigate(isOrgAdmin ? '/org-admin/orders' : '/individual/orders');
    },
    onError: (error: any) => {
      toast.error(`Failed to create order: ${error.message}`);
    }
  });

  return {
    form,
    activeTab,
    setActiveTab,
    selectedUser,
    setSelectedUser,
    selectedProduct,
    setSelectedProduct,
    productPrice,
    setProductPrice,
    users,
    isUsersLoading,
    usersError,
    products,
    isProductsLoading,
    productsError,
    measurements,
    isMeasurementsLoading,
    measurementsError,
    createOrderMutation,
    userData
  };
};
