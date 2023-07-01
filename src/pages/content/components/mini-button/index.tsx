import '../../inject';

import { twindSetup } from '@src/pages/common/libs/twind';
import { createRoot } from 'react-dom/client';

import MiniButton from './MiniButton';

// import refreshOnUpdate from 'virtual:reload-on-update-in-view';
// refreshOnUpdate('pages/content');

function main() {
  twindSetup();

  const timer = setInterval(() => {
    const initComplete = document.querySelector('.b-img__inner') !== null;

    if (initComplete) {
      if (
        initPageDOM(document.querySelector('#arc_toolbar_report .video-toolbar-right'))
      ) {
        clearInterval(timer);
      }
    }
  }, 300);

  return;

  function initPageDOM(targetElement: HTMLDivElement | null): boolean {
    if (targetElement === null) return false;

    const root = document.createElement('div');
    root.className = 'mr-2 video-complaint video-toolbar-right-item toolbar-right-complaint';
    root.setAttribute("data-v-67e5402c", "");
    root.setAttribute("data-v-3b7178b8", "");
    root.setAttribute("style", "margin-right: 18px;");

    
    root.addEventListener('click', ()=>{
      window.open('https://taichangbukan.cn')
    })
    targetElement.insertAdjacentElement('afterbegin', root);

    createRoot(root).render(<MiniButton />);

    return true;
  }
}

main();
