
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementService } from '@/services/api-extensions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Ruler } from 'lucide-react';
import { format } from 'date-fns';
import IndividualMeasurementForm from '@/components/measurements/IndividualMeasurementForm';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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

  // Handle add new measurement
  const handleAddMeasurement = () => {
    setSelectedMeasurement(null);
    setIsDialogOpen(true);
  };

  // Handle edit measurement
  const handleEditMeasurement = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    setIsDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedMeasurement(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">My Measurements</h2>
          <p className="text-muted-foreground">View and manage your measurements</p>
        </div>
        <Button className="gap-2" onClick={handleAddMeasurement}>
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
                          onClick={() => handleEditMeasurement(measurement)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMeasurement ? 'Edit Measurement' : 'Add New Measurement'}
            </DialogTitle>
          </DialogHeader>
          {userId && (
            <IndividualMeasurementForm
              userId={userId}
              measurementId={selectedMeasurement?.id}
              onSuccess={handleDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IndividualMeasurements;
