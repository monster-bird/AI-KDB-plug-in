import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface StoreState {
  activedBody: 'none' | 'summary' | 'preview' | 'notification' | 'letter';
}

interface StoreAction {
  setActivedBody: (body: StoreState['activedBody']) => void;
}

type Store = StoreState & StoreAction;

export const useGlobalStore = create<Store, [['zustand/immer', Store]]>(
  immer(set => ({
    activedBody: 'none',

    setActivedBody: body => {
      set(state => {
        state.activedBody = body;
      });
    }
  }))
);
