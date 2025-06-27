import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Play, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { StatusBadge } from '../ui/StatusBadge';
import toast from 'react-hot-toast';

interface Brand {
  id: string;
  common_name: string;
}

interface MediaFile {
  id: string;
  isciCode: string;
  friendlyName: string;
  originalFilename: string;
  filesize: number;
  fileTimestamp: string;
  type: 'video' | 'audio';
  url: string;
  broadcastUrl: string | null;
  brandName: string;
  duration: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface MediaUploadProps {
  selectedBrandId?: string;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ selectedBrandId }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isciCode, setIsciCode] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Refs for media duration calculation
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    if (selectedBrandId) {
      setSelectedBrand(selectedBrandId);
    }
    fetchBrands();
    fetchMediaFiles();
  }, [selectedBrandId]);

  // Handle duration calculation when file is selected
  useEffect(() => {
    if (selectedFile && mediaRef.current) {
      const url = URL.createObjectURL(selectedFile);
      mediaRef.current.src = url;

      const handleLoadedMetadata = () => {
        if (mediaRef.current) {
          setDuration(mediaRef.current.duration);
          URL.revokeObjectURL(url);
        }
      };

      mediaRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        if (mediaRef.current) {
          mediaRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
        URL.revokeObjectURL(url);
      };
    }
  }, [selectedFile]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id, common_name')
        .order('common_name');

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    }
  };

  const fetchMediaFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .select(`
          *,
          brands (
            common_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedFiles = data.map(file => ({
        id: file.id,
        isciCode: file.isci_code,
        friendlyName: file.friendly_name,
        originalFilename: file.original_filename,
        filesize: file.filesize,
        fileTimestamp: new Date(file.file_timestamp).toLocaleString(),
        type: file.type,
        url: file.url,
        broadcastUrl: file.broadcast_url,
        brandName: file.brands.common_name,
        duration: file.duration,
        status: file.status,
        createdAt: new Date(file.created_at).toLocaleDateString()
      }));

      setFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching media files:', error);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!selectedBrand) {
      toast.error('Please select a brand');
      return false;
    }
    if (!isciCode) {
      toast.error('Please enter an ISCI code');
      return false;
    }
    if (!friendlyName) {
      toast.error('Please enter a friendly name');
      return false;
    }
    if (!selectedFile) {
      toast.error('Please select a file');
      return false;
    }
    if (!duration) {
      toast.error('Unable to determine media duration');
      return false;
    }
    return true;
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      toast.error('Only video and audio files are allowed');
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB');
      return;
    }

    setSelectedFile(file);
    // Auto-populate friendly name from file name
    if (!friendlyName) {
      setFriendlyName(file.name.split('.')[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!validateForm() || !selectedFile) return;

    try {
      setUploading(true);

      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${isciCode}.${fileExt}`;
      const filePath = `${selectedBrand}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('media')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Create media asset record with pending status
      const { error: dbError } = await supabase
        .from('media_assets')
        .insert({
          brand_id: selectedBrand,
          isci_code: isciCode,
          friendly_name: friendlyName,
          original_filename: selectedFile.name,
          filesize: selectedFile.size,
          file_timestamp: selectedFile.lastModified ? new Date(selectedFile.lastModified).toISOString() : new Date().toISOString(),
          name: fileName,
          type: selectedFile.type.startsWith('video/') ? 'video' : 'audio',
          duration: `${Math.floor(duration / 3600)}:${Math.floor((duration % 3600) / 60)}:${Math.floor(duration % 60)}`,
          url: publicUrl,
          status: 'pending' // Set to pending for admin approval
        });

      if (dbError) throw dbError;

      // Reset form
      setIsciCode('');
      setFriendlyName('');
      setSelectedFile(null);
      setDuration(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('File uploaded successfully and is pending approval');
      fetchMediaFiles(); // Refresh the list
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFiles(files.filter(file => file.id !== id));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
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

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setShowPreview(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-100';
      case 'rejected':
        return 'text-red-700 bg-red-100';
      case 'pending':
      default:
        return 'text-yellow-700 bg-yellow-100';
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Media Assets</h3>
          <p className="text-sm text-gray-500">Upload and manage your media files</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Select
            label="Brand"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            options={[
              { value: '', label: 'Select Brand' },
              ...brands.map(brand => ({
                value: brand.id,
                label: brand.common_name
              }))
            ]}
          />
          <Input
            label="ISCI Code"
            value={isciCode}
            onChange={(e) => setIsciCode(e.target.value)}
            placeholder="Enter ISCI code"
          />
          <Input
            label="Friendly Name"
            value={friendlyName}
            onChange={(e) => setFriendlyName(e.target.value)}
            placeholder="Enter friendly name"
          />
        </div>

        {/* Hidden media element for duration calculation */}
        {selectedFile?.type.startsWith('video/') ? (
          <video ref={mediaRef as React.RefObject<HTMLVideoElement>} className="hidden" />
        ) : (
          <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} className="hidden" />
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {selectedFile && (
              <>
                <p className="text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
                {duration > 0 && (
                  <p className="text-sm text-gray-600">
                    Duration: {formatDuration(duration)}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="video/*,audio/*"
              onChange={handleFileChange}
              disabled={!selectedBrand || uploading}
            />
            <Button
              onClick={handleFileSelect}
              variant="light"
              disabled={!selectedBrand || uploading}
            >
              Select File
            </Button>
            <Button
              onClick={handleFileUpload}
              icon={<Upload size={16} />}
              isLoading={uploading}
              disabled={!selectedFile || !duration}
            >
              Upload Media
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading media files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">No media files uploaded yet</p>
          </div>
        ) : (
          files.map(file => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                  {file.type === 'video' ? (
                    <video className="h-8 w-8 object-cover rounded\" src={file.url} />
                  ) : (
                    <audio className="h-8 w-8\" controls src={file.url} />
                  )}
                </div>
                <div className="ml-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{file.friendlyName}</p>
                    <span className="text-sm text-gray-500">({file.isciCode})</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(file.status)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(file.status)}`}>
                        {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {file.brandName} • {formatFileSize(file.filesize)} • {file.duration} • {file.fileTimestamp}
                  </p>
                  <p className="text-xs text-gray-400">{file.originalFilename}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="light"
                  size="sm"
                  icon={<Play size={16} />}
                  onClick={() => handlePreview(file.url)}
                >
                  Preview
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<X size={16} />}
                  onClick={() => handleDelete(file.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Media Preview</h3>
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
              {previewUrl.includes('.mp4') ? (
                <video
                  className="w-full h-full"
                  controls
                  src={previewUrl}
                  autoPlay
                />
              ) : (
                <audio
                  className="w-full mt-20"
                  controls
                  src={previewUrl}
                  autoPlay
                />
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MediaUpload;