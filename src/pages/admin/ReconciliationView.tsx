import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, BarChart, DollarSign } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { formatCurrency, formatNumber } from '../../utils/calculations';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';

interface ActiveCampaign {
  id: string;
  estimate_name: string;
  status: string;
  total_spend: number;
  start_date: string;
  owner_id: string;
  brand: {
    common_name: string;
  };
  media_asset?: {
    friendly_name: string;
    isci_code: string;
  };
  owner?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  actual_impressions?: number;
  actual_spend?: number;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const ReconciliationView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeCampaigns, setActiveCampaigns] = useState<ActiveCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<ActiveCampaign | null>(null);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [reconcileData, setReconcileData] = useState({
    impressions: '',
    spend: ''
  });
  const [processingAction, setProcessingAction] = useState(false);

  const fetchActiveCampaigns = async () => {
    try {
      setLoading(true);
      
      // First, fetch estimates with brand and media asset info
      const { data: estimatesData, error: estimatesError } = await supabase
        .from('estimates')
        .select(`
          id,
          estimate_name,
          status,
          total_spend,
          start_date,
          owner_id,
          actual_impressions,
          actual_spend,
          brand:brands (
            common_name
          ),
          media_asset:media_assets (
            friendly_name,
            isci_code
          )
        `)
        .eq('status', 'approved')
        .order('start_date', { ascending: true });

      if (estimatesError) throw estimatesError;

      if (!estimatesData || estimatesData.length === 0) {
        setActiveCampaigns([]);
        return;
      }

      // Get unique owner IDs
      const ownerIds = [...new Set(estimatesData.map(estimate => estimate.owner_id))];

      // Fetch user data for all owners
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', ownerIds);

      if (usersError) throw usersError;

      // Create a map of users by their ID for quick lookup
      const usersMap = (usersData || []).reduce((acc: { [key: string]: User }, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      // Combine estimates with user data
      const campaignsWithOwners = estimatesData.map(estimate => ({
        ...estimate,
        owner: usersMap[estimate.owner_id]
      }));

      setActiveCampaigns(campaignsWithOwners);
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      toast.error('Failed to load active campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCampaigns();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('estimates_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'estimates',
          filter: "status=in.(approved)"
        },
        () => {
          fetchActiveCampaigns();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleReconcile = async () => {
    if (!selectedCampaign) return;

    try {
      setProcessingAction(true);
      const { error } = await supabase
        .from('estimates')
        .update({
          status: 'approved',
          actual_impressions: parseInt(reconcileData.impressions),
          actual_spend: parseFloat(reconcileData.spend)
        })
        .eq('id', selectedCampaign.id);

      if (error) throw error;
      
      setShowReconcileModal(false);
      setSelectedCampaign(null);
      setReconcileData({ impressions: '', spend: '' });
      toast.success('Campaign reconciled successfully');
      fetchActiveCampaigns();
    } catch (error) {
      console.error('Error reconciling campaign:', error);
      toast.error('Failed to reconcile campaign');
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Campaign Reconciliation</h1>
        <p className="text-gray-600 mt-1">
          Review and reconcile active advertising campaigns
        </p>
      </div>

      {activeCampaigns.length === 0 ? (
        <Card>
          <div className="text-center py-6">
            <Check className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500">
              No active campaigns need reconciliation.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeCampaigns.map(campaign => (
            <Card key={campaign.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {campaign.estimate_name}
                    </h3>
                    <StatusBadge status={campaign.status} />
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-500">
                    <p>Brand: {campaign.brand.common_name}</p>
                    <p>Start Date: {new Date(campaign.start_date).toLocaleDateString()}</p>
                    <p>Budget: {formatCurrency(campaign.total_spend)}</p>
                    {campaign.media_asset && (
                      <p>Media: {campaign.media_asset.friendly_name} ({campaign.media_asset.isci_code})</p>
                    )}
                  </div>

                  {campaign.actual_impressions && campaign.actual_spend && (
                    <div className="mt-2 flex gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Actual Impressions</p>
                        <p className="font-medium">{formatNumber(campaign.actual_impressions)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Actual Spend</p>
                        <p className="font-medium">{formatCurrency(campaign.actual_spend)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="light"
                    onClick={() => navigate(`/estimates/${campaign.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setShowReconcileModal(true);
                    }}
                    icon={<Check size={16} />}
                  >
                    Reconcile
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reconcile Modal */}
      {showReconcileModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <BarChart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Reconcile Campaign
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the actual impressions and spend for this campaign.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Actual Impressions"
                type="number"
                value={reconcileData.impressions}
                onChange={(e) => setReconcileData({ ...reconcileData, impressions: e.target.value })}
                icon={<BarChart size={16} className="text-gray-400" />}
                required
              />

              <Input
                label="Actual Spend"
                type="number"
                step="0.01"
                value={reconcileData.spend}
                onChange={(e) => setReconcileData({ ...reconcileData, spend: e.target.value })}
                icon={<DollarSign size={16} className="text-gray-400" />}
                required
              />
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="light"
                onClick={() => {
                  setShowReconcileModal(false);
                  setSelectedCampaign(null);
                  setReconcileData({ impressions: '', spend: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReconcile}
                isLoading={processingAction}
                disabled={!reconcileData.impressions || !reconcileData.spend}
              >
                Complete Reconciliation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconciliationView;