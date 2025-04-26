
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <Button onClick={goBack} className="bg-brand-blue hover:bg-brand-dark">
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
