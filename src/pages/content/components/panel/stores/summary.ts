import { axiosInstance } from "@src/pages/common/libs/axios";
import { useUserStore } from "@src/pages/common/stores/user";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { getBvid } from "../helpers";
import { useGlobalStore } from "./global";
import { useNotificationStore } from "./notification";

export interface SummaryData {
  noteId: string | null;
  notebookId: string | null;
  summaryCode: SummaryCode;
  chargeReason: string;
  totalCredit: number;
  remainingCredit: number;
  creditResetTime: number;
  latestModel: boolean;
  results: {
    summary: string;
    sections: Array<{
      start: string;
      end: string;
      detail: string;
      brief: string;
    }>;
  };
}

interface Resp {
  code: number;
  data: SummaryData;
}

interface StoreState {
  currentBvid: null | string;
  data: SummaryData["results"] | null;
  requesting: boolean;
  error: null | string;
  currentNoteId: null | string;
  currentNotebookId: null | string;
  latestModel: boolean;
}

interface StoreAction {
  start(): Promise<void>;
  cancelCurrentRequest(): void;
  setCurrentBvid(bvid: string): void;
  setCurrentNotebookId(notebookId: string): void;
  setLoading(loading: boolean): void;
  setLatestModel(latestModel: boolean): void;
  setSummaryData(data: object): void;
}

type Store = StoreState & StoreAction;

enum SummaryCode {
  SUCCESS = 100,
  START_PROCESSING = 200,
  PROCESSING = 201,
  ERROR = 301,
  _CANCEL,
  _BVID_CHANGED,
}

