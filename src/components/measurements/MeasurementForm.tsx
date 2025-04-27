
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementService } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { DataState } from '../ui/data-state';

// Define types
interface MeasurementType {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface MeasurementSection {
  id: string;
  measurement_type_id: string;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  fields: MeasurementField[];
}

interface MeasurementField {
  id: string;
  section_id: string;
  name: string;
  description: string;
  unit: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface MeasurementValue {
  id?: string;
  field_id: string;
  value: string;
}

interface MeasurementFormProps {
  userId: string;
  userType: string;
  measurementId?: string;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({
  userId,
  userType,
  measurementId
}) => {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});

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
    }
  });

  // Fetch measurement sections for the selected type
  const { 
    data: sections, 
    isLoading: sectionsLoading, 
    error: sectionsError 
  } = useQuery({
    queryKey: ['measurementSections', selectedType],
    queryFn: async () => {
      if (!selectedType) return null;
      try {
        const response = await measurementService.getMeasurementTypeSection(selectedType);
        return response.data.sections || [];
      } catch (err) {
        console.error('Failed to fetch measurement sections:', err);
        throw new Error('Failed to fetch measurement sections');
      }
    },
    enabled: !!selectedType,
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
    enabled: !!measurementId,
  });

  // Create measurement mutation
  const createMeasurementMutation = useMutation({
    mutationFn: async (data: {
      user_id: string;
      user_type: string;
      measurement_type_id: string;
      values: MeasurementValue[];
    }) => {
      return await measurementService.createMeasurement(data);
    },
    onSuccess: () => {
      toast.success('Measurement saved successfully');
      queryClient.invalidateQueries({ queryKey: ['userMeasurements'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to save measurement: ${error.message}`);
    }
  });

  // Update measurement mutation
  const updateMeasurementMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: MeasurementValue[] }) => {
      return await measurementService.updateMeasurement(id, { values });
    },
    onSuccess: () => {
      toast.success('Measurement updated successfully');
      queryClient.invalidateQueries({ queryKey: ['userMeasurements'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update measurement: ${error.message}`);
    }
  });

  // Effect to set selected type from existing measurement
  useEffect(() => {
    if (existingMeasurement && !selectedType) {
      setSelectedType(existingMeasurement.type_id);

      // Extract values from existing measurement
      const values: { [key: string]: string } = {};
      existingMeasurement.sections?.forEach((section) => {
        section.values.forEach((value) => {
          values[value.field_id] = value.value;
        });
      });
      
      setFormValues(values);
    }
  }, [existingMeasurement]);

  // Handle saving the measurement
  const handleSaveMeasurement = () => {
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

  // Handle selecting a measurement type
  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    setFormValues({});
  };

  // Handle form input changes
  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Loading state
  if (typesLoading || (measurementId && measurementLoading)) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        <p className="ml-2">Loading measurement form...</p>
      </div>
    );
  }

  // Error state
  if (typesError || (measurementId && measurementError)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
        <p className="text-red-800">
          Failed to load measurement data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!selectedType ? (
        <div>
          <h3 className="text-lg font-medium mb-4">Select Measurement Type</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {measurementTypes?.map((type: MeasurementType) => (
              <Card 
                key={type.id} 
                className={`cursor-pointer hover:border-brand-blue hover:shadow-md transition-all`}
                onClick={() => handleSelectType(type.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle>{type.name}</CardTitle>
                  {type.description && (
                    <CardDescription>{type.description}</CardDescription>
                  )}
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full">Select</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <DataState
          isLoading={sectionsLoading}
          error={sectionsError}
          isEmpty={!sections || sections.length === 0}
          emptyMessage="No measurement sections found for this type."
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">
                  {measurementTypes?.find((t: MeasurementType) => t.id === selectedType)?.name} Measurements
                </h3>
                <p className="text-muted-foreground text-sm">
                  Fill in the measurements below
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setSelectedType(null)}
              >
                Change Type
              </Button>
            </div>

            {sections?.map((section: MeasurementSection) => (
              <Card key={section.id}>
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {section.fields.map((field: MeasurementField) => (
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

            <div className="flex justify-end mt-8">
              <Button 
                onClick={handleSaveMeasurement}
                disabled={createMeasurementMutation.isPending || updateMeasurementMutation.isPending}
                className="px-8"
              >
                {(createMeasurementMutation.isPending || updateMeasurementMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  measurementId ? 'Update Measurements' : 'Save Measurements'
                )}
              </Button>
            </div>
          </div>
        </DataState>
      )}
    </div>
  );
};

export default MeasurementForm;
