import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EstimatesList, { Estimate } from '../../components/estimates/EstimatesList';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

const DraftsView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'traffic_admin';
  const [drafts, setDrafts] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    try {
      console.log('=== STARTING DRAFTS FETCH ===');
      console.log('Current user:', user);
      console.log('Current user ID:', user?.id);
      console.log('Is admin:', isAdmin);
      
      setLoading(true);

      // Build the query for estimates with brands and media assets
      const query = supabase
        .from('estimates')
        .select(`
          *,
          brands (
            common_name
          ),
          media_assets (
            friendly_name,
            isci_code
          )
        `)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false });

      // If not admin, only show user's drafts
      if (!isAdmin) {
        console.log('Adding owner_id filter for user:', user?.id);
        query.eq('owner_id', user?.id);
      }

      console.log('Executing estimates query...');
      const { data: estimatesData, error: estimatesError } = await query;

      if (estimatesError) {
        console.error('Estimates query error:', estimatesError);
        throw estimatesError;
      }

      console.log('Raw estimates data:', estimatesData);

      if (!estimatesData || estimatesData.length === 0) {
        console.log('No estimates found, setting empty array');
        setDrafts([]);
        return;
      }

      // Get unique owner IDs from the estimates
      const ownerIds = [...new Set(estimatesData.map(estimate => estimate.owner_id).filter(Boolean))];
      console.log('Owner IDs to fetch:', ownerIds);

      // Fetch user details separately if we have owner IDs
      let usersData: any[] = [];
      if (ownerIds.length > 0) {
        console.log('Fetching users for IDs:', ownerIds);
        const { data: fetchedUsers, error: usersError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email')
          .in('id', ownerIds);

        console.log('Users query result:', { fetchedUsers, usersError });

        if (usersError) {
          console.error('Users query error:', usersError);
          // Don't throw here, just log the error and continue without user data
        } else {
          usersData = fetchedUsers || [];
          console.log('Users data found:', usersData);
        }
      }

      // Create a map of user ID to user data for quick lookup
      const usersMap = new Map(usersData.map(user => [user.id, user]));
      console.log('Users map created:', Object.fromEntries(usersMap));

      // Log each estimate's owner_id and status
      estimatesData.forEach(estimate => {
        const ownerData = usersMap.get(estimate.owner_id);
        console.log('Processing estimate:', {
          id: estimate.id,
          name: estimate.estimate_name,
          owner_id: estimate.owner_id,
          status: estimate.status,
          owner: ownerData,
          hasOwnerData: !!ownerData
        });
      });

      const formattedEstimates: Estimate[] = estimatesData.map(estimate => {
        const ownerData = usersMap.get(estimate.owner_id);
        console.log(`Formatting estimate ${estimate.id}:`, {
          owner_id: estimate.owner_id,
          ownerData,
          hasOwnerData: !!ownerData,
          firstName: ownerData?.first_name,
          lastName: ownerData?.last_name,
          email: ownerData?.email
        });
        
        const formattedEstimate = {
          id: estimate.id,
          estimateName: estimate.estimate_name,
          status: estimate.status,
          totalEstimatedCost: estimate.total_estimated_cost,
          totalSpend: estimate.total_spend,
          brandName: estimate.brands?.common_name || 'Unknown Brand',
          startDate: estimate.start_date,
          createdAt: estimate.created_at,
          updatedAt: estimate.updated_at,
          media_asset: estimate.media_assets,
          payment_method_id: estimate.payment_method_id,
          // Add creator information if available
          createdBy: ownerData ? {
            firstName: ownerData.first_name || 'Unknown',
            lastName: ownerData.last_name || 'User',
            email: ownerData.email || 'No email'
          } : {
            firstName: 'Unknown',
            lastName: 'User',
            email: 'No email'
          }
        };

        console.log('Final formatted estimate:', formattedEstimate);
        return formattedEstimate;
      });

      console.log('=== FINAL FORMATTED ESTIMATES ===');
      console.log('Total estimates:', formattedEstimates.length);
      formattedEstimates.forEach((est, index) => {
        console.log(`Estimate ${index + 1}:`, {
          id: est.id,
          name: est.estimateName,
          createdBy: est.createdBy
        });
      });

      setDrafts(formattedEstimates);
    } catch (error: any) {
      console.error('=== ERROR IN FETCH DRAFTS ===');
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== DRAFTS VIEW MOUNTED ===');
    console.log('Initial user state:', user);
    console.log('Initial admin state:', isAdmin);
    
    fetchDrafts();

    // Subscribe to realtime changes
    console.log('Setting up realtime subscription...');
    const subscription = supabase
      .channel('estimates_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'estimates',
          filter: "status=eq.draft"
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchDrafts();
        }
      )
      .subscribe();

    return () => {
      console.log('DraftsView unmounting, cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [user, isAdmin]);

  const handleCreateOrder = async () => {
    try {
      console.log('Creating new order...');
      console.log('User ID:', user?.id);
      
      const newOrder = {
        estimate_name: 'New Order',
        start_date: new Date().toISOString().split('T')[0],
        total_spend: 0,
        total_estimated_cost: 0,
        status: 'draft',
        owner_id: user?.id
      };
      
      console.log('New order data:', newOrder);
      
      const { data, error } = await supabase
        .from('estimates')
        .insert([newOrder])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      console.log('New order created:', data);
      navigate(`/estimates/${data.id}?edit=true`);
      toast.success('New order created');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Draft Orders</h1>
        <p className="text-gray-600 mt-1">
          {isAdmin 
            ? 'View and manage all draft orders across the system'
            : 'View and manage your draft orders'}
        </p>
      </div>

      <EstimatesList
        estimates={drafts}
        isLoading={loading}
        title="Draft Orders"
        onNewOrder={handleCreateOrder}
        showCreator={isAdmin}
      />
    </div>
  );
};

export default DraftsView;