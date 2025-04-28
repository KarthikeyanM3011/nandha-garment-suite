import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementService, userService } from '@/services/api-extensions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DataState } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Ruler, Search } from 'lucide-react';
import { format } from 'date-fns';
import MeasurementDialog from '@/components/measurements/MeasurementDialog';

interface Measurement {
  id: string;
  user_id: string;
  user_type: string;
  measurement_type_id: string;
  type_name: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  values: Array<{
    field_id: string;
    field_name: string;
    value: string;
  }>;
}

const OrgAdminMeasurements = () => {
  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const orgId = userData?.org_id;
  const userType = 'ORG_USER';

  // Fetch org users
  const { 
    data: users, 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery({
    queryKey: ['orgUsers', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID is required');
      
      try {
        const response = await userService.getOrgUsers(orgId);
        return response.data.users || [];
      } catch (err) {
        console.error('Failed to fetch org users:', err);
        throw new Error('Failed to fetch org users');
      }
    },
    enabled: !!orgId,
  });

  // Fetch measurements for selected user
  const { 
    data: measurements, 
    isLoading: measurementsLoading, 
    error: measurementsError 
  } = useQuery({
    queryKey: ['measurements', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return [];
      
      try {
        const response = await measurementService.getMeasurementsByUser(selectedUser, userType);
        return response.data.measurements || [];
      } catch (err) {
        console.error('Failed to fetch measurements:', err);
        throw new Error('Failed to fetch measurements');
      }
    },
    enabled: !!selectedUser,
  });

  // Delete measurement mutation
  const deleteMeasurementMutation = useMutation({
    mutationFn: async (measurementId: string) => {
      return await measurementService.deleteMeasurement(measurementId);
    },
    onSuccess: () => {
      toast.success('Measurement deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['measurements', selectedUser] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete measurement: ${error.message}`);
    }
  });

  // Filter measurements based on search term
  const filteredMeasurements = measurements ? measurements.filter((measurement: Measurement) => {
    return searchTerm === '' || 
      measurement.type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (measurement.user_name && measurement.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
  }) : [];

  // Handle delete measurement
  const handleDeleteMeasurement = (measurementId: string) => {
    if (confirm('Are you sure you want to delete this measurement?')) {
      deleteMeasurementMutation.mutate(measurementId);
    }
  };

  // Handle add new measurement
  const handleAddMeasurement = () => {
    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }
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
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Organization Measurements</h2>
          <p className="text-muted-foreground">Manage measurements for organization users</p>
        </div>
        <Button className="gap-2" onClick={handleAddMeasurement} disabled={!selectedUser}>
          <Plus size={16} />
          Add Measurement
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select
          value={selectedUser || ''}
          onValueChange={setSelectedUser}
        >
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users?.map((user: any) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search measurements"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={!selectedUser}
          />
        </div>
      </div>

      <DataState 
        isLoading={usersLoading || (selectedUser && measurementsLoading)} 
        error={usersError || (selectedUser && measurementsError)} 
        isEmpty={selectedUser ? (!filteredMeasurements || filteredMeasurements.length === 0) : false}
        emptyMessage={selectedUser ? "No measurements found for this user." : "Please select a user to view measurements."}
      >
        {selectedUser ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler size={18} />
                Measurement Records
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
                  {filteredMeasurements.map((measurement: Measurement) => (
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
        ) : (
          <Card className="border-dashed border-2 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <Ruler size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">Select a user to view measurements</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Choose a user from the dropdown above to view and manage their measurements.
              </p>
            </CardContent>
          </Card>
        )}
      </DataState>

      {isDialogOpen && selectedUser && (
        <MeasurementDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          userId={selectedUser}
          userType={userType}
          measurementId={selectedMeasurement?.id}
        />
      )}
    </div>
  );
};

export default OrgAdminMeasurements;
