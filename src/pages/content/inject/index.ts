import Browser from 'webextension-polyfill';

const script = document.createElement('script');
const css = `
.desc .ant-form-item-label label{
    padding-left: 10px !important;
  }
  .ant-form-item {
    margin-bottom: 12px;
  }
  .ant-switch{
    background-color: #ecb0c1;
  }
  .ant-tabs-nav {
    margin: 0 !important;
  }
`;

const styleTag = document.createElement('style');
styleTag.innerHTML = css;
document.head.appendChild(styleTag);
script.src = Browser.runtime.getURL('src/pages/injectScript/index.js');
script.type = 'module';
document.head.prepend(script);
