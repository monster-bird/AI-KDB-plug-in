import { API_BASE_URL } from '@src/pages/common/constants';
import { axiosInstance } from '@src/pages/common/libs/axios';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useSummaryStore } from './summary';
import { useQuestionStore } from './question';

interface StoreState {
  activedBody: 'none' | 'summary' | 'preview' | 'no_money' | 'notification' | 'letter' |'stream' | 'question';
  mode: 'list' | 'article';
  currentTime: number;
  letterList: any[] ;
  showText: string;
  currentP: string;
  realMode: boolean;
  searchWords: string;
  currentSelectKey: string;
  caseMode: boolean;
  streamStart: boolean;
  noLetter: boolean;
}

interface StoreAction {
  setActivedBody: (body: StoreState['activedBody']) => void;
  setMode: (mode: StoreState['mode']) => void;
  setCurrentTime: (time: StoreState['currentTime']) => void;
  setLetterList: (letterList: StoreState['letterList']) => void;
  setShowText: (showText: StoreState['showText']) => void;
  setCurrentP: (currentP: StoreState['currentP']) => void;
  setRealMode: (realMode: StoreState['realMode']) => void;
  setSearchWords: (searchWords: StoreState['searchWords']) => void;
  setcurrentSelectKey: (currentSelectKey: StoreState['currentSelectKey']) => void;
  setCaseMode: (caseMode: StoreState['caseMode']) => void;
  devLog: (info: any) => void;
  init: () => void;
  setStreamStart: (stream: StoreState['streamStart']) => void;
  setNoLetter: (noLetter: StoreState['noLetter']) => void;
  getLetterData: () => void;
} 

type Store = StoreState & StoreAction;

export const useGlobalStore = create<Store, [['zustand/immer', Store]]>(
  immer(set => ({
    activedBody: 'none',
    mode: 'list',
    currentTime: -1,
    letterList: [],
    currentP: '',
    realMode: true,
    showText: '',
    searchWords: '',
    currentSelectKey: '',
    caseMode: false,
    streamStart: false,
    noLetter:false,

    init: () => {
      set(state=> {
        state.currentTime = -1;
        state.currentSelectKey = '';
        state.searchWords = '';
        state.streamStart = false
      })
    },
    devLog: info => {
      if (API_BASE_URL.includes('dev')) {
        console.log(info);

      }
      
    },
    getLetterData: ()=> {
      const queryString = window.location.search;
  
      const urlParams = new URLSearchParams(queryString);
  
  
      let _p = urlParams.get('p');
      if (!_p) {
        _p = '';
      } else {
        _p = '%3Fp=' + _p;
      }
      axiosInstance.get(`/v2/ai-notes/${useSummaryStore.getState().currentBvid + _p}/subtitle`).then(value => {
        set(state => {
          state.letterList = [...value]
          
        })
        useQuestionStore.getState().setQuestionLoading(false)

      }).catch(e=>{
        console.log(e);
        
        useQuestionStore.getState().setQuestionLoading(false)
      }).finally(()=>{
        console.log(123);
        
        useQuestionStore.getState().setQuestionLoading(false)
        
      })
    },
    setNoLetter: letter => {
      set(state => {
        state.noLetter = letter
      })
    },
    setStreamStart: stream => {
      set(state => {
        state.streamStart = stream
      })
    },
    setCaseMode: mode => {
      set(state => {
        state.caseMode = mode;
      })
    },
    setcurrentSelectKey: key => {
      set(state => {
        state.currentSelectKey = key;
      });
    },
    setSearchWords: words => {
      set(state => {
        state.searchWords = words;
      });
    },
    setActivedBody: body => {
      set(state => {
        state.activedBody = body;
      });
    },
    setRealMode: mode => {
      set(state => {
        state.realMode = mode;
      })
    },
    setShowText: text => {
      set(state => {
        state.showText = text;
      })
    },
    setMode: mode => {
      set(state => {
        state.mode = mode;
      });
    },
    setCurrentP: p => {
      set(state => {
        state.currentP = p;
      })
    },
    setCurrentTime: (time: number) => {
      set(state => {
        state.currentTime = time
      })
    },
    setLetterList: (letterList: []) => {
      set(state => {
        state.letterList = [...letterList]
      })
    }
  }))
);
