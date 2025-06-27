import React from 'react';
import PricingPlans from '../components/stripe/PricingPlans';

const PricingView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-600 mt-1">
          Choose the perfect plan for your TV advertising needs
        </p>
      </div>

      <PricingPlans />
    </div>
  );
};

export default PricingView;