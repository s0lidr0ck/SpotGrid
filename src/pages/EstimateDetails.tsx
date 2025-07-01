import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Edit, X, Check, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api-client';
import Button from '../components/ui/Button';

// Temporary stub for supabase calls that aren't migrated yet - SIMPLIFIED VERSION
const supabase = {
  from: () => ({
    delete: () => ({ eq: () => ({ error: null }) }),
    insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
    update: () => ({ eq: () => ({ error: null }) })
  })
};

import EstimateForm from '../components/estimates/EstimateForm';
import EstimateSidePanel from '../components/estimates/EstimateSidePanel';
import ScheduleGrid from '../components/schedules/ScheduleGrid';
import MediaSelectionDialog from '../components/estimates/MediaSelectionDialog';
import PaymentSelectionDialog from '../components/estimates/PaymentSelectionDialog';
import { calculateWeeklySpend, calculateWeeklyImpressions } from '../utils/calculations';
import CouponCodeInput from '../components/estimates/CouponCodeInput';

// Import EstimateItem type from calculations
type EstimateItem = SelectedSlot;
import { getNextStatuses, canEditEstimate } from '../utils/statusUtils';

export interface Estimate {
  id: string;
  estimateName: string;
  brandId: string;
  status: string;
  totalSpend: number;
  startDate: string;
  brands?: {
    id: string;
    common_name: string;
  };
  media_asset?: {
    id: string;
    friendly_name: string;
    isci_code: string;
  };
  payment_method_id?: string;
}

export type EstimateStatus = 'draft' | 'pending_approval' | 'ordered' | 'modified' | 'approved' | 'rejected';

export interface DayPart {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  spotFrequency: number;
  multiplier: number;
  expectedViews: number;
  lowestCpm: number;
  days: number;
}

interface SelectedSlot {
  id: string;
  dayPartId: string;
  specificDate: string;
  userDefinedCpm: number;
  spotsPerOccurrence: number;
}

interface SelectedMedia {
  id: string;
  friendlyName: string;
  isciCode: string;
}

interface SelectedPayment {
  id: string;
  last4: string;
  brand: string;
}

interface CouponCode {
  id: string;
  name?: string;
  percent_off?: number;
  amount_off?: number;
  currency?: string;
  duration: string;
  duration_in_months?: number;
}

const EstimateDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'traffic_admin';
  
  console.log('🚀 NEW EstimateDetails component loaded with ID:', id);
  console.log('🔥 This should appear if the new component is loaded');
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [dayParts, setDayParts] = useState<DayPart[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<SelectedPayment | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);

  // Calculate weekly totals from selected slots
  const weeklySpend = selectedSlots.length > 0 ? calculateWeeklySpend(selectedSlots as EstimateItem[], dayParts) : 0;
  const weeklyImpressions = selectedSlots.length > 0 ? calculateWeeklyImpressions(selectedSlots as EstimateItem[], dayParts) : 0;

  // Calculate discount amount based on coupon
  const calculateCouponDiscount = (totalAmount: number, coupon: CouponCode | null) => {
    if (!coupon) return 0;
    
    if (coupon.percent_off) {
      return (totalAmount * coupon.percent_off) / 100;
    } else if (coupon.amount_off) {
      // Stripe amounts are in cents
      return coupon.amount_off / 100;
    }
    
    return 0;
  };

  const couponDiscount = calculateCouponDiscount(weeklySpend, appliedCoupon);
  const finalTotal = Math.max(0, weeklySpend - couponDiscount);

  useEffect(() => {
    const fetchEstimateDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching estimate details for ID:', id);
        
        // Check URL parameters for edit mode
        if (searchParams.get('edit') === 'true') {
          setIsEditing(true);
        }
        
        // Fetch estimate details with brand and media information
        console.log('🔥 NEW FETCH FUNCTION - Making API call to fetch estimate with ID:', id);
        console.log('🔥 API client base URL:', 'http://localhost:3001/api');
        console.log('🔥 Auth token available:', !!localStorage.getItem('auth_token'));
        
        const { data: estimateData, error: estimateError } = await apiClient.getEstimate(id!);

        console.log('API response received:', { data: estimateData, error: estimateError });

        if (estimateError) {
          console.error('Error fetching estimate:', estimateError);
          throw new Error(estimateError.message);
        }

        console.log('Fetched estimate data:', estimateData);

        if (!estimateData) {
          throw new Error('Estimate not found');
        }

        // Set selected media if it exists - for now using mock data since media_assets aren't fully migrated
        if (estimateData.media_asset_id) {
          setSelectedMedia({
            id: estimateData.media_asset_id,
            friendlyName: 'Sample Media Asset', // Mock data
            isciCode: 'MOCK001' // Mock data
          });
        }

        // Set selected payment if it exists
        if (estimateData.payment_method_id) {
          // For now, we'll use mock data since we don't have a payments table
          setSelectedPayment({
            id: estimateData.payment_method_id,
            last4: '4242', // Mock data
            brand: 'Visa' // Mock data
          });
        }

        // Transform the data to match our interface
        const transformedEstimate: Estimate = {
          id: estimateData.id,
          estimateName: estimateData.estimate_name || estimateData.name,
          brandId: estimateData.brand_id,
          status: estimateData.status,
          totalSpend: estimateData.total_spend || estimateData.total_estimated_cost || 0,
          startDate: estimateData.start_date ? new Date(estimateData.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          brands: estimateData.brand_name ? {
            id: estimateData.brand_id,
            common_name: estimateData.brand_name
          } : undefined,
          media_asset: estimateData.media_asset_id ? {
            id: estimateData.media_asset_id,
            friendly_name: 'Sample Media Asset',
            isci_code: 'MOCK001'
          } : undefined,
          payment_method_id: estimateData.payment_method_id
        };
        
        // Fetch real dayparts data from the database
        console.log('🔥 Fetching dayparts from database...');
        const { data: dayPartsData, error: dayPartsError } = await apiClient.getDayparts();

        if (dayPartsError) {
          console.error('Error fetching dayparts:', dayPartsError);
          throw new Error(dayPartsError.message);
        }

        console.log('Fetched dayparts data:', dayPartsData);

        // Transform dayparts data to match our interface
        const transformedDayParts: DayPart[] = dayPartsData?.map((dp: any) => ({
          id: dp.id,
          name: dp.name,
          startTime: dp.start_time,
          endTime: dp.end_time,
          spotFrequency: dp.spot_frequency,
          multiplier: parseFloat(dp.multiplier),
          expectedViews: dp.expected_views,
          lowestCpm: parseFloat(dp.lowest_cpm),
          days: dp.days
        })) || [];

        // Fetch saved estimate items (slot selections) from database
        console.log('🔥 Fetching estimate items from database...');
        const { data: estimateItemsData, error: itemsError } = await apiClient.getEstimateItems(id!);

        if (itemsError) {
          console.error('Error fetching estimate items:', itemsError);
          // Don't throw error here, just log it and continue with empty slots
          console.log('Continuing with empty slots...');
        }

        console.log('Fetched estimate items data:', estimateItemsData);

        // Transform estimate items to selected slots
        const transformedSlots: SelectedSlot[] = estimateItemsData?.map((item: any) => ({
          id: item.id,
          dayPartId: item.day_part_id,
          specificDate: item.specific_date,
          userDefinedCpm: parseFloat(item.user_defined_cpm),
          spotsPerOccurrence: item.spots_per_occurrence
        })) || [];

        setEstimate(transformedEstimate);
        setDayParts(transformedDayParts);
        setSelectedSlots(transformedSlots);

        // Load saved media and payment selections
        if (estimateData.media_asset_id) {
          setSelectedMedia({
            id: estimateData.media_asset_id,
            friendlyName: estimateData.media_filename || 'Selected Media',
            isciCode: estimateData.media_asset_id.substring(0, 8).toUpperCase()
          });
        }

        if (estimateData.payment_method_id) {
          setSelectedPayment({
            id: estimateData.payment_method_id,
            last4: estimateData.payment_last4 || '****',
            brand: estimateData.payment_brand || 'Unknown'
          });
        }

        console.log('Initial estimate state set:', transformedEstimate);
      } catch (error) {
        console.error('Error fetching estimate details:', error);
        toast.error('Failed to load estimate details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEstimateDetails();
    }
  }, [id, searchParams]);

  const handleEdit = () => {
    console.log('Entering edit mode');
    setIsEditing(true);
  };

  const handleCancel = () => {
    console.log('Canceling edit mode');
    setIsEditing(false);
    window.location.href = window.location.pathname;
  };

  const handleSave = async () => {
    if (!estimate) return;
    
    try {
      setIsSaving(true);
      console.log('Saving changes');
      
      // Calculate total spend from selected slots
      const calculatedTotalSpend = calculateWeeklySpend(selectedSlots as EstimateItem[], dayParts);
      
      // Update the estimate with calculated totals
      await handleEstimateUpdate({
        totalSpend: calculatedTotalSpend,
        status: estimate.status
      });
      
      // handleEstimateUpdate already handles success/error messages and setIsEditing(false)
      
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes');
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!estimate || estimate.status !== 'draft') {
      toast.error('Only draft orders can be deleted');
      return;
    }

    try {
      setIsDeleting(true);
      
      // Use API client to delete estimate
      const { error } = await apiClient.deleteEstimate(estimate.id);
      
      if (error) {
        throw new Error(error.message);
      }

      toast.success('Order deleted successfully');
      navigate('/orders');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Slot selection functionality
  const handleSlotSelect = async (newSlot: SelectedSlot) => {
    if (!estimate) return;
    
    try {
      console.log('Adding new slot:', newSlot);
      
      // Save to database first
      const itemData = {
        day_part_id: newSlot.dayPartId,
        specific_date: newSlot.specificDate,
        user_defined_cpm: newSlot.userDefinedCpm,
        spots_per_occurrence: newSlot.spotsPerOccurrence
      };
      
      const { data: savedItem, error } = await apiClient.createEstimateItem(estimate.id, itemData);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state with the saved item (including database ID)
      const slotWithDbId: SelectedSlot = {
        ...newSlot,
        id: savedItem.id // Use the database-generated ID
      };
      
      setSelectedSlots(prevSlots => [...prevSlots, slotWithDbId]);
      
      // Find the daypart for this slot to show proper feedback
      const dayPart = dayParts.find(dp => dp.id === newSlot.dayPartId);
      const dayPartName = dayPart?.name || 'Unknown';
      
      toast.success(`Added ${newSlot.spotsPerOccurrence} spots to ${dayPartName} at $${newSlot.userDefinedCpm} CPM`);
      
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error('Failed to add slot');
    }
  };

  const handleSlotRemove = async (slotId: string) => {
    if (!estimate) return;
    
    try {
      console.log('Removing slot:', slotId);
      
      // Find the slot being removed for feedback
      const slotToRemove = selectedSlots.find(slot => slot.id === slotId);
      
      // Delete from database
      const { error } = await apiClient.deleteEstimateItem(estimate.id, slotId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Remove from local state
      setSelectedSlots(prevSlots => prevSlots.filter(slot => slot.id !== slotId));
      
      // Show feedback
      if (slotToRemove) {
        const dayPart = dayParts.find(dp => dp.id === slotToRemove.dayPartId);
        const dayPartName = dayPart?.name || 'Unknown';
        toast.success(`Removed spots from ${dayPartName}`);
      } else {
        toast.success('Slot removed');
      }
      
    } catch (error) {
      console.error('Error removing slot:', error);
      toast.error('Failed to remove slot');
    }
  };

  const handleEstimateUpdate = async (updatedEstimate: Partial<Estimate>) => {
    if (!estimate) return;
    
    try {
      setIsSaving(true);
      console.log('Updating estimate:', updatedEstimate);
      
      // Prepare the update data
      const updateData = {
        estimate_name: updatedEstimate.estimateName || estimate.estimateName,
        brand_id: updatedEstimate.brandId || estimate.brandId,
        start_date: updatedEstimate.startDate || estimate.startDate,
        total_spend: updatedEstimate.totalSpend || estimate.totalSpend,
        status: updatedEstimate.status || estimate.status,
        // Include selected media and payment method
        media_asset_id: selectedMedia?.id || null,
        payment_method_id: selectedPayment?.id || null
      };
      
      // Call the API to update the estimate
      const { data, error } = await apiClient.updateEstimate(estimate.id, updateData);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state with the returned data
      if (data) {
        const updatedEstimateData: Estimate = {
          id: data.id,
          estimateName: data.estimate_name || data.name,
          brandId: data.brand_id,
          status: data.status,
          totalSpend: data.total_spend || data.total_estimated_cost || 0,
          startDate: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          brands: data.brand_name ? {
            id: data.brand_id,
            common_name: data.brand_name
          } : estimate.brands,
          media_asset: data.media_asset_id ? {
            id: data.media_asset_id,
            friendly_name: data.media_filename || 'Selected Media',
            isci_code: data.media_asset_id.substring(0, 8).toUpperCase()
          } : undefined,
          payment_method_id: data.payment_method_id
        };
        
        setEstimate(updatedEstimateData);
      }
      
      toast.success('Order updated successfully');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating estimate:', error);
      toast.error('Failed to update order');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: EstimateStatus) => {
    if (!estimate) return;

    // Validation before submitting
    if (newStatus === 'ordered') {
      if (!selectedMedia) {
        toast.error('Please select media before submitting the order');
        return;
      }
      if (!selectedPayment) {
        toast.error('Please select a payment method before submitting the order');
        return;
      }
      if (selectedSlots.length === 0) {
        toast.error('Please add at least one schedule slot before submitting the order');
        return;
      }
    }

    try {
      console.log('Changing status to:', newStatus);
      
      // Update the estimate status
      await handleEstimateUpdate({
        status: newStatus,
        estimateName: estimate.estimateName,
        brandId: estimate.brandId,
        startDate: estimate.startDate,
        totalSpend: estimate.totalSpend
      });
      
      // Show appropriate success message
      const statusMessages = {
        ordered: 'Order submitted for approval successfully!',
        approved: 'Order approved successfully!',
        rejected: 'Order rejected',
        modified: 'Order marked for modifications'
      };
      
      toast.success(statusMessages[newStatus as keyof typeof statusMessages] || `Status changed to ${newStatus}`);
      
    } catch (error) {
      console.error('Error changing status:', error);
      toast.error('Failed to change order status');
    }
  };

  const handleBrandChange = async (brandId: string) => {
    if (!estimate) return;
    
    try {
      console.log('Changing brand to:', brandId);
      
      // Update the estimate with the new brand
      await handleEstimateUpdate({
        brandId: brandId,
        estimateName: estimate.estimateName,
        startDate: estimate.startDate,
        totalSpend: estimate.totalSpend,
        status: estimate.status
      });
      
      toast.success('Brand updated successfully');
      
    } catch (error) {
      console.error('Error changing brand:', error);
      toast.error('Failed to update brand');
    }
  };

  if (loading) {
    console.log('EstimateDetails: Showing loading state for ID:', id);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading estimate details...</p>
          <p className="text-sm text-gray-400">ID: {id}</p>
        </div>
      </div>
    );
  }

  console.log('EstimateDetails: Rendering main component', { estimate, loading });

  if (!estimate) {
    return <div>Estimate not found</div>;
  }

  const canEdit = canEditEstimate(estimate.status as EstimateStatus, isAdmin);
  const nextStatuses = getNextStatuses(estimate.status as EstimateStatus, isAdmin);
  const canDelete = estimate.status === 'draft';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{estimate.estimateName}</h1>
          <p className="text-gray-600 mt-1">
            Estimate ID: {estimate.id}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing && canEdit && (
            <Button
              variant="light"
              onClick={handleEdit}
              icon={<Edit size={16} />}
            >
              Edit Order
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="light"
                onClick={handleCancel}
                icon={<X size={16} />}
              >
                Cancel
              </Button>
              <Button
                form="orderForm"
                type="submit"
                isLoading={isSaving}
                icon={<Check size={16} />}
              >
                Save Changes
              </Button>
            </>
          )}
          {canDelete && !isEditing && (
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              icon={<Trash2 size={16} />}
            >
              Delete Order
            </Button>
          )}
          {nextStatuses.map(status => (
            <Button
              key={status}
              onClick={() => handleStatusChange(status)}
              variant={status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'primary'}
            >
              {status === 'ordered' ? 'Submit Order' : 
               status === 'approved' ? 'Approve Order' :
               status === 'rejected' ? 'Reject Order' :
               status === 'modified' ? 'Request Changes' :
               `Change to ${status}`}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Schedule</h2>
          </div>

          <ScheduleGrid
            dayParts={dayParts}
            selectedSlots={selectedSlots}
            onSlotSelect={handleSlotSelect}
            onSlotRemove={handleSlotRemove}
            isEditable={isEditing}
          />
        </div>

        <div>
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <EstimateForm
                initialData={estimate}
                onSubmit={handleEstimateUpdate}
                isLoading={loading || isSaving}
                isEditing={isEditing}
                onBrandChange={handleBrandChange}
              />

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="light"
                    onClick={() => setShowMediaDialog(true)}
                    disabled={!estimate?.brandId || !isEditing}
                    className="flex-1"
                  >
                    {selectedMedia ? `Selected: ${selectedMedia.friendlyName}` : 'Select Media'}
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => setShowPaymentDialog(true)}
                    disabled={!estimate?.brandId || !isEditing}
                    className="flex-1"
                  >
                    {selectedPayment ? `Card ending in ${selectedPayment.last4}` : 'Select Payment'}
                  </Button>
                </div>

                {/* Coupon Code Section */}
                {isEditing && (
                  <div className="border-t pt-4">
                    <CouponCodeInput
                      onCouponApplied={(coupon) => setAppliedCoupon(coupon)}
                      onCouponRemoved={() => setAppliedCoupon(null)}
                      appliedCoupon={appliedCoupon}
                      disabled={!isEditing}
                    />
                  </div>
                )}
              </div>
            </div>

            <EstimateSidePanel
              estimate={estimate}
              weeklySpend={weeklySpend}
              weeklyImpressions={weeklyImpressions}
              onStatusChange={handleStatusChange}
              isAdmin={isAdmin}
              isLoading={loading}
            />
          </div>
        </div>
      </div>

      {showMediaDialog && estimate.brandId && (
        <MediaSelectionDialog
          brandId={estimate.brandId}
          onClose={() => setShowMediaDialog(false)}
          onSelect={(media) => {
            setSelectedMedia({
              id: media.id,
              friendlyName: media.friendlyName,
              isciCode: media.isciCode
            });
            setShowMediaDialog(false);
            toast.success(`Selected media: ${media.friendlyName}`);
          }}
        />
      )}

      {showPaymentDialog && estimate.brandId && (
        <PaymentSelectionDialog
          brandId={estimate.brandId}
          onClose={() => setShowPaymentDialog(false)}
          onSelect={(payment) => {
            setSelectedPayment({
              id: payment.id,
              last4: payment.last4,
              brand: payment.brand
            });
            setShowPaymentDialog(false);
            toast.success(`Selected payment method ending in ${payment.last4}`);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Order</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="light"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                icon={<Trash2 size={16} />}
              >
                Delete Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimateDetails;