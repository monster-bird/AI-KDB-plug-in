import { twindSetup } from '@src/pages/common/libs/twind';
import { createRoot } from 'react-dom/client';
import MyLoginBox from './MyLoginBox';
import React from 'react';
// import refreshOnUpdate from 'virtual:reload-on-update-in-view';
// refreshOnUpdate('pages/content');

function main() {

  twindSetup();
  console.log('version: 2.0.1');

  const timer = setInterval(() => {
    const initComplete = document.querySelectorAll('.no-login-text') !== null;
    console.log('正在查找元素');
    
    if (initComplete) {
        
      if (initPageDOM(document.querySelectorAll('.no-login-text'))) {
        clearInterval(timer);
      }
    }
  }, 1000);

  return;
  function replaceElements(targetElements: NodeListOf<Element> | null, newElement: HTMLDivElement) {
    targetElements.forEach(targetElement => {
      const parentElement = targetElement.parentNode;
      parentElement.replaceChild(newElement, targetElement);
    });
  }
  function initPageDOM(targetElement: NodeListOf<Element> | null): boolean {
    const root = document.createElement('div');
    root.className = 'no-login-text';
    replaceElements(targetElement, root);
    createRoot(root).render(React.createElement(MyLoginBox));

    return true;
  }

}

main();
