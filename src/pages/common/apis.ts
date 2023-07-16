import { axiosInstance } from './libs/axios';
import type { User } from './types';

export const apiUser = {
  async getAccessToken(reqModel: User.LoginReqModel) {
    return axiosInstance.get('/v2/auth/bilibili/token', {
      params: { state: reqModel.state }
    }) as unknown as Res;

    type Res = {
      jwtToken(jwtToken: any, arg1: { id: number; userName: string; credit: {}; }): unknown;
      id: string;
      userOpenId: string;
      userName: string;
      asscessToken: string;
      expiresIn: number;
      userType: number;
    };
  },
  logout() {
    return axiosInstance.post('/api/user/logout');
  },
  async login() {
    return axiosInstance.get('/v2/users/info') as unknown as Res;
  }
};
