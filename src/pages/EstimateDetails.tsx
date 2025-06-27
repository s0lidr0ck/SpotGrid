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

export type EstimateStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

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

  // Calculate weekly metrics
  const weeklySpend = selectedSlots.length > 0 ? calculateWeeklySpend(selectedSlots, dayParts) : 0;
  const weeklyImpressions = selectedSlots.length > 0 ? calculateWeeklyImpressions(selectedSlots, dayParts) : 0;

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
          startDate: estimateData.start_date,
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
        
        // For now, use mock day parts data since day_parts table isn't migrated yet
        const mockDayParts: DayPart[] = [
          {
            id: '1',
            name: 'Morning Drive',
            startTime: '06:00',
            endTime: '10:00',
            spotFrequency: 3,
            multiplier: 1.2,
            expectedViews: 25000,
            lowestCpm: 8.50,
            days: 5
          },
          {
            id: '2',
            name: 'Midday',
            startTime: '10:00',
            endTime: '15:00',
            spotFrequency: 2,
            multiplier: 0.8,
            expectedViews: 15000,
            lowestCpm: 6.00,
            days: 5
          },
          {
            id: '3',
            name: 'Evening Drive',
            startTime: '15:00',
            endTime: '19:00',
            spotFrequency: 4,
            multiplier: 1.5,
            expectedViews: 35000,
            lowestCpm: 12.00,
            days: 5
          }
        ];

        // For now, use empty slots array since estimate_items table integration isn't complete
        const mockSlots: SelectedSlot[] = [];

        setEstimate(transformedEstimate);
        setDayParts(mockDayParts);
        setSelectedSlots(mockSlots);

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

  const handleSave = () => {
    console.log('Saving changes');
    setIsEditing(false);
    toast.success('Changes saved successfully');
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

  // COMMENTED OUT FUNCTIONS THAT NEED FULL MIGRATION - WILL BE IMPLEMENTED LATER
  const handleSlotSelect = async (newSlot: SelectedSlot) => {
    console.log('Slot selection not yet implemented - needs full migration');
    toast.success('Slot selection feature is being migrated');
  };

  const handleSlotRemove = async (slotId: string) => {
    console.log('Slot removal not yet implemented - needs full migration');
    toast.success('Slot removal feature is being migrated');
  };

  const handleEstimateUpdate = async (updatedEstimate: Partial<Estimate>) => {
    console.log('Estimate update not yet implemented - needs full migration');
    toast.success('Estimate update feature is being migrated');
  };

  const handleStatusChange = async (newStatus: EstimateStatus) => {
    console.log('Status change not yet implemented - needs full migration');
    toast.success('Status change feature is being migrated');
  };

  const handleBrandChange = (brandId: string) => {
    console.log('Brand change not yet implemented - needs full migration');
    toast.success('Brand change feature is being migrated');
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
              {status === 'ordered' ? 'Submit for Approval' : 
               status === 'approved' ? 'Approve' :
               status === 'rejected' ? 'Reject' :
               status === 'modified' ? 'Request Changes' :
               status === 'approved' ? 'Mark Approved' : 
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