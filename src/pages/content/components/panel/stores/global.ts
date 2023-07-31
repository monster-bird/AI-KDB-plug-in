import { API_BASE_URL } from '@src/pages/common/constants';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface StoreState {
  activedBody: 'none' | 'summary' | 'preview' | 'notification' | 'letter' |'stream';
  mode: 'list' | 'article';
  currentTime: number;
  letterList: [];
  showText: string;
  currentP: string;
  realMode: boolean;
  searchWords: string;
  currentSelectKey: string;
  caseMode: boolean;
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
    init: () => {
      set(state=> {
        state.currentTime = -1;
        state.currentSelectKey = '';
        state.searchWords = '';
        state.realMode = true;
        state.caseMode = false;
        state.mode = 'list';
      })
    },
    devLog: info => {
      if (API_BASE_URL.includes('dev')) {
        console.log(info);

      }
      
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
