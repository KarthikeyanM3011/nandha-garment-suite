
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/api';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ShoppingCart, Plus, Minus, Package, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define types
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

interface CartItem {
  product: Product;
  quantity: number;
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);

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

  // Filter products based on search term
  const filteredProducts = products ? products.filter((product: Product) => {
    return searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category_name.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Handle checkout
  const handleCheckout = () => {
    // Here you would implement the checkout process
    // For now, we'll just clear the cart and show a success message
    toast.success("Order placed successfully! Redirecting to checkout...");
    setCart([]);
    setIsCartDialogOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Products</h2>
          <p className="text-muted-foreground">Browse our collection of products</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setIsCartDialogOpen(true)}
        >
          <ShoppingCart size={18} />
          <span>Cart ({cart.length})</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Categories tabs */}
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex sm:flex-col h-auto bg-transparent space-x-1 sm:space-x-0 sm:space-y-1">
              <TabsTrigger 
                value="all" 
                className="w-full justify-start mb-1 data-[state=active]:bg-brand-blue data-[state=active]:text-white"
              >
                All Products
              </TabsTrigger>
              {!categoriesLoading && categories && categories.map((category: Category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="w-full justify-start data-[state=active]:bg-brand-blue data-[state=active]:text-white"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1">
          {/* Search input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search products by name or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products grid */}
          <DataState
            isLoading={productsLoading || categoriesLoading}
            error={productsError || categoriesError}
            isEmpty={!filteredProducts || filteredProducts.length === 0}
            emptyMessage="No products found. Try adjusting your search or filter."
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product: Product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-md transition-all">
                  {product.image && (
                    <div className="w-full h-48 overflow-hidden bg-gray-100">
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
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Badge variant="outline" className="bg-blue-50">
                        {product.category_name}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {product.description || "No description available"}
                    </p>
                    <div className="text-2xl font-bold text-brand-blue">
                      {formatPrice(product.price)}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 py-3">
                    <Button 
                      onClick={() => addToCart(product)} 
                      className="w-full gap-2"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </DataState>
        </div>
      </div>

      {/* Shopping Cart Dialog */}
      <Dialog open={isCartDialogOpen} onOpenChange={setIsCartDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart size={20} />
              Shopping Cart
            </DialogTitle>
            <DialogDescription>
              Review your items and proceed to checkout.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-md">
                <Package size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-muted-foreground">Your cart is empty.</p>
                <Button 
                  variant="link" 
                  onClick={() => setIsCartDialogOpen(false)}
                  className="mt-2"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-[400px] overflow-auto pr-1">
                  {cart.map((item) => (
                    <div 
                      key={item.product.id}
                      className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50"
                    >
                      <div className="flex gap-3">
                        {item.product.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/100?text=No+Image';
                            }}
                          />
                        )}
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

                <div className="border-t pt-4 flex justify-between items-end">
                  <p className="text-muted-foreground">
                    {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                  </p>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="text-2xl font-bold text-brand-blue">
                      {formatPrice(cartTotal)}
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCartDialogOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                  <Button onClick={handleCheckout}>
                    Checkout
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
