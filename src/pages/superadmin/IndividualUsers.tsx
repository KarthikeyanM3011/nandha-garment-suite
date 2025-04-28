
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/api';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define types
interface IndividualUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

// Define form schema
const individualFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const IndividualUsers = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IndividualUser | null>(null);

  // Fetch individual users
  const { data, isLoading, error } = useQuery({
    queryKey: ['individualUsers'],
    queryFn: async () => {
      try {
        console.log('Fetching individual users...');   
        const response = await userService.getIndividuals();
        console.log('Individual users fetched:', response.data);
        return response.data.individuals || [];
      } catch (err) {
        console.error('Failed to fetch individual users:', err);
        throw new Error('Failed to fetch individual users');
      }
    }
  });

  // Create individual user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof individualFormSchema>) => {
      return await userService.createIndividual(data);
    },
    onSuccess: () => {
      toast.success('Individual user created successfully');
      queryClient.invalidateQueries({ queryKey: ['individualUsers'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast.error(`Failed to create individual user: ${error.message}`);
    }
  });

  // Update individual user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string, data: Partial<z.infer<typeof individualFormSchema>> }) => {
      return await userService.updateIndividual(userId, data);
    },
    onSuccess: () => {
      toast.success('Individual user updated successfully');
      queryClient.invalidateQueries({ queryKey: ['individualUsers'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to update individual user: ${error.message}`);
    }
  });

  // Delete individual user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await userService.deleteIndividual(userId);
    },
    onSuccess: () => {
      toast.success('Individual user deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['individualUsers'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete individual user: ${error.message}`);
    }
  });

  // Create form setup
  const createForm = useForm<z.infer<typeof individualFormSchema>>({
    resolver: zodResolver(individualFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      password: '',
    },
  });

  // Edit form setup
  const editForm = useForm<Partial<z.infer<typeof individualFormSchema>>>({
    resolver: zodResolver(individualFormSchema.partial()),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  // Handle create form submission
  const onCreateSubmit = (data: z.infer<typeof individualFormSchema>) => {
    createUserMutation.mutate(data);
  };

  // Handle edit form submission
  const onEditSubmit = (data: Partial<z.infer<typeof individualFormSchema>>) => {
    if (!selectedUser) return;
    
    const updateData: Partial<z.infer<typeof individualFormSchema>> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.address) updateData.address = data.address;
    if (data.password) updateData.password = data.password;
    
    updateUserMutation.mutate({ 
      userId: selectedUser.id, 
      data: updateData 
    });
  };

  // Handle edit user
  const handleEditUser = (user: IndividualUser) => {
    setSelectedUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Individual Users</h2>
          <p className="text-muted-foreground">Manage all individual users in the system</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add Individual User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Individual User</DialogTitle>
              <DialogDescription>
                Enter the details for the new individual user. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={createForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <DataState 
        isLoading={isLoading} 
        error={error} 
        isEmpty={!data || data.length === 0}
        emptyMessage="No individual users found. Click 'Add Individual User' to create one."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data && data.map((user: IndividualUser) => (
            <Card key={user.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
                    <CardDescription className="mt-1">{user.email}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium mt-1">{user.address}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-gray-50 py-3">
                <div className="text-xs text-muted-foreground w-full flex justify-between">
                  <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => handleEditUser(user)}
                  >
                    <Pencil size={14} className="mr-1" /> Edit
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DataState>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Individual User</DialogTitle>
            <DialogDescription>
              Update the details for this individual user. Fields left blank will remain unchanged.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (leave blank to keep unchanged)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter new password" type="password" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IndividualUsers;
