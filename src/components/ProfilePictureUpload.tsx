// components/ProfilePictureUpload.tsx
import React, { useState, useRef } from 'react';
import { User, Camera, Upload, X, Loader, Check } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useUploadProfilePictureMutation, 
  useRemoveProfilePictureMutation 
} from '../features/api/UserApi';

interface ProfilePictureUploadProps {
  user: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture?: string;
  };
  onPictureUpdate: (newPictureUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ 
  user, 
  onPictureUpdate,
  size = 'lg'
}) => {
  const [uploadProfilePicture, { isLoading: isUploading }] = useUploadProfilePictureMutation();
  const [removeProfilePicture, { isLoading: isRemoving }] = useRemoveProfilePictureMutation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizes = {
    sm: { container: 'w-16 h-16', icon: 24, text: 'text-xs' },
    md: { container: 'w-20 h-20', icon: 28, text: 'text-sm' },
    lg: { container: 'w-24 h-24', icon: 40, text: 'text-base' }
  };

  const { container, icon, text } = sizes[size];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Only JPG, PNG, WEBP, and GIF are allowed.'
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 5MB.'
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const response = await uploadProfilePicture(formData).unwrap();
      
      toast.success('Profile picture updated!', {
        description: 'Your profile picture has been updated successfully.'
      });
      
      onPictureUpdate(response.profile_picture);
      setPreviewUrl(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: error?.data?.error || error?.data?.message || 'Please try again.'
      });
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;

    try {
      const response = await removeProfilePicture().unwrap();
      
      toast.success('Profile picture removed', {
        description: 'Your profile picture has been removed successfully.'
      });
      
      onPictureUpdate(null);
    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error('Remove failed', {
        description: error?.data?.error || error?.data?.message || 'Please try again.'
      });
    }
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="relative group">
        {/* Profile Picture Container */}
        <div className={`${container} rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-blue-600 to-blue-800 relative`}>
          {user.profile_picture ? (
            <img 
              src={user.profile_picture} 
              alt={`${user.first_name} ${user.last_name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={icon} className="text-white" />
            </div>
          )}

          {/* Upload Overlay */}
          <label 
            htmlFor={`profile-picture-input-${user.user_id}`}
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-2"
          >
            <Camera className="text-white mb-1" size={20} />
            <span className="text-white text-xs text-center">Click to upload</span>
          </label>

          {/* Loading Overlay */}
          {(isUploading || isRemoving) && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Loader className="text-white animate-spin" size={24} />
            </div>
          )}

          {/* Remove Button (when has picture and not loading) */}
          {user.profile_picture && !previewUrl && !isUploading && !isRemoving && (
            <button
              onClick={handleRemove}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-110"
              title="Remove profile picture"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          id={`profile-picture-input-${user.user_id}`}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading || isRemoving}
        />
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={handleCancelPreview} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Preview New Profile Picture</h3>
                <button
                  onClick={handleCancelPreview}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6 flex justify-center">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelPreview}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors disabled:opacity-50"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Use This Photo
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Recommended: Square image, at least 400x400 pixels
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePictureUpload;