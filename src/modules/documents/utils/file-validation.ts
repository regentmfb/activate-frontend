import type { FileValidationOptions, FileValidationResult, AcceptedFileTypes } from '../types/documents.types';

// ── File type configurations ──────────────────────────────────────────────────

export const ACCEPTED_FILE_TYPES: AcceptedFileTypes = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DEFAULT_MAX_FILES = 1;

// ── File validation functions ─────────────────────────────────────────────────

export function validateFile(file: File, options: FileValidationOptions = {}): FileValidationResult {
  const {
    maxSize = DEFAULT_MAX_FILE_SIZE,
    acceptedTypes = ACCEPTED_FILE_TYPES.all,
  } = options;

  const errors: string[] = [];

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  // Check file type
  const extension = getFileExtension(file.name).toLowerCase();
  
  // Create a list of allowed extensions based on acceptedTypes
  const allowedExtensions: string[] = [];
  acceptedTypes.forEach(t => {
    if (t.includes('pdf')) allowedExtensions.push('pdf');
    if (t.includes('msword') || t.includes('wordprocessingml')) {
      allowedExtensions.push('doc', 'docx');
    }
    if (t.includes('image/jpeg')) allowedExtensions.push('jpg', 'jpeg');
    if (t.includes('image/png')) allowedExtensions.push('png');
    if (t.includes('image/webp')) allowedExtensions.push('webp');
    if (t.includes('image/heic')) allowedExtensions.push('heic');
  });

  const isValidType = acceptedTypes.includes(file.type) || allowedExtensions.includes(extension);

  if (!isValidType) {
    const acceptedExtensions = acceptedTypes
      .map(type => {
        switch (type) {
          case 'image/jpeg':
          case 'image/jpg':
            return 'JPG';
          case 'image/png':
            return 'PNG';
          case 'image/webp':
            return 'WebP';
          case 'image/heic':
            return 'HEIC';
          case 'application/pdf':
            return 'PDF';
          case 'application/msword':
            return 'DOC';
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'DOCX';
          default:
            return type;
        }
      })
      .join(', ');
    errors.push(`File type not supported. Accepted formats: ${acceptedExtensions}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateFiles(files: File[], options: FileValidationOptions = {}): FileValidationResult {
  const { maxFiles = DEFAULT_MAX_FILES } = options;
  const errors: string[] = [];

  // Check number of files
  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`);
  }

  // Validate each file
  files.forEach((file, index) => {
    const fileValidation = validateFile(file, options);
    if (!fileValidation.isValid) {
      fileValidation.errors.forEach(error => {
        errors.push(`File ${index + 1}: ${error}`);
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ── File utility functions ────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toUpperCase() || '';
}

export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf';
}

export function isDocumentFile(file: File): boolean {
  return ACCEPTED_FILE_TYPES.documents.includes(file.type);
}