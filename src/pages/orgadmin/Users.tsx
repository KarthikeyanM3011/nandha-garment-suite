
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DataState, TableRowSkeleton } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Search, UserPlus, Users, Building } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define types
interface OrgUser {
  id: string;
  org_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  age: number;
  department: string;
  created_at: string;
  updated_at: string;
}

interface OrgAdmin {
  id: string;
  org_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Define form schemas
const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  age: z.coerce.number().int().positive().optional(),
  department: z.string().optional(),
});

const adminFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const Users = () => {
  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<OrgUser | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  
  // Get organization ID from user context
  const orgId = userData?.org_id;

  // Fetch organization users
  const { 
    data: orgUsers, 
    isLoading: isOrgUsersLoading, 
    error: orgUsersError 
  } = useQuery({
    queryKey: ['orgUsers', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID is required');
      try {
        const response = await userService.getOrgUsersByOrg(orgId);
        return response.data.users || [];
      } catch (err) {
        console.error('Failed to fetch organization users:', err);
        throw new Error('Failed to fetch organization users');
      }
    },
    enabled: !!orgId,
  });

  // Fetch organization admins
  const { 
    data: orgAdmins, 
    isLoading: isOrgAdminsLoading, 
    error: orgAdminsError 
  } = useQuery({
    queryKey: ['orgAdmins', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID is required');
      try {
        const response = await userService.getOrgAdminsByOrg(orgId);
        return response.data.admins || [];
      } catch (err) {
        console.error('Failed to fetch organization admins:', err);
        throw new Error('Failed to fetch organization admins');
      }
    },
    enabled: !!orgId,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!orgId) throw new Error('Organization ID is required');
      if (!userData?.id) throw new Error('User ID is required');
      
      return await userService.createOrgUser({
        ...data,
        org_id: orgId,
        created_by: userData.id,
      });
    },
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['orgUsers'] });
      setIsUserDialogOpen(false);
      userForm.reset();
    },
    onError: (error: any) => {
      toast.error(`Failed to create user: ${error.message}`);
    }
  });

  // Create admin mutation
  const createAdminMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!orgId) throw new Error('Organization ID is required');
      
      return await userService.createOrgAdmin({
        ...data,
        org_id: orgId,
      });
    },
    onSuccess: () => {
      toast.success('Admin created successfully');
      queryClient.invalidateQueries({ queryKey: ['orgAdmins'] });
      setIsAdminDialogOpen(false);
      adminForm.reset();
    },
    onError: (error: any) => {
      toast.error(`Failed to create admin: ${error.message}`);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await userService.deleteOrgUser(userId);
    },
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['orgUsers'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete user: ${error.message}`);
    }
  });

  // Delete admin mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      return await userService.deleteOrgAdmin(adminId);
    },
    onSuccess: () => {
      toast.success('Admin deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['orgAdmins'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete admin: ${error.message}`);
    }
  });

  // User form setup
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      age: undefined,
      department: '',
    },
  });

  // Admin form setup
  const adminForm = useForm<z.infer<typeof adminFormSchema>>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Handle user form submission
  const onUserSubmit = (data: z.infer<typeof userFormSchema>) => {
    createUserMutation.mutate(data);
  };

  // Handle admin form submission
  const onAdminSubmit = (data: z.infer<typeof adminFormSchema>) => {
    createAdminMutation.mutate(data);
  };

  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Handle delete admin
  const handleDeleteAdmin = (adminId: string) => {
    if (confirm('Are you sure you want to delete this admin?')) {
      deleteAdminMutation.mutate(adminId);
    }
  };

  // Filter users based on search term
  const filteredUsers = orgUsers ? orgUsers.filter((user: OrgUser) => {
    return searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  // Filter admins based on search term
  const filteredAdmins = orgAdmins ? orgAdmins.filter((admin: OrgAdmin) => {
    return searchTerm === '' || 
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h2>
          <p className="text-muted-foreground">Manage users and admins for your organization</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users size={16} />
              Users
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-2">
              <Building size={16} />
              Admins
            </TabsTrigger>
          </TabsList>
          
          <div className="flex w-full sm:w-auto gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            
            {activeTab === 'users' ? (
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 h-9">
                    <UserPlus size={16} />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Organization User</DialogTitle>
                    <DialogDescription>
                      Add a new user to your organization. They will be able to place orders and manage their measurements.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={userForm.control}
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
                          control={userForm.control}
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
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={userForm.control}
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
                        <FormField
                          control={userForm.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Age (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter age" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={userForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter department" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
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
            ) : (
              <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 h-9">
                    <UserPlus size={16} />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Organization Admin</DialogTitle>
                    <DialogDescription>
                      Add a new admin to your organization. They will have administrative privileges.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...adminForm}>
                    <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4 pt-4">
                      <FormField
                        control={adminForm.control}
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
                        control={adminForm.control}
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
                        control={adminForm.control}
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
                      <DialogFooter>
                        <Button type="submit" disabled={createAdminMutation.isPending}>
                          {createAdminMutation.isPending ? 'Creating...' : 'Create Admin'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="bg-gray-50 border-b py-3">
              <CardTitle className="text-lg">Organization Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataState 
                isLoading={isOrgUsersLoading} 
                error={orgUsersError} 
                isEmpty={!filteredUsers || filteredUsers.length === 0}
                emptyMessage="No users found. Add a new user to get started."
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isOrgUsersLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRowSkeleton key={index} cols={6} />
                      ))
                    ) : (
                      filteredUsers.map((user: OrgUser) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{user.department || 'N/A'}</TableCell>
                          <TableCell>{user.age || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </DataState>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins">
          <Card>
            <CardHeader className="bg-gray-50 border-b py-3">
              <CardTitle className="text-lg">Organization Admins</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataState 
                isLoading={isOrgAdminsLoading} 
                error={orgAdminsError} 
                isEmpty={!filteredAdmins || filteredAdmins.length === 0}
                emptyMessage="No admins found. Add a new admin to get started."
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isOrgAdminsLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRowSkeleton key={index} cols={4} />
                      ))
                    ) : (
                      filteredAdmins.map((admin: OrgAdmin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">{admin.name}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteAdmin(admin.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </DataState>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Users;
