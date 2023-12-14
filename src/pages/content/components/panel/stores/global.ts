import { API_BASE_URL } from "@src/pages/common/constants";
import { axiosInstance } from "@src/pages/common/libs/axios";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useSummaryStore } from "./summary";
import { useQuestionStore } from "./question";
import { getP } from "./../helpers";
import { useUserStore } from "./../../../../common/stores/user";

interface StoreState {
  activedBody:
    | "none"
    | "summary"
    | "preview"
    | "no_money"
    | "notification"
    | "letter"
    | "stream"
    | "question"
    | "upgrade";
  mode: "list" | "article";
  currentTime: number;
  letterList: any[];
  showText: string;
  currentP: string;
  realMode: boolean;
  searchWords: string;
  currentSelectKey: string;
  caseMode: boolean;
  streamStart: boolean;
  noLetter: boolean;
  transList: String[];
  transStart: boolean;
  letterLoading: boolean;
  originList: any[],
  summaryCode: number,
  transLoading: boolean
}

interface StoreAction {
  setActivedBody: (body: StoreState["activedBody"]) => void;
  setMode: (mode: StoreState["mode"]) => void;
  setCurrentTime: (time: StoreState["currentTime"]) => void;
  setLetterList: (letterList: StoreState["letterList"]) => void;
  setShowText: (showText: StoreState["showText"]) => void;
  setCurrentP: (currentP: StoreState["currentP"]) => void;
  setRealMode: (realMode: StoreState["realMode"]) => void;
  setSearchWords: (searchWords: StoreState["searchWords"]) => void;
  setcurrentSelectKey: (
    currentSelectKey: StoreState["currentSelectKey"]
  ) => void;
  setCaseMode: (caseMode: StoreState["caseMode"]) => void;
  devLog: (info: any) => void;
  init: () => void;
  setStreamStart: (stream: StoreState["streamStart"]) => void;
  setNoLetter: (noLetter: StoreState["noLetter"]) => void;
  getLetterData: () => void;
  getStreamLetterData: () => void;
  setSummaryCode: (summaryCode: StoreState["summaryCode"]) => void;
  getLangLetterList: (lang: String) => void;
  setTransStart: (start: StoreState["transStart"]) => void;
  setLetterLoading: (loading: StoreState["letterLoading"]) => void;
  setOriginList:(list: StoreState["originList"]) => void;
  setTransLoading:(loading: StoreState["transLoading"]) => void;
}

type Store = StoreState & StoreAction;

