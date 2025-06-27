import React from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';

const PaymentMethods = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Methods
        </h2>
        <p className="text-gray-600">
          Manage your payment methods and billing information
        </p>
      </div>

      <Card>
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Payment System Migration
          </h3>
          <p className="text-gray-600 mb-4">
            Payment method management is being migrated to provide better security 
            and more payment options.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">Secure Processing</span>
            </div>
            <p className="text-blue-700 text-sm">
              All existing payment methods are secure and will be migrated automatically. 
              Contact support if you need to update payment information urgently.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentMethods;