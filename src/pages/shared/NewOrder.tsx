
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { User, ShoppingBag, Ruler } from 'lucide-react';
import { useOrderForm } from '@/features/orders/hooks/useOrderForm';
import UserSelectionTab from '@/features/orders/components/UserSelectionTab';
import ProductSelectionTab from '@/features/orders/components/ProductSelectionTab';
import MeasurementSelectionTab from '@/features/orders/components/MeasurementSelectionTab';
import OrderReviewTab from '@/features/orders/components/OrderReviewTab';
import { NewOrderProps } from '@/features/orders/types';
import { toast } from 'sonner';

const NewOrder: React.FC<NewOrderProps> = ({ isOrgAdmin }) => {
  const navigate = useNavigate();
  const {
    form,
    activeTab,
    setActiveTab,
    selectedUser,
    setSelectedUser,
    selectedProduct,
    setSelectedProduct,
    productPrice,
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
  } = useOrderForm(isOrgAdmin);

  const handleBack = () => {
    navigate(isOrgAdmin ? '/org-admin/orders' : '/individual/orders');
  };

  const handleNext = () => {
    if (activeTab === "user" && !selectedUser) {
      toast.error("Please select a user");
      return;
    }
    if (activeTab === "product" && !selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    
    const nextTab = {
      user: "product",
      product: "measurement",
      measurement: "review",
    }[activeTab];
    
    if (nextTab) setActiveTab(nextTab);
  };

  const handlePrev = () => {
    const prevTab = {
      product: "user",
      measurement: "product",
      review: "measurement",
    }[activeTab];
    
    if (prevTab) setActiveTab(prevTab);
  };

  const handleSubmit = (data: any) => {
    createOrderMutation.mutate(data);
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <UserSelectionTab
                    isOrgAdmin={isOrgAdmin}
                    users={users}
                    isUsersLoading={isUsersLoading}
                    usersError={usersError}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    userData={userData}
                    onNext={handleNext}
                  />

                  <ProductSelectionTab
                    products={products}
                    isProductsLoading={isProductsLoading}
                    productsError={productsError}
                    selectedProduct={selectedProduct}
                    setSelectedProduct={setSelectedProduct}
                    onNext={handleNext}
                    onPrev={handlePrev}
                  />

                  <MeasurementSelectionTab
                    form={form}
                    measurements={measurements}
                    isMeasurementsLoading={isMeasurementsLoading}
                    measurementsError={measurementsError}
                    onNext={handleNext}
                    onPrev={handlePrev}
                  />

                  <OrderReviewTab
                    form={form}
                    users={users}
                    products={products}
                    measurements={measurements}
                    selectedUser={selectedUser}
                    selectedProduct={selectedProduct}
                    productPrice={productPrice}
                    createOrderMutation={createOrderMutation}
                    onPrev={handlePrev}
                  />
                </form>
              </Form>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t bg-gray-50">
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
