import browser from 'webextension-polyfill';

import type { RuntimeMessage } from './types';

export function runtimeSendMessage(message: RuntimeMessage) {
  return browser.runtime.sendMessage(message);
}
