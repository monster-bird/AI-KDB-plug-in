import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface StoreState {
  activedBody: 'none' | 'summary' | 'preview' | 'notification' | 'letter';
  mode: 'list' | 'article';
  currentTime: number;
}

interface StoreAction {
  setActivedBody: (body: StoreState['activedBody']) => void;
  setMode: (mode: StoreState['mode']) => void;
  setCurrentTime: (time: StoreState['currentTime']) => void;
}

type Store = StoreState & StoreAction;

export const useGlobalStore = create<Store, [['zustand/immer', Store]]>(
  immer(set => ({
    activedBody: 'none',
    mode: 'list',
    currentTime: -1,
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
    }
  }))
);
