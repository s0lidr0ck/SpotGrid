import React from 'react';
import MediaUpload from '../components/media/MediaUpload';

const MediaView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Media Assets</h1>
        <p className="text-gray-600 mt-1">
          Upload and manage your video and audio files
        </p>
      </div>

      <MediaUpload />
    </div>
  );
};

export default MediaView;