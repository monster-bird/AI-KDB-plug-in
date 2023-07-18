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
  .m-border {
    border-bottom: 1px solid #f0f0f0;
  }
  .m-border>div {
    transform: translateY(1px);
  }
  .ant-switch:hover {
    background: #ecb0c1 !important;
    
  }
`;

const styleTag = document.createElement('style');
styleTag.innerHTML = css;
document.head.appendChild(styleTag);
script.src = Browser.runtime.getURL('src/pages/injectScript/index.js');
script.type = 'module';
document.head.prepend(script);
