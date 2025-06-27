import React from 'react';
import PaymentMethods from '../components/payments/PaymentMethods';

const PaymentMethodsView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
        <p className="text-gray-600 mt-1">
          Manage your payment methods for campaign billing
        </p>
      </div>

      <PaymentMethods />
    </div>
  );
};

export default PaymentMethodsView;