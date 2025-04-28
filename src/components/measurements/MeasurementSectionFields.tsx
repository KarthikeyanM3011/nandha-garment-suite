
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';

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

interface MeasurementSectionFieldsProps {
  sections: MeasurementSection[];
  formValues: { [key: string]: string };
  onInputChange: (fieldId: string, value: string) => void;
}

const MeasurementSectionFields: React.FC<MeasurementSectionFieldsProps> = ({
  sections,
  formValues,
  onInputChange
}) => {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Card key={section.id}>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">{section.title}</h3>
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

export default MeasurementSectionFields;
