import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  brandId?: string;
  brandName?: string;
}

interface Brand {
  id: string;
  common_name: string;
}

interface CardFormData {
  brandId: string;
  cardNumber: string;
  cardholderName: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface PaymentMethodsProps {
  selectedBrandId?: string;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ selectedBrandId }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      last4: '4242',
      brand: 'Visa',
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
      brandId: undefined,
      brandName: undefined
    }
  ]);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CardFormData>({
    brandId: '',
    cardNumber: '',
    cardholderName: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  });

  useEffect(() => {
    if (selectedBrandId) {
      setFormData(prev => ({ ...prev, brandId: selectedBrandId }));
    }
    fetchPaymentMethods();
  }, [selectedBrandId]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      
      // Fetch brands without owner_id filter for admins
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('id, common_name')
        .order('common_name');

      if (brandsError) throw brandsError;
      setBrands(brandsData || []);

      // Mock payment methods data
      setPaymentMethods([{
        id: '1',
        last4: '4242',
        brand: 'Visa',
        expMonth: 12,
        expYear: 2025,
        isDefault: true
      }]);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandId) {
      toast.error('Please select a brand');
      return;
    }
    // This will be replaced with Stripe Elements integration
    toast.info('Stripe integration pending');
    setShowAddForm(false);
  };

  const handleRemoveCard = (id: string) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Payment Methods</h3>
          <p className="text-sm text-gray-500">Manage payment methods for your brands</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          icon={<Plus size={16} />}
        >
          Add Payment Method
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <form onSubmit={handleAddCard} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Brand"
                name="brandId"
                value={formData.brandId}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Select Brand' },
                  ...brands.map(brand => ({
                    value: brand.id,
                    label: brand.common_name
                  }))
                ]}
                error={formData.brandId ? undefined : 'Please select a brand'}
                required
              />
              <Input
                label="Card Number"
                name="cardNumber"
                placeholder="**** **** **** ****"
                value={formData.cardNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Cardholder Name"
                name="cardholderName"
                placeholder="Name on card"
                value={formData.cardholderName}
                onChange={handleInputChange}
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Exp Month"
                  name="expMonth"
                  placeholder="MM"
                  maxLength={2}
                  value={formData.expMonth}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Exp Year"
                  name="expYear"
                  placeholder="YY"
                  maxLength={2}
                  value={formData.expYear}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="CVC"
                  name="cvc"
                  placeholder="***"
                  maxLength={4}
                  value={formData.cvc}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Billing Address</h4>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Address Line 1"
                  name="address.line1"
                  placeholder="Street address"
                  value={formData.address.line1}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Address Line 2"
                  name="address.line2"
                  placeholder="Apt, Suite, etc. (optional)"
                  value={formData.address.line2}
                  onChange={handleInputChange}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="address.city"
                    placeholder="City"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="State"
                    name="address.state"
                    placeholder="State"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="ZIP Code"
                    name="address.postalCode"
                    placeholder="ZIP Code"
                    value={formData.address.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                  <Select
                    label="Country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    options={[
                      { value: 'US', label: 'United States' },
                      { value: 'CA', label: 'Canada' }
                    ]}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="light"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Card
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {paymentMethods.map(method => (
          <div
            key={method.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center">
              <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center">
                <CreditCard size={20} className="text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium">
                  {method.brand} ending in {method.last4}
                </p>
                <p className="text-sm text-gray-500">
                  Expires {method.expMonth}/{method.expYear}
                </p>
                {method.brandName && (
                  <p className="text-sm text-blue-600">
                    {method.brandName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!method.isDefault && (
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => handleSetDefault(method.id)}
                >
                  Set as Default
                </Button>
              )}
              {method.isDefault && (
                <span className="text-sm text-green-600 font-medium">
                  Default
                </span>
              )}
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={16} />}
                onClick={() => handleRemoveCard(method.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        {paymentMethods.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No payment methods added yet
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentMethods;