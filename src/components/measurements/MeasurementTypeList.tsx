
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MeasurementType {
  id: string;
  name: string;
  description?: string;
}

interface MeasurementTypeListProps {
  types: MeasurementType[];
  onSelectType: (typeId: string) => void;
}

const MeasurementTypeList: React.FC<MeasurementTypeListProps> = ({
  types,
  onSelectType
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Select Measurement Type</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {types?.map((type: MeasurementType) => (
          <Card 
            key={type.id} 
            className="cursor-pointer hover:border-brand-blue hover:shadow-md transition-all"
            onClick={() => onSelectType(type.id)}
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
  );
};

export default MeasurementTypeList;
