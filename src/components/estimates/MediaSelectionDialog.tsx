import React, { useState, useEffect } from 'react';
import { X, Film, Play } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

interface MediaAsset {
  id: string;
  friendlyName: string;
  isciCode: string;
  duration: string;
  type: 'video' | 'audio';
  url: string;
  status: string;
}

interface MediaSelectionDialogProps {
  brandId: string;
  onClose: () => void;
  onSelect: (media: MediaAsset) => void;
}

const MediaSelectionDialog: React.FC<MediaSelectionDialogProps> = ({
  brandId,
  onClose,
  onSelect
}) => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  useEffect(() => {
    fetchMediaAssets();
  }, [brandId]);

  const fetchMediaAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .select('id, friendly_name, isci_code, duration, type, url, status')
        .eq('brand_id', brandId)
        .neq('status', 'rejected')
        .order('friendly_name');

      if (error) throw error;

      const formattedAssets = data.map(asset => ({
        id: asset.id,
        friendlyName: asset.friendly_name,
        isciCode: asset.isci_code,
        duration: asset.duration,
        type: asset.type,
        url: asset.url,
        status: asset.status
      }));

      setMediaAssets(formattedAssets);
    } catch (error) {
      console.error('Error fetching media assets:', error);
      toast.error('Failed to load media assets');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (asset: MediaAsset) => {
    setPreviewAsset(asset);
    setShowPreview(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Media Asset</h2>
          <Button
            variant="light"
            size="sm"
            onClick={onClose}
            icon={<X size={16} />}
          >
            Close
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading media assets...</p>
          </div>
        ) : mediaAssets.length === 0 ? (
          <div className="text-center py-8">
            <Film size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No available media assets found for this brand</p>
            <p className="text-sm text-gray-400 mt-2">
              Upload media assets in the Media section
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mediaAssets.map(asset => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {asset.friendlyName}
                    </h3>
                    {asset.status === 'pending' && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        Pending Approval
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-500 space-y-1">
                    <div>
                      <span className="capitalize">{asset.type}</span> • Duration: {asset.duration}
                    </div>
                    <div className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded inline-block">
                      ISCI: {asset.isciCode}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePreview(asset)}
                    variant="light"
                    icon={<Play size={16} />}
                  >
                    Preview
                  </Button>
                  <Button
                    onClick={() => onSelect(asset)}
                    variant="light"
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && previewAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {previewAsset.friendlyName}
                </h3>
                <Button
                  variant="light"
                  size="sm"
                  icon={<X size={16} />}
                  onClick={() => setShowPreview(false)}
                >
                  Close
                </Button>
              </div>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {previewAsset.type === 'video' ? (
                  <video
                    className="w-full h-full"
                    controls
                    src={previewAsset.url}
                    autoPlay
                  />
                ) : (
                  <audio
                    className="w-full mt-20"
                    controls
                    src={previewAsset.url}
                    autoPlay
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaSelectionDialog;