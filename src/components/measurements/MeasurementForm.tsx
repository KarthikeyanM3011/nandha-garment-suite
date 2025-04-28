
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { DataState } from '../ui/data-state';
import { useMeasurementForm } from '@/hooks/useMeasurementForm';
import MeasurementTypeList from './MeasurementTypeList';
import MeasurementSections from './MeasurementSections';

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
  const {
    selectedType,
    handleSelectType,
    formValues,
    handleInputChange,
    handleSaveMeasurement,
    measurementTypes,
    sections,
    isLoading,
    isSubmitting,
    error
  } = useMeasurementForm({ userId, userType, measurementId });

  // Find the selected type name
  const selectedTypeName = measurementTypes?.find((t: any) => t.id === selectedType)?.name;

  return (
    <div className="space-y-8">
      {!selectedType ? (
        <MeasurementTypeList 
          types={measurementTypes || []} 
          onSelectType={handleSelectType} 
        />
      ) : (
        <DataState
          isLoading={isLoading}
          error={error}
          isEmpty={!sections || sections.length === 0}
          emptyMessage="No measurement sections found for this type."
        >
          <div className="space-y-6">
            <MeasurementSections 
              sections={sections} 
              formValues={formValues}
              onInputChange={handleInputChange}
              selectedTypeName={selectedTypeName}
              onChangeType={() => handleSelectType('')}
            />

            <div className="flex justify-end mt-8">
              <Button 
                onClick={handleSaveMeasurement}
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? (
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
