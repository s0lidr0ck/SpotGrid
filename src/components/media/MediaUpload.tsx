import React from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';

const MediaUpload = () => {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Upload className="mr-2" size={20} />
          Media Upload
        </h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-blue-800 font-medium mb-1">
                Media System Migration
              </h4>
              <p className="text-blue-700 text-sm">
                Media upload and management features are being migrated to provide 
                better performance and storage options. This feature will be available soon.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Upload Temporarily Disabled
          </h4>
          <p className="text-gray-600 text-sm">
            Media upload functionality is being updated. 
            Please contact support for assistance with urgent uploads.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default MediaUpload;