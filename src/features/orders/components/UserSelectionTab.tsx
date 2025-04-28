
import React, { useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DataState } from '@/components/ui/data-state';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface UserSelectionTabProps {
  isOrgAdmin: boolean;
  users: any[];
  isUsersLoading: boolean;
  usersError: any;
  selectedUser: string | null;
  setSelectedUser: (userId: string) => void;
  userData: any;
  onNext: () => void;
}

const UserSelectionTab: React.FC<UserSelectionTabProps> = ({
  isOrgAdmin,
  users,
  isUsersLoading,
  usersError,
  selectedUser,
  setSelectedUser,
  userData,
  onNext,
}) => {
  useEffect(() => {
    // Set the user ID for individual users (non-admin) when the component mounts
    if (!isOrgAdmin && userData && userData.id) {
      setSelectedUser(userData.id);
    }
  }, [userData, isOrgAdmin, setSelectedUser]);

  return (
    <TabsContent value="user">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Select User</h3>
        <p className="text-sm text-muted-foreground">
          {isOrgAdmin ? "Choose the user for whom you're creating the order" : "Confirm your details for this order"}
        </p>

        <DataState
          isLoading={isUsersLoading}
          error={usersError}
          isEmpty={!users || users.length === 0}
          emptyMessage="No users available"
        >
          <div className="space-y-4">
            {isOrgAdmin ? (
              <RadioGroup
                value={selectedUser || ""}
                onValueChange={setSelectedUser}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {users?.map((user: any) => (
                  <div key={user.id} className="relative">
                    <RadioGroupItem
                      value={user.id}
                      id={`user-${user.id}`}
                      className="absolute top-4 left-4 z-10"
                    />
                    <Label
                      htmlFor={`user-${user.id}`}
                      className={`block p-4 border rounded-md cursor-pointer ${selectedUser === user.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      {user.department && (
                        <div className="mt-1 text-xs bg-gray-100 inline-block px-2 py-1 rounded">
                          {user.department}
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="p-4 border rounded-md bg-gray-50">
                <div className="font-medium">{userData?.name}</div>
                <div className="text-sm text-muted-foreground">{userData?.email}</div>
              </div>
            )}
          </div>
        </DataState>
      </div>

      <div className="flex justify-end mt-6">
        <Button type="button" onClick={onNext} className="gap-2">
          Next <ArrowRight size={16} />
        </Button>
      </div>
    </TabsContent>
  );
};

export default UserSelectionTab;
