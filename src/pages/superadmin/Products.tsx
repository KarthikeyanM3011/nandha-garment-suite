
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/api';
import { toast } from 'sonner';
import { DataState, CardSkeleton } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

// Define form schemas
const productFormSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters" }),
  category_id: z.string().min(1, { message: "Category is required" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  description: z.string().optional(),
  image: z.string().optional(),
});

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters" }),
  description: z.string().optional(),
});

const Products = () => {
  const queryClient = useQueryClient();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch products
  const { 
    data: products, 
    isLoading: isProductsLoading, 
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

  // Fetch categories
  const { 
    data: categories, 
    isLoading: isCategoriesLoading, 
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

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: z.infer<typeof productFormSchema>) => {
      return await productService.createProduct(data);
    },
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsProductDialogOpen(false);
      productForm.reset();
    },
    onError: (error: any) => {
      toast.error(`Failed to create product: ${error.message}`);
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await productService.deleteProduct(productId);
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete product: ${error.message}`);
    }
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof categoryFormSchema>) => {
      return await productService.createProductCategory(data);
    },
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
    },
    onError: (error: any) => {
      toast.error(`Failed to create category: ${error.message}`);
    }
  });

  // Product form setup
  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      category_id: '',
      price: 0,
      description: '',
      image: '',
    },
  });

  // Category form setup
  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Handle product form submission
  const onProductSubmit = (data: z.infer<typeof productFormSchema>) => {
    createProductMutation.mutate(data);
  };

  // Handle category form submission
  const onCategorySubmit = (data: z.infer<typeof categoryFormSchema>) => {
    createCategoryMutation.mutate(data);
  };

  // Handle delete product
  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Products</h2>
          <p className="text-muted-foreground">Manage all products in the system</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Tag size={16} />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new product category to the system.
                </DialogDescription>
              </DialogHeader>
              <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={categoryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={categoryForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createCategoryMutation.isPending}>
                      {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to the system. Fill in all required fields.
                </DialogDescription>
              </DialogHeader>
              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={productForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category: Category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter price" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter image URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createProductMutation.isPending}>
                      {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>
            All Products
          </TabsTrigger>
          {categories && categories.map((category: Category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <DataState 
            isLoading={isProductsLoading} 
            error={productsError} 
            isEmpty={!products || products.length === 0}
            emptyMessage="No products found in this category."
          >
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products && products.map((product: Product) => (
                <Card key={product.id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-lg">
                          {product.category_name}
                        </span>
                        <CardTitle className="mt-2 text-xl">{product.name}</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {product.image && (
                      <div className="w-full h-48 mb-4 overflow-hidden rounded bg-gray-100">
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
                    <p className="text-muted-foreground text-sm mb-3">
                      {product.description || "No description available"}
                    </p>
                    <div className="text-2xl font-bold text-brand-blue">
                      {formatPrice(product.price)}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 py-3">
                    <div className="text-xs text-muted-foreground w-full flex justify-between items-center">
                      <span>Added: {new Date(product.created_at).toLocaleDateString()}</span>
                      <Button variant="outline" size="sm" className="h-8">
                        <Pencil size={14} className="mr-1" /> Edit
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </DataState>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;
