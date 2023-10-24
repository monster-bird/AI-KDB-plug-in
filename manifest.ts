import packageJson from "./package.json";

const isDev = process.env.__DEV__ === "true";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: isDev
    ? "太长不看 - 开发版"
    : "AI课代表 - B站学习助手, 视频总结, 字幕列表, GPT-4",
  version: "1.5.5",
  description: packageJson.description,
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: "logo.png",
  },
  icons: {
    "128": "logo-128.png",
    "34": "logo-34.png",
    "16": "logo-16.png",
  },
  // oauth2: {
  // client_id: '600399979100-nng6ckqkvg556qlghrme4ji8v05fng5l.apps.googleusercontent.com',
  // scopes: ['https://www.googleapis.com/auth/userinfo.profile']
  // },
  content_scripts: [
    {
      matches: [
        "https://www.bilibili.com/video/*",
        "https://www.bilibili.com/list/*",
        "https://kedaibiao.pro/*",
        "http://localhost:3000/*",
        "https://www.kedaibiao.pro/*",
        "https://www.kedaibiao.pro/*",
        "https://www.ixigua.com/*",
        "https://www.youtube.com/watch?v=*",
        "https://www.youtube.com/*"

      ],
      // matches: ['<all_urls>'],
      js: ["src/pages/content/index.js"],
      css: [],

      // KEY for cache invalidation
      // css: ['assets/css/contentStyle<KEY>.chjunk.css']
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/js/*.js.map",
        "assets/css/*.css",
        "src/pages/welcome.html",
        "src/pages/injectScript/index.js",
        "logo.png",
        // 'icon-128.png',
        // 'icon-34.png'
      ],
      matches: ["*://*/*", "<all_urls>"],
    },
  ],
  permissions: ["background", "storage"],
};

export default manifest;
