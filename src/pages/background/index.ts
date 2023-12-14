import JSZip from "jszip";
import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import browser from "webextension-polyfill";

import type { RuntimeMessage } from "../common/types";

reloadOnUpdate("pages/background");

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    // 当插件被首次安装时执行以下代码
    chrome.tabs.create({ url: "welcome.html" });
  }
});

browser.runtime.onMessage.addListener(async (msg: RuntimeMessage) => {
  
  switch (msg.action) {
    case "storage-get": {
      
      return browser.storage.local.get(msg.data.key);
    }
    case "storage-set": {
      return browser.storage.local.set({
        [msg.data.key]: msg.data.value,
      });
    }
    case "login-success": {
      
      return browser.storage.local.set({
        [msg.data.key]: msg.data.value,
      });
    }
    case "storage-remove": {
      return browser.storage.local.remove(msg.data.key);
    }
  }
});
