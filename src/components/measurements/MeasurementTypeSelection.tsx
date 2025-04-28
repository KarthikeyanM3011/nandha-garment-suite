
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MeasurementType {
  id: string;
  name: string;
  description?: string;
}

interface MeasurementTypeSelectionProps {
  types: MeasurementType[];
  selectedType: string | null;
  onTypeSelect: (typeId: string) => void;
}

const MeasurementTypeSelection: React.FC<MeasurementTypeSelectionProps> = ({
  types,
  selectedType,
  onTypeSelect
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {types?.map((type: MeasurementType) => (
        <Card 
          key={type.id} 
          className={`cursor-pointer hover:border-brand-blue hover:shadow-md transition-all ${
            selectedType === type.id ? 'border-brand-blue shadow-md' : ''
          }`}
          onClick={() => onTypeSelect(type.id)}
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
  );
};

export default MeasurementTypeSelection;
