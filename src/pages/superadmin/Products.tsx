
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/api';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Plus, Trash2, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataState } from '@/components/ui/data-state';

// Define types
interface Product {
  id: string;
  name: string;
  category_id: string;
  description?: string;
  price: number;
  image?: string;
  created_at: string;
  updated_at: string;
  category_name: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const Products = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    description: '',
    price: 0,
    image: '',
  });
  const [editProduct, setEditProduct] = useState({
    id: '',
    name: '',
    category_id: '',
    description: '',
    price: 0,
    image: '',
  });

  const queryClient = useQueryClient();

  // Fetch products
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productService.getAllProducts();
      return response.data.products || [];
    },
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['productCategories'],
    queryFn: async () => {
      const response = await productService.getProductCategories();
      return response.data.categories || [];
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (productData: {
      name: string;
      category_id: string;
      price: number;
      description?: string;
      image?: string;
    }) => {
      return productService.createProduct(productData);
    },
    onSuccess: () => {
      setIsAddProductDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added successfully');
      setNewProduct({
        name: '',
        category_id: '',
        description: '',
        price: 0,
        image: '',
      });
    },
    onError: (error) => {
      console.error('Failed to create product', error);
      toast.error('Failed to add product');
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (productData: {
      id: string;
      name?: string;
      category_id?: string;
      description?: string;
      price?: number;
      image?: string;
    }) => {
      const { id, ...data } = productData;
      return productService.updateProduct(id, data);
    },
    onSuccess: () => {
      setIsEditProductDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update product', error);
      toast.error('Failed to update product');
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: { name: string; description?: string }) => {
      return productService.createProductCategory(categoryData);
    },
    onSuccess: () => {
      setIsAddCategoryDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      toast.success('Category added successfully');
      setNewCategory({ name: '', description: '' });
    },
    onError: (error) => {
      console.error('Failed to create category', error);
      toast.error('Failed to add category');
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => {
      return productService.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete product', error);
      toast.error('Failed to delete product');
    },
  });

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  // Handle product form submission
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    createProductMutation.mutate({
      ...newProduct,
      price: Number(newProduct.price),
    });
  };

  // Handle edit product form submission
  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    updateProductMutation.mutate({
      ...editProduct,
      price: Number(editProduct.price),
    });
  };

  // Handle category form submission
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate(newCategory);
  };

  // Handle product deletion
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      description: product.description || '',
      price: product.price,
      image: product.image || '',
    });
    setIsEditProductDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products Management</h2>
          <p className="text-muted-foreground">Manage your product catalog and categories</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="products" className="px-8">
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="px-8">
            Categories
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddProductDialogOpen(true)} className="flex gap-2">
              <Plus size={18} />
              Add Product
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <DataState
                isLoading={productsLoading}
                error={productsError}
                isEmpty={!productsData || productsData.length === 0}
                emptyMessage="No products available. Add a new product to get started."
              >
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsData &&
                        productsData.map((product: Product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {product.image && (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-10 w-10 rounded object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://placehold.co/100?text=Product';
                                    }}
                                  />
                                )}
                                <span className="font-medium">{product.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.category_name}</Badge>
                            </TableCell>
                            <TableCell>{formatPrice(product.price)}</TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {product.description || 'No description'}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditClick(product)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </DataState>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddCategoryDialogOpen(true)} className="flex gap-2">
              <Plus size={18} />
              Add Category
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <DataState
                isLoading={categoriesLoading}
                error={categoriesError}
                isEmpty={!categoriesData || categoriesData.length === 0}
                emptyMessage="No categories available. Add a new category to get started."
              >
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoriesData &&
                        categoriesData.map((category: Category) => {
                          const productCount = productsData
                            ? productsData.filter(
                                (product: Product) => product.category_id === category.id
                              ).length
                            : 0;
                          return (
                            <TableRow key={category.id}>
                              <TableCell className="font-medium">{category.name}</TableCell>
                              <TableCell>{category.description || 'No description'}</TableCell>
                              <TableCell>{productCount} products</TableCell>
                              <TableCell>
                                {new Date(category.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </DataState>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new product.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={newProduct.category_id}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category_id: e.target.value })
                  }
                >
                  <option value="">Select a category</option>
                  {categoriesData &&
                    categoriesData.map((category: Category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (INR)</Label>
                <Input
                  id="price"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={newProduct.image}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                Add Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  required
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={editProduct.category_id}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, category_id: e.target.value })
                  }
                >
                  <option value="">Select a category</option>
                  {categoriesData &&
                    categoriesData.map((category: Category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price (INR)</Label>
                <Input
                  id="edit-price"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={editProduct.price}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editProduct.description}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  value={editProduct.image}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, image: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                Update Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new product category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCategory}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                Add Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
