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
:where(.css-w8mnev).ant-checkbox+span {
  padding-inline-end: 0 !important;
  }
  .m-header {
    border-bottom: 1px solid #f0f0f0;
  }
  .m-header .tarbar {
  }
  .ant-switch:hover {
    background: #ecb0c1 !important;
    
  }
  .ant-switch-checked:hover {
    background: #1677ff !important;

  }
  .ant-tabs-tab-active {
    
  }
  .ant-tabs-tab {
    margin: 0 !important;
    border-radius: 0 !important;
    padding: 11px 16px !important;
    border-bottom: none !important;
    border-left: 1px solid #f0f0f0 !important;
    border-top: 1px solid #f0f0f0 !important;
    border-right: 1px solid #f0f0f0 !important;
  }
  .ant-tabs-tab:first-child{
    border-right:none !important;
  }
  @keyframes blink {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  
  .cursor-after::after {
    content: '';
    display: inline-block;
    width: 5px;
    height: 22px;
    background-color: #303030;
    margin-left: 0.2em;
    animation: blink .5s infinite;
    position: absolute;
    align-items: center;
  }
  .mh-3 {
    min-height: 30px;
  }
`;

const styleTag = document.createElement('style');
styleTag.innerHTML = css;
document.head.appendChild(styleTag);
script.src = Browser.runtime.getURL('src/pages/injectScript/index.js');
script.type = 'module';
document.head.prepend(script);
