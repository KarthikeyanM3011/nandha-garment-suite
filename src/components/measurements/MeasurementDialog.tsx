
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementService } from '@/services/api-extensions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

// Measurement form schema
const measurementFormSchema = z.object({
  measurementTypeId: z.string().min(1, "Measurement type is required"),
  values: z.array(z.object({
    field_id: z.string(),
    field_name: z.string().optional(),
    value: z.string().min(1, "Value is required")
  }))
});

type MeasurementFormValues = z.infer<typeof measurementFormSchema>;

interface MeasurementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userType: string;
  measurementId?: string;
}

const MeasurementDialog: React.FC<MeasurementDialogProps> = ({
  isOpen,
  onClose,
  userId,
  userType,
  measurementId,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('type');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});

  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues: {
      measurementTypeId: '',
      values: []
    }
  });

  // Fetch measurement types
  const { 
    data: measurementTypes, 
    isLoading: typesLoading, 
    error: typesError 
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
    },
    enabled: isOpen
  });

  // Fetch measurement sections for the selected type
  const { 
    data: sections, 
    isLoading: sectionsLoading, 
    error: sectionsError 
  } = useQuery({
    queryKey: ['measurementSections', selectedType],
    queryFn: async () => {
      if (!selectedType) return [];
      try {
        const response = await measurementService.getMeasurementTypeSection(selectedType);
        console.log('Fetched sections data:', response.data);
        return response.data.sections || [];
      } catch (err) {
        console.error('Failed to fetch measurement sections:', err);
        throw new Error('Failed to fetch measurement sections');
      }
    },
    enabled: !!selectedType && isOpen,
  });

  // Fetch existing measurement if measurementId is provided
  const {
    data: existingMeasurement,
    isLoading: measurementLoading,
    error: measurementError
  } = useQuery({
    queryKey: ['measurement', measurementId],
    queryFn: async () => {
      if (!measurementId) return null;
      try {
        const response = await measurementService.getMeasurement(measurementId);
        return response.data.measurement || null;
      } catch (err) {
        console.error('Failed to fetch measurement:', err);
        throw new Error('Failed to fetch measurement');
      }
    },
    enabled: !!measurementId && isOpen,
  });

  // Create measurement mutation
  const createMeasurementMutation = useMutation({
    mutationFn: async (data: {
      user_id: string;
      user_type: string;
      measurement_type_id: string;
      values: Array<{ field_id: string; value: string }>;
    }) => {
      return await measurementService.createMeasurement(data);
    },
    onSuccess: () => {
      toast.success('Measurement saved successfully');
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Failed to save measurement: ${error.message}`);
    }
  });

  // Update measurement mutation
  const updateMeasurementMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Array<{ field_id: string; value: string }> }) => {
      return await measurementService.updateMeasurement(id, { values });
    },
    onSuccess: () => {
      toast.success('Measurement updated successfully');
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Failed to update measurement: ${error.message}`);
    }
  });

  // Effect to set selected type from existing measurement
  useEffect(() => {
    if (existingMeasurement && !selectedType) {
      setSelectedType(existingMeasurement.measurement_type_id);
      setActiveTab('values');

      // Extract values from existing measurement
      const values: { [key: string]: string } = {};
      if (existingMeasurement.values) {
        existingMeasurement.values.forEach((value: any) => {
          values[value.field_id] = value.value;
        });
      }
      
      setFormValues(values);
    }
  }, [existingMeasurement, selectedType]);

  // Handle type selection
  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setActiveTab('values');
  };

  // Handle form input changes
  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedType) {
      toast.error('Please select a measurement type');
      return;
    }

    const values = Object.entries(formValues).map(([fieldId, value]) => ({
      field_id: fieldId,
      value: value
    }));

    if (values.length === 0) {
      toast.error('Please fill in some measurement values');
      return;
    }

    if (measurementId) {
      // Update existing measurement
      updateMeasurementMutation.mutate({
        id: measurementId,
        values: values
      });
    } else {
      // Create new measurement
      createMeasurementMutation.mutate({
        user_id: userId,
        user_type: userType,
        measurement_type_id: selectedType,
        values: values
      });
    }
  };

  const isSubmitting = createMeasurementMutation.isPending || updateMeasurementMutation.isPending;
  const isLoading = typesLoading || (measurementId && measurementLoading) || sectionsLoading;
  const hasError = typesError || (measurementId && measurementError) || sectionsError;

  console.log('Selected type:', selectedType);
  console.log('Sections data:', sections);
  console.log('Sections loading:', sectionsLoading);
  console.log('Sections error:', sectionsError);

  // Add mock sections if none are available or if there's an error loading them
  const displaySections = sections && sections.length > 0 ? sections : [
    {
      id: "mock-section-1",
      title: "Basic Measurements",
      fields: [
        { id: "field-1", name: "Height", unit: "cm", description: "Your height in centimeters" },
        { id: "field-2", name: "Weight", unit: "kg", description: "Your weight in kilograms" },
        { id: "field-3", name: "Chest", unit: "cm", description: "Chest circumference" },
        { id: "field-4", name: "Waist", unit: "cm", description: "Waist circumference" }
      ]
    },
    {
      id: "mock-section-2",
      title: "Additional Measurements",
      fields: [
        { id: "field-5", name: "Hips", unit: "cm", description: "Hip circumference" },
        { id: "field-6", name: "Inseam", unit: "cm", description: "Inseam length" },
        { id: "field-7", name: "Shoulders", unit: "cm", description: "Shoulder width" },
        { id: "field-8", name: "Sleeve", unit: "cm", description: "Sleeve length" }
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {measurementId ? 'Edit Measurement' : 'Add New Measurement'}
          </DialogTitle>
          <DialogDescription>
            {measurementId 
              ? 'Update the measurement values below.' 
              : 'First select a measurement type, then fill in the values.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            <p className="ml-2">Loading measurements...</p>
          </div>
        ) : hasError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <p className="text-red-800">
              Failed to load measurement data. Please try again.
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="type" disabled={!!measurementId}>Select Type</TabsTrigger>
              <TabsTrigger value="values" disabled={!selectedType}>Enter Values</TabsTrigger>
            </TabsList>

            <TabsContent value="type">
              <div className="grid gap-4 md:grid-cols-2">
                {measurementTypes?.map((type: any) => (
                  <Card 
                    key={type.id} 
                    className={`cursor-pointer hover:border-brand-blue hover:shadow-md transition-all ${
                      selectedType === type.id ? 'border-brand-blue shadow-md' : ''
                    }`}
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium">{type.name}</h3>
                      {type.description && (
                        <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="values">
              <div className="space-y-6">
                {displaySections.map((section: any) => (
                  <Card key={section.id}>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-3">{section.title}</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {section.fields.map((field: any) => (
                          <div key={field.id}>
                            <FormLabel htmlFor={field.id}>{field.name}</FormLabel>
                            <div className="flex items-center mt-1">
                              <Input
                                id={field.id}
                                placeholder={`Enter ${field.name.toLowerCase()}`}
                                value={formValues[field.id] || ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                className="flex-1"
                              />
                              <span className="ml-2 text-muted-foreground min-w-[30px]">
                                {field.unit}
                              </span>
                            </div>
                            {field.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {field.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedType}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : measurementId ? 'Update Measurement' : 'Save Measurement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MeasurementDialog;
