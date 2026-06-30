'use client';

import { useCallback } from 'react';
import { Upload, File, Image, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { formatFileSize, getFileExtension, isImageFile } from '../utils/file-validation';
import { cn } from '@/src/utils';
import type { FileUploadState, FileValidationOptions } from '../types/documents.types';

type Props = {
  uploadState: FileUploadState;
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  onClear: () => void;
  onReset: () => void;
  validationOptions?: FileValidationOptions;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
};

export function FileUploadDropzone({
  uploadState,
  onFileSelect,
  onUpload,
  onClear,
  onReset,
  validationOptions,
  disabled = false,
  className,
  label = 'Upload Document',
  description = 'Drag and drop a file here, or click to select',
}: Props) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [onFileSelect]);

  const getAcceptAttribute = () => {
    if (!validationOptions?.acceptedTypes) return undefined;
    
    const extensions = validationOptions.acceptedTypes.flatMap(t => {
      if (t === 'application/pdf') return ['.pdf'];
      if (t === 'application/msword') return ['.doc'];
      if (t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return ['.docx'];
      if (t === 'image/jpeg') return ['.jpg', '.jpeg'];
      if (t === 'image/png') return ['.png'];
      if (t === 'image/webp') return ['.webp'];
      if (t === 'image/heic') return ['.heic'];
      return [];
    });
    
    // Combine MIME types with specific extensions for OS file pickers
    return [...validationOptions.acceptedTypes, ...extensions].join(',');
  };

  const getMaxSizeText = () => {
    if (!validationOptions?.maxSize) return '';
    const maxSizeMB = Math.round(validationOptions.maxSize / (1024 * 1024));
    return `Max size: ${maxSizeMB}MB`;
  };

  const renderFilePreview = () => {
    if (!uploadState.file) return null;

    const isImage = isImageFile(uploadState.file);
    const FileIcon = isImage ? Image : File;

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
        {uploadState.preview ? (
          <img
            src={uploadState.preview}
            alt="Preview"
            className="w-12 h-12 object-cover rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <FileIcon className="w-6 h-6 text-gray-500" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {uploadState.file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(uploadState.file.size)} • {getFileExtension(uploadState.file.name)}
          </p>
        </div>

        {uploadState.status !== 'uploading' && (
          <button
            onClick={onClear}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    );
  };

  const renderUploadProgress = () => {
    if (uploadState.status !== 'uploading') return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Uploading...</span>
          <span className="text-gray-900 font-medium">{uploadState.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#920793] h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadState.progress}%` }}
          />
        </div>
      </div>
    );
  };

  const renderStatusMessage = () => {
    if (uploadState.status === 'success') {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Upload successful</span>
        </div>
      );
    }

    if (uploadState.status === 'error' && uploadState.error) {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{uploadState.error}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload area */}
      {!uploadState.file && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-2xl p-8 text-center transition-colors',
            disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-[#920793] hover:bg-purple-50 cursor-pointer'
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              disabled ? 'bg-gray-200' : 'bg-purple-100'
            )}>
              <Upload className={cn('w-6 h-6', disabled ? 'text-gray-400' : 'text-[#920793]')} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
              <p className="text-gray-500 mt-1">{description}</p>
              {getMaxSizeText() && (
                <p className="text-xs text-gray-400 mt-1">{getMaxSizeText()}</p>
              )}
            </div>

            <div className="flex gap-3">
              <div>
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept={getAcceptAttribute()}
                  disabled={disabled}
                  className="hidden"
                  id="file-upload"
                />
                
                <label
                  htmlFor="file-upload"
                  className={cn(
                    'inline-block px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center',
                    disabled
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#920793] text-white hover:opacity-90 cursor-pointer'
                  )}
                >
                  Choose File
                </label>
              </div>

              {(!getAcceptAttribute() || getAcceptAttribute()?.includes('image')) && (
                <div>
                  <input
                    type="file"
                    onChange={handleFileInput}
                    accept="image/*"
                    
                    disabled={disabled}
                    className="hidden"
                    id="camera-upload"
                  />
                  <label
                    htmlFor="camera-upload"
                    className={cn(
                      'inline-block px-4 py-2 rounded-lg text-sm font-medium transition-colors border text-center',
                      disabled
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-[#920793] text-[#920793] hover:bg-purple-50 cursor-pointer'
                    )}
                  >
                    Take Photo
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File preview */}
      {uploadState.file && renderFilePreview()}

      {/* Upload progress */}
      {renderUploadProgress()}

      {/* Status message */}
      {renderStatusMessage()}

      {/* Action buttons */}
      {uploadState.file && uploadState.status === 'idle' && (
        <div className="flex gap-2">
          <Button
            onClick={onUpload}
            disabled={disabled}
            className="flex-1"
          >
            Upload Document
          </Button>
          <Button
            onClick={onClear}
            variant="outline"
            disabled={disabled}
          >
            Cancel
          </Button>
        </div>
      )}

      {uploadState.status === 'success' && (
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full"
        >
          Upload Another File
        </Button>
      )}

      {uploadState.status === 'error' && (
        <div className="flex gap-2">
          <Button
            onClick={onReset}
            variant="outline"
            className="flex-1"
          >
            Try Again
          </Button>
          <Button
            onClick={onClear}
            variant="outline"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}