import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { stripeProducts } from '../../stripe-config';
import { supabase } from '../../utils/supabase';
import Button from '../ui/Button';
import Card from '../ui/Card';
import toast from 'react-hot-toast';

interface PricingPlansProps {
  onSuccess?: () => void;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(priceId);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Please log in to subscribe');
        return;
      }

      const product = stripeProducts.find(p => p.priceId === priceId);
      if (!product) {
        toast.error('Product not found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/subscription-success`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to start subscription process');
    } finally {
      setLoading(null);
    }
  };

  const features = [
    'Unlimited TV advertising campaigns',
    'Real-time performance analytics',
    'Advanced targeting options',
    'Campaign optimization tools',
    'Priority customer support',
    'Custom reporting dashboard'
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get started with SpotGrid's powerful TV advertising platform. Choose the plan that works best for your business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {stripeProducts.map((product) => {
          const isAnnual = product.name.includes('Annual');
          const monthlyPrice = isAnnual ? (product.price / 12).toFixed(2) : product.price.toFixed(2);
          
          return (
            <Card key={product.priceId} className={`relative ${isAnnual ? 'ring-2 ring-blue-500' : ''}`}>
              {isAnnual && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${product.price}</span>
                  <span className="text-gray-600">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                
                {isAnnual && (
                  <p className="text-sm text-green-600 font-medium">
                    Save ${((4.99 * 12) - product.price).toFixed(2)} per year
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe(product.priceId)}
                disabled={loading !== null}
                isLoading={loading === product.priceId}
                className="w-full"
                variant={isAnnual ? 'primary' : 'light'}
              >
                {loading === product.priceId ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Subscribe to ${product.name}`
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>All plans include a 14-day free trial. Cancel anytime.</p>
        <p className="mt-1">Secure payment processing powered by Stripe.</p>
      </div>
    </div>
  );
};

export default PricingPlans;