export const useSummaryStore = create<Store, [["zustand/immer", Store]]>(
  immer((set, get) => ({
    currentBvid: null,
    data: null,
    currentNoteId: null,
    currentNotebookId: null,
    requesting: false,
    error: null,
    latestModel: true,
    isLongLoading: false,
    loadEnd: false,
    async start() {
      const originBvid = getBvid();
      let i = 0;
      const queryString = window.location.search;

      const urlParams = new URLSearchParams(queryString);

      let _p = urlParams.get("p");
      let count = 0;
      let errorCount = 0;
      if (!_p) {
        _p = "";
      } else {
        _p = "?p=" + _p;
      }
      return new Promise((resolve, reject) => {
        set((state) => {
          state.requesting = true;
        });
        errorCount = 0
        requestFn(originBvid)
          .then(processData)
          .then((data) => {
            set((state) => {
              state.data = data.results;
              state.currentNoteId = data.noteId;
              state.currentNotebookId = data.notebookId;
              state.latestModel = data.latestModel;
            });
            // useGlobalStore.getState().setActivedBody('preview');

            if (data.remainingCredit < 0) {
              if (useGlobalStore.getState().summaryCode === 100) {
                useGlobalStore.getState().setActivedBody("preview");
              } else {
                useGlobalStore.getState().setActivedBody("no_money");
              }
              return
            } else {
              useGlobalStore.getState().setActivedBody("summary");
              // useGlobalStore.getState().setActivedBody("upgrade");
            }
            set((state) => {
              state.loadEnd = false;
              state.requesting = false;
            });
            // useUserStore.getState().setCredit({
            //   remainingCredit: -1,
            //   total: data.totalCredit,
            //   resetTime: data.creditResetTime
            // });

            // useUserStore.getState().setCredit({
            //   remainingCredit: data.remainingCredit,
            //   totalCredit: data.totalCredit,
            //   creditResetTime: data.creditResetTime,
            //   userType: data.userType,
            // });
            // let i = 0
            // useGlobalStore.getState().setActivedBody("upgrade");

            // 测试升级
            // useGlobalStore.getState().setActivedBody("notification");
            // useNotificationStore.getState().show({
            //   message: "大概需要15-30秒，请耐心等候"
            // });
            // setInterval(()=> {
            //   if (i%2 === 0) {
            //     useGlobalStore.getState().setActivedBody("upgrade");

            //   }else {
            //     useGlobalStore.getState().setActivedBody("notification");
            //     useNotificationStore.getState().show({
            //       message: "大概需要15-30秒，请耐心等候"
            //     });
            //   }
            //   i++

            // }, 5000)
            resolve();
          })
          .catch((error) => {
            errorCount++
            console.log(error);

            if (error == "error") {
              // useNotificationStore.getState().show({
              //   type: "error",
              //   message: "记笔记失败，请改天再来看看",
              // });
              useGlobalStore.getState().setActivedBody("no_money");

            }
            if ("code" in error) {
              if (error.code === 901 /* 余额不足 */) {
                useNotificationStore.getState().show({
                  type: "warning",
                  message: "余额不足~",
                });
              }
            } else if (
              error !== SummaryCode._CANCEL &&
              error !== SummaryCode._BVID_CHANGED
            ) {
              if (errorCount >= 3) {
                useNotificationStore.getState().show({
                  type: "warning",
                  message: "服务器繁忙，请稍后再试~",
                });

              } else {
                get().start()
              }

            }

            reject(error);
          })
          .finally(() => {
            set((state) => {
              state.isLongLoading = false;
              state.requesting = false;
            });

          });
      });
      function processData(data: Resp["data"]): Promise<SummaryData> {
        switch (data.summaryCode) {
          case SummaryCode.START_PROCESSING:
            useGlobalStore.getState().setShowText("课代表正在写笔记");

            return new Promise((resolve, reject) => {
              if (i <= 1) {
                i++
                if (useUserStore.getState().info?.userType > 0) {
                  useNotificationStore.getState().show({
                    message: "大概需要15-30秒，请耐心等候",
                  });
                } else {

                  useGlobalStore.getState().setActivedBody('upgrade')

                }

                set((state) => {
                  state.isLongLoading = true;
                });
              }

              setTimeout(() => {
                // 手动返回了
                if (!get().requesting) {
                  useNotificationStore.getState().close();
                  return reject(SummaryCode._CANCEL);
                }

                const currentBvid = getBvid();

                if (currentBvid !== originBvid) {
                  useNotificationStore.getState().close();
                  set((state) => {
                    state.isLongLoading = false;
                  });
                  return reject(SummaryCode._BVID_CHANGED);
                }

                requestFn(currentBvid)
                  .then(processData)
                  .then(resolve)
                  .catch(reject);
              }, 3000);
            });
          case SummaryCode.PROCESSING:
            return new Promise((resolve, reject) => {
              useGlobalStore.getState().setShowText("课代表正在看视频");
              if (i === 0) {
                if (count >= 3) {
                  useNotificationStore.getState().show({
                    message: "正在生成字幕，大概需要3-5分钟",
                  });
                  i++;
                }
                count++;
                set((state) => {
                  state.isLongLoading = true;
                });
              }

              setTimeout(() => {
                // 手动返回了
                if (!get().requesting) {
                  useNotificationStore.getState().close();
                  return reject(SummaryCode._CANCEL);
                }

                const currentBvid = getBvid();

                if (currentBvid !== originBvid) {
                  useNotificationStore.getState().close();
                  set((state) => {
                    state.isLongLoading = false;
                  });
                  return reject(SummaryCode._BVID_CHANGED);
                }

                requestFn(currentBvid)
                  .then(processData)
                  .then(resolve)
                  .catch(reject);
              }, 3000);
            });
          case SummaryCode.SUCCESS:

            return Promise.resolve(data);

          case SummaryCode.ERROR:
          default:
            return Promise.reject("error");
        }
      }

      async function requestFn(videoId: string) {
        // const data = await axiosInstance.post('/v2/videos/summary', {
        //   videoId: (videoId + _p)
        // });
        const data = await axiosInstance.get("/v2/ai-notes/" + videoId + _p);
        return data as unknown as Resp["data"];
      }
    },
    setLatestModel: (model) => {
      set((state) => {
        state.latestModel = model;
      });
    },
    cancelCurrentRequest() {
      set((state) => {
        state.requesting = false;
      });
    },

    setCurrentBvid(bvid: string) {
      set((state) => {
        state.currentBvid = bvid;
      });
    },
    setSummaryData(data) {
      set((state) => {
        state.data = bvdataid;
      });
    },
    setLoading(loading: boolean) {
      set((state) => {
        state.requesting = loading;
        state.isLongLoading = loading;
      });
    },
    setCurrentNotebookId(notebookId: string) {
      set((state) => {
        state.currentNotebookId = notebookId;
      });
    },
  }))
);
