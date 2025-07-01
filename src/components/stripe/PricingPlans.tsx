import React from 'react';
import { AlertCircle, CreditCard } from 'lucide-react';
import Card from '../ui/Card';

const PricingPlans = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pricing Plans
        </h2>
        <p className="text-gray-600">
          Choose the plan that works best for your business
        </p>
      </div>

      <Card>
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Pricing System Being Updated
          </h3>
          <p className="text-gray-600 mb-4">
            Our pricing and subscription system is being migrated to provide 
            better service and more flexible options.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">Contact Sales</span>
                </div>
            <p className="text-blue-700 text-sm">
              For pricing information and subscription options, please contact 
              our sales team directly.
            </p>
                  </div>
              </div>
            </Card>
    </div>
  );
};

export default PricingPlans;