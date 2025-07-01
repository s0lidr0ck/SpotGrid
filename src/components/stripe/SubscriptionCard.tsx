import React from 'react';
import { AlertCircle, CreditCard } from 'lucide-react';
import Card from '../ui/Card';

const SubscriptionCard = () => {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CreditCard className="mr-2" size={20} />
          Subscription Status
        </h3>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-blue-800 font-medium mb-1">
                Subscription System Migration
              </h4>
              <p className="text-blue-700 text-sm">
                Subscription management is being migrated to provide better service. 
                Your current subscription status is maintained and all features remain available.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-green-800 font-medium">Account Active</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Your account is active and all features are available.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SubscriptionCard;