
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementService } from '@/services/api-extensions';
import { toast } from 'sonner';

interface MeasurementFormHookProps {
  userId: string;
  userType: string;
  measurementId?: string;
}

export const useMeasurementForm = ({ userId, userType, measurementId }: MeasurementFormHookProps) => {
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
        console.log('Fetched measurement types:', response.data);
        return response.data.types || [];
      } catch (err) {
        console.error('Failed to fetch measurement types:', err);
        
        // Return mock types if API fails
        return [
          { id: 'type-1', name: 'Body Measurements', description: 'Basic body measurements' },
          { id: 'type-2', name: 'Garment Measurements', description: 'Measurements for custom clothing' },
          { id: 'type-3', name: 'Medical Measurements', description: 'Health-related measurements' }
        ];
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
        console.log('Fetched sections data:', response.data);
        return response.data.sections || [];
      } catch (err) {
        console.error('Failed to fetch measurement sections:', err);
        
        // Return mock sections if API fails
        return [
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
      values: Array<{ field_id: string; value: string }>;
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
    mutationFn: async ({ id, values }: { id: string; values: Array<{ field_id: string; value: string }> }) => {
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
        section.values?.forEach((value) => {
          values[value.field_id] = value.value;
        });
      });
      
      setFormValues(values);
    }
  }, [existingMeasurement, selectedType]);

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

  // Get display sections
  const getDisplaySections = () => sections || [];

  return {
    selectedType,
    handleSelectType,
    formValues,
    handleInputChange,
    handleSaveMeasurement,
    measurementTypes,
    sections: getDisplaySections(),
    isLoading: typesLoading || (measurementId && measurementLoading) || (selectedType && sectionsLoading),
    isSubmitting: createMeasurementMutation.isPending || updateMeasurementMutation.isPending,
    error: typesError || (measurementId && measurementError) || sectionsError
  };
};
