import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
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

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingTest, setAddingTest] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
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

  const handleAddTestPaymentMethod = async () => {
    try {
      setAddingTest(true);
      
      // Generate random test data
      const brands = ['visa', 'mastercard', 'amex', 'discover'];
      const randomBrand = brands[Math.floor(Math.random() * brands.length)];
      const randomLast4 = Math.floor(1000 + Math.random() * 9000).toString();
      const randomMonth = Math.floor(1 + Math.random() * 12);
      const randomYear = 2025 + Math.floor(Math.random() * 5);

      const testData = {
        test_data: {
          type: 'card',
          brand: randomBrand,
          last4: randomLast4,
          exp_month: randomMonth,
          exp_year: randomYear
        },
        is_default: paymentMethods.length === 0 // First payment method is default
      };

      const { data, error } = await apiClient.createPaymentMethod(testData);

      if (error) {
        throw new Error(error.message);
      }

      setPaymentMethods(prev => [data, ...prev]);
      toast.success('Test payment method added successfully!');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding test payment method:', error);
      toast.error('Failed to add test payment method');
    } finally {
      setAddingTest(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      setDeletingId(id);
      
      const { error } = await apiClient.deletePaymentMethod(id);

      if (error) {
        throw new Error(error.message);
      }

      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
      toast.success('Payment method deleted successfully');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const { error } = await apiClient.updatePaymentMethod(id, { is_default: true });

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      setPaymentMethods(prev => 
        prev.map(pm => ({
          ...pm,
          is_default: pm.id === id
        }))
      );
      
      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
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
    const lowerBrand = brand.toLowerCase();
    const colors: { [key: string]: string } = {
      'visa': 'text-blue-600',
      'mastercard': 'text-red-600',
      'amex': 'text-green-600',
      'discover': 'text-orange-600'
    };
    
    return (
      <CreditCard 
        className={`h-8 w-8 ${colors[lowerBrand] || 'text-gray-600'}`} 
      />
    );
  };

  if (loading) {
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
          <div className="animate-pulse p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Methods
          </h2>
          <p className="text-gray-600">
            Manage your payment methods and billing information
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={16} />}
        >
          Add Payment Method
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Payment Methods
            </h3>
            <p className="text-gray-600 mb-4">
              You haven't added any payment methods yet. Add one to start placing orders.
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<Plus size={16} />}
            >
              Add Your First Payment Method
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((payment) => (
            <Card key={payment.id}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getCardIcon(payment.brand)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-medium text-gray-900">
                          {getBrandDisplayName(payment.brand)} •••• {payment.last4}
                        </span>
                        {payment.is_default && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle size={12} className="mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires {String(payment.exp_month).padStart(2, '0')}/{payment.exp_year}
                        <span className="ml-2">• Added {new Date(payment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!payment.is_default && (
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleSetDefault(payment.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeletePaymentMethod(payment.id)}
                      isLoading={deletingId === payment.id}
                      icon={<Trash2 size={14} />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Payment Method</h3>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">Development Mode</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    This is a development environment. You can add test payment methods 
                    to try out the ordering system without real billing.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleAddTestPaymentMethod}
                    isLoading={addingTest}
                    className="w-full"
                    icon={<CreditCard size={16} />}
                  >
                    Add Test Payment Method
                  </Button>
                  
                  <div className="text-center">
                    <span className="text-sm text-gray-500">or</span>
                  </div>
                  
                  <Button
                    variant="light"
                    className="w-full"
                    disabled
                  >
                    Add Real Card (Coming Soon)
                  </Button>
                </div>

                <div className="text-xs text-gray-500">
                  <p>Test payment methods are automatically generated with random card details 
                  for development purposes. They cannot be used for real transactions.</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  variant="light"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;