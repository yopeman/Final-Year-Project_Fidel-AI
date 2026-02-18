import { getMainDefinition } from '@apollo/client/utilities';
import { BASE_URL } from '../lib/apollo-client';

// Function to upload community attachments using REST API
export const uploadCommunityAttachments = async (communityId, files) => {
  try {
    const formData = new FormData();
    
    // Add files to FormData
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${BASE_URL}/api/upload/community/${communityId}/files`, {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header when using FormData, let the browser set it with the boundary
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading attachments:', error);
    throw error;
  }
};

// Function to check if a GraphQL operation is a subscription
export const isSubscriptionOperation = (operation) => {
  const definition = getMainDefinition(operation.query);
  return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
};

// Function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Function to get file icon based on extension
export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const iconMap = {
    pdf: 'file-text',
    doc: 'file-text',
    docx: 'file-text',
    txt: 'file-text',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    mp4: 'video',
    avi: 'video',
    mov: 'video',
    mp3: 'music',
    wav: 'music',
    zip: 'archive',
    rar: 'archive',
    default: 'file'
  };
  
  return iconMap[extension] || iconMap.default;
};

// Function to validate file for upload
export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'video/mp4',
    'audio/mpeg',
    'audio/wav'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' };
  }

  return { valid: true };
};