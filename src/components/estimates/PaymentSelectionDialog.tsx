import React from 'react';
import { AlertCircle, CreditCard } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface PaymentSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (paymentId: string) => void;
}

const PaymentSelectionDialog: React.FC<PaymentSelectionDialogProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Payment Method
            </h2>
            <Button variant="light" onClick={onClose}>
              ×
            </Button>
          </div>

          <Card>
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Payment Selection Being Migrated
              </h3>
              <p className="text-gray-600 mb-4">
                Payment method selection is being migrated to the new system.
                This feature will be available soon.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center justify-center mb-2">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">Payment Management</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Payment methods can be managed through the main interface temporarily.
                  Contact support for assistance with payment configuration.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex justify-end mt-6">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSelectionDialog;