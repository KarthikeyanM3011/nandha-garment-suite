
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

interface MeasurementField {
  id: string;
  name: string;
  unit: string;
  description?: string;
}

interface MeasurementSection {
  id: string;
  title: string;
  description?: string;
  fields: MeasurementField[];
}

interface MeasurementSectionsProps {
  sections: MeasurementSection[];
  formValues: { [key: string]: string };
  onInputChange: (fieldId: string, value: string) => void;
  selectedTypeName?: string;
  onChangeType?: () => void;
}

const MeasurementSections: React.FC<MeasurementSectionsProps> = ({
  sections,
  formValues,
  onInputChange,
  selectedTypeName,
  onChangeType
}) => {
  return (
    <div className="space-y-6">
      {selectedTypeName && (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">{selectedTypeName} Measurements</h3>
            <p className="text-muted-foreground text-sm">
              Fill in the measurements below
            </p>
          </div>
          {onChangeType && (
            <Button 
              variant="outline"
              onClick={onChangeType}
            >
              Change Type
            </Button>
          )}
        </div>
      )}

      {sections?.map((section) => (
        <Card key={section.id}>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg">{section.title}</CardTitle>
            {section.description && (
              <CardDescription>{section.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.id}>
                  <FormLabel htmlFor={field.id}>{field.name}</FormLabel>
                  <div className="flex items-center mt-1">
                    <Input
                      id={field.id}
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      value={formValues[field.id] || ''}
                      onChange={(e) => onInputChange(field.id, e.target.value)}
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
    </div>
  );
};

export default MeasurementSections;
