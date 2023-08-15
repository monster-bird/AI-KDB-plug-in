import Browser from "webextension-polyfill";

const script = document.createElement("script");
const css = `
pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}.hljs{color:#383a42;background:#fafafa}.hljs-comment,.hljs-quote{color:#a0a1a7;font-style:italic}.hljs-doctag,.hljs-formula,.hljs-keyword{color:#a626a4}.hljs-deletion,.hljs-name,.hljs-section,.hljs-selector-tag,.hljs-subst{color:#e45649}.hljs-literal{color:#0184bb}.hljs-addition,.hljs-attribute,.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#50a14f}.hljs-attr,.hljs-number,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-pseudo,.hljs-template-variable,.hljs-type,.hljs-variable{color:#986801}.hljs-bullet,.hljs-link,.hljs-meta,.hljs-selector-id,.hljs-symbol,.hljs-title{color:#4078f2}.hljs-built_in,.hljs-class .hljs-title,.hljs-title.class_{color:#c18401}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}.hljs-link{text-decoration:underline}
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
    padding: 0 !important;
    width: 55px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: none !important;
    border-left: 1px solid #f0f0f0 !important;
    border-top: 1px solid #f0f0f0 !important;
    height: 100%;
    z-index: 999 !important;
    border-right: 1px solid #f0f0f0 !important;
  }
  .ant-tabs-nav::before {
    background-color: #fff !important;  
  }
  .ant-tabs-tab {
    height: 100% !important;
  }
  .ant-tabs-ink-bar {
    display: none !important;
  }
  .tarbar {
    height: 100%;
  }
  .ant-tabs-tab:first-child{
    border-right:none !important;
  }
  .ant-tabs-nav {
    height: 100%; 
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
  .color-blue {
    color: #008AC5;
  }
  .ant-btn-icon {
    margin-top: 0.25rem !important;
  }
  .ant-tabs-nav-wrap::before{
    display: none !important;;
  }
  .ant-tabs-nav-wrap::after {
    display: none !important;;
  }
  .text-tag{
    color: #5973c8;
    bottom: 5px;
    font-weight: 700;
    border-radius: 3px;
    font-size: 10px;
    position: relative;
    cursor: pointer;
    background: #d0d7ef;
    box-sizing: border-box;
    padding-left: 4px;
    padding-right: 4px;
    margin-left:2px;
  }
  .tag-box {
    display: flex;
    padding-bottom: 10px;
    padding-top: 10px;
    flex-wrap: wrap;
  }
  .time-tag{
    margin-left: 10px;
    padding-left: 5px;
    padding-right: 5px;
    background: #d0d7ef;
    color: #5973c8;

    font-weight: 500;
    cursor: pointer;
    border-radius: 3px;

  }
  .ref-tag {
    color: #5973c8;
    bottom: 5px;
    font-weight: 700;
    border-radius: 3px;
    font-size: 10px;
    position: relative;
    cursor: pointer;
    background: #d0d7ef;
    box-sizing: border-box;
    padding-left: 4px;
    padding-right: 4px;
    margin-left:2px;

  }
  .ant-btn-primary {
    background-color: #00aeec !important;
  }
  .blockquote {
    padding: 10px;
    margin: 10px 0;
    border-left: 5px solid #f1f1f1;
    color: #666;
    font-style: italic;
  }
  .markdown-container {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 8px;
  }
  
  .markdown-container h1, .markdown-container h2, .markdown-container h3 {
    color: #333366;
    border-bottom: 1px solid #ccc;
    padding-bottom: 8px;
  }
  
  .markdown-container h1 {
    font-size: 1.75em;
  }
  
  .markdown-container h2 {
    font-size: 1.5em;
  }
  
  .markdown-container h3 {
    font-size: 1.25em;
  }
  
  .markdown-container p:not(:last-of-type) {

    margin-bottom: 1em;
}

  
  .markdown-container a {
    color: #0073e6;
    text-decoration: none;
  }
  
  .markdown-container a:hover {
    text-decoration: underline;
  }
  
  .markdown-container code {
    background-color: #f0f0f0;
    border-radius: 3px;
    padding: 2px 4px;
  }
  
  .markdown-container pre {
    border-radius: 5px;
    overflow-x: auto;
    flex-direction: column;
    display: flex;
  }
  
  .markdown-container blockquote {
    border-left: 3px solid #777;
    padding-left: 15px;
    font-style: italic;
  }
  
  .markdown-container img {
    max-width: 100%;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
  }
  .markdown-container ol {
    list-style-type: decimal;
  }
  .markdown-container ol {
    list-style-type: decimal;
  }

  .markdown-container ul {
    list-style-type:   disc;
  }
  .markdown-container ul, .markdown-container ol {
    margin-left: 20px;
    margin-bottom: 1em;
  }
  
  .markdown-container table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .markdown-container th, .markdown-container td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  
  .markdown-container th {
    background-color: #f5f5f5;
    text-align: left;
  }
  .markdown-container .button-container {
    display: flex;
    padding-left: 10px;
    padding-right: 5px;
    justify-content: space-between;
    background-color: #c8ccce;
    align-items: center;
    border-top-right-radius: 6px;
    border-top-left-radius: 6px;
  }
  .markdown-container .copy-button {
    right: 10px;
    top: 10px;
    padding: 5px 10px;
    cursor: pointer;
    color: #333333;
    border: none;
    border-radius: 3px;
    display: flex;
    align-items: center;
    background-color: #c8ccce;
    font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    gap:6px;
  }
  
  .markdown-container .copy-button:hover {
    background: #dddddd;
  }
  
  .markdown-container pre {
    position: relative;
    overflow-x: auto;
  }
  
  .result-streaming>:not(ol):not(ul):not(pre):last-child:after, .result-streaming>ol:last-child li:last-child:after, .result-streaming>pre:last-child code:after, .result-streaming>ul:last-child li:last-child:after {
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
  .prepare_stream:after{
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
  .ant-btn-primary:disabled {
    background-color: rgba(0, 0, 0, 0.04) !important;
  }
  .svg-container{
    display: flex;
    align-items: center;
  }
`;

const styleTag = document.createElement("style");
styleTag.innerHTML = css;
document.head.appendChild(styleTag);
script.src = Browser.runtime.getURL("src/pages/injectScript/index.js");
script.type = "module";
document.head.prepend(script);
