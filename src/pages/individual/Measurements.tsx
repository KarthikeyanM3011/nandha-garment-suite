
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Ruler, Pencil, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
}

const IndividualMeasurements = () => {
  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);
  const [selectedMeasurementType, setSelectedMeasurementType] = useState<MeasurementType | null>(null);

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
    queryKey: ['measurements', userData?.id, 'INDIVIDUAL'],
    queryFn: async () => {
      if (!userData?.id) throw new Error('User ID is required');
      
      try {
        const response = await measurementService.getMeasurementsByUser(
          userData.id, 
          'INDIVIDUAL'
        );
        return response.data.measurements || [];
      } catch (err) {
        console.error('Failed to fetch measurements:', err);
        throw new Error('Failed to fetch measurements');
      }
    },
    enabled: !!userData?.id
  });

  // Create measurement mutation
  const createMeasurementMutation = useMutation({
    mutationFn: async (data: { 
      measurement_type_id: string; 
      values: Array<{ field_id: string; value: string }> 
    }) => {
      if (!userData?.id) throw new Error('User ID is required');
      
      return await measurementService.createMeasurement({
        user_id: userData.id,
        user_type: 'INDIVIDUAL',
        measurement_type_id: data.measurement_type_id,
        values: data.values
      });
    },
    onSuccess: () => {
      toast.success('Measurement created successfully');
      queryClient.invalidateQueries({ queryKey: ['measurements', userData?.id, 'INDIVIDUAL'] });
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
      queryClient.invalidateQueries({ queryKey: ['measurements', userData?.id, 'INDIVIDUAL'] });
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
      queryClient.invalidateQueries({ queryKey: ['measurements', userData?.id, 'INDIVIDUAL'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete measurement: ${error.message}`);
    }
  });

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

  // Generate schema for the dynamic form
  const generateSchema = (type: MeasurementType | null) => {
    if (!type) return z.object({});
    
    const schema: Record<string, z.ZodString> = {};
    
    type.fields.forEach(field => {
      schema[field.id] = z.string().min(1, { message: `${field.name} is required` });
    });
    
    return z.object(schema);
  };

  // Handle measurement type selection
  const handleMeasurementTypeSelect = (typeId: string) => {
    const type = measurementTypes?.find(t => t.id === typeId);
    if (type) {
      setSelectedMeasurementType(type);
    }
  };

  const isLoading = isTypesLoading || isMeasurementsLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">My Measurements</h2>
          <p className="text-muted-foreground">Manage your body measurements for tailored clothing</p>
        </div>
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
                Add New Measurement
              </DialogTitle>
              <DialogDescription>
                Select a measurement type and enter your measurements.
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
      </div>

      <DataState 
        isLoading={isLoading} 
        error={measurementsError} 
        isEmpty={!measurements || measurements.length === 0}
        emptyMessage="You haven't added any measurements yet. Click 'Add Measurement' to get started."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {measurements?.map((measurement: Measurement) => {
            const type = measurementTypes?.find(t => t.id === measurement.measurement_type_id);
            
            return (
              <Card key={measurement.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Ruler size={18} />
                      {measurement.type_name || 'Measurement'}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteMeasurement(measurement.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <CardDescription>
                    Added on {new Date(measurement.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
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
                </CardContent>
                <CardFooter className="border-t bg-gray-50 py-2">
                  <Button
                    variant="ghost"
                    className="w-full gap-2"
                    onClick={() => handleEditMeasurement(measurement)}
                  >
                    <Pencil size={14} />
                    Edit Measurements
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </DataState>

      {/* Edit Measurement Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ruler size={20} />
              Edit Measurement
            </DialogTitle>
            <DialogDescription>
              Update your measurement values.
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

export default IndividualMeasurements;
