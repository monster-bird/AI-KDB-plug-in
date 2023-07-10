import { axiosInstance } from '@src/pages/common/libs/axios';
import { useUserStore } from '@src/pages/common/stores/user';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { getBvid } from '../helpers';
import { useGlobalStore } from './global';
import { useNotificationStore } from './notification';

export interface SummaryData {
  summaryCode: SummaryCode;
  chargeReason: string;
  totalCredit: number;
  remainingCredit: number;
  creditResetTime: number;
  currentNoteId: string;
  currentNotebookId: String;
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
  data: SummaryData['results'] | null;
  requesting: boolean;
  error: null | string;
  currentNoteId: null | string;
  currentNotebookId: null | string;
}

interface StoreAction {
  start(): Promise<void>;
  cancelCurrentRequest(): void;
  setCurrentBvid(bvid: string): void;
  setCurrentNotebookId(notebookId: string): void;
}

type Store = StoreState & StoreAction;

enum SummaryCode {
  SUCCESS = 100,
  START_PROCESSING = 200,
  PROCESSING = 201,
  ERROR = 301,
  _CANCEL,
  _BVID_CHANGED
}

export const useSummaryStore = create<Store, [['zustand/immer', Store]]>(
  immer((set, get) => ({
    currentBvid: null,
    data: null,
    currentNoteId: null,
    currentNotebookId: null,
    requesting: false,
    error: null,
    isLongLoading: false,
    async start() {
      const originBvid = getBvid();
      let i = 0;
      const queryString = window.location.search;
      console.log(queryString); // "?name=John&age=30"

      const urlParams = new URLSearchParams(queryString);


      let _p = urlParams.get('p');
      if (!_p) {
        _p = '';
      } else {
        _p = '?p=' + _p;
      }
      return new Promise((resolve, reject) => {
        set(state => {
          state.requesting = true;
        });

        requestFn(originBvid)
          .then(processData)
          .then(data => {
            console.log('summary');
            
            console.log(data);
            set(state => {
              state.data = data.results;
              state.currentNoteId = data.noteId;
              state.currentNotebookId = data.notebookId;
            });
            if (data.remainingCredit<0) {
              useGlobalStore.getState().setActivedBody('preview');

            }else {
              useGlobalStore.getState().setActivedBody('summary');

            }
            // useUserStore.getState().setCredit({
            //   remaining: data.remainingCredit,
            //   total: data.totalCredit,
            //   resetTime: data.creditResetTime
            // });
            useUserStore.getState().setCredit({
              remaining: data.remainingCredit,
              total: data.totalCredit,
              resetTime: data.creditResetTime
            });
            resolve();
          })
          .catch(error => {
            console.log(error);
            if (error == 'error') {
              useNotificationStore.getState().show({
                type: 'error',
                message: '记笔记失败，请改天再来看看~~'
              });
            }
            if ('code' in error) {
              if (error.code === 901 /* 余额不足 */) {
                useNotificationStore.getState().show({
                  type: 'warning',
                  message: '余额不足~'
                });
              }
            } else if (
              error !== SummaryCode._CANCEL &&
              error !== SummaryCode._BVID_CHANGED
            ) {
              useNotificationStore.getState().show({
                type: 'error',
                message: '记笔记失败，请稍后再试~'
              });
            }

            reject(error);
          })
          .finally(() => {
            set(state => {
              state.requesting = false;
              state.isLongLoading = false;
            });
          });
      });
      function processData(data: Resp['data']): Promise<SummaryData> {

        switch (data.summaryCode) {
          case SummaryCode.START_PROCESSING:
            return new Promise((resolve, reject) => {
              if (i <= 1) {
                i++;
                useNotificationStore.getState().show({
                  message: '课代表整理一份高质量的笔记需要花费1-3分钟，请耐心等候……'
                });
                set(state => {
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
                  set(state => {
                    state.isLongLoading = false;
                  });
                  return reject(SummaryCode._BVID_CHANGED);
                }

                requestFn(currentBvid).then(processData).then(resolve).catch(reject);
              }, 3000);
            });
          case SummaryCode.PROCESSING:
            return new Promise((resolve, reject) => {
              if (i === 0) {
                i++;
                useNotificationStore.getState().show({
                  message: '该视频可能没有字幕，等待时间较长，建议3-5分钟后到收件箱查看'
                });
                set(state => {
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
                  set(state => {
                    state.isLongLoading = false;
                  });
                  return reject(SummaryCode._BVID_CHANGED);
                }

                requestFn(currentBvid).then(processData).then(resolve).catch(reject);
              }, 3000);
            });
          case SummaryCode.SUCCESS:
            return Promise.resolve(data);

          case SummaryCode.ERROR:
          default:
            return Promise.reject('error');
        }
      }

      async function requestFn(videoId: string) {
        // const data = await axiosInstance.post('/v2/videos/summary', {
        //   videoId: (videoId + _p)
        // });
        const data = await axiosInstance.get('/v2/ai-notes/' + videoId + _p)
        return data as unknown as Resp['data'];
      }
    },

    cancelCurrentRequest() {
      set(state => {
        state.requesting = false;
      });
    },

    setCurrentBvid(bvid: string) {
      set(state => {
        state.currentBvid = bvid;
      });
    },
    setCurrentNotebookId(notebookId: string) {
      set(state => {
        state.currentNotebookId = notebookId;
      });
    }
  }))
);
