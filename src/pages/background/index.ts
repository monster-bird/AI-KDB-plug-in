import JSZip from 'jszip';
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import browser from 'webextension-polyfill';

import type { RuntimeMessage } from '../common/types';

reloadOnUpdate('pages/background');


browser.runtime.onMessage.addListener(async (msg: RuntimeMessage) => {
  switch (msg.action) {
    case 'storage-get': {
      return browser.storage.local.get(msg.data.key);
    }
    case 'storage-set': {
      return browser.storage.local.set({
        [msg.data.key]: msg.data.value
      });
    }

    case 'storage-remove': {
      return browser.storage.local.remove(msg.data.key);
    }
  }
});

