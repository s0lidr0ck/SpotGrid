import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const SubscriptionSuccessView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // Wait a moment for webhook to process, then fetch subscription
    const timer = setTimeout(() => {
      fetchSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Subscription Successful!</h2>
            <p className="text-gray-600 mt-2">
              Thank you for subscribing to SpotGrid. Your account has been activated.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Loading subscription details...</span>
            </div>
          ) : subscription ? (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Subscription Details</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Status:</span> {subscription.subscription_status}</p>
                {subscription.current_period_end && (
                  <p>
                    <span className="font-medium">Next billing:</span>{' '}
                    {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-700">
                Your subscription is being processed. You should receive a confirmation email shortly.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full"
              icon={<ArrowRight size={16} />}
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/profile')}
              variant="light"
              className="w-full"
            >
              Manage Subscription
            </Button>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@spotgrid.com" className="text-blue-600 hover:text-blue-500">
              support@spotgrid.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessView;