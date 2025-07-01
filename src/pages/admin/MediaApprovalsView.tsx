import React, { useState, useEffect } from 'react';
import { Video, CheckCircle, Clock, X, Eye, Trash2, FileVideo } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { apiClient } from '../../utils/api-client';
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
  uploaded_by_email?: string;
  created_at: string;
  updated_at: string;
}

const MediaApprovalsView = () => {
  const { user, isAuthenticated } = useAuth();
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'traffic_admin') {
    return <Navigate to="/dashboard" />;
  }

  useEffect(() => {
    fetchMediaAssets();
  }, [filter]);

  const fetchMediaAssets = async () => {
    try {
      setLoading(true);
      
      const params = filter === 'all' ? {} : { status: filter };
      const { data, error } = await apiClient.getMediaAssets(params);

      if (error) {
        throw new Error(error.message);
      }

      setMediaAssets(data || []);
    } catch (error) {
      console.error('Error fetching media assets:', error);
      toast.error('Failed to load media assets');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await apiClient.updateMediaAsset(id, { status: 'approved' });
      
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

  const handleReject = async (id: string) => {
    try {
      const { error } = await apiClient.updateMediaAsset(id, { status: 'rejected' });
      
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

  const handleDelete = async (id: string) => {
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

  const filteredAssets = mediaAssets;
  const pendingCount = mediaAssets.filter(asset => asset.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Video className="mr-3" size={28} />
            Media Approvals
            {pendingCount > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve media assets
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'pending', label: 'Pending', count: mediaAssets.filter(a => a.status === 'pending').length },
            { key: 'approved', label: 'Approved', count: mediaAssets.filter(a => a.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: mediaAssets.filter(a => a.status === 'rejected').length },
            { key: 'all', label: 'All', count: mediaAssets.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      <Card>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading media assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8">
              <FileVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Media Assets
              </h3>
              <p className="text-gray-600">
                {filter === 'pending' ? 'No pending media assets to review.' : 
                 filter === 'approved' ? 'No approved media assets.' :
                 filter === 'rejected' ? 'No rejected media assets.' :
                 'No media assets found.'}
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
                      Uploaded By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
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
                        {asset.uploaded_by_email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {asset.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleApprove(asset.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleReject(asset.id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(asset.id)}
                            icon={<Trash2 size={14} />}
                          >
                            Delete
                          </Button>
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
    </div>
  );
};

export default MediaApprovalsView;