export const useGlobalStore = create<Store, [["zustand/immer", Store]]>(
  immer((set) => ({
    activedBody: "none",
    mode: "list",
    currentTime: -1,
    letterList: [],
    currentP: "",
    realMode: true,
    showText: "",
    searchWords: "",
    currentSelectKey: "",
    caseMode: false,
    streamStart: false,
    noLetter: false,
    originList: [],
    summaryCode: 100,
    transStart:false,
    transLoading: false,
    transList: [],
    letterLoading: true,
    init: () => {
      set((state) => {
        state.currentTime = -1;
        state.currentSelectKey = "";
        state.searchWords = "";
        state.streamStart = false;
        state.transList = [];
        state.transStart = false;
        state.letterLoading = true
      });
    },
    setOriginList: (list) => {
      set(state=> {
        state.originList = list
      })
    },
    setTransLoading: (loading) => {
      set(state=> {
        state.transLoading = loading
      })
    },
    setLetterLoading: (loading) => {
      set((state) => {
        state.letterLoading = loading;
      });
    },
    devLog: () => {
      if (API_BASE_URL.includes("dev")) {
      }
    },
    setTransStart: start => {
      set(state=>{
        state.transStart = start;
      })
    },
    getStreamLetterData: async () => {
      const queryString = window.location.search;

      const urlParams = new URLSearchParams(queryString);

      let _p = urlParams.get("p");
      if (!_p) {
        _p = "";
      } else {
        _p = "%3Fp=" + _p;
      }
      // axiosInstance.get(`/v2/ai-notes/${summary.currentBvid + _p}/subtitle`).then(value => {
      //   setLetterList(value)
      //   setLetterLoading(false)
      //   global.setLetterList(value)
      //   setOriginList([...value])
      // }).catch(error=>{
      //   setLetterLoading(false)
      //   setLetterList([])

      // })
      try {
        const resp = await fetch(
          `${API_BASE_URL}/v2/ai-notes/${
            useSummaryStore.getState().currentBvid
          }${getP()}/stream_subtitle`,
          {
            method: "get",

            headers: {
              Authorization: `Bearer ${useUserStore.getState().token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const reader = resp.body.getReader();
        const textDecoder = new TextDecoder();
        set(state => {
          state.letterLoading = false
        });
        while (1) {
          const { done, value } = await reader.read();
          if (done) {
            set(() => {
            });
            break;
          }
  
          const str = textDecoder.decode(value);
          const _list = str.split("\n\n");
          _list.forEach((value) => {
            const _lineList = value.split("\n");
  
            if (_lineList.length > 1) {
              if (_lineList[0].includes("error")) {
                const _objList = _lineList[1].split("data: ");
                if (_objList.length > 1) {
  
                  let obj = JSON.parse(_objList[1]);
  
                  setNoLetterNotification(obj.body.msg);
                }
              } else if (_lineList[0].includes("subtitle")) {
                const _objList = _lineList[1].split("data: ");
                if (_objList.length > 1) {
                  let obj = JSON.parse(_objList[1]);
  
                  // setLetterList((value) => {
                  //   global.setLetterList([...value, obj.body]);
  
                  //   return [...value, obj.body];
                  // });
  
                  set((state) => {
                    state.letterList = [...state.letterList, obj.body];
                  });
                }
              }
            }
          });
        }
      } catch (error) {
        console.error("请求错误:", error);
        summary.setLoading(false);
      }
    },
    getLangLetterList: (lang) => {
      const getLetterData = async () => {
        // axiosInstance.get(`/v2/ai-notes/${summary.currentBvid + _p}/subtitle`).then(value => {
        //   setLetterList(value)
        //   setLoading(false)
        //   global.setLetterList(value)
        //   setOriginList([...value])
        // }).catch(error=>{
        //   setLoading(false)
        //   setLetterList([])

        // })
        try {
          const resp = await fetch(
            `${API_BASE_URL}/v2/ai-notes/${
              useSummaryStore.getState().currentBvid
            }${getP()}/translate_subtitle/${lang}`,
            {
              method: "post",

              headers: {
                Authorization: `Bearer ${useUserStore.getState().token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const reader = resp.body.getReader();
          const textDecoder = new TextDecoder();
          while (1) {
            const { done, value } = await reader.read();
            if (done) {
              // console.log(tempLetterList);
              set(state=> {
                state.transLoading = false
              })

              break;
            }

            const str = textDecoder.decode(value);
            const _list = str.split("\n\n");
            _list.forEach((value) => {
              const _lineList = value.split("\n");

              if (_lineList.length > 1) {
                if (_lineList[0].includes("error")) {
                  const _objList = _lineList[1].split("data: ");
                  if (_objList.length > 1) {
                  }
                } else if (_lineList[0].includes("translation")) {
                  const _objList = _lineList[1].split("data: ");
                  if (_objList.length > 1) {
                    let obj = JSON.parse(_objList[1]);

                    set((state) => {
                      state.transList = [...state.transList, obj.body];
                    });
                  }
                }
              }
            });
          }
        } catch (error) {
          console.error("请求错误:", error);
          useSummaryStore.getState().setLoading(false);
        }
      };
      getLetterData();
    },
    setSummaryCode: (number) => {
      set((state) => {
        state.summaryCode = number;
      });
    },
    getLetterData: () => {
      const queryString = window.location.search;

      const urlParams = new URLSearchParams(queryString);

      let _p = urlParams.get("p");
      if (!_p) {
        _p = "";
      } else {
        _p = "%3Fp=" + _p;
      }
      axiosInstance
        .get(
          `/v2/ai-notes/${useSummaryStore.getState().currentBvid + _p}/subtitle`
        )
        .then((value) => {
          set((state) => {
            state.letterList = [...value];
          });
          useQuestionStore.getState().setQuestionLoading(false);
        })
        .catch((e) => {
          console.log(e);

          useQuestionStore.getState().setQuestionLoading(false);
        })
        .finally(() => {
          set((state) => {
            state.letterLoading = false;
          });
          useQuestionStore.getState().setQuestionLoading(false);
        });
    },
    setNoLetter: (letter) => {
      set((state) => {
        state.noLetter = letter;
      });
    },
    setStreamStart: (stream) => {
      set((state) => {
        state.streamStart = stream;
      });
    },
    setCaseMode: (mode) => {
      set((state) => {
        state.caseMode = mode;
      });
    },
    setcurrentSelectKey: (key) => {
      set((state) => {
        state.currentSelectKey = key;
      });
    },
    setSearchWords: (words) => {
      set((state) => {
        state.searchWords = words;
      });
    },
    setActivedBody: (body) => {
      set((state) => {
        state.activedBody = body;
      });
    },
    setRealMode: (mode) => {
      set((state) => {
        state.realMode = mode;
      });
    },
    setShowText: (text) => {
      set((state) => {
        state.showText = text;
      });
    },
    setMode: (mode) => {
      set((state) => {
        state.mode = mode;
      });
    },
    setCurrentP: (p) => {
      set((state) => {
        state.currentP = p;
      });
    },
    setCurrentTime: (time: number) => {
      set((state) => {
        state.currentTime = time;
      });
    },
    setLetterList: (letterList: []) => {
      return set((state) => {
        state.letterList = [...letterList];
      });
    },
  }))
);
function setNoLetterNotification(msg: any) {
  throw new Error("Function not implemented.");
}

