
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MeasurementTypeSelection from './MeasurementTypeSelection';
import MeasurementSectionFields from './MeasurementSectionFields';

interface MeasurementDialogContentProps {
  isLoading: boolean;
  hasError: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  measurementTypes: any[];
  selectedType: string | null;
  handleTypeSelect: (typeId: string) => void;
  displaySections: any[];
  formValues: { [key: string]: string };
  handleInputChange: (fieldId: string, value: string) => void;
  measurementId?: string;
}

const MeasurementDialogContent: React.FC<MeasurementDialogContentProps> = ({
  isLoading,
  hasError,
  activeTab,
  setActiveTab,
  measurementTypes,
  selectedType,
  handleTypeSelect,
  displaySections,
  formValues,
  handleInputChange,
  measurementId
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        <p className="ml-2">Loading measurements...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
        <p className="text-red-800">
          Failed to load measurement data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="type" disabled={!!measurementId}>Select Type</TabsTrigger>
        <TabsTrigger value="values" disabled={!selectedType}>Enter Values</TabsTrigger>
      </TabsList>

      <TabsContent value="type">
        <MeasurementTypeSelection 
          types={measurementTypes || []} 
          selectedType={selectedType}
          onTypeSelect={handleTypeSelect}
        />
      </TabsContent>

      <TabsContent value="values">
        <MeasurementSectionFields 
          sections={displaySections || []}
          formValues={formValues}
          onInputChange={handleInputChange}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MeasurementDialogContent;
