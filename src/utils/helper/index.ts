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
  return item ? JSON.parse(item) : null;
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
