
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementService } from '@/services/api-extensions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Ruler } from 'lucide-react';
import { format } from 'date-fns';

interface Measurement {
  id: string;
  user_id: string;
  user_type: string;
  measurement_type_id: string;
  type_name: string;
  created_at: string;
  updated_at: string;
  values: Array<{
    field_id: string;
    field_name: string;
    value: string;
  }>;
}

const IndividualMeasurements = () => {
  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const userId = userData?.id;
  const userType = 'INDIVIDUAL';

  // Fetch user's measurements
  const { 
    data: measurements, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['measurements', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      
      try {
        const response = await measurementService.getMeasurementsByUser(userId, userType);
        return response.data.measurements || [];
      } catch (err) {
        console.error('Failed to fetch measurements:', err);
        throw new Error('Failed to fetch measurements');
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
      queryClient.invalidateQueries({ queryKey: ['measurements', userId] });
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

  // Handle view measurement
  const handleViewMeasurement = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">My Measurements</h2>
          <p className="text-muted-foreground">View and manage your measurements</p>
        </div>
        <Button className="gap-2" onClick={() => toast.info('Add new measurement functionality coming soon!')}>
          <Plus size={16} />
          Add Measurement
        </Button>
      </div>

      <DataState 
        isLoading={isLoading} 
        error={error} 
        isEmpty={!measurements || measurements.length === 0}
        emptyMessage="No measurements found. Start by adding your measurements."
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler size={18} />
              Your Measurement Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Measurement Type</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements?.map((measurement: Measurement) => (
                  <TableRow key={measurement.id}>
                    <TableCell>
                      {format(new Date(measurement.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">{measurement.type_name}</TableCell>
                    <TableCell>{measurement.values ? measurement.values.length : 0} fields</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewMeasurement(measurement)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteMeasurement(measurement.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataState>

      {/* View Measurement Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Measurement Details</DialogTitle>
            <DialogDescription>
              View the details of this measurement record.
            </DialogDescription>
          </DialogHeader>
          {selectedMeasurement && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{selectedMeasurement.type_name}</h3>
                <p className="text-sm text-muted-foreground">
                  Recorded on {format(new Date(selectedMeasurement.created_at), 'MMMM dd, yyyy')}
                </p>
              </div>

              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-3">Measurement Values</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {selectedMeasurement.values && selectedMeasurement.values.map((value) => (
                    <div key={value.field_id} className="flex justify-between border-b pb-1">
                      <span className="text-sm">{value.field_name || 'Field'}</span>
                      <span className="font-medium">{value.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IndividualMeasurements;
