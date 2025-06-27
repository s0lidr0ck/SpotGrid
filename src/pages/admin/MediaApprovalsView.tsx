import React, { useState, useEffect } from 'react';
import { Check, X, Play, Download, Eye, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { formatCurrency } from '../../utils/calculations';
import { sendMediaApprovedEmail, sendMediaRejectedEmail } from '../../utils/emailService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';

interface PendingMedia {
  id: string;
  isci_code: string;
  friendly_name: string;
  original_filename: string;
  filesize: number;
  file_timestamp: string;
  type: 'video' | 'audio';
  duration: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  brand: {
    common_name: string;
    owner_id: string;
  } | null;
  owner?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const MediaApprovalsView = () => {
  const [loading, setLoading] = useState(true);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<PendingMedia | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const fetchPendingMedia = async () => {
    try {
      setLoading(true);
      
      // Fetch media assets with brand and owner information
      const { data: mediaData, error: mediaError } = await supabase
        .from('media_assets')
        .select(`
          *,
          brands (
            common_name,
            owner_id
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (mediaError) throw mediaError;

      if (!mediaData || mediaData.length === 0) {
        setPendingMedia([]);
        return;
      }

      // Get unique owner IDs from brands
      const ownerIds = [...new Set(mediaData.map(media => media.brands?.owner_id).filter(Boolean))];

      // Fetch user data for all owners
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', ownerIds);

      if (usersError) throw usersError;

      // Create a map of user data by ID for quick lookup
      const userMap = (usersData || []).reduce((acc: Record<string, any>, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      // Combine media with user data
      const mediaWithUsers = mediaData.map(media => ({
        ...media,
        owner: media.brands?.owner_id ? userMap[media.brands.owner_id] : null
      }));

      setPendingMedia(mediaWithUsers);
    } catch (error) {
      console.error('Error fetching pending media:', error);
      toast.error('Failed to load pending media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingMedia();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('media_assets_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_assets',
          filter: "status=eq.pending"
        },
        () => {
          fetchPendingMedia();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleApprove = async (media: PendingMedia) => {
    try {
      setProcessingAction(true);
      const { error } = await supabase
        .from('media_assets')
        .update({ status: 'approved' })
        .eq('id', media.id);

      if (error) throw error;
      
      toast.success('Media approved successfully');
      
      // Send approval email notification
      if (media.owner?.email && media.brand) {
        const emailSent = await sendMediaApprovedEmail(
          media.owner.email,
          media.friendly_name,
          media.isci_code,
          media.brand.common_name
        );
        
        if (emailSent) {
          toast.success('Approval notification sent to user');
        } else {
          toast.error('Failed to send email notification');
        }
      }
      
      fetchPendingMedia();
    } catch (error) {
      console.error('Error approving media:', error);
      toast.error('Failed to approve media');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedMedia) return;

    try {
      setProcessingAction(true);
      const { error } = await supabase
        .from('media_assets')
        .update({ 
          status: 'rejected'
          // Note: We could add a rejection_reason column to store the reason
        })
        .eq('id', selectedMedia.id);

      if (error) throw error;
      
      toast.success('Media rejected');
      
      // Send rejection email notification
      if (selectedMedia.owner?.email && selectedMedia.brand) {
        const emailSent = await sendMediaRejectedEmail(
          selectedMedia.owner.email,
          selectedMedia.friendly_name,
          selectedMedia.isci_code,
          selectedMedia.brand.common_name
        );
        
        if (emailSent) {
          toast.success('Rejection notification sent to user');
        } else {
          toast.error('Failed to send email notification');
        }
      }
      
      setShowRejectModal(false);
      setSelectedMedia(null);
      setRejectReason('');
      fetchPendingMedia();
    } catch (error) {
      console.error('Error rejecting media:', error);
      toast.error('Failed to reject media');
    } finally {
      setProcessingAction(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDuration = (duration: string) => {
    // Duration is in format HH:MM:SS
    const parts = duration.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseInt(parts[2]);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
        <h1 className="text-2xl font-bold text-gray-900">Media Approvals</h1>
        <p className="text-gray-600 mt-1">
          Review and approve submitted media assets
        </p>
      </div>

      {pendingMedia.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Check className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500">
              No media assets are waiting for approval.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingMedia.map(media => (
            <Card key={media.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {media.type === 'video' ? (
                        <Play className="h-6 w-6 text-gray-600" />
                      ) : (
                        <div className="h-6 w-6 bg-blue-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">♪</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {media.friendly_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ISCI: {media.isci_code} • {media.brand?.common_name || 'Unknown Brand'}
                      </p>
                    </div>
                    <StatusBadge status="pending" />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium text-gray-700">File Details</p>
                      <p>{media.original_filename}</p>
                      <p>{formatFileSize(media.filesize)} • {formatDuration(media.duration)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Type</p>
                      <p className="capitalize">{media.type}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Submitted By</p>
                      {media.owner ? (
                        <div>
                          <p>{media.owner.first_name} {media.owner.last_name}</p>
                          <p className="text-xs text-gray-500">{media.owner.email}</p>
                        </div>
                      ) : (
                        <p className="text-gray-400">Unknown User</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Submitted</p>
                      <p>{new Date(media.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(media.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => {
                      setSelectedMedia(media);
                      setShowPreviewModal(true);
                    }}
                    icon={<Eye size={16} />}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(media)}
                    isLoading={processingAction}
                    icon={<Check size={16} />}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedMedia(media);
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

      {/* Preview Modal */}
      {showPreviewModal && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedMedia.friendly_name}
                </h3>
                <p className="text-sm text-gray-500">
                  ISCI: {selectedMedia.isci_code} • {selectedMedia.brand?.common_name || 'Unknown Brand'}
                </p>
              </div>
              <Button
                variant="light"
                size="sm"
                onClick={() => setShowPreviewModal(false)}
                icon={<X size={16} />}
              >
                Close
              </Button>
            </div>
            
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              {selectedMedia.type === 'video' ? (
                <video
                  className="w-full h-full"
                  controls
                  src={selectedMedia.url}
                  autoPlay
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <audio
                    className="w-full max-w-md"
                    controls
                    src={selectedMedia.url}
                    autoPlay
                  />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Duration</p>
                <p>{formatDuration(selectedMedia.duration)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">File Size</p>
                <p>{formatFileSize(selectedMedia.filesize)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Type</p>
                <p className="capitalize">{selectedMedia.type}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Original Filename</p>
                <p className="truncate">{selectedMedia.original_filename}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="danger"
                onClick={() => {
                  setShowPreviewModal(false);
                  setShowRejectModal(true);
                }}
                icon={<X size={16} />}
              >
                Reject
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  setShowPreviewModal(false);
                  handleApprove(selectedMedia);
                }}
                icon={<Check size={16} />}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Reject Media Asset
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to reject "{selectedMedia.friendly_name}"?
                </p>
              </div>
            </div>

            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional: Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="light"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedMedia(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                isLoading={processingAction}
                icon={<X size={16} />}
              >
                Reject Media
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaApprovalsView;