import React from 'react';
import { User, Mail, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import { Navigate } from 'react-router-dom';

const ProfileView = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">
            View your account information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <Mail className="mr-2 text-gray-400" size={16} />
                  <span className="text-gray-900">{user?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <Briefcase className="mr-2 text-gray-400" size={16} />
                  <span className="text-gray-900 capitalize">
                    {user?.role === 'traffic_admin' ? 'Administrator' : 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Status */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Account Status
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-green-800 font-medium">Active Account</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Your account is active and in good standing.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="text-blue-800 font-medium mb-2">Profile Management</h3>
                <p className="text-blue-700 text-sm">
                  Profile editing features are being migrated. Contact your administrator 
                  if you need to update your account information.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfileView;