import axios from 'axios';
import { ERROR_MESSAGES } from '../utils/constants';
import { API } from '../configs/env';
import { AUTH_ROUTES } from '../routing/routes';

export const METHODS = {
  POST: 'post',
  GET: 'get',
  DELETE: 'delete',
  PUT: 'put',
  PATCH: 'patch',
  HEAD: 'head',
  OPTIONS: 'options',
};

const BASE_URL = API.URL;
// const DEFAULT_PREFIX = '/';

const axiosConfig = {
  baseURL: BASE_URL,
  withCredentials: true,
};

// Create a single Axios instance
const axiosInstance = axios.create(axiosConfig);

// Set up request interceptor
axiosInstance.interceptors.request.use(config => {
  // const token = getLocalStorage(LOCAL_STORAGE_KEY);
  // const token = getLocalStorage("token");
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Set up response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;

    if (!response) {
      return Promise.reject(error);
    }

    const { status } = response;

    const errorMessage =
      response?.data?.error ||
      response?.data?.message ||
      ERROR_MESSAGES[status as keyof typeof ERROR_MESSAGES] ||
      ERROR_MESSAGES.common;

    const customError = {
      message: errorMessage,
      ...response,
    };

    if ([401].includes(status)) {
      localStorage.clear();
      // window.location.href = AUTH_ROUTES.LOGIN.url;
      return Promise.reject(customError);
    }

    return Promise.reject(customError);
  }
);

// const client = ({
//   method = METHODS.GET,
//   url = '',
//   data = undefined as any,
//   ...rest
// }: {
//   method?: string;
//   url?: string;
//   data?: any;
//   [key: string]: any;
// }) => {
//   return axiosInstance({
//     method,
//     url,
//     data,
//     withCredentials: true,
//     ...rest,
//   });
// };

const client = ({
  method = METHODS.GET,
  url = '',
  data = undefined as any,
  headers = {},
  ...rest
}: {
  method?: string;
  url?: string;
  data?: any;
  headers?: Record<string, string>;
  [key: string]: any;
}) => {
  if (headers['Content-Type'] === 'multipart/form-data') {
    delete headers['Content-Type'];
  }

  return axiosInstance({
    method,
    url,
    data,
    headers,
    withCredentials: true,
    ...rest,
  });
};

export default client;
