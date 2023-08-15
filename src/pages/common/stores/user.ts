import { USER_INFO, USER_TOKEN } from "@src/pages/common/constants";
import { runtimeSendMessage } from "@src/pages/common/helpers";
import type { User } from "@src/pages/common/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { apiUser } from "../apis";

interface StoreState {
  info: User.Info | null;
  initComplete: boolean;
  token: string | null;
}

interface StoreAction {
  refreshBalance: () => Promise<void>;
  setUser: (token: string, info: User.Info) => Promise<void>;
  logout: () => void;
  init: () => Promise<void>;
  setCredit: (info: any) => void;
}

type Store = StoreState & StoreAction;

export const useUserStore = create<Store, [["zustand/immer", Store]]>(
  immer((set) => ({
    //#region  //*=========== state ===========
    info: null,
    initComplete: false,
    token: null,
    //#endregion  //*======== state ===========

    //#region  //*=========== actions ===========
    refreshBalance() {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    },

    setCredit(info) {
      set((state) => {
        state.info = {
          ...state.info,
          ...info,
        };
      });

      runtimeSendMessage({
        action: "storage-set",
        data: { key: USER_INFO, value: JSON.stringify(info) },
      });
    },

    async setUser(token, info) {
      set((state) => {
        state.token = token;
        state.info = info;
      });

      await Promise.all([
        runtimeSendMessage({
          action: "storage-set",
          data: { key: USER_TOKEN, value: token },
        }),
        runtimeSendMessage({
          action: "storage-set",
          data: { key: USER_INFO, value: JSON.stringify(info) },
        }),
      ]);
    },

    async logout() {
      // await apiUser.logout();
      set((state) => {
        state.info = null;
        state.token = null;
      });

      runtimeSendMessage({
        action: "storage-remove",
        data: { key: [USER_TOKEN, USER_INFO] },
      });
    },
    async init() {
      const token = await runtimeSendMessage({
        action: "storage-get",
        data: { key: [USER_TOKEN] },
      });

      if (!token || token == {}) return;
      if (Object.keys(token).length === 0) {
        set((state) => {
          state.token = null;
          state.initComplete = true;
        });
        return;
      }
      if (token[USER_TOKEN]) {
        set((state) => {
          state.token = token[USER_TOKEN];
        });
      }

      let data = null;
      try {
        data = await apiUser.login();
      } catch (err) {
        // runtimeSendMessage({
        //   action: "storage-remove",
        //   data: { key: [USER_TOKEN, USER_INFO] },
        // });
        set((state) => {
          state.token = null;
          state.initComplete = true;
        });
      }
      if (!data) return;

      set((state) => {
        state.info = {
          ...data,
        };
      });

      set((state) => {
        state.initComplete = true;
      });
    },

    //#endregion  //*======== actions ===========
  }))
);
