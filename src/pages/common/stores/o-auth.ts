import { API_BASE_URL, BILIBILI_CLIENT_ID } from '@src/pages/common/constants';
import { nanoid } from 'nanoid';
import queryString from 'query-string';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { apiUser } from '../apis';
import { useUserStore } from './user';

interface StoreState {
  tempState: string | null;
}

interface StoreAction {
  start(): void;
  syncState(): Promise<boolean>;
  clearTempState(): void;
}

type Store = StoreState & StoreAction;

export const useOAuthStore = create<
  Store,
  [['zustand/persist', Partial<StoreState>], ['zustand/immer', StoreState]]
>(
  persist(
    immer((set, get) => ({
      tempState: null,

      start() {
        const tempState = nanoid();
        const startTime = Date.now();

        set(state => {
          state.tempState = tempState;
        });

        const bilibiliOAuthUrl = (() => {
          const returnUrl = encodeURIComponent(
            API_BASE_URL + `/v2/auth/bilibili/callback`
          );

          // https://openhome.bilibili.com/doc/4/aac73b2e-4ff2-b75c-4c96-35ced865797b
          const params = queryString.stringify({
            client_id: BILIBILI_CLIENT_ID,
            state: tempState,
            return_url: returnUrl,
            response_type: 'code'
          });

          return `https://passport.bilibili.com/register/pc_oauth2.html#/?${params}`;
        })();

        window.open(bilibiliOAuthUrl, '_blank');

        const timer = setInterval(async () => {
          const isTimeout = Date.now() - startTime > 1000 * 60 * 5;

          if (isTimeout || (await useOAuthStore.getState().syncState())) {
            clearInterval(timer);
          }
        }, 3000);
      },
      async syncState() {
        const { tempState } = useOAuthStore.getState();

        if (tempState) {
          const data = await apiUser.getAccessToken({ state: tempState! });

          await useUserStore
            .getState()
            .setUser(data.jwtToken, { id: 1, userName: data.userName, credit: {} });

          get().clearTempState();
          await useUserStore.getState().init();
          location.reload()
          return true;
        }

        return false;
      },
      clearTempState() {
        set(state => {
          state.tempState = null;
        });
      }
    })),
    {
      name: 'oauth',
      partialize(state) {
        return {
          tempState: state.tempState
        };
      }
    }
  )
);
