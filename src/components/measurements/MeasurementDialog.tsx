
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MeasurementDialogContent from './MeasurementDialogContent';
import { useMeasurement } from '@/hooks/useMeasurement';

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
  const {
    activeTab,
    setActiveTab,
    selectedType,
    handleTypeSelect,
    formValues,
    handleInputChange,
    handleSubmit,
    measurementTypes,
    displaySections,
    isSubmitting,
    isLoading,
    hasError
  } = useMeasurement({ userId, userType, measurementId, onClose });

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

        <MeasurementDialogContent
          isLoading={isLoading}
          hasError={hasError}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          measurementTypes={measurementTypes}
          selectedType={selectedType}
          handleTypeSelect={handleTypeSelect}
          displaySections={displaySections}
          formValues={formValues}
          handleInputChange={handleInputChange}
          measurementId={measurementId}
        />

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
