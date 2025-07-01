import React, { useState, useEffect } from 'react';
import { AlertCircle, Video, FileVideo, CheckCircle, Clock, X, Eye } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { apiClient } from '../../utils/api-client';
import toast from 'react-hot-toast';

interface MediaAsset {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  brand_id: string;
  status: 'pending' | 'approved' | 'rejected';
  brand_name?: string;
  created_at: string;
}

interface MediaSelectionDialogProps {
  brandId: string;
  onClose: () => void;
  onSelect: (media: { id: string; friendlyName: string; isciCode: string }) => void;
}

const MediaSelectionDialog: React.FC<MediaSelectionDialogProps> = ({
  brandId,
  onClose,
  onSelect
}) => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchMediaAssets();
  }, [brandId]);

  const fetchMediaAssets = async () => {
    try {
      setLoading(true);
      
      // Fetch approved media assets for this brand
      const { data, error } = await apiClient.getMediaAssets({ 
        brand_id: brandId, 
        status: 'approved' 
      });

      if (error) {
        throw new Error(error.message);
      }

      setMediaAssets(data || []);

      // If no approved media found, check if there are pending media assets
      if (!data || data.length === 0) {
        console.log('No approved media found, checking for pending media...');
        const { data: pendingData, error: pendingError } = await apiClient.getMediaAssets({ 
          brand_id: brandId, 
          status: 'pending' 
        });
        
        if (!pendingError && pendingData && pendingData.length > 0) {
          console.log(`Found ${pendingData.length} pending media assets for this brand`);
          // We'll show this information in the empty state
        }
      }
    } catch (error) {
      console.error('Error fetching media assets:', error);
      toast.error('Failed to load media assets');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedAsset) {
      // Transform MediaAsset to match expected interface
      onSelect({
        id: selectedAsset.id,
        friendlyName: selectedAsset.filename, // Use filename as friendly name
        isciCode: selectedAsset.id.substring(0, 8).toUpperCase() // Generate a mock ISCI code
      });
      onClose();
    }
  };

  const handlePreview = async (asset: MediaAsset) => {
    try {
      // Try to get preview URL first, fallback to original if no preview available
      let previewData;
      try {
        const { data, error } = await apiClient.getMediaAssetPreviewUrl(asset.id, 'preview');
        if (error) throw new Error(error.message);
        previewData = data;
      } catch (previewError) {
        console.log('No preview available, using original file');
        const { data, error } = await apiClient.getMediaAssetUrl(asset.id);
        if (error) throw new Error(error.message);
        previewData = data;
      }

      setPreviewUrl(previewData.url);
      setShowPreview(true);
    } catch (error) {
      console.error('Error getting preview URL:', error);
      toast.error('Failed to load media preview');
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <X className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Media Asset
            </h2>
            <Button variant="light" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading media assets...</span>
              </div>
            ) : mediaAssets.length === 0 ? (
              <Card>
                <div className="p-8 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Approved Media Assets Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No approved media assets are available for this brand.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <Video className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-blue-800 font-medium">Next Steps</span>
                    </div>
                    <div className="text-blue-700 text-sm space-y-2">
                      <p>1. Upload media assets through the Media page</p>
                      <p>2. Wait for admin approval of uploaded assets</p>
                      <p>3. Or contact your admin to approve existing media</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="text-amber-800 text-sm">
                      💡 <strong>Tip:</strong> Only approved media assets can be selected for orders. 
                      Check the Media Approvals section if you're an admin.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mediaAssets.map((asset) => (
                  <div 
                    key={asset.id}
                    className={`cursor-pointer transition-all ${
                      selectedAsset?.id === asset.id 
                        ? 'ring-2 ring-blue-500' 
                        : ''
                    }`}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <Card 
                      className={`${
                        selectedAsset?.id === asset.id 
                          ? 'bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center flex-1">
                            <FileVideo className="h-8 w-8 text-blue-600 mr-3" />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 truncate">
                                {asset.filename}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {asset.mime_type} • {formatFileSize(asset.file_size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(asset.status)}
                            <Button
                              size="sm"
                              variant="light"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(asset);
                              }}
                              icon={<Eye size={14} />}
                            >
                              Preview
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          Uploaded: {new Date(asset.created_at).toLocaleDateString()}
                        </div>
                        
                        {selectedAsset?.id === asset.id && (
                          <div className="mt-2 text-sm text-blue-600 font-medium">
                            ✓ Selected
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 space-x-2">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSelect}
              disabled={!selectedAsset}
            >
              Select Media
            </Button>
          </div>
        </div>
      </div>

      {/* Media Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Media Preview</h3>
              <Button 
                variant="light" 
                onClick={() => {
                  setShowPreview(false);
                  setPreviewUrl(null);
                }}
              >
                <X size={20} />
              </Button>
            </div>
            <div className="p-4">
              <div className="flex justify-center">
                <video 
                  controls 
                  className="max-w-full max-h-96"
                  src={previewUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaSelectionDialog;