// components/admin/VehicleImageUpload.tsx
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader, Check, AlertCircle, Eye, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface VehicleImageUploadProps {
  onImageSelect: (file: File | null) => void;
  initialImageUrl?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

const VehicleImageUpload: React.FC<VehicleImageUploadProps> = ({
  onImageSelect,
  initialImageUrl,
  disabled = false,
  label = 'Vehicle Image',
  required = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Only JPG, PNG, WEBP, and GIF images are allowed.'
      });
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large', {
        description: 'Maximum file size is 10MB.'
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Pass file to parent
    onImageSelect(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled}
            className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>

      {/* Upload Area */}
      <div
        onClick={triggerFileInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200 hover:border-blue-500 hover:bg-blue-50
          ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300'}
          ${previewUrl ? 'border-solid' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {previewUrl ? (
          <div className="relative">
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
              <img
                src={previewUrl}
                alt="Vehicle preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 rounded-xl">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                <Camera className="text-blue-600 mx-auto mb-2" size={24} />
                <span className="text-sm font-medium text-gray-700">Change Image</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                {isLoading ? (
                  <Loader className="text-blue-600 animate-spin" size={32} />
                ) : (
                  <Upload className="text-blue-600" size={32} />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900">
                  Drag & drop or click to upload
                </p>
                <p className="text-sm text-gray-600">
                  Upload a high-quality image of the vehicle
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">Recommended</p>
                <p className="text-gray-600">1200×800 px</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">Max size</p>
                <p className="text-gray-600">10 MB</p>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                disabled={disabled}
              >
                Choose File
              </button>
            </div>
          </>
        )}
      </div>

      {/* Help Text */}
      <div className="flex items-start gap-2 text-sm">
        <AlertCircle className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
        <p className="text-gray-600">
          Use clear, well-lit photos showing the entire vehicle. Image will be automatically optimized.
        </p>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <img
              src={previewUrl}
              alt="Full preview"
              className="w-full h-full object-contain rounded-xl"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewUrl(null);
              }}
              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleImageUpload;