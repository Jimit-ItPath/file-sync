import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key-here'; // Move this to env variables in production

export const encryptRouteParam = (value: string): string => {
  const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
  // Make the encrypted string URL-safe
  return encodeURIComponent(encrypted);
};

export const decryptRouteParam = (encrypted: string): string => {
  try {
    // Decode the URL-safe string back to the encrypted format
    const decodedValue = decodeURIComponent(encrypted);
    const decrypted = CryptoJS.AES.decrypt(decodedValue, SECRET_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt route param:', error);
    return '';
  }
};
