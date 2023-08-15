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
    case 'checkUpdate': {

      checkUpdate();

      return;
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
function checkUpdate() {
  fetch('https://api.taichangbukan.cn/v1/update/latest_version')
    .then(response => response.json())
    .then(data => {
      const versionInfo = data.data;
      console.log(versionInfo);
      const currentVersion = chrome.runtime.getManifest().version;

      if (versionInfo.version !== currentVersion) {
        const downloadUrl = versionInfo.downloadUrl;
        installUpdate(downloadUrl);
      }
    })
    .catch(error => console.error(error));
}
function installUpdate(url) {
  fetch(url)
    .then(response => response.arrayBuffer())
    .then(blob => {
      const zip = new JSZip();
      zip.loadAsync(blob).then(zip => {
        // 解压缩更新包到临时目录

        const dirName = 'my-plugin-' + Date.now();

        const dirPath = '/' + dirName + '/';
        zip.forEach(function (relativePath, zipEntry) {
          if (!zipEntry.dir) {
            const filePath = dirPath + relativePath;
            chrome.storage.local.set({ [filePath]: zipEntry.async('blob') });
          }
        });
        // 备份当前插件的数据
        chrome.storage.local.get(null, function (data) {
          const backupData = {};
          for (const key in data) {
            if (key.startsWith('/')) {
              backupData[key] = data[key];
            }
          }
          chrome.storage.local.set({ backupData: backupData }, function () {
            // 卸载当前插件
            chrome.management.getSelf(function (info) {
              chrome.management.uninstall(
                info.id,
                { showConfirmDialog: false },
                function () {
                  // 安装更新包
                  chrome.management.install(
                    { url: window.URL.createObjectURL(blob) },
                    function () {
                      // 重新加载插件
                      chrome.runtime.reload();
                    }
                  );
                }
              );
            });
          });
        });
      });
    });
}
