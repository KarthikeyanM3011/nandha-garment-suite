
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService, userService } from '@/services/api-extensions';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Building2, Edit, Plus, Trash2, User, Users } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';

// Define types
interface Organization {
  id: string;
  name: string;
  pan: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  logo?: string;
  created_at: string;
  updated_at: string;
}

interface OrgUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Define form schema for organization users
const orgUserFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  department: z.string().min(2, { message: "Department must be at least 2 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  is_admin: z.boolean().default(false),
});

const OrganizationDetails = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditOrgDialogOpen, setIsEditOrgDialogOpen] = useState(false);
  const { userData } = useAuth();

  // Fetch organization details
  const { 
    data: organization, 
    isLoading: isOrgLoading, 
    error: orgError 
  } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID is required');
      
      try {
        const response = await organizationService.getOrganizationById(orgId);
        return response.data.organization || null;
      } catch (err) {
        console.error('Failed to fetch organization:', err);
        throw new Error('Failed to fetch organization');
      }
    },
    enabled: !!orgId,
  });

  // Fetch organization users
  const { 
    data: orgUsers, 
    isLoading: isUsersLoading,
    error: usersError
  } = useQuery({
    queryKey: ['orgUsers', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID is required');
      
      try {
        const response = await userService.getAllOrgUsers(orgId);
        return response.data.users || [];
      } catch (err) {
        console.error('Failed to fetch organization users:', err);
        throw new Error('Failed to fetch organization users');
      }
    },
    enabled: !!orgId && activeTab === 'users',
  });

  // Update organization mutation
  const updateOrgMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!orgId) throw new Error('Organization ID is required');
      
      return await organizationService.updateOrganization(orgId, data);
    },
    onSuccess: () => {
      toast.success('Organization updated successfully');
      queryClient.invalidateQueries({ queryKey: ['organization', orgId] });
      setIsEditOrgDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to update organization: ${error.message}`);
    }
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof orgUserFormSchema>) => {
      if (!orgId) throw new Error('Organization ID is required');
      
      return await userService.createOrgUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        department: data.department,
        password: data.password,
        is_admin: data.is_admin,
        org_id: orgId,
        created_by: userData?.id || 'super-admin',
      });
    },
    onSuccess: () => {
      toast.success('User added successfully');
      queryClient.invalidateQueries({ queryKey: ['orgUsers', orgId] });
      setIsAddUserDialogOpen(false);
      addUserForm.reset();
    },
    onError: (error: any) => {
      toast.error(`Failed to add user: ${error.message}`);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await userService.deleteOrgUser(userId);
    },
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['orgUsers', orgId] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete user: ${error.message}`);
    }
  });

  // Form setup for editing organization
  const editOrgForm = useForm<Partial<Organization>>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2, { message: "Organization name must be at least 2 characters" }).optional(),
        pan: z.string().min(10, { message: "PAN must be at least 10 characters" }).optional(),
        email: z.string().email({ message: "Please enter a valid email address" }).optional(),
        phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }).optional(),
        address: z.string().min(5, { message: "Address must be at least 5 characters" }).optional(),
        gstin: z.string().min(15, { message: "GSTIN must be 15 characters" }).max(15).optional(),
      })
    ),
    values: organization ? {
      name: organization.name,
      pan: organization.pan,
      email: organization.email,
      phone: organization.phone,
      address: organization.address,
      gstin: organization.gstin,
    } : {},
  });

  // Form setup for adding user
  const addUserForm = useForm<z.infer<typeof orgUserFormSchema>>({
    resolver: zodResolver(orgUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      department: '',
      password: '',
      is_admin: false,
    },
  });

  // Handle form submission for editing organization
  const onEditOrgSubmit = (data: Partial<Organization>) => {
    updateOrgMutation.mutate(data);
  };

  // Handle form submission for adding user
  const onAddUserSubmit = (data: z.infer<typeof orgUserFormSchema>) => {
    addUserMutation.mutate(data);
  };

  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/super-admin/organizations');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {isOrgLoading ? 'Loading...' : organization?.name || 'Organization Details'}
            </h2>
            <p className="text-muted-foreground">Manage organization details and users</p>
          </div>
        </div>
        {organization && (
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setIsEditOrgDialogOpen(true)}
          >
            <Edit size={16} />
            Edit Organization
          </Button>
        )}
      </div>

      <DataState 
        isLoading={isOrgLoading} 
        error={orgError} 
        isEmpty={!organization}
        emptyMessage="Organization not found"
      >
        {organization && (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="details" className="gap-2">
                  <Building2 size={16} />
                  Organization Details
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2">
                  <Users size={16} />
                  Users
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{organization.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{organization.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{organization.phone}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">PAN</p>
                        <p className="font-medium">{organization.pan}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">GSTIN</p>
                        <p className="font-medium">{organization.gstin}</p>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{organization.address}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Created At</p>
                        <p className="font-medium">{new Date(organization.created_at).toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="font-medium">{new Date(organization.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="users">
                <div className="flex justify-between mb-6">
                  <h3 className="text-lg font-medium">Organization Users</h3>
                  <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus size={16} />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Add a new user to {organization.name}.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...addUserForm}>
                        <form onSubmit={addUserForm.handleSubmit(onAddUserSubmit)} className="space-y-4 pt-4">
                          <FormField
                            control={addUserForm.control}
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
                            control={addUserForm.control}
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
                            control={addUserForm.control}
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
                              control={addUserForm.control}
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
                              control={addUserForm.control}
                              name="department"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Department</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter department" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={addUserForm.control}
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
                            <Button type="submit" disabled={addUserMutation.isPending}>
                              {addUserMutation.isPending ? 'Adding...' : 'Add User'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <DataState
                  isLoading={isUsersLoading}
                  error={usersError}
                  isEmpty={!orgUsers || orgUsers.length === 0}
                  emptyMessage="No users found for this organization"
                >
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orgUsers && orgUsers.map((user: OrgUser) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.department}</TableCell>
                              <TableCell>{user.phone}</TableCell>
                              <TableCell>{user.is_admin ? 'Admin' : 'User'}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </DataState>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DataState>

      {/* Edit Organization Dialog */}
      <Dialog open={isEditOrgDialogOpen} onOpenChange={setIsEditOrgDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update the details for {organization?.name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...editOrgForm}>
            <form onSubmit={editOrgForm.handleSubmit(onEditOrgSubmit)} className="space-y-4 pt-4">
              <FormField
                control={editOrgForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editOrgForm.control}
                name="pan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter PAN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editOrgForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editOrgForm.control}
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
                control={editOrgForm.control}
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
              <FormField
                control={editOrgForm.control}
                name="gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter GSTIN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateOrgMutation.isPending}>
                  {updateOrgMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationDetails;
