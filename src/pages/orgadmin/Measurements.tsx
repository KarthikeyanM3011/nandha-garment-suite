
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { measurementService, userService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { DataState, CardSkeleton } from '@/components/ui/data-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Ruler, User, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import MeasurementForm from '@/components/measurements/MeasurementForm';

// Define types
interface OrgUser {
  id: string;
  name: string;
  email: string;
  department?: string;
}

interface Measurement {
  id: string;
  user_id: string;
  user_type: string;
  measurement_type_id: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  measurement_type: string;
}

const Measurements = () => {
  const { userData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<OrgUser | null>(null);
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);
  const [isNewMeasurementDialogOpen, setIsNewMeasurementDialogOpen] = useState(false);
  const [isViewMeasurementDialogOpen, setIsViewMeasurementDialogOpen] = useState(false);
  
  // Get organization ID from user context
  const orgId = userData?.org_id;

  // Fetch organization users
  const { 
    data: users, 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery({
    queryKey: ['orgUsers', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID is required');
      try {
        const response = await userService.getOrgUsersByOrg(orgId);
        return response.data.users || [];
      } catch (err) {
        console.error('Failed to fetch organization users:', err);
        throw new Error('Failed to fetch organization users');
      }
    },
    enabled: !!orgId,
  });

  // Fetch organization measurements
  const { 
    data: measurements, 
    isLoading: measurementsLoading, 
    error: measurementsError 
  } = useQuery({
    queryKey: ['orgMeasurements', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID is required');
      try {
        const response = await measurementService.getOrgMeasurements(orgId);
        return response.data.measurements || [];
      } catch (err) {
        console.error('Failed to fetch organization measurements:', err);
        throw new Error('Failed to fetch organization measurements');
      }
    },
    enabled: !!orgId,
  });

  // Filter users based on search term
  const filteredUsers = users ? users.filter((user: OrgUser) => {
    return searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
  }) : [];

  // Handle opening the new measurement dialog for a user
  const handleNewMeasurement = (user: OrgUser) => {
    setSelectedUser(user);
    setIsNewMeasurementDialogOpen(true);
  };

  // Handle viewing a measurement
  const handleViewMeasurement = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    setIsViewMeasurementDialogOpen(true);
  };

  // Get measurements for a specific user
  const getUserMeasurements = (userId: string) => {
    if (!measurements) return [];
    return measurements.filter((m: Measurement) => m.user_id === userId);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Measurements</h2>
        <p className="text-muted-foreground">Manage measurements for all users in your organization</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search users by name, email or department"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 mb-6"
        />
      </div>

      <DataState 
        isLoading={usersLoading || measurementsLoading} 
        error={usersError || measurementsError}
        isEmpty={!filteredUsers || filteredUsers.length === 0}
        emptyMessage="No users found. Please add users to your organization first."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user: OrgUser) => {
            const userMeasurements = getUserMeasurements(user.id);
            
            return (
              <Card key={user.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="bg-gray-50 border-b pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-blue/10 text-brand-blue rounded-full p-2">
                        <User size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <CardDescription className="text-sm">{user.email}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50">
                      {userMeasurements.length} Measurements
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {userMeasurements.length > 0 ? (
                    <div className="space-y-3">
                      {userMeasurements.map((measurement: Measurement) => (
                        <div 
                          key={measurement.id}
                          className="flex justify-between items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleViewMeasurement(measurement)}
                        >
                          <div className="flex items-center gap-2">
                            <Ruler size={16} className="text-brand-blue" />
                            <span>{measurement.measurement_type}</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar size={12} className="mr-1" />
                            {new Date(measurement.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No measurements found</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 border-t py-3">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => handleNewMeasurement(user)}
                  >
                    <Plus size={16} />
                    Add Measurement
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </DataState>

      {/* New Measurement Dialog */}
      <Dialog open={isNewMeasurementDialogOpen} onOpenChange={setIsNewMeasurementDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>New Measurement for {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Add a new measurement for this user. Select a measurement type and fill in the details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <MeasurementForm
              userId={selectedUser.id}
              userType="org_user"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Measurement Dialog */}
      <Dialog open={isViewMeasurementDialogOpen} onOpenChange={setIsViewMeasurementDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMeasurement?.measurement_type} Measurements for {selectedMeasurement?.user_name}
            </DialogTitle>
            <DialogDescription>
              View and edit measurements. Make changes as needed and save.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMeasurement && (
            <MeasurementForm
              userId={selectedMeasurement.user_id}
              userType="org_user"
              measurementId={selectedMeasurement.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Measurements;
