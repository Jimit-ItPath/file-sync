/**
 * Environment Configuration
 *
 * This module centralizes all environment variable access and provides
 * type checking and default values for environment variables.
 */

// Environment type (development, production, staging)
export const ENV = import.meta.env.VITE_APP_ENV || 'development';

// Application metadata
export const APP = {};

// API configuration
export const API = {
  URL: import.meta.env.VITE_REACT_APP_BASE_URL || 'http://localhost:3000',
};

// Server configuration
export const SERVER = {
  PORT: parseInt(import.meta.env.VITE_PORT || '3000', 10),
};

// Feature flags
export const FEATURES = {
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
};

// Check if we're running in development mode
export const IS_DEV = ENV === 'development';

// Check if we're running in production mode
export const IS_PROD = ENV === 'production';

// Check if we're running in staging mode
export const IS_STAGING = ENV === 'staging';

export default {
  ENV,
  APP,
  API,
  SERVER,
  FEATURES,
  IS_DEV,
  IS_PROD,
  IS_STAGING,
};
