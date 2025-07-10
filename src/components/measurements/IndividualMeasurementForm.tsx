import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { measurementService } from '@/services/api-extensions';

const measurementSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  reference: z.string().optional(),
  gender: z.enum(['male', 'female']),
  chest: z.coerce.number().positive('Chest measurement must be positive'),
  waist: z.coerce.number().positive('Waist measurement must be positive'),
  seat: z.coerce.number().positive('Seat measurement must be positive'),
  shirt_length: z.coerce.number().positive('Shirt length must be positive'),
  arm_length: z.coerce.number().positive('Arm length must be positive'),
  neck: z.coerce.number().positive('Neck measurement must be positive'),
  hip: z.coerce.number().positive('Hip measurement must be positive'),
  polo_shirt_length: z.coerce.number().positive('Polo shirt length must be positive'),
  shoulder_width: z.coerce.number().positive('Shoulder width must be positive'),
  wrist: z.coerce.number().positive('Wrist measurement must be positive'),
  biceps: z.coerce.number().positive('Biceps measurement must be positive'),
});

type MeasurementFormData = z.infer<typeof measurementSchema>;

interface IndividualMeasurementFormProps {
  userId: string;
  measurementId?: string;
  initialData?: Partial<MeasurementFormData>;
  onSuccess: () => void;
}

const IndividualMeasurementForm: React.FC<IndividualMeasurementFormProps> = ({
  userId,
  measurementId,
  initialData,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  const [isGenderMale, setIsGenderMale] = useState<boolean>(initialData?.gender === 'male' ? true : false);

  const form = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      name: initialData?.name || '',
      reference: initialData?.reference || '',
      gender: initialData?.gender || 'male',
      chest: initialData?.chest || 0,
      waist: initialData?.waist || 0,
      seat: initialData?.seat || 0,
      shirt_length: initialData?.shirt_length || 0,
      arm_length: initialData?.arm_length || 0,
      neck: initialData?.neck || 0,
      hip: initialData?.hip || 0,
      polo_shirt_length: initialData?.polo_shirt_length || 0,
      shoulder_width: initialData?.shoulder_width || 0,
      wrist: initialData?.wrist || 0,
      biceps: initialData?.biceps || 0,
    },
  });

  const saveMeasurementMutation = useMutation({
    mutationFn: async (data: MeasurementFormData) => {
      // For now, use a static measurement type ID for individual measurements
      // In a real implementation, this would be dynamic or retrieved from API
      const INDIVIDUAL_MEASUREMENT_TYPE_ID = 'individual-body-measurements';
      
      const values = [
        { field_id: 'name', value: data.name },
        { field_id: 'reference', value: data.reference || '' },
        { field_id: 'gender', value: data.gender },
        { field_id: 'chest', value: data.chest.toString() },
        { field_id: 'waist', value: data.waist.toString() },
        { field_id: 'seat', value: data.seat.toString() },
        { field_id: 'shirt_length', value: data.shirt_length.toString() },
        { field_id: 'arm_length', value: data.arm_length.toString() },
        { field_id: 'neck', value: data.neck.toString() },
        { field_id: 'hip', value: data.hip.toString() },
        { field_id: 'polo_shirt_length', value: data.polo_shirt_length.toString() },
        { field_id: 'shoulder_width', value: data.shoulder_width.toString() },
        { field_id: 'wrist', value: data.wrist.toString() },
        { field_id: 'biceps', value: data.biceps.toString() },
      ];

      const measurementData = {
        user_id: userId,
        user_type: 'INDIVIDUAL',
        measurement_type_id: INDIVIDUAL_MEASUREMENT_TYPE_ID,
        values
      };

      if (measurementId) {
        return await measurementService.updateMeasurement(measurementId, { values });
      } else {
        return await measurementService.createMeasurement(measurementData);
      }
    },
    onSuccess: () => {
      toast.success(measurementId ? 'Measurement updated successfully' : 'Measurement saved successfully');
      queryClient.invalidateQueries({ queryKey: ['measurements', userId] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(`Failed to save measurement: ${error.message}`);
    }
  });

  const onSubmit = (data: MeasurementFormData) => {
    saveMeasurementMutation.mutate(data);
  };

  const handleGenderToggle = (checked: boolean) => {
    setIsGenderMale(checked);
    form.setValue('gender', checked ? 'male' : 'female');
  };

  const measurementFields = [
    { key: 'chest', label: 'Chest', unit: 'inches' },
    { key: 'waist', label: 'Waist', unit: 'inches' },
    { key: 'seat', label: 'Seat', unit: 'inches' },
    { key: 'shirt_length', label: 'Shirt Length', unit: 'inches' },
    { key: 'arm_length', label: 'Arm Length', unit: 'inches' },
    { key: 'neck', label: 'Neck', unit: 'inches' },
    { key: 'hip', label: 'Hip', unit: 'inches' },
    { key: 'polo_shirt_length', label: 'Polo Shirt Length', unit: 'inches' },
    { key: 'shoulder_width', label: 'Shoulder Width', unit: 'inches' },
    { key: 'wrist', label: 'Wrist', unit: 'inches' },
    { key: 'biceps', label: 'Biceps', unit: 'inches' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <User className="h-5 w-5 text-brand-blue" />
        <h3 className="text-lg font-semibold">
          {measurementId ? 'Edit Measurement' : 'Add New Measurement'}
        </h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference (Note)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any notes or references..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-3">
                <Label>Gender:</Label>
                <span className="text-sm text-gray-500">Female</span>
                <Switch
                  checked={isGenderMale}
                  onCheckedChange={handleGenderToggle}
                />
                <span className="text-sm text-gray-500">Male</span>
              </div>
            </CardContent>
          </Card>

          {/* Measurements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Body Measurements</CardTitle>
              <p className="text-sm text-gray-500">All measurements are in inches</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {measurementFields.map((field, index) => (
                  <FormField
                    key={field.key}
                    control={form.control}
                    name={field.key as keyof MeasurementFormData}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0.0"
                              {...formField}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                              {field.unit}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saveMeasurementMutation.isPending}
              className="min-w-32"
            >
              {saveMeasurementMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                measurementId ? 'Update Measurement' : 'Save Measurement'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default IndividualMeasurementForm;