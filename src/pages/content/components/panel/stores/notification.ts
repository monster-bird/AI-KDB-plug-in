import type { AlertProps } from 'antd';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { useGlobalStore } from './global';

interface Options extends Pick<AlertProps, 'type' | 'message'> {
  /**
   * @default false
   */
  autoClose?:
    | false
    | {
        /**
         * 自动关闭的延时，单位秒
         * @default 1000
         */
        delay?: number;
      };
  componentProps?: Omit<AlertProps, 'type' | 'message'>;
}

interface StoreState {
  componentProps: null | Partial<AlertProps>;
  visible: boolean;
}

interface StoreAction {
  show: (options: Options) => void;
  close(): void;
}

type Store = StoreState & StoreAction;

export const useNotificationStore = create<Store, [['zustand/immer', Store]]>(
  immer(set => ({
    componentProps: null,
    visible: false,

    show(options) {
      set(state => {
        state.componentProps = {
          ...options.componentProps,
          type: options.type,
          message: options.message
        };
        state.visible = true;
      });

      const { setActivedBody } = useGlobalStore.getState();

      setActivedBody('notification');

      if (options.autoClose) {
        setTimeout(() => {
          set(state => {
            state.visible = false;
          });
        }, options.autoClose.delay || 1000);
      }
    },
    close() {
      set(state => {
        state.visible = false;
      });
    }
  }))
);
