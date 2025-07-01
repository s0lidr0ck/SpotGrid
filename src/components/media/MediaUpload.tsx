import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, FileVideo, CheckCircle, Clock, X, Eye, Trash2, Plus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { apiClient } from '../../utils/api-client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface MediaAsset {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  brand_id: string;
  brand_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

interface UploadProgress {
  stage: 'uploading' | 'processing' | 'complete';
  progress: number;
  message: string;
}

const MediaUpload = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'traffic_admin';
  
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    filename: '',
    brand_id: '',
    file_size: 0,
    mime_type: '',
    file: null as File | null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch media assets and brands in parallel
      const [mediaResponse, brandsResponse] = await Promise.all([
        apiClient.getMediaAssets(),
        apiClient.getBrands()
      ]);

      if (mediaResponse.error) {
        throw new Error(mediaResponse.error.message);
      }
      if (brandsResponse.error) {
        throw new Error(brandsResponse.error.message);
      }

      setMediaAssets(mediaResponse.data || []);
      setBrands(brandsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load media assets');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData(prev => ({
        ...prev,
        file: file,
        filename: file.name,
        file_size: file.size,
        mime_type: file.type
      }));
    }
  };

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadData.file || !uploadData.brand_id) {
      toast.error('File and brand are required');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress({
        stage: 'uploading',
        progress: 0,
        message: 'Starting upload...'
      });
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('brand_id', uploadData.brand_id);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      let uploadId: string | null = null;
      let eventSource: EventSource | null = null;
      
      return new Promise((resolve, reject) => {
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const uploadPercent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress({
              stage: 'uploading',
              progress: uploadPercent,
              message: `Uploading file... ${uploadPercent}%`
            });
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status === 200 || xhr.status === 201) {
            const result = JSON.parse(xhr.responseText);
            
            if (result.error) {
              throw new Error(result.error.message);
            }

            uploadId = result.data.uploadId;

            // Check if it's a video file for preview generation
            const isVideo = uploadData.file!.type.startsWith('video/');
            
            if (isVideo && uploadId) {
              // Connect to Server-Sent Events for real-time progress
              const token = localStorage.getItem('auth_token');
              eventSource = new EventSource(`http://localhost:3001/api/media/upload-progress/${uploadId}?token=${token}`);
              
              eventSource.onmessage = (event) => {
                try {
                  const progressData = JSON.parse(event.data);
                  console.log('Progress update:', progressData);
                  
                  setUploadProgress({
                    stage: progressData.stage === 'preview' || progressData.stage === 'thumbnail' ? 'processing' : progressData.stage,
                    progress: progressData.progress,
                    message: progressData.message
                  });
                  
                  // Close connection when complete
                  if (progressData.stage === 'complete' || progressData.stage === 'error') {
                    eventSource?.close();
                    
                    if (progressData.stage === 'complete') {
                      setTimeout(() => {
                        setUploadProgress(null);
                      }, 2000);
                    }
                  }
                } catch (parseError) {
                  console.error('Error parsing progress data:', parseError);
                }
              };
              
              eventSource.onerror = (error) => {
                console.error('SSE error:', error);
                eventSource?.close();
              };
            } else {
              // Non-video files complete immediately
              setUploadProgress({
                stage: 'complete',
                progress: 100,
                message: 'Upload complete!'
              });
              
              setTimeout(() => {
                setUploadProgress(null);
              }, 2000);
            }

            setMediaAssets(prev => [result.data, ...prev]);
            setShowUploadForm(false);
            setUploadData({ filename: '', brand_id: '', file_size: 0, mime_type: '', file: null });
            toast.success('Media asset uploaded successfully');
            resolve(result);
          } else {
            const errorResult = JSON.parse(xhr.responseText);
            reject(new Error(errorResult.error?.message || 'Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.open('POST', 'http://localhost:3001/api/media/upload');
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('auth_token')}`);
        xhr.send(formData);
      });

    } catch (error) {
      console.error('Error uploading media asset:', error);
      toast.error('Failed to upload media asset');
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  };

  const handleApproveMedia = async (id: string) => {
    try {
      const { data, error } = await apiClient.updateMediaAsset(id, { status: 'approved' });
      
      if (error) {
        throw new Error(error.message);
      }

      setMediaAssets(prev => prev.map(asset => 
        asset.id === id ? { ...asset, status: 'approved' } : asset
      ));
      toast.success('Media asset approved');
    } catch (error) {
      console.error('Error approving media:', error);
      toast.error('Failed to approve media asset');
    }
  };

  const handleRejectMedia = async (id: string) => {
    try {
      const { data, error } = await apiClient.updateMediaAsset(id, { status: 'rejected' });
      
      if (error) {
        throw new Error(error.message);
      }

      setMediaAssets(prev => prev.map(asset => 
        asset.id === id ? { ...asset, status: 'rejected' } : asset
      ));
      toast.success('Media asset rejected');
    } catch (error) {
      console.error('Error rejecting media:', error);
      toast.error('Failed to reject media asset');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      const { error } = await apiClient.deleteMediaAsset(id);
      
      if (error) {
        throw new Error(error.message);
      }

      setMediaAssets(prev => prev.filter(asset => asset.id !== id));
      toast.success('Media asset deleted');
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Failed to delete media asset');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const ProgressBar = ({ progress, stage, message }: UploadProgress) => (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-900">{message}</span>
        <span className="text-sm text-blue-700">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            stage === 'complete' ? 'bg-green-500' : 'bg-blue-600'
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-2 text-xs text-blue-600">
        {stage === 'uploading' && 'Uploading file to server...'}
        {stage === 'processing' && 'Generating preview and thumbnail...'}
        {stage === 'complete' && 'Processing complete!'}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading media assets...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Upload className="mr-2" size={20} />
              Media Assets
            </h3>
            <Button
              onClick={() => setShowUploadForm(!showUploadForm)}
              icon={<Plus size={16} />}
            >
              Add Media Asset
            </Button>
          </div>
          
          {showUploadForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Upload New Media Asset</h4>
              <form onSubmit={handleCreateMedia} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Media File
                    </label>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="video/*,audio/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {uploadData.file && (
                      <p className="text-sm text-gray-500 mt-1">
                        Selected: {uploadData.file.name} ({formatFileSize(uploadData.file.size)})
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <select
                      value={uploadData.brand_id}
                      onChange={(e) => setUploadData(prev => ({ ...prev, brand_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.common_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => setShowUploadForm(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    isLoading={uploading}
                    disabled={!uploadData.file || !uploadData.brand_id}
                  >
                    {uploading ? 'Uploading...' : 'Upload Media'}
                  </Button>
                </div>
                {uploadProgress && (
                  <ProgressBar 
                    progress={uploadProgress.progress} 
                    stage={uploadProgress.stage} 
                    message={uploadProgress.message} 
                  />
                )}
              </form>
            </div>
          )}

          {mediaAssets.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <FileVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Media Assets
              </h4>
              <p className="text-gray-600 text-sm">
                Get started by adding your first media asset.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Media
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mediaAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileVideo className="h-8 w-8 text-blue-600 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {asset.filename}
                            </div>
                            <div className="text-sm text-gray-500">
                              {asset.mime_type} • {formatFileSize(asset.file_size)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{asset.brand_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                          {getStatusIcon(asset.status)}
                          <span className="ml-1 capitalize">{asset.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => handlePreview(asset)}
                            icon={<Eye size={14} />}
                          >
                            Preview
                          </Button>
                          {isAdmin && asset.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleApproveMedia(asset.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleRejectMedia(asset.id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {(isAdmin || asset.status === 'pending') && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteMedia(asset.id)}
                              icon={<Trash2 size={14} />}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
      {uploadProgress && (
        <ProgressBar progress={uploadProgress.progress} stage={uploadProgress.stage} message={uploadProgress.message} />
      )}
      
      {/* Media Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
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

export default MediaUpload;