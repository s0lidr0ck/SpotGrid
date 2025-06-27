import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { stripeProducts, getProductByPriceId } from '../../stripe-config';
import Button from '../ui/Button';
import Card from '../ui/Card';
import toast from 'react-hot-toast';

interface Subscription {
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

interface SubscriptionCardProps {
  onUpgrade?: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ onUpgrade }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching subscription:', fetchError);
        setError('Failed to load subscription information');
        return;
      }

      setSubscription(data);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      case 'past_due':
        return 'text-orange-600 bg-orange-100';
      case 'canceled':
      case 'unpaid':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'trialing':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'past_due':
      case 'canceled':
      case 'unpaid':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading subscription...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Subscription</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchSubscription} variant="light">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <Card>
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">
            You don't have an active subscription. Choose a plan to get started.
          </p>
          {onUpgrade && (
            <Button onClick={onUpgrade}>
              View Plans
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Current Subscription</h3>
          <p className="text-sm text-gray-500">Manage your subscription plan</p>
        </div>
        <div className="flex items-center">
          {getStatusIcon(subscription.subscription_status)}
        </div>
      </div>

      <div className="space-y-4">
        {/* Plan Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">
                {product?.name || 'Unknown Plan'}
              </h4>
              <p className="text-sm text-gray-600">
                {product?.description || 'Subscription plan'}
              </p>
              {product && (
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  ${product.price}/{product.mode === 'subscription' ? (product.name.includes('Annual') ? 'year' : 'month') : 'one-time'}
                </p>
              )}
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.subscription_status)}`}>
              {subscription.subscription_status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Billing Information */}
        {subscription.current_period_start && subscription.current_period_end && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                Current Period
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
              </p>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <CreditCard className="h-4 w-4 mr-1" />
                Payment Method
              </div>
              <p className="text-sm font-medium text-gray-900">
                {subscription.payment_method_brand && subscription.payment_method_last4
                  ? `${subscription.payment_method_brand} •••• ${subscription.payment_method_last4}`
                  : 'Not available'
                }
              </p>
            </div>
          </div>
        )}

        {/* Cancellation Notice */}
        {subscription.cancel_at_period_end && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-orange-800">Subscription Ending</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Your subscription will end on {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'the current period end'}.
                  You'll continue to have access until then.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          {onUpgrade && (
            <Button onClick={onUpgrade} variant="light" className="flex-1">
              Change Plan
            </Button>
          )}
          <Button 
            variant="light" 
            className="flex-1"
            onClick={() => toast.info('Billing portal coming soon')}
          >
            Manage Billing
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SubscriptionCard;