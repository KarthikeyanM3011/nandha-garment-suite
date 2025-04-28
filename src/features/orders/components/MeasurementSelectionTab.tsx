
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormValues } from '../types';

interface MeasurementSelectionTabProps {
  form: UseFormReturn<OrderFormValues>;
  measurements: any[];
  isMeasurementsLoading: boolean;
  measurementsError: any;
  onNext: () => void;
  onPrev: () => void;
}

const MeasurementSelectionTab: React.FC<MeasurementSelectionTabProps> = ({
  form,
  measurements,
  isMeasurementsLoading,
  measurementsError,
  onNext,
  onPrev,
}) => {
  return (
    <TabsContent value="measurement">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Select Measurements</h3>
        <p className="text-sm text-muted-foreground">
          Choose measurements for the product or skip this step if not needed
        </p>

        <FormField
          control={form.control}
          name="measurement_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Measurements</FormLabel>
              <FormControl>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a measurement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Skip)</SelectItem>
                    {measurements?.map((measurement: any) => (
                      <SelectItem key={measurement.id} value={measurement.id}>
                        {measurement.type_name || 'Measurement'} - {new Date(measurement.created_at).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isMeasurementsLoading && (
          <div className="text-center p-4">Loading measurements...</div>
        )}

        {!isMeasurementsLoading && (!measurements || measurements.length === 0) && (
          <div className="p-4 border rounded bg-yellow-50 text-yellow-800">
            <p>No measurements found for this user.</p>
            <p className="text-sm mt-1">You can continue without selecting measurements or add measurements first.</p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft size={16} /> Back
        </Button>
        <Button type="button" onClick={onNext} className="gap-2">
          Next <ArrowRight size={16} />
        </Button>
      </div>
    </TabsContent>
  );
};

export default MeasurementSelectionTab;
