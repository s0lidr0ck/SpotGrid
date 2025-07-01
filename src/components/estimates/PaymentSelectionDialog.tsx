import React, { useState, useEffect } from 'react';
import { AlertCircle, CreditCard, CheckCircle, X, Plus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { apiClient } from '../../utils/api-client';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  brand_name?: string;
  created_at: string;
}

interface PaymentSelectionDialogProps {
  brandId?: string;
  onClose: () => void;
  onSelect: (payment: { id: string; last4: string; brand: string }) => void;
}

const PaymentSelectionDialog: React.FC<PaymentSelectionDialogProps> = ({
  brandId,
  onClose,
  onSelect
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, [brandId]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      
      // Fetch payment methods (no longer filtering by brand)
      const { data, error } = await apiClient.getPaymentMethods();

      if (error) {
        throw new Error(error.message);
      }

      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedPayment) {
      onSelect({
        id: selectedPayment.id,
        last4: selectedPayment.last4,
        brand: selectedPayment.brand
      });
      onClose();
    }
  };

  const getBrandDisplayName = (brand: string) => {
    const brandMap: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'discover': 'Discover',
      'diners': 'Diners Club',
      'jcb': 'JCB',
      'unionpay': 'UnionPay'
    };
    return brandMap[brand.toLowerCase()] || brand.toUpperCase();
  };

  const getCardIcon = (brand: string) => {
    // You could replace these with actual card brand icons
    const lowerBrand = brand.toLowerCase();
    const colors: { [key: string]: string } = {
      'visa': 'text-blue-600',
      'mastercard': 'text-red-600',
      'amex': 'text-green-600',
      'discover': 'text-orange-600'
    };
    
    return (
      <CreditCard 
        className={`h-6 w-6 ${colors[lowerBrand] || 'text-gray-600'}`} 
        fill="currentColor"
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Payment Method
            </h2>
            <Button variant="light" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading payment methods...</span>
              </div>
            ) : paymentMethods.length === 0 ? (
              <Card>
                <div className="p-8 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Payment Methods Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You need to add a payment method before placing orders.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-blue-800 font-medium">Add Payment Method</span>
                    </div>
                    <div className="text-blue-700 text-sm space-y-2">
                      <p>1. Go to Payment Methods page</p>
                      <p>2. Add a credit/debit card</p>
                      <p>3. Return here to select it for your order</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="text-amber-800 text-sm">
                      💡 <strong>For Testing:</strong> You can create test payment methods 
                      to try out the ordering system.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((payment) => (
                  <div 
                    key={payment.id}
                    className={`cursor-pointer transition-all border rounded-lg p-4 ${
                      selectedPayment?.id === payment.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getCardIcon(payment.brand)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {getBrandDisplayName(payment.brand)} •••• {payment.last4}
                            </span>
                            {payment.is_default && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Expires {String(payment.exp_month).padStart(2, '0')}/{payment.exp_year}
                            {payment.brand_name && (
                              <span className="ml-2">• {payment.brand_name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {selectedPayment?.id === payment.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                    
                    {selectedPayment?.id === payment.id && (
                      <div className="mt-2 text-sm text-blue-600 font-medium">
                        ✓ Selected for this order
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6">
            <Button
              variant="light"
              onClick={() => {
                // This could open a "Add Payment Method" modal
                toast('Go to Payment Methods page to add cards');
              }}
              icon={<Plus size={16} />}
            >
              Add New Card
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="light" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSelect}
                disabled={!selectedPayment}
              >
                Select Payment Method
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSelectionDialog;