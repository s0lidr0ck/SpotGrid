import React, { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { apiClient } from '../../utils/api-client';
import toast from 'react-hot-toast';

interface CouponCode {
  id: string;
  name?: string;
  percent_off?: number;
  amount_off?: number;
  currency?: string;
  duration: string;
  duration_in_months?: number;
}

interface CouponCodeInputProps {
  onCouponApplied: (coupon: CouponCode) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: CouponCode | null;
  disabled?: boolean;
}

const CouponCodeInput: React.FC<CouponCodeInputProps> = ({
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
  disabled = false
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      setIsValidating(true);
      
      const { data, error } = await apiClient.validateCoupon(couponCode.trim());

      if (error) {
        throw new Error(error.message);
      }

      if (data.valid) {
        onCouponApplied(data.coupon);
        setCouponCode('');
        toast.success('Coupon code applied successfully!');
      } else {
        toast.error(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast.error('Failed to validate coupon code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    toast.success('Coupon code removed');
  };

  const formatCouponDiscount = (coupon: CouponCode) => {
    if (coupon.percent_off) {
      return `${coupon.percent_off}% off`;
    } else if (coupon.amount_off && coupon.currency) {
      const amount = (coupon.amount_off / 100).toFixed(2); // Stripe amounts are in cents
      return `$${amount} off`;
    }
    return 'Discount applied';
  };

  const formatCouponDuration = (coupon: CouponCode) => {
    switch (coupon.duration) {
      case 'once':
        return 'One-time use';
      case 'repeating':
        return coupon.duration_in_months 
          ? `Valid for ${coupon.duration_in_months} months`
          : 'Repeating discount';
      case 'forever':
        return 'Permanent discount';
      default:
        return '';
    }
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-green-900">
                  Coupon Applied: {appliedCoupon.name || appliedCoupon.id}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {formatCouponDiscount(appliedCoupon)}
                </span>
              </div>
              <p className="text-xs text-green-700">
                {formatCouponDuration(appliedCoupon)}
              </p>
            </div>
          </div>
          <Button
            variant="light"
            size="sm"
            onClick={handleRemoveCoupon}
            disabled={disabled}
            icon={<X size={16} />}
          >
            Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Coupon Code (Optional)
      </label>
      <div className="flex space-x-2">
        <div className="flex-1">
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            disabled={disabled || isValidating}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleValidateCoupon();
              }
            }}
          />
        </div>
        <Button
          onClick={handleValidateCoupon}
          disabled={disabled || isValidating || !couponCode.trim()}
          isLoading={isValidating}
          icon={isValidating ? <Loader2 size={16} /> : <Tag size={16} />}
        >
          Apply
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Enter a valid coupon code to receive a discount on your order
      </p>
    </div>
  );
};

export default CouponCodeInput; 