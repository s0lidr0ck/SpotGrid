import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EstimatesList, { Estimate } from '../components/estimates/EstimatesList';
import { useAuth } from '../context/AuthContext';

import { apiClient } from '../utils/api-client';
import toast from 'react-hot-toast';

const OrdersView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'traffic_admin';
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEstimates = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await apiClient.getEstimates({
        exclude_status: ['approved', 'rejected']
      });

      if (error) throw new Error(error.message);

      const formattedEstimates: Estimate[] = data.map(estimate => ({
        id: estimate.id,
        estimateName: estimate.estimate_name,
        status: estimate.status,
        totalEstimatedCost: estimate.total_estimated_cost,
        totalSpend: estimate.total_spend,
        brandName: estimate.brand_name || 'Unknown Brand',
        startDate: estimate.start_date,
        createdAt: estimate.created_at,
        updatedAt: estimate.updated_at,
        media_asset: undefined, // Will be populated when we add media API
        payment_method_id: estimate.payment_method_id
      }));

      setEstimates(formattedEstimates);
    } catch (error: any) {
      console.error('Error fetching estimates:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();

    // TODO: Implement real-time subscriptions when needed
    // For now, we'll just fetch once when component mounts
  }, [user, isAdmin]);

  const handleCreateOrder = async () => {
    try {
      const { data, error } = await apiClient.createEstimate({
        estimate_name: 'New Order',
        start_date: new Date().toISOString().split('T')[0],
        total_spend: 0,
        total_estimated_cost: 0,
        status: 'draft'
      });

      if (error) throw new Error(error.message);

      // Navigate to the new order in edit mode
      navigate(`/estimates/${data.id}?edit=true`);
      toast.success('New order created');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <EstimatesList
          estimates={estimates}
          isLoading={false}
          title="Orders in Progress"
          onNewOrder={handleCreateOrder}
        />
      )}
    </div>
  );
};

export default OrdersView;