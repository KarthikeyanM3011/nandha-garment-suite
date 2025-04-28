
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormValues } from '../types';

interface OrderReviewTabProps {
  form: UseFormReturn<OrderFormValues>;
  users: any[];
  products: any[];
  measurements: any[];
  selectedUser: string | null;
  selectedProduct: string | null;
  productPrice: number;
  createOrderMutation: any;
  onPrev: () => void;
}

const OrderReviewTab: React.FC<OrderReviewTabProps> = ({
  form,
  users,
  products,
  measurements,
  selectedUser,
  selectedProduct,
  productPrice,
  createOrderMutation,
  onPrev,
}) => {
  return (
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
        <Button type="button" variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft size={16} /> Back
        </Button>
        <Button type="submit" disabled={createOrderMutation.isPending} className="gap-2">
          {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
        </Button>
      </div>
    </TabsContent>
  );
};

export default OrderReviewTab;
