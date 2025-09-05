import { jwtDecode } from 'jwt-decode';
import { API } from '../../configs/env';

export interface LogError {
  (error: unknown): void;
}

export const logError: LogError = error => {
  console.error('Error:', error);
};

export const decodeToken = (token: string | null = null) => {
  if (!token) {
    return null;
  }
  const decoded = jwtDecode(token);
  return decoded;
};

export const isTokenActive = (token: string | null = null): boolean => {
  if (!token) {
    return false;
  }
  try {
    const decoded = jwtDecode(token);
    return Boolean(decoded?.exp && decoded.exp > Date.now() / 1000);
  } catch {
    return false;
  }
};

export const setLocalStorage = (key: string, value: unknown) => {
  return localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalStorage = (key: string) => {
  const item = localStorage.getItem(key);
  return item && item !== 'null' && item !== 'undefined'
    ? JSON.parse(item)
    : null;
};

export const removeLocalStorage = (key: string) => {
  localStorage.removeItem(key);
};

export const capitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Utility function to generate a random password
export const generateRandomPassword = () => {
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
  const allChars = upperCase + lowerCase + numbers + specialChars;

  interface GetRandomChar {
    (chars: string): string;
  }

  const getRandomChar: GetRandomChar = (chars: string): string =>
    chars[Math.floor(Math.random() * chars.length)];

  // Ensure the password includes at least one of each required character type
  const password = [
    getRandomChar(upperCase),
    getRandomChar(lowerCase),
    getRandomChar(numbers),
    getRandomChar(specialChars),
  ];

  // Fill the rest of the password with random characters
  for (let i = password.length; i < 8; i++) {
    password.push(getRandomChar(allChars));
  }

  // Shuffle the password to randomize character order
  return password.sort(() => Math.random() - 0.5).join('');
};

export const apiAsyncHandler = async (
  handleTry: () => Promise<unknown>,
  handleCatch?: (error: unknown) => unknown,
  handleFinally?: () => void
) => {
  try {
    const response = await handleTry();
    return response;
  } catch (error) {
    logError(error);
    if (handleCatch && typeof handleCatch === 'function') {
      return handleCatch(error);
    }
    return null;
  } finally {
    if (handleFinally && typeof handleFinally === 'function') {
      handleFinally();
    }
  }
};

export const errorHandler = (
  handleTry: () => unknown,
  handleCatch?: (error: unknown) => unknown,
  handleFinally?: () => void
) => {
  try {
    const response = handleTry();
    return response;
  } catch (error) {
    logError(error);
    if (handleCatch && typeof handleCatch === 'function') {
      return handleCatch(error);
    }
    return null;
  } finally {
    if (handleFinally && typeof handleFinally === 'function') {
      handleFinally();
    }
  }
};

export const getTotalPages = (totalData: number, limit: number) => {
  if (limit <= 0) {
    return 1;
  }

  return Math.ceil(totalData / limit);
};

export const formatListWithAnd = (arr: string[]) => {
  if (!Array.isArray(arr)) {
    return '';
  }

  const len = arr.length;

  if (len === 0) {
    return '';
  }
  if (len === 1) {
    return arr[0];
  }
  if (len === 2) {
    return `${arr[0]} and ${arr[1]}`;
  }

  // For 3 or more items
  const allButLast = arr.slice(0, -1).join(', ');
  const last = arr[len - 1];
  return `${allButLast} and ${last}`;
};

export const createFileUrl = (url = ''): string => {
  if (!url) {
    return '';
  }

  const absoluteUrlRegex = /^(http|https):\/\//;

  if (absoluteUrlRegex.test(url)) {
    return url;
  }

  return `${API.URL}${url}`;
};

export const formatFileSize = (bytes?: string) => {
  if (!bytes) {
    return '–';
  }
  const size = parseInt(bytes, 10);
  if (isNaN(size)) {
    return '–';
  }

  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const formatDate = (
  dateString: string,
  includeTime: boolean = false
) => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }

  return date.toLocaleDateString('en-US', options);
};

export const formatTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return '--';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const formatDateAndTime = (
  dateString: string,
  includeTime: boolean = true
): string => {
  const date = new Date(dateString);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let formattedDate = `${month} ${day}, ${year}`;

  if (includeTime) {
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutes = date.getMinutes().toString().padStart(2, '0');

    formattedDate += ` ${hours}:${minutes} ${ampm}`;
  }

  return formattedDate;
};

export const getMimeTypeFromExtension = (extension?: string) => {
  if (!extension) {
    return undefined;
  }

  const extensionMap: Record<string, string> = {
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',

    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',

    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',

    // Audio/Video
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    mov: 'video/quicktime',

    // Code
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
  };

  return extensionMap[extension];
};

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedValue = (bytes / Math.pow(k, i)).toFixed(2);
  return formattedValue + ' ' + sizes[i];
  // return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateBreadcrumbName = (
  name: string,
  maxLength: number = 20
) => {
  if (name.length <= maxLength) {
    return name;
  }
  return name.slice(0, maxLength - 3) + '...';
};

export const downloadFiles = (data: any, res: any) => {
  const blob = new Blob([data]);
  const contentDisposition = res?.payload?.headers?.['content-disposition'];
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || `download-${Date.now()}.zip`;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadFilesEnhanced = async (
  selectedIds: string[],
  downloadFile: (ids: string[]) => Promise<void>
) => {
  try {
    await downloadFile(selectedIds);
  } catch (error: any) {
    console.error('Download failed:', error);
    throw error;
  }
};

export const getVideoMimeType = (ext: string) => {
  const map: Record<string, string> = {
    mp4: 'video/mp4',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    webm: 'video/webm',
    m4v: 'video/x-m4v',
  };
  return map?.[ext?.toLowerCase()] || 'video/mp4';
};

/**
 * Returns a human-readable file type label from mime_type
 */
export const getFileMimeTypeLabel = (mime_type: string): string => {
  if (!mime_type) return 'Unknown';

  switch (mime_type) {
    // -------------------------
    // Google Drive MIME types
    // -------------------------
    case 'application/vnd.google-apps.folder':
      return 'Google Folder';
    case 'application/vnd.google-apps.document':
      return 'Google Document';
    case 'application/vnd.google-apps.spreadsheet':
      return 'Google Spreadsheet';
    case 'application/vnd.google-apps.presentation':
      return 'Google Presentation';
    case 'application/vnd.google-apps.form':
      return 'Google Form';
    case 'application/vnd.google-apps.drawing':
      return 'Google Drawing';
    case 'application/vnd.google-apps.script':
      return 'Google Script';
    case 'application/vnd.google-apps.site':
      return 'Google Site';
    case 'application/vnd.google-apps.map':
      return 'Google Map';
    case 'application/vnd.google-apps.photo':
      return 'Google Photo';
    case 'application/vnd.google-apps.audio':
      return 'Google Audio';
    case 'application/vnd.google-apps.video':
      return 'Google Video';
    case 'application/vnd.google-apps.file':
      return 'Google File';

    // -------------------------
    // Dropbox common MIME types
    // -------------------------
    case 'application/vnd.dropbox.folder':
      return 'Dropbox Folder';
    case 'application/vnd.dropbox-paper':
      return 'Dropbox Paper Doc';

    // -------------------------
    // OneDrive MIME types
    // -------------------------
    case 'application/vnd.onedrive.folder':
      return 'OneDrive Folder';
    case 'application/vnd.onedrive.document':
      return 'OneDrive Document';
    case 'application/vnd.onedrive.spreadsheet':
      return 'OneDrive Spreadsheet';
    case 'application/vnd.onedrive.presentation':
      return 'OneDrive Presentation';
    case 'application/vnd.onedrive.photo':
      return 'OneDrive Photo';
    case 'application/vnd.onedrive.audio':
      return 'OneDrive Audio';
    case 'application/vnd.onedrive.video':
      return 'OneDrive Video';

    // -------------------------
    // Generic MIME groups
    // -------------------------
    default:
      if (mime_type.startsWith('image/')) return 'Image';
      if (mime_type.startsWith('video/')) return 'Video';
      if (mime_type.startsWith('audio/')) return 'Audio';
      if (mime_type.startsWith('text/')) return 'Text File';
      if (mime_type.includes('pdf')) return 'PDF Document';
      if (mime_type.includes('zip') || mime_type.includes('compressed'))
        return 'Archive';
      if (mime_type.includes('spreadsheet') || mime_type.includes('excel'))
        return 'Spreadsheet';
      if (
        mime_type.includes('presentation') ||
        mime_type.includes('powerpoint')
      )
        return 'Presentation';
      if (
        mime_type.includes('document') ||
        mime_type.includes('word') ||
        mime_type.includes('msword')
      )
        return 'Document';
      if (mime_type.includes('json')) return 'JSON File';
      if (mime_type.includes('csv')) return 'CSV File';
      if (mime_type.includes('xml')) return 'XML File';
      if (mime_type.includes('html')) return 'HTML File';
      if (mime_type.includes('script')) return 'Script File';

      return 'Unknown';
  }
};
