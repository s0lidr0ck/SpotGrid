import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, AlertTriangle, MessageSquare } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { formatCurrency } from '../../utils/calculations';
import { sendOrderApprovedEmail, sendOrderRejectedEmail } from '../../utils/emailService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';

interface PendingOrder {
  id: string;
  estimate_name: string;
  status: string;
  total_spend: number;
  start_date: string;
  created_at: string;
  updated_at: string;
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
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const ApprovalsView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      
      // First, fetch estimates with brand and media asset data
      const { data: estimatesData, error: estimatesError } = await supabase
        .from('estimates')
        .select(`
          *,
          brand:brands (
            common_name
          ),
          media_asset:media_assets (
            friendly_name,
            isci_code
          )
        `)
        .in('status', ['ordered', 'modified'])
        .order('updated_at', { ascending: false });

      if (estimatesError) throw estimatesError;

      if (!estimatesData) {
        setPendingOrders([]);
        return;
      }

      // Get unique owner IDs
      const ownerIds = [...new Set(estimatesData.map(order => order.owner_id))];

      // Fetch user data for all owners
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', ownerIds);

      if (usersError) throw usersError;

      // Create a map of user data by ID for quick lookup
      const userMap = (usersData || []).reduce((acc: Record<string, User>, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      // Combine estimates with user data
      const ordersWithUsers = estimatesData.map(order => ({
        ...order,
        owner: userMap[order.owner_id]
      }));

      setPendingOrders(ordersWithUsers);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      toast.error('Failed to load pending orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('estimates_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'estimates',
          filter: "status=in.(ordered,modified)"
        },
        () => {
          fetchPendingOrders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleApprove = async (order: PendingOrder) => {
    try {
      setProcessingAction(true);
      const { error } = await supabase
        .from('estimates')
        .update({ status: 'approved' })
        .eq('id', order.id);

      if (error) throw error;
      
      toast.success('Order approved successfully');
      
      // Send approval email notification
      if (order.owner?.email) {
        const emailSent = await sendOrderApprovedEmail(
          order.owner.email,
          order.estimate_name,
          order.brand.common_name
        );
        
        if (emailSent) {
          toast.success('Approval notification sent to user');
        } else {
          toast.error('Failed to send email notification');
        }
      }
      
      fetchPendingOrders();
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error('Failed to approve order');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;

    try {
      setProcessingAction(true);
      const { error } = await supabase
        .from('estimates')
        .update({
          status: 'rejected',
          rejection_reason: rejectReason
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;
      
      toast.success('Order rejected');
      
      // Send rejection email notification
      if (selectedOrder.owner?.email) {
        const emailSent = await sendOrderRejectedEmail(
          selectedOrder.owner.email,
          selectedOrder.estimate_name,
          selectedOrder.brand.common_name,
          rejectReason
        );
        
        if (emailSent) {
          toast.success('Rejection notification sent to user');
        } else {
          toast.error('Failed to send email notification');
        }
      }
      
      setShowRejectModal(false);
      setSelectedOrder(null);
      setRejectReason('');
      fetchPendingOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to reject order');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRequestChanges = async (order: PendingOrder) => {
    try {
      setProcessingAction(true);
      const { error } = await supabase
        .from('estimates')
        .update({ status: 'modified' })
        .eq('id', order.id);

      if (error) throw error;
      
      toast.success('Changes requested');
      fetchPendingOrders();
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast.error('Failed to request changes');
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
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600 mt-1">
          Review and approve advertising orders
        </p>
      </div>

      {pendingOrders.length === 0 ? (
        <Card>
          <div className="text-center py-6">
            <Check className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500">
              No orders are waiting for approval.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingOrders.map(order => (
            <Card key={order.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {order.estimate_name}
                    </h3>
                    <StatusBadge status={order.status} />
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-500">
                    <p>Brand: {order.brand.common_name}</p>
                    <p>Submitted by: {order.owner?.first_name} {order.owner?.last_name}</p>
                    <p>Budget: {formatCurrency(order.total_spend)}</p>
                    {order.media_asset && (
                      <p>Media: {order.media_asset.friendly_name} ({order.media_asset.isci_code})</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="light"
                    onClick={() => navigate(`/estimates/${order.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => handleApprove(order)}
                    isLoading={processingAction}
                    icon={<Check size={16} />}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="warning"
                    onClick={() => handleRequestChanges(order)}
                    isLoading={processingAction}
                    icon={<MessageSquare size={16} />}
                  >
                    Request Changes
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowRejectModal(true);
                    }}
                    isLoading={processingAction}
                    icon={<X size={16} />}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Reject Order
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Please provide a reason for rejecting this order.
                </p>
              </div>
            </div>

            <textarea
              className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="light"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedOrder(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                isLoading={processingAction}
                disabled={!rejectReason.trim()}
              >
                Reject Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsView;