import Browser from 'webextension-polyfill';

const script = document.createElement('script');

script.src = Browser.runtime.getURL('src/pages/injectScript/index.js');
script.type = 'module';
document.head.prepend(script);
