import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
}

interface PaymentSelectionDialogProps {
  brandId: string;
  onClose: () => void;
  onSelect: (payment: PaymentMethod) => void;
}

const PaymentSelectionDialog: React.FC<PaymentSelectionDialogProps> = ({
  brandId,
  onClose,
  onSelect
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, using a UUID for the mock payment method
    setPaymentMethods([
      {
        id: crypto.randomUUID(), // Generate a proper UUID instead of "1"
        last4: '4242',
        brand: 'Visa',
        expMonth: 12,
        expYear: 2025
      }
    ]);
    setLoading(false);
  }, [brandId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Payment Method</h2>
          <Button
            variant="light"
            size="sm"
            onClick={onClose}
            icon={<X size={16} />}
          >
            Close
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading payment methods...</p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No payment methods found for this brand</p>
            <p className="text-sm text-gray-400 mt-2">
              Add payment methods in the Payment Methods section
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">
                    {method.brand} ending in {method.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires {method.expMonth}/{method.expYear}
                  </p>
                </div>
                <Button
                  onClick={() => onSelect(method)}
                  variant="light"
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSelectionDialog;