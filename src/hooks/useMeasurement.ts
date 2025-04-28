
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementService } from '@/services/api-extensions';
import { toast } from 'sonner';

interface MeasurementField {
  id: string;
  name: string;
  unit: string;
  description?: string;
}

interface MeasurementSection {
  id: string;
  title: string;
  fields: MeasurementField[];
}

interface UseMeasurementProps {
  userId: string;
  userType: string;
  measurementId?: string;
  onClose?: () => void;
}

export const useMeasurement = ({ userId, userType, measurementId, onClose }: UseMeasurementProps) => {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('type');
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
        throw new Error('Failed to fetch measurement types');
      }
    },
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
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      if (onClose) onClose();
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
      if (onClose) onClose();
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

  // Get display sections with fallback to mock data
  const getDisplaySections = () => {
    if (sections && sections.length > 0) return sections;
    
    // Return mock sections if none are available
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
  };

  const isSubmitting = createMeasurementMutation.isPending || updateMeasurementMutation.isPending;
  const isLoading = typesLoading || (measurementId && measurementLoading) || (selectedType && sectionsLoading);
  const hasError = typesError || (measurementId && measurementError) || sectionsError;

  return {
    activeTab,
    setActiveTab,
    selectedType,
    handleTypeSelect,
    formValues,
    handleInputChange,
    handleSubmit,
    measurementTypes,
    displaySections: getDisplaySections(),
    isSubmitting,
    isLoading,
    hasError,
    measurementId
  };
};
