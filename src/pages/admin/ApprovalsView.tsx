import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ApprovalsView = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'traffic_admin') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CheckCircle className="mr-3" size={28} />
            Approvals Management
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve pending estimates
          </p>
        </div>
      </div>

      <Card>
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Feature Being Migrated
          </h3>
          <p className="text-gray-600 mb-4">
            The approvals management system is being migrated to the new database infrastructure.
            This feature will be available soon.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-700 text-sm">
              Estimate approval workflows are being redesigned for improved efficiency.
              Manual approval processes can be handled through the main Orders section temporarily.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApprovalsView;