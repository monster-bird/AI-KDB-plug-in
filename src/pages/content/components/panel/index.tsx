import { twindSetup } from '@src/pages/common/libs/twind';
import { createRoot } from 'react-dom/client';
import Panel from './Panel';

// import refreshOnUpdate from 'virtual:reload-on-update-in-view';
// refreshOnUpdate('pages/content');

function main() {
  twindSetup();
  console.log('version: 1.5.2');
  const currentUrl = window.location.href;
  const timer = setInterval(() => {
    if (currentUrl.startsWith('https://www.bilibili.com')) {
      const initComplete = document.querySelector('.b-img__inner') !== null;

      if (initComplete) {
        if (initPageDOM(document.getElementById('oldfanfollowEntry'))) {
          clearInterval(timer);
        }
      }
    } else if (currentUrl.startsWith('https://www.ixigua.com')) {
      // 获取所有具有特定类名的元素
    
      const initComplete = document.querySelector('.tt-img-loaded') !== null;
      console.log('检测到加载完成');

      if (initComplete) {
        var elementsWithClassName = document.getElementsByClassName('auto-play-control');

        // 选择一个元素或根据需要迭代它们
        if (elementsWithClassName.length > 0) {
          var element = elementsWithClassName[0] as HTMLElement; // 这里选择第一个匹配的元素，根据需要进行更改
          initPageDOM(element);
          clearInterval(timer);

        } else {
          // 处理没有找到匹配元素的情况
          console.log('没有找到具有指定类名的元素');
        }
        

      }
    }

  }, 400);
  var userAgent = navigator.userAgent.toLowerCase();

  // setInterval(()=>{
  //   const videoWrapper = document.getElementsByClassName('bpx-player-video-wrap')
  //   const video = videoWrapper[0].querySelector('video')


  //   if (video) {
  //     chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  //       // 在这里处理标签页信息
  //     });
  //     window.postMessage({
  //       data: {
  //         currentTime: video.currentTime
  //       }, type: 'setCurrentTime'
  //     }, 'https://www.bilibili.com')
  //     console.log(video.currentTime);

  //   }
  // }, 500)


  return;


  function initPageDOM(targetElement: HTMLElement | null): boolean {
    const root = document.createElement('div');
    console.log('正在创建元素');
    
    console.log(targetElement);
    
    root.id = 'tcbk-extension-panel-view-root';
    targetElement.insertAdjacentElement('beforebegin', root);
    createRoot(root).render(<Panel />);

    return true;
  }
}

main();
