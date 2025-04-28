
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DataState } from '@/components/ui/data-state';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ProductSelectionTabProps {
  products: any[];
  isProductsLoading: boolean;
  productsError: any;
  selectedProduct: string | null;
  setSelectedProduct: (productId: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const ProductSelectionTab: React.FC<ProductSelectionTabProps> = ({
  products,
  isProductsLoading,
  productsError,
  selectedProduct,
  setSelectedProduct,
  onNext,
  onPrev,
}) => {
  return (
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
        <Button type="button" variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft size={16} /> Back
        </Button>
        <Button type="button" onClick={onNext} className="gap-2">
          Next <ArrowRight size={16} />
        </Button>
      </div>
    </TabsContent>
  );
};

export default ProductSelectionTab;
