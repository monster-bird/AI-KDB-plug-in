import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

import { API_BASE_URL } from '../constants';
import { useUserStore } from '../stores/user';

export { type APIResponse, axiosInstance };

interface APIResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

const axiosInterceptor = {
  request: {
    auth(config: InternalAxiosRequestConfig) {
      const { token } = useUserStore.getState() ?? {};

      if (token) {
        config.headers!.Authorization = `Bearer ${token}`;
      }

      // config.headers!['Content-Type'] = 'application/json';

      return config;
    }
  },
  response: {
    noErrorAndFilterData(response: AxiosResponse<APIResponse, any>) {
      return response.data.data;
    },
    errorStatus(response: AxiosResponse<APIResponse, any>) {
      if (response.status === 200) return response;

      throw response;
    },
    errorCode(response: AxiosResponse<APIResponse, any>) {
      const { data } = response;

      if (data.code !== 200) {
        throw data;
      }

      return response;
    }
  }
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

axiosInstance.interceptors.request.use(axiosInterceptor.request.auth);

axiosInstance.interceptors.response.use(axiosInterceptor.response.errorStatus);
axiosInstance.interceptors.response.use(
  axiosInterceptor.response.errorCode,
  Promise.reject
);
axiosInstance.interceptors.response.use(axiosInterceptor.response.noErrorAndFilterData);
