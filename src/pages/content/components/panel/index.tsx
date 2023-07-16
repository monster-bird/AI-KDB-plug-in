import { twindSetup } from '@src/pages/common/libs/twind';
import { createRoot } from 'react-dom/client';

import Panel from './Panel';

// import refreshOnUpdate from 'virtual:reload-on-update-in-view';
// refreshOnUpdate('pages/content');

function main() {
  twindSetup();
  console.log('version: 2.3.6');

  const timer = setInterval(() => {
    const initComplete = document.querySelector('.b-img__inner') !== null;

    if (initComplete) {
      if (initPageDOM(document.getElementById('danmukuBox'))) {
        clearInterval(timer);
      }
    }
  }, 300);
  setInterval(()=>{
    const videoWrapper = document.getElementById('bilibili-player')
    const video = videoWrapper.querySelector('video')
    if (video) {
      window.postMessage({
        data: {
          currentTime: video.currentTime
        }, type: 'setCurrentTime'
      }, 'https://www.bilibili.com/*')

    }
  }, 500)


  return;


  function initPageDOM(targetElement: HTMLElement | null): boolean {
    const root = document.createElement('div');
    root.id = 'tcbk-extension-panel-view-root';
    targetElement.insertAdjacentElement('beforebegin', root);
    createRoot(root).render(<Panel />);

    return true;
  }
}

main();
