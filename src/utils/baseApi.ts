import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';
import { v4 } from 'uuid';
// import { signOut } from '@clerk/nextjs';

import { ACCESS_TOKEN, baseApi as baseURL } from '@/utils/constants-global';

import { getCookie, handleError } from './common';

const api = axios.create({
  baseURL,
});

const onRequest = async (
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> => {
  const newConfig = {
    ...config,
    timeout: 60000,
    validateStatus: (status: number) => status < 400,
  };
  // console.log('go here');
  // const accessToken = cookies().get(ACCESS_TOKEN);
  // console.log(accessToken);
  if (!newConfig?.headers['Content-Type']) {
    newConfig.headers['Content-Type'] = 'application/json';
  }
  // const loginData = sessionStorage?.getItem('loginData');
  // console.log('loginData', loginData);
  // const token = loginData ? JSON.parse(loginData)?.data?.accessToken : null;
  const token = getCookie(ACCESS_TOKEN);
  // console.log('token', token);
  if (token) {
    // console.log('có token');
    newConfig.headers.Authorization = `Bearer ${token}`;
  }
  newConfig.headers.clientMessageId = `${v4()}`;
  newConfig.headers.clientTime = new Date().toISOString();
  return newConfig;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  handleError(error);
  return Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  if (response.status === 401) {
    sessionStorage.removeItem('loginData');
    // signOut();
  }
  return response;
};

const onResponseError = (error: AxiosError): Promise<AxiosError> => {
  return Promise.reject(error);
};

function setupInterceptorsTo(
  axiosInstance: AxiosInstance,
): AxiosInstance {
  axiosInstance.interceptors.request.use(onRequest, onRequestError);
  axiosInstance.interceptors.response.use(onResponse, onResponseError);
  return axiosInstance;
}

export default setupInterceptorsTo(api);
