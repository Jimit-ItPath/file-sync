import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_REACT_APP_ROUTE_SECRET_KEY;

// Convert to base62 (alphanumeric) to make it URL-safe
const base62Chars =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function toBase62(buffer: number[]): string {
  let num = BigInt(
    '0x' + buffer.map(b => b.toString(16).padStart(2, '0')).join('')
  );
  let result = '';
  while (num > 0n) {
    result = base62Chars[Number(num % 62n)] + result;
    num = num / 62n;
  }
  // Pad to ensure consistent length and prevent collisions
  return result.padStart(24, '0');
}

function fromBase62(str: string): number[] {
  let num = 0n;
  for (let i = 0; i < str.length; i++) {
    num = num * 62n + BigInt(base62Chars.indexOf(str[i]));
  }
  const hex = num.toString(16).padStart(32, '0');
  const buffer = [];
  for (let i = 0; i < hex.length; i += 2) {
    buffer.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return buffer;
}

export const encryptRouteParam = (value: string): string => {
  try {
    // First encrypt with AES
    const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY);
    // Convert the encrypted string to bytes
    const bytes = CryptoJS.enc.Base64.parse(encrypted.toString());
    // Convert bytes to hex string
    const hex = bytes.toString(CryptoJS.enc.Hex);
    // Convert hex to byte array
    const byteArray = [];
    for (let i = 0; i < hex.length; i += 2) {
      byteArray.push(parseInt(hex.substr(i, 2), 16));
    }
    // Convert to base62 string
    return toBase62(byteArray);
  } catch (error) {
    console.error('Failed to encrypt route param:', error);
    return '';
  }
};

export const decryptRouteParam = (encrypted: string): string => {
  try {
    // Convert base62 string back to byte array
    const byteArray = fromBase62(encrypted);
    // Convert byte array to hex string
    const hex = byteArray.map(b => b.toString(16).padStart(2, '0')).join('');
    // Convert hex to Base64
    const base64 = CryptoJS.enc.Hex.parse(hex).toString(CryptoJS.enc.Base64);
    // Decrypt the Base64 string
    const decrypted = CryptoJS.AES.decrypt(base64, SECRET_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt route param:', error);
    return '';
  }
};
