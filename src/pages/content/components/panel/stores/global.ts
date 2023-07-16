import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface StoreState {
  activedBody: 'none' | 'summary' | 'preview' | 'notification' | 'letter';
  mode: 'list' | 'article';
  currentTime: number;
  letterList: [];
}

interface StoreAction {
  setActivedBody: (body: StoreState['activedBody']) => void;
  setMode: (mode: StoreState['mode']) => void;
  setCurrentTime: (time: StoreState['currentTime']) => void;
  setLetterList: (letterList: StoreState['letterList']) => void;
} 

type Store = StoreState & StoreAction;

export const useGlobalStore = create<Store, [['zustand/immer', Store]]>(
  immer(set => ({
    activedBody: 'none',
    mode: 'list',
    currentTime: -1,
    letterList: [],
    setActivedBody: body => {
      set(state => {
        state.activedBody = body;
      });
    },
    setMode: mode => {
      set(state => {
        state.mode = mode;
      });
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
