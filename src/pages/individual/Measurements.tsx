
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Ruler, Calendar, PenLine, Trash2 } from 'lucide-react';
import MeasurementForm from '@/components/measurements/MeasurementForm';

// Define types
interface Measurement {
  id: string;
  type_id: string;
  type_name: string;
  created_at: string;
  updated_at: string;
  values?: Array<{
    id: string;
    field_id: string;
    field_name: string;
    unit: string;
    section_title: string;
    value: string;
  }>;
}

// Group values by section title
const groupBySectionTitle = (values: any[]) => {
  return values?.reduce((acc, item) => {
    const { section_title } = item;
    if (!acc[section_title]) {
      acc[section_title] = [];
    }
    acc[section_title].push(item);
    return acc;
  }, {}) || {};
};

const Measurements = () => {
  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const [isNewMeasurementDialogOpen, setIsNewMeasurementDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);
  
  // Get user ID from context
  const userId = userData?.id;

  // Fetch user measurements
  const { 
    data: measurements, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['userMeasurements', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      try {
        const response = await measurementService.getUserMeasurements(userId, 'individual');
        return response.data.measurements || [];
      } catch (err) {
        console.error('Failed to fetch user measurements:', err);
        throw new Error('Failed to fetch user measurements');
      }
    },
    enabled: !!userId,
  });

  // Delete measurement mutation
  const deleteMeasurementMutation = useMutation({
    mutationFn: async (measurementId: string) => {
      return await measurementService.deleteMeasurement(measurementId);
    },
    onSuccess: () => {
      toast.success('Measurement deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['userMeasurements'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete measurement: ${error.message}`);
    }
  });

  // Handle delete measurement
  const handleDeleteMeasurement = (measurementId: string) => {
    if (confirm('Are you sure you want to delete this measurement?')) {
      deleteMeasurementMutation.mutate(measurementId);
    }
  };

  // Handle edit measurement
  const handleEditMeasurement = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    setIsEditDialogOpen(true);
  };

  // Handle add new measurement
  const handleAddNewMeasurement = () => {
    setIsNewMeasurementDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">My Measurements</h2>
          <p className="text-muted-foreground">View and manage your body measurements</p>
        </div>
        <Button onClick={handleAddNewMeasurement} className="gap-2">
          <Plus size={16} />
          Add New Measurement
        </Button>
      </div>

      <DataState 
        isLoading={isLoading} 
        error={error} 
        isEmpty={!measurements || measurements.length === 0}
        emptyMessage="You haven't added any measurements yet. Click 'Add New Measurement' to get started."
      >
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Measurements</TabsTrigger>
            {measurements && measurements.map((measurement: Measurement) => (
              <TabsTrigger key={measurement.id} value={measurement.id}>
                {measurement.type_name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {measurements && measurements.map((measurement: Measurement) => (
              <Card key={measurement.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="bg-gray-50 border-b pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-blue/10 text-brand-blue rounded-full p-2">
                        <Ruler size={20} />
                      </div>
                      <CardTitle>{measurement.type_name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Created: {new Date(measurement.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Updated: {new Date(measurement.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    {measurement.values && measurement.values.length > 0 ? (
                      <div className="text-sm">
                        <p className="font-medium mb-1">Sample measurements:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {measurement.values.slice(0, 3).map((value, idx) => (
                            <li key={idx}>
                              {value.field_name}: <span className="font-medium">{value.value} {value.unit}</span>
                            </li>
                          ))}
                          {measurement.values.length > 3 && (
                            <li className="list-none text-brand-blue font-medium pt-1">
                              + {measurement.values.length - 3} more measurements
                            </li>
                          )}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No measurement values found.</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t py-3 flex justify-between">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => handleEditMeasurement(measurement)}
                  >
                    <PenLine size={16} />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
                    onClick={() => handleDeleteMeasurement(measurement.id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </TabsContent>

          {measurements && measurements.map((measurement: Measurement) => (
            <TabsContent key={measurement.id} value={measurement.id} className="mt-6">
              <Card>
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{measurement.type_name} Measurements</CardTitle>
                      <CardDescription>
                        Created on {new Date(measurement.created_at).toLocaleDateString()}, 
                        Last updated on {new Date(measurement.updated_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => handleEditMeasurement(measurement)}
                      >
                        <PenLine size={16} />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
                        onClick={() => handleDeleteMeasurement(measurement.id)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {measurement.values && measurement.values.length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(groupBySectionTitle(measurement.values)).map(([section, values]) => (
                        <div key={section} className="border rounded-md overflow-hidden">
                          <div className="bg-gray-50 border-b px-4 py-2">
                            <h3 className="font-medium">{section}</h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                            {(values as any[]).map((value, idx) => (
                              <div key={idx} className="flex flex-col">
                                <span className="text-sm text-muted-foreground">{value.field_name}</span>
                                <span className="font-medium">
                                  {value.value} <span className="text-muted-foreground">{value.unit}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No measurement values found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </DataState>

      {/* New Measurement Dialog */}
      <Dialog open={isNewMeasurementDialogOpen} onOpenChange={setIsNewMeasurementDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Add New Measurement</DialogTitle>
            <DialogDescription>
              Select a measurement type and enter your measurements.
            </DialogDescription>
          </DialogHeader>
          
          {userId && (
            <MeasurementForm
              userId={userId}
              userType="individual"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Measurement Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit {selectedMeasurement?.type_name} Measurement</DialogTitle>
            <DialogDescription>
              Update your measurement values and save changes.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMeasurement && userId && (
            <MeasurementForm
              userId={userId}
              userType="individual"
              measurementId={selectedMeasurement.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Measurements;
