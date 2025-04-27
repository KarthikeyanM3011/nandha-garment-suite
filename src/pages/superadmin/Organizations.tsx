
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/api';
import { organizationService } from '@/services/api-extensions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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

// Define form schema
const organizationFormSchema = z.object({
  name: z.string().min(2, { message: "Organization name must be at least 2 characters" }),
  pan: z.string().min(10, { message: "PAN must be at least 10 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  gstin: z.string().min(15, { message: "GSTIN must be 15 characters" }).max(15),
});

const Organizations = () => {
  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  // Fetch organizations
  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        const response = await organizationService.getAllOrganizations();
        return response.data.organizations || [];
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
        throw new Error('Failed to fetch organizations');
      }
    }
  });

  // Create organization mutation
  const createOrgMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!userData?.id) throw new Error('User ID is required');
      return await userService.createOrganization({
        ...data,
        created_by: userData.id
      });
    },
    onSuccess: () => {
      toast.success('Organization created successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(`Failed to create organization: ${error.message}`);
    }
  });

  // Delete organization mutation
  const deleteOrgMutation = useMutation({
    mutationFn: async (orgId: string) => {
      return await organizationService.deleteOrganization(orgId);
    },
    onSuccess: () => {
      toast.success('Organization deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete organization: ${error.message}`);
    }
  });

  // Form setup
  const form = useForm<z.infer<typeof organizationFormSchema>>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
      pan: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof organizationFormSchema>) => {
    createOrgMutation.mutate(data);
  };

  // Handle delete organization
  const handleDeleteOrganization = (orgId: string) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      deleteOrgMutation.mutate(orgId);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Organizations</h2>
          <p className="text-muted-foreground">Manage all organizations in the system</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Enter the details for the new organization. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                <FormField
                  control={form.control}
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                </div>
                <FormField
                  control={form.control}
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
                  <Button type="submit" disabled={createOrgMutation.isPending}>
                    {createOrgMutation.isPending ? 'Creating...' : 'Create Organization'}
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
        emptyMessage="No organizations found. Click 'Add Organization' to create one."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data && data.map((org: Organization) => (
            <Card key={org.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold">{org.name}</CardTitle>
                    <CardDescription className="mt-1">{org.email}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteOrganization(org.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PAN:</span>
                    <span className="font-medium">{org.pan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GSTIN:</span>
                    <span className="font-medium">{org.gstin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{org.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium mt-1">{org.address}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-gray-50 py-3">
                <div className="text-xs text-muted-foreground w-full flex justify-between">
                  <span>Created: {new Date(org.created_at).toLocaleDateString()}</span>
                  <Button variant="outline" size="sm" className="h-8">
                    <Pencil size={14} className="mr-1" /> Edit
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DataState>
    </div>
  );
};

export default Organizations;
