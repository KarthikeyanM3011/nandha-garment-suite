
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementService, userService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Ruler, Pencil, Trash2, Search, Users } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define types
interface MeasurementType {
  id: string;
  name: string;
  description: string;
  fields: Array<{
    id: string;
    name: string;
    description: string;
    unit: string;
  }>;
}

interface Measurement {
  id: string;
  user_id: string;
  user_type: string;
  measurement_type_id: string;
  created_at: string;
  updated_at: string;
  values: Array<{
    field_id: string;
    value: string;
  }>;
  type_name: string;
  user_name?: string;
}

interface OrgUser {
  id: string;
  name: string;
  email: string;
  department: string;
}

const OrgAdminMeasurements = () => {
  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);
  const [selectedMeasurementType, setSelectedMeasurementType] = useState<MeasurementType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch organization users
  const { 
    data: orgUsers, 
    isLoading: isUsersLoading,
  } = useQuery({
    queryKey: ['orgUsers', userData?.org_id],
    queryFn: async () => {
      if (!userData?.org_id) throw new Error('Organization ID is required');
      
      try {
        const response = await userService.getOrgUsers(userData.org_id);
        return response.data.users || [];
      } catch (err) {
        console.error('Failed to fetch organization users:', err);
        throw new Error('Failed to fetch organization users');
      }
    },
    enabled: !!userData?.org_id,
  });

  // Fetch measurement types
  const { 
    data: measurementTypes, 
    isLoading: isTypesLoading,
  } = useQuery({
    queryKey: ['measurementTypes'],
    queryFn: async () => {
      try {
        const response = await measurementService.getMeasurementTypes();
        return response.data.types || [];
      } catch (err) {
        console.error('Failed to fetch measurement types:', err);
        throw new Error('Failed to fetch measurement types');
      }
    }
  });

  // Fetch user's measurements
  const {
    data: measurements,
    isLoading: isMeasurementsLoading,
    error: measurementsError
  } = useQuery({
    queryKey: ['measurements', selectedUserId, 'ORG_USER'],
    queryFn: async () => {
      if (!selectedUserId) throw new Error('User ID is required');
      
      try {
        const response = await measurementService.getMeasurementsByUser(
          selectedUserId, 
          'ORG_USER'
        );
        return response.data.measurements || [];
      } catch (err) {
        console.error('Failed to fetch measurements:', err);
        throw new Error('Failed to fetch measurements');
      }
    },
    enabled: !!selectedUserId
  });

  // Create measurement mutation
  const createMeasurementMutation = useMutation({
    mutationFn: async (data: { 
      measurement_type_id: string; 
      values: Array<{ field_id: string; value: string }> 
    }) => {
      if (!selectedUserId) throw new Error('User ID is required');
      
      return await measurementService.createMeasurement({
        user_id: selectedUserId,
        user_type: 'ORG_USER',
        measurement_type_id: data.measurement_type_id,
        values: data.values
      });
    },
    onSuccess: () => {
      toast.success('Measurement created successfully');
      queryClient.invalidateQueries({ queryKey: ['measurements', selectedUserId, 'ORG_USER'] });
      setIsAddDialogOpen(false);
      setSelectedMeasurementType(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to create measurement: ${error.message}`);
    }
  });

  // Update measurement mutation
  const updateMeasurementMutation = useMutation({
    mutationFn: async ({ 
      measurementId, 
      values 
    }: { 
      measurementId: string; 
      values: Array<{ field_id: string; value: string }> 
    }) => {
      return await measurementService.updateMeasurement(measurementId, { values });
    },
    onSuccess: () => {
      toast.success('Measurement updated successfully');
      queryClient.invalidateQueries({ queryKey: ['measurements', selectedUserId, 'ORG_USER'] });
      setIsEditDialogOpen(false);
      setSelectedMeasurement(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to update measurement: ${error.message}`);
    }
  });

  // Delete measurement mutation
  const deleteMeasurementMutation = useMutation({
    mutationFn: async (measurementId: string) => {
      return await measurementService.deleteMeasurement(measurementId);
    },
    onSuccess: () => {
      toast.success('Measurement deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['measurements', selectedUserId, 'ORG_USER'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete measurement: ${error.message}`);
    }
  });

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    const user = orgUsers?.find((u: OrgUser) => u.id === userId);
    if (user) {
      setSelectedUserId(userId);
      setSelectedUserName(user.name);
    }
  };

  // Handle delete measurement
  const handleDeleteMeasurement = (measurementId: string) => {
    if (confirm('Are you sure you want to delete this measurement?')) {
      deleteMeasurementMutation.mutate(measurementId);
    }
  };

  // Handle edit measurement
  const handleEditMeasurement = (measurement: Measurement) => {
    // Find the measurement type
    const type = measurementTypes?.find(t => t.id === measurement.measurement_type_id);
    if (!type) {
      toast.error('Measurement type not found');
      return;
    }
    
    setSelectedMeasurement(measurement);
    setSelectedMeasurementType(type);
    setIsEditDialogOpen(true);
  };

  // Handle form submission for adding new measurement
  const handleAddMeasurement = (values: Record<string, string>) => {
    if (!selectedMeasurementType) return;
    
    const formattedValues = Object.entries(values).map(([field_id, value]) => ({
      field_id,
      value
    }));

    createMeasurementMutation.mutate({ 
      measurement_type_id: selectedMeasurementType.id, 
      values: formattedValues
    });
  };

  // Handle form submission for editing measurement
  const handleEditMeasurementSubmit = (values: Record<string, string>) => {
    if (!selectedMeasurement) return;
    
    const formattedValues = Object.entries(values).map(([field_id, value]) => ({
      field_id,
      value
    }));

    updateMeasurementMutation.mutate({ 
      measurementId: selectedMeasurement.id, 
      values: formattedValues
    });
  };

  // Handle measurement type selection
  const handleMeasurementTypeSelect = (typeId: string) => {
    const type = measurementTypes?.find(t => t.id === typeId);
    if (type) {
      setSelectedMeasurementType(type);
    }
  };

  // Filter users based on search term
  const filteredUsers = orgUsers ? orgUsers.filter((user: OrgUser) => {
    return searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  const isLoading = isUsersLoading || isTypesLoading || (!!selectedUserId && isMeasurementsLoading);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">User Measurements</h2>
          <p className="text-muted-foreground">Manage measurements for users in your organization</p>
        </div>
        {selectedUserId && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Add Measurement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Ruler size={20} />
                  Add New Measurement for {selectedUserName}
                </DialogTitle>
                <DialogDescription>
                  Select a measurement type and enter the measurements.
                </DialogDescription>
              </DialogHeader>
              
              {!selectedMeasurementType ? (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label htmlFor="measurementType" className="text-sm font-medium">
                      Measurement Type
                    </label>
                    <Select onValueChange={handleMeasurementTypeSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a measurement type" />
                      </SelectTrigger>
                      <SelectContent>
                        {measurementTypes?.map((type: MeasurementType) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {measurementTypes?.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        No measurement types available.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <MeasurementForm
                  type={selectedMeasurementType}
                  initialValues={{}}
                  onSubmit={handleAddMeasurement}
                  isSubmitting={createMeasurementMutation.isPending}
                  submitText={createMeasurementMutation.isPending ? 'Saving...' : 'Save Measurements'}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users size={18} />
                Organization Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-auto">
              <DataState 
                isLoading={isUsersLoading} 
                error={null} 
                isEmpty={!filteredUsers || filteredUsers.length === 0}
                emptyMessage={searchTerm ? "No users match your search" : "No users found in your organization"}
              >
                <div className="divide-y">
                  {filteredUsers?.map((user: OrgUser) => (
                    <button
                      key={user.id}
                      className={`w-full text-left p-3 flex items-center hover:bg-gray-50 transition-colors ${
                        selectedUserId === user.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.department && (
                          <p className="text-xs text-muted-foreground mt-1">{user.department}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </DataState>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-4">
          {selectedUserId ? (
            <Card>
              <CardHeader className="bg-gray-50 border-b py-3">
                <CardTitle className="text-lg">
                  Measurements for {selectedUserName}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <DataState 
                  isLoading={isMeasurementsLoading} 
                  error={measurementsError} 
                  isEmpty={!measurements || measurements.length === 0}
                  emptyMessage="No measurements found for this user. Click 'Add Measurement' to get started."
                >
                  <div className="space-y-6">
                    {measurements?.map((measurement: Measurement) => {
                      const type = measurementTypes?.find(t => t.id === measurement.measurement_type_id);
                      
                      return (
                        <div key={measurement.id} className="border rounded-md overflow-hidden">
                          <div className="bg-gray-50 p-3 flex justify-between items-center border-b">
                            <div>
                              <h3 className="font-medium flex items-center gap-2">
                                <Ruler size={16} />
                                {measurement.type_name || 'Measurement'}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Added on {new Date(measurement.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditMeasurement(measurement)}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteMeasurement(measurement.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                          <div className="p-4">
                            <Table>
                              <TableBody>
                                {type && measurement.values.map(value => {
                                  const field = type.fields.find(f => f.id === value.field_id);
                                  if (!field) return null;
                                  
                                  return (
                                    <TableRow key={value.field_id}>
                                      <TableCell className="py-2 text-muted-foreground">
                                        {field.name}
                                      </TableCell>
                                      <TableCell className="py-2 text-right font-medium">
                                        {value.value} {field.unit}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DataState>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center bg-gray-50 border rounded-lg">
              <div>
                <Users size={48} className="mx-auto text-gray-300 mb-2" />
                <h3 className="text-lg font-medium text-gray-600">Select a User</h3>
                <p className="text-muted-foreground mt-1">
                  Select a user from the list to view and manage their measurements.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Measurement Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ruler size={20} />
              Edit Measurement
            </DialogTitle>
            <DialogDescription>
              Update measurement values for {selectedUserName}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMeasurement && selectedMeasurementType && (
            <MeasurementForm
              type={selectedMeasurementType}
              initialValues={
                selectedMeasurement.values.reduce((acc, val) => {
                  acc[val.field_id] = val.value;
                  return acc;
                }, {} as Record<string, string>)
              }
              onSubmit={handleEditMeasurementSubmit}
              isSubmitting={updateMeasurementMutation.isPending}
              submitText={updateMeasurementMutation.isPending ? 'Updating...' : 'Update Measurements'}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Measurement Form Component
interface MeasurementFormProps {
  type: MeasurementType;
  initialValues: Record<string, string>;
  onSubmit: (values: Record<string, string>) => void;
  isSubmitting: boolean;
  submitText: string;
}

const MeasurementForm = ({ 
  type, 
  initialValues, 
  onSubmit, 
  isSubmitting, 
  submitText 
}: MeasurementFormProps) => {
  // Generate schema for the form
  const schema = generateSchema(type);
  
  // Define form default values
  const defaultValues: Record<string, string> = {};
  type.fields.forEach(field => {
    defaultValues[field.id] = initialValues[field.id] || '';
  });
  
  // Set up form
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues
  });
  
  // Handle form submission
  const handleSubmit = (data: Record<string, string>) => {
    onSubmit(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        <div className="space-y-4">
          {type.fields.map(field => (
            <FormField
              key={field.id}
              control={form.control}
              name={field.id}
              render={({ field: fieldProps }) => (
                <FormItem>
                  <FormLabel>{field.name}</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input {...fieldProps} type="text" />
                    </FormControl>
                    <span className="text-sm text-muted-foreground w-10">
                      {field.unit}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {submitText}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Helper function to generate schema for the form
const generateSchema = (type: MeasurementType | null) => {
  if (!type) return z.object({});
  
  const schema: Record<string, z.ZodString> = {};
  
  type.fields.forEach(field => {
    schema[field.id] = z.string().min(1, { message: `${field.name} is required` });
  });
  
  return z.object(schema);
};

export default OrgAdminMeasurements;
