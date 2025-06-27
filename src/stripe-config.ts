export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1QDmfSDtJnn28LjWXnvlFmKf',
    name: 'Annual Subscription',
    description: 'Pursuit Annual Subscription',
    mode: 'subscription',
    price: 49.99
  },
  {
    priceId: 'price_1QDmgCDtJnn28LjW6ltzHjB3',
    name: 'Monthly Subscription',
    description: 'Pursuit Monthly Subscription',
    mode: 'subscription',
    price: 4.99
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};