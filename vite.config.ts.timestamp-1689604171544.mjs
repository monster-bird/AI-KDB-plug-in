// vite.config.ts
import react from "@vitejs/plugin-react";
import path3, { resolve as resolve3 } from "path";
import { defineConfig } from "vite";

// package.json
var package_default = {
  private: true,
  name: "tcbk-chrome-extension",
  version: "1.3.2",
  description: "Bilibili \u89C6\u9891\u603B\u7ED3\u63D2\u4EF6~",
  packageManager: ">=pnpm@7.0.0",
  scripts: {
    build: "vite build",
    "build:watch": "cross-env __DEV__=true vite build --watch",
    "build:hmr": "rollup --config utils/reload/rollup.config.ts",
    wss: "node utils/reload/initReloadServer.js",
    dev: "npm run build:hmr && (run-p wss build:watch)",
    test: "jest"
  },
  type: "module",
  dependencies: {
    "@ant-design/icons": "^5.0.1",
    ahooks: "^3.7.6",
    antd: "^5.4.0",
    axios: "^1.3.4",
    clsx: "^1.2.1",
    "emoji-regex": "^10.2.1",
    immer: "^9.0.21",
    jszip: "^3.10.1",
    nanoid: "^4.0.2",
    "query-string": "^8.1.0",
    react: "18.2.0",
    "react-dom": "18.2.0",
    twind: "^0.16.19",
    "webextension-polyfill": "^0.10.0",
    zustand: "^4.3.7"
  },
  devDependencies: {
    "@emotion/babel-plugin": "^11.10.6",
    "@emotion/react": "^11.10.6",
    "@rollup/plugin-typescript": "^8.5.0",
    "@styled/typescript-styled-plugin": "^1.0.0",
    "@testing-library/react": "13.4.0",
    "@twind/typescript-plugin": "^0.3.5",
    "@types/chrome": "0.0.224",
    "@types/jest": "29.0.3",
    "@types/lodash": "^4.14.195",
    "@types/node": "18.15.11",
    "@types/react": "18.0.21",
    "@types/react-dom": "18.0.11",
    "@types/webextension-polyfill": "^0.10.0",
    "@types/ws": "^8.5.3",
    "@typescript-eslint/eslint-plugin": "5.56.0",
    "@typescript-eslint/parser": "5.38.1",
    "@vitejs/plugin-react": "2.2.0",
    chokidar: "^3.5.3",
    "cross-env": "^7.0.3",
    eslint: "8.36.0",
    "eslint-config-prettier": "^8.5.0",
    "eslint-plugin-prettier": "4.2.1",
    "eslint-plugin-simple-import-sort": "^10.0.0",
    "fs-extra": "11.1.0",
    jest: "29.0.3",
    "jest-environment-jsdom": "29.5.0",
    "npm-run-all": "^4.1.5",
    prettier: "^2.8.7",
    rollup: "2.79.1",
    sass: "1.55.0",
    "ts-jest": "29.0.2",
    "ts-loader": "9.4.2",
    "ts-toolbelt": "^9.6.0",
    "type-fest": "^3.7.2",
    typescript: "4.9.3",
    vite: "3.1.3",
    ws: "8.9.0"
  }
};

// manifest.ts
var isDev = process.env.__DEV__ === "true";
var manifest = {
  manifest_version: 3,
  name: isDev ? "\u592A\u957F\u4E0D\u770B - \u5F00\u53D1\u7248" : "AI\u8BFE\u4EE3\u8868\uFF1A\u89C6\u9891\u603B\u7ED3 \u5B57\u5E55\u5217\u8868",
  version: "1.4.0",
  description: package_default.description,
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module"
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: "logo.png"
  },
  icons: {
    "128": "logo-128.png",
    "34": "logo-34.png",
    "16": "logo-16.png"
  },
  content_scripts: [
    {
      matches: ["https://www.bilibili.com/video/*", "https://kedaibiao.pro/*", "http://localhost:3000/*", "https://www.kedaibiao.pro/*"],
      js: ["src/pages/content/index.js"],
      css: []
    }
  ],
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/js/*.js.map",
        "assets/css/*.css",
        "src/pages/injectScript/index.js",
        "logo.png"
      ],
      matches: ["*://*/*", "<all_urls>"]
    }
  ],
  permissions: ["background", "storage"]
};
var manifest_default = manifest;

// utils/plugins/add-hmr.ts
import { readFileSync } from "fs";
import * as path from "path";
var __vite_injected_original_dirname = "E:\\GitProjects\\AI-KDB-plug-in\\utils\\plugins";
var isDev2 = process.env.__DEV__ === "true";
var DUMMY_CODE = `export default function(){};`;
function getInjectionCode(fileName) {
  return readFileSync(path.resolve(__vite_injected_original_dirname, "..", "reload", "injections", fileName), {
    encoding: "utf8"
  });
}
function addHmr(config) {
  const { background = false, view = true } = config || {};
  const idInBackgroundScript = "virtual:reload-on-update-in-background-script";
  const idInView = "virtual:reload-on-update-in-view";
  const scriptHmrCode = isDev2 ? getInjectionCode("script.js") : DUMMY_CODE;
  const viewHmrCode = isDev2 ? getInjectionCode("view.js") : DUMMY_CODE;
  return {
    name: "add-hmr",
    resolveId(id) {
      if (id === idInBackgroundScript || id === idInView) {
        return getResolvedId(id);
      }
    },
    load(id) {
      if (id === getResolvedId(idInBackgroundScript)) {
        return background ? scriptHmrCode : DUMMY_CODE;
      }
      if (id === getResolvedId(idInView)) {
        return view ? viewHmrCode : DUMMY_CODE;
      }
    }
  };
}
function getResolvedId(id) {
  return "\0" + id;
}

// utils/plugins/custom-dynamic-import.ts
function customDynamicImport() {
  return {
    name: "custom-dynamic-import",
    renderDynamicImport() {
      return {
        left: `
        {
          const dynamicImport = (path) => import(path);
          dynamicImport(
          `,
        right: ")}"
      };
    }
  };
}

// utils/plugins/make-manifest.ts
import * as fs from "fs";
import * as path2 from "path";

// utils/log.ts
function colorLog(message, type) {
  let color = type || COLORS.FgBlack;
  switch (type) {
    case "success":
      color = COLORS.FgGreen;
      break;
    case "info":
      color = COLORS.FgBlue;
      break;
    case "error":
      color = COLORS.FgRed;
      break;
    case "warning":
      color = COLORS.FgYellow;
      break;
  }
  console.log(color, message);
}
var COLORS = {
  Reset: "\x1B[0m",
  Bright: "\x1B[1m",
  Dim: "\x1B[2m",
  Underscore: "\x1B[4m",
  Blink: "\x1B[5m",
  Reverse: "\x1B[7m",
  Hidden: "\x1B[8m",
  FgBlack: "\x1B[30m",
  FgRed: "\x1B[31m",
  FgGreen: "\x1B[32m",
  FgYellow: "\x1B[33m",
  FgBlue: "\x1B[34m",
  FgMagenta: "\x1B[35m",
  FgCyan: "\x1B[36m",
  FgWhite: "\x1B[37m",
  BgBlack: "\x1B[40m",
  BgRed: "\x1B[41m",
  BgGreen: "\x1B[42m",
  BgYellow: "\x1B[43m",
  BgBlue: "\x1B[44m",
  BgMagenta: "\x1B[45m",
  BgCyan: "\x1B[46m",
  BgWhite: "\x1B[47m"
};

// utils/manifest-parser/index.ts
var ManifestParser = class {
  constructor() {
  }
  static convertManifestToString(manifest2) {
    return JSON.stringify(manifest2, null, 2);
  }
};
var manifest_parser_default = ManifestParser;

// utils/plugins/make-manifest.ts
var __vite_injected_original_dirname2 = "E:\\GitProjects\\AI-KDB-plug-in\\utils\\plugins";
var { resolve: resolve2 } = path2;
var distDir = resolve2(__vite_injected_original_dirname2, "..", "..", "dist");
var publicDir = resolve2(__vite_injected_original_dirname2, "..", "..", "public");
function makeManifest(manifest2, config) {
  function makeManifest2(to) {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to);
    }
    const manifestPath = resolve2(to, "manifest.json");
    if (config.contentScriptCssKey) {
      manifest2.content_scripts.forEach((script) => {
        script.css = script.css.map(
          (css) => css.replace("<KEY>", config.contentScriptCssKey)
        );
      });
    }
    fs.writeFileSync(manifestPath, manifest_parser_default.convertManifestToString(manifest2));
    colorLog(`Manifest file copy complete: ${manifestPath}`, "success");
  }
  return {
    name: "make-manifest",
    buildStart() {
      if (config.isDev) {
        makeManifest2(distDir);
      }
    },
    buildEnd() {
      if (config.isDev) {
        return;
      }
      makeManifest2(publicDir);
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname3 = "E:\\GitProjects\\AI-KDB-plug-in";
var root = resolve3(__vite_injected_original_dirname3, "src");
var pagesDir = resolve3(root, "pages");
var assetsDir = resolve3(root, "assets");
var outDir = resolve3(__vite_injected_original_dirname3, "dist");
var publicDir2 = resolve3(__vite_injected_original_dirname3, "public");
var isDev3 = process.env.__DEV__ === "true";
var isProduction = !isDev3;
var enableHmrInBackgroundScript = true;
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@src": root,
      "@assets": assetsDir,
      "@pages": pagesDir
    }
  },
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"]
      }
    }),
    makeManifest(manifest_default, {
      isDev: isDev3,
      contentScriptCssKey: regenerateCacheInvalidationKey()
    }),
    customDynamicImport(),
    addHmr({ background: enableHmrInBackgroundScript, view: true })
  ],
  publicDir: publicDir2,
  build: {
    outDir,
    assetsInlineLimit: 4096e3,
    minify: isProduction,
    reportCompressedSize: isProduction,
    rollupOptions: {
      input: {
        content: resolve3(pagesDir, "content", "index.ts"),
        background: resolve3(pagesDir, "background", "index.ts"),
        popup: resolve3(pagesDir, "popup", "index.html"),
        injectScript: resolve3(pagesDir, "content", "inject", "script.ts")
      },
      watch: {
        include: ["src/**", "vite.config.ts", "package.json", "manifest.ts"],
        exclude: ["node_modules/**", "src/**/*.spec.ts"]
      },
      output: {
        entryFileNames: "src/pages/[name]/index.js",
        chunkFileNames: isDev3 ? "assets/js/[name].js" : "assets/js/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          const { dir, name: _name } = path3.parse(assetInfo.name);
          const assetFolder = dir.split("/").at(-1);
          const name = assetFolder + firstUpperCase(_name);
          if (name === "contentStyle") {
            return `assets/css/contentStyle${cacheInvalidationKey}.chunk.css`;
          }
          return `assets/[ext]/${name}.chunk.[ext]`;
        }
      }
    }
  }
});
function firstUpperCase(str) {
  const firstAlphabet = new RegExp(/( |^)[a-z]/, "g");
  return str.toLowerCase().replace(firstAlphabet, (L) => L.toUpperCase());
}
var cacheInvalidationKey = generateKey();
function regenerateCacheInvalidationKey() {
  cacheInvalidationKey = generateKey();
  return cacheInvalidationKey;
}
function generateKey() {
  return `${(Date.now() / 100).toFixed()}`;
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QudHMiLCAidXRpbHMvcGx1Z2lucy9hZGQtaG1yLnRzIiwgInV0aWxzL3BsdWdpbnMvY3VzdG9tLWR5bmFtaWMtaW1wb3J0LnRzIiwgInV0aWxzL3BsdWdpbnMvbWFrZS1tYW5pZmVzdC50cyIsICJ1dGlscy9sb2cudHMiLCAidXRpbHMvbWFuaWZlc3QtcGFyc2VyL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXEdpdFByb2plY3RzXFxcXEFJLUtEQi1wbHVnLWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9HaXRQcm9qZWN0cy9BSS1LREItcGx1Zy1pbi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBwYXRoLCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcblxyXG5pbXBvcnQgbWFuaWZlc3QgZnJvbSAnLi9tYW5pZmVzdCc7XHJcbmltcG9ydCBhZGRIbXIgZnJvbSAnLi91dGlscy9wbHVnaW5zL2FkZC1obXInO1xyXG5pbXBvcnQgY3VzdG9tRHluYW1pY0ltcG9ydCBmcm9tICcuL3V0aWxzL3BsdWdpbnMvY3VzdG9tLWR5bmFtaWMtaW1wb3J0JztcclxuaW1wb3J0IG1ha2VNYW5pZmVzdCBmcm9tICcuL3V0aWxzL3BsdWdpbnMvbWFrZS1tYW5pZmVzdCc7XHJcblxyXG5jb25zdCByb290ID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKTtcclxuY29uc3QgcGFnZXNEaXIgPSByZXNvbHZlKHJvb3QsICdwYWdlcycpO1xyXG5jb25zdCBhc3NldHNEaXIgPSByZXNvbHZlKHJvb3QsICdhc3NldHMnKTtcclxuY29uc3Qgb3V0RGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0Jyk7XHJcbmNvbnN0IHB1YmxpY0RpciA9IHJlc29sdmUoX19kaXJuYW1lLCAncHVibGljJyk7XHJcblxyXG5jb25zdCBpc0RldiA9IHByb2Nlc3MuZW52Ll9fREVWX18gPT09ICd0cnVlJztcclxuY29uc3QgaXNQcm9kdWN0aW9uID0gIWlzRGV2O1xyXG5cclxuLy8gRU5BQkxFIEhNUiBJTiBCQUNLR1JPVU5EIFNDUklQVFxyXG5jb25zdCBlbmFibGVIbXJJbkJhY2tncm91bmRTY3JpcHQgPSB0cnVlO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQHNyYyc6IHJvb3QsXHJcbiAgICAgICdAYXNzZXRzJzogYXNzZXRzRGlyLFxyXG4gICAgICAnQHBhZ2VzJzogcGFnZXNEaXJcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCh7XHJcbiAgICAgIGpzeEltcG9ydFNvdXJjZTogJ0BlbW90aW9uL3JlYWN0JyxcclxuICAgICAgYmFiZWw6IHtcclxuICAgICAgICBwbHVnaW5zOiBbJ0BlbW90aW9uL2JhYmVsLXBsdWdpbiddXHJcbiAgICAgIH1cclxuICAgIH0pLFxyXG4gICAgbWFrZU1hbmlmZXN0KG1hbmlmZXN0LCB7XHJcbiAgICAgIGlzRGV2LFxyXG4gICAgICBjb250ZW50U2NyaXB0Q3NzS2V5OiByZWdlbmVyYXRlQ2FjaGVJbnZhbGlkYXRpb25LZXkoKVxyXG4gICAgfSksXHJcbiAgICBjdXN0b21EeW5hbWljSW1wb3J0KCksXHJcbiAgICBhZGRIbXIoeyBiYWNrZ3JvdW5kOiBlbmFibGVIbXJJbkJhY2tncm91bmRTY3JpcHQsIHZpZXc6IHRydWUgfSlcclxuICBdLFxyXG4gIHB1YmxpY0RpcixcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyLFxyXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDQwOTYwMDAsXHJcbiAgICAvKiogQ2FuIHNsb3dEb3duIGJ1aWxkIHNwZWVkLiAqL1xyXG4gICAgLy8gc291cmNlbWFwOiBpc0RldixcclxuICAgIG1pbmlmeTogaXNQcm9kdWN0aW9uLFxyXG4gICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IGlzUHJvZHVjdGlvbixcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgaW5wdXQ6IHtcclxuICAgICAgICBjb250ZW50OiByZXNvbHZlKHBhZ2VzRGlyLCAnY29udGVudCcsICdpbmRleC50cycpLFxyXG4gICAgICAgIGJhY2tncm91bmQ6IHJlc29sdmUocGFnZXNEaXIsICdiYWNrZ3JvdW5kJywgJ2luZGV4LnRzJyksXHJcbiAgICAgICAgcG9wdXA6IHJlc29sdmUocGFnZXNEaXIsICdwb3B1cCcsICdpbmRleC5odG1sJyksXHJcbiAgICAgICAgaW5qZWN0U2NyaXB0OiByZXNvbHZlKHBhZ2VzRGlyLCAnY29udGVudCcsICdpbmplY3QnLCAnc2NyaXB0LnRzJylcclxuICAgICAgfSxcclxuICAgICAgd2F0Y2g6IHtcclxuICAgICAgICBpbmNsdWRlOiBbJ3NyYy8qKicsICd2aXRlLmNvbmZpZy50cycsICdwYWNrYWdlLmpzb24nLCAnbWFuaWZlc3QudHMnXSxcclxuICAgICAgICBleGNsdWRlOiBbJ25vZGVfbW9kdWxlcy8qKicsICdzcmMvKiovKi5zcGVjLnRzJ11cclxuICAgICAgfSxcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdzcmMvcGFnZXMvW25hbWVdL2luZGV4LmpzJyxcclxuICAgICAgICBjaHVua0ZpbGVOYW1lczogaXNEZXYgPyAnYXNzZXRzL2pzL1tuYW1lXS5qcycgOiAnYXNzZXRzL2pzL1tuYW1lXS5baGFzaF0uanMnLFxyXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiBhc3NldEluZm8gPT4ge1xyXG4gICAgICAgICAgY29uc3QgeyBkaXIsIG5hbWU6IF9uYW1lIH0gPSBwYXRoLnBhcnNlKGFzc2V0SW5mby5uYW1lISk7XHJcbiAgICAgICAgICBjb25zdCBhc3NldEZvbGRlciA9IGRpci5zcGxpdCgnLycpLmF0KC0xKTtcclxuICAgICAgICAgIGNvbnN0IG5hbWUgPSBhc3NldEZvbGRlciArIGZpcnN0VXBwZXJDYXNlKF9uYW1lKTtcclxuXHJcbiAgICAgICAgICBpZiAobmFtZSA9PT0gJ2NvbnRlbnRTdHlsZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvY3NzL2NvbnRlbnRTdHlsZSR7Y2FjaGVJbnZhbGlkYXRpb25LZXl9LmNodW5rLmNzc2A7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGBhc3NldHMvW2V4dF0vJHtuYW1lfS5jaHVuay5bZXh0XWA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGZpcnN0VXBwZXJDYXNlKHN0cjogc3RyaW5nKSB7XHJcbiAgY29uc3QgZmlyc3RBbHBoYWJldCA9IG5ldyBSZWdFeHAoLyggfF4pW2Etel0vLCAnZycpO1xyXG5cclxuICByZXR1cm4gc3RyLnRvTG93ZXJDYXNlKCkucmVwbGFjZShmaXJzdEFscGhhYmV0LCBMID0+IEwudG9VcHBlckNhc2UoKSk7XHJcbn1cclxuXHJcbmxldCBjYWNoZUludmFsaWRhdGlvbktleTogc3RyaW5nID0gZ2VuZXJhdGVLZXkoKTtcclxuXHJcbmZ1bmN0aW9uIHJlZ2VuZXJhdGVDYWNoZUludmFsaWRhdGlvbktleSgpIHtcclxuICBjYWNoZUludmFsaWRhdGlvbktleSA9IGdlbmVyYXRlS2V5KCk7XHJcblxyXG4gIHJldHVybiBjYWNoZUludmFsaWRhdGlvbktleTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2VuZXJhdGVLZXkoKTogc3RyaW5nIHtcclxuICByZXR1cm4gYCR7KERhdGUubm93KCkgLyAxMDApLnRvRml4ZWQoKX1gO1xyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXEdpdFByb2plY3RzXFxcXEFJLUtEQi1wbHVnLWluXFxcXG1hbmlmZXN0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9HaXRQcm9qZWN0cy9BSS1LREItcGx1Zy1pbi9tYW5pZmVzdC50c1wiO2ltcG9ydCBwYWNrYWdlSnNvbiBmcm9tICcuL3BhY2thZ2UuanNvbic7XHJcblxyXG5jb25zdCBpc0RldiA9IHByb2Nlc3MuZW52Ll9fREVWX18gPT09ICd0cnVlJztcclxuXHJcbi8qKlxyXG4gKiBBZnRlciBjaGFuZ2luZywgcGxlYXNlIHJlbG9hZCB0aGUgZXh0ZW5zaW9uIGF0IGBjaHJvbWU6Ly9leHRlbnNpb25zYFxyXG4gKi9cclxuY29uc3QgbWFuaWZlc3Q6IGNocm9tZS5ydW50aW1lLk1hbmlmZXN0VjMgPSB7XHJcbiAgbWFuaWZlc3RfdmVyc2lvbjogMyxcclxuICBuYW1lOiBpc0RldiA/ICdcdTU5MkFcdTk1N0ZcdTRFMERcdTc3MEIgLSBcdTVGMDBcdTUzRDFcdTcyNDgnIDogJ0FJXHU4QkZFXHU0RUUzXHU4ODY4XHVGRjFBXHU4OUM2XHU5ODkxXHU2MDNCXHU3RUQzIFx1NUI1N1x1NUU1NVx1NTIxN1x1ODg2OCcsXHJcbiAgdmVyc2lvbjogJzEuNC4wJyxcclxuICBkZXNjcmlwdGlvbjogcGFja2FnZUpzb24uZGVzY3JpcHRpb24sXHJcbiAgYmFja2dyb3VuZDoge1xyXG4gICAgc2VydmljZV93b3JrZXI6ICdzcmMvcGFnZXMvYmFja2dyb3VuZC9pbmRleC5qcycsXHJcbiAgICB0eXBlOiAnbW9kdWxlJ1xyXG4gIH0sXHJcbiAgYWN0aW9uOiB7XHJcbiAgICBkZWZhdWx0X3BvcHVwOiAnc3JjL3BhZ2VzL3BvcHVwL2luZGV4Lmh0bWwnLFxyXG4gICAgZGVmYXVsdF9pY29uOiAnbG9nby5wbmcnXHJcbiAgfSxcclxuICBpY29uczoge1xyXG4gICAgJzEyOCc6ICdsb2dvLTEyOC5wbmcnLFxyXG4gICAgJzM0JzogJ2xvZ28tMzQucG5nJyxcclxuICAgICcxNic6ICdsb2dvLTE2LnBuZydcclxuICB9LFxyXG4gIC8vIG9hdXRoMjoge1xyXG4gIC8vIGNsaWVudF9pZDogJzYwMDM5OTk3OTEwMC1ubmc2Y2txa3ZnNTU2cWxnaHJtZTRqaTh2MDVmbmc1bC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbScsXHJcbiAgLy8gc2NvcGVzOiBbJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvdXNlcmluZm8ucHJvZmlsZSddXHJcbiAgLy8gfSxcclxuICBjb250ZW50X3NjcmlwdHM6IFtcclxuICAgIHtcclxuICAgICAgbWF0Y2hlczogWydodHRwczovL3d3dy5iaWxpYmlsaS5jb20vdmlkZW8vKicsICdodHRwczovL2tlZGFpYmlhby5wcm8vKicsJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC8qJywnaHR0cHM6Ly93d3cua2VkYWliaWFvLnByby8qJ10sXHJcbiAgICAgIC8vIG1hdGNoZXM6IFsnPGFsbF91cmxzPiddLFxyXG4gICAgICBqczogWydzcmMvcGFnZXMvY29udGVudC9pbmRleC5qcyddLFxyXG4gICAgICAvLyBLRVkgZm9yIGNhY2hlIGludmFsaWRhdGlvblxyXG4gICAgICAvLyBjc3M6IFsnYXNzZXRzL2Nzcy9jb250ZW50U3R5bGU8S0VZPi5jaGp1bmsuY3NzJ11cclxuICAgICAgY3NzOiBbXVxyXG4gICAgfVxyXG4gIF0sXHJcbiAgd2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzOiBbXHJcbiAgICB7XHJcbiAgICAgIHJlc291cmNlczogW1xyXG4gICAgICAgICdhc3NldHMvanMvKi5qcycsXHJcbiAgICAgICAgJ2Fzc2V0cy9qcy8qLmpzLm1hcCcsXHJcbiAgICAgICAgJ2Fzc2V0cy9jc3MvKi5jc3MnLFxyXG4gICAgICAgICdzcmMvcGFnZXMvaW5qZWN0U2NyaXB0L2luZGV4LmpzJyxcclxuICAgICAgICAnbG9nby5wbmcnXHJcbiAgICAgICAgLy8gJ2ljb24tMTI4LnBuZycsXHJcbiAgICAgICAgLy8gJ2ljb24tMzQucG5nJ1xyXG4gICAgICBdLFxyXG4gICAgICBtYXRjaGVzOiBbJyo6Ly8qLyonLCAnPGFsbF91cmxzPiddXHJcbiAgICB9XHJcbiAgXSxcclxuICBwZXJtaXNzaW9uczogWydiYWNrZ3JvdW5kJywgJ3N0b3JhZ2UnXVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgbWFuaWZlc3Q7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cXFxcdXRpbHNcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cXFxcdXRpbHNcXFxccGx1Z2luc1xcXFxhZGQtaG1yLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9HaXRQcm9qZWN0cy9BSS1LREItcGx1Zy1pbi91dGlscy9wbHVnaW5zL2FkZC1obXIudHNcIjtpbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB0eXBlIHsgUGx1Z2luT3B0aW9uIH0gZnJvbSAndml0ZSc7XHJcblxyXG5jb25zdCBpc0RldiA9IHByb2Nlc3MuZW52Ll9fREVWX18gPT09ICd0cnVlJztcclxuXHJcbmNvbnN0IERVTU1ZX0NPREUgPSBgZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKXt9O2A7XHJcblxyXG5mdW5jdGlvbiBnZXRJbmplY3Rpb25Db2RlKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiByZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJ3JlbG9hZCcsICdpbmplY3Rpb25zJywgZmlsZU5hbWUpLCB7XHJcbiAgICBlbmNvZGluZzogJ3V0ZjgnXHJcbiAgfSk7XHJcbn1cclxuXHJcbnR5cGUgQ29uZmlnID0ge1xyXG4gIGJhY2tncm91bmQ/OiBib29sZWFuO1xyXG4gIHZpZXc/OiBib29sZWFuO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYWRkSG1yKGNvbmZpZz86IENvbmZpZyk6IFBsdWdpbk9wdGlvbiB7XHJcbiAgY29uc3QgeyBiYWNrZ3JvdW5kID0gZmFsc2UsIHZpZXcgPSB0cnVlIH0gPSBjb25maWcgfHwge307XHJcbiAgY29uc3QgaWRJbkJhY2tncm91bmRTY3JpcHQgPSAndmlydHVhbDpyZWxvYWQtb24tdXBkYXRlLWluLWJhY2tncm91bmQtc2NyaXB0JztcclxuICBjb25zdCBpZEluVmlldyA9ICd2aXJ0dWFsOnJlbG9hZC1vbi11cGRhdGUtaW4tdmlldyc7XHJcblxyXG4gIGNvbnN0IHNjcmlwdEhtckNvZGUgPSBpc0RldiA/IGdldEluamVjdGlvbkNvZGUoJ3NjcmlwdC5qcycpIDogRFVNTVlfQ09ERTtcclxuICBjb25zdCB2aWV3SG1yQ29kZSA9IGlzRGV2ID8gZ2V0SW5qZWN0aW9uQ29kZSgndmlldy5qcycpIDogRFVNTVlfQ09ERTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdhZGQtaG1yJyxcclxuICAgIHJlc29sdmVJZChpZCkge1xyXG4gICAgICBpZiAoaWQgPT09IGlkSW5CYWNrZ3JvdW5kU2NyaXB0IHx8IGlkID09PSBpZEluVmlldykge1xyXG4gICAgICAgIHJldHVybiBnZXRSZXNvbHZlZElkKGlkKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGxvYWQoaWQpIHtcclxuICAgICAgaWYgKGlkID09PSBnZXRSZXNvbHZlZElkKGlkSW5CYWNrZ3JvdW5kU2NyaXB0KSkge1xyXG4gICAgICAgIHJldHVybiBiYWNrZ3JvdW5kID8gc2NyaXB0SG1yQ29kZSA6IERVTU1ZX0NPREU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpZCA9PT0gZ2V0UmVzb2x2ZWRJZChpZEluVmlldykpIHtcclxuICAgICAgICByZXR1cm4gdmlldyA/IHZpZXdIbXJDb2RlIDogRFVNTVlfQ09ERTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJlc29sdmVkSWQoaWQ6IHN0cmluZykge1xyXG4gIHJldHVybiAnXFwwJyArIGlkO1xyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cXFxcdXRpbHNcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cXFxcdXRpbHNcXFxccGx1Z2luc1xcXFxjdXN0b20tZHluYW1pYy1pbXBvcnQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L0dpdFByb2plY3RzL0FJLUtEQi1wbHVnLWluL3V0aWxzL3BsdWdpbnMvY3VzdG9tLWR5bmFtaWMtaW1wb3J0LnRzXCI7aW1wb3J0IHR5cGUgeyBQbHVnaW5PcHRpb24gfSBmcm9tICd2aXRlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGN1c3RvbUR5bmFtaWNJbXBvcnQoKTogUGx1Z2luT3B0aW9uIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogJ2N1c3RvbS1keW5hbWljLWltcG9ydCcsXHJcbiAgICByZW5kZXJEeW5hbWljSW1wb3J0KCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGxlZnQ6IGBcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjb25zdCBkeW5hbWljSW1wb3J0ID0gKHBhdGgpID0+IGltcG9ydChwYXRoKTtcclxuICAgICAgICAgIGR5bmFtaWNJbXBvcnQoXHJcbiAgICAgICAgICBgLFxyXG4gICAgICAgIHJpZ2h0OiAnKX0nXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfTtcclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXEdpdFByb2plY3RzXFxcXEFJLUtEQi1wbHVnLWluXFxcXHV0aWxzXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXEdpdFByb2plY3RzXFxcXEFJLUtEQi1wbHVnLWluXFxcXHV0aWxzXFxcXHBsdWdpbnNcXFxcbWFrZS1tYW5pZmVzdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovR2l0UHJvamVjdHMvQUktS0RCLXBsdWctaW4vdXRpbHMvcGx1Z2lucy9tYWtlLW1hbmlmZXN0LnRzXCI7aW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgdHlwZSB7IFBsdWdpbk9wdGlvbiB9IGZyb20gJ3ZpdGUnO1xyXG5cclxuaW1wb3J0IGNvbG9yTG9nIGZyb20gJy4uL2xvZyc7XHJcbmltcG9ydCBNYW5pZmVzdFBhcnNlciBmcm9tICcuLi9tYW5pZmVzdC1wYXJzZXInO1xyXG5cclxuY29uc3QgeyByZXNvbHZlIH0gPSBwYXRoO1xyXG5cclxuY29uc3QgZGlzdERpciA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAnZGlzdCcpO1xyXG5jb25zdCBwdWJsaWNEaXIgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJy4uJywgJ3B1YmxpYycpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWFrZU1hbmlmZXN0KFxyXG4gIG1hbmlmZXN0OiBjaHJvbWUucnVudGltZS5NYW5pZmVzdFYzLFxyXG4gIGNvbmZpZzogeyBpc0RldjogYm9vbGVhbjsgY29udGVudFNjcmlwdENzc0tleT86IHN0cmluZyB9XHJcbik6IFBsdWdpbk9wdGlvbiB7XHJcbiAgZnVuY3Rpb24gbWFrZU1hbmlmZXN0KHRvOiBzdHJpbmcpIHtcclxuICAgIGlmICghZnMuZXhpc3RzU3luYyh0bykpIHtcclxuICAgICAgZnMubWtkaXJTeW5jKHRvKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtYW5pZmVzdFBhdGggPSByZXNvbHZlKHRvLCAnbWFuaWZlc3QuanNvbicpO1xyXG5cclxuICAgIC8vIE5hbWluZyBjaGFuZ2UgZm9yIGNhY2hlIGludmFsaWRhdGlvblxyXG4gICAgaWYgKGNvbmZpZy5jb250ZW50U2NyaXB0Q3NzS2V5KSB7XHJcbiAgICAgIG1hbmlmZXN0LmNvbnRlbnRfc2NyaXB0cy5mb3JFYWNoKHNjcmlwdCA9PiB7XHJcbiAgICAgICAgc2NyaXB0LmNzcyA9IHNjcmlwdC5jc3MubWFwKGNzcyA9PlxyXG4gICAgICAgICAgY3NzLnJlcGxhY2UoJzxLRVk+JywgY29uZmlnLmNvbnRlbnRTY3JpcHRDc3NLZXkpXHJcbiAgICAgICAgKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnMud3JpdGVGaWxlU3luYyhtYW5pZmVzdFBhdGgsIE1hbmlmZXN0UGFyc2VyLmNvbnZlcnRNYW5pZmVzdFRvU3RyaW5nKG1hbmlmZXN0KSk7XHJcblxyXG4gICAgY29sb3JMb2coYE1hbmlmZXN0IGZpbGUgY29weSBjb21wbGV0ZTogJHttYW5pZmVzdFBhdGh9YCwgJ3N1Y2Nlc3MnKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnbWFrZS1tYW5pZmVzdCcsXHJcbiAgICBidWlsZFN0YXJ0KCkge1xyXG4gICAgICBpZiAoY29uZmlnLmlzRGV2KSB7XHJcbiAgICAgICAgbWFrZU1hbmlmZXN0KGRpc3REaXIpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgYnVpbGRFbmQoKSB7XHJcbiAgICAgIGlmIChjb25maWcuaXNEZXYpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG1ha2VNYW5pZmVzdChwdWJsaWNEaXIpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxHaXRQcm9qZWN0c1xcXFxBSS1LREItcGx1Zy1pblxcXFx1dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cXFxcdXRpbHNcXFxcbG9nLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9HaXRQcm9qZWN0cy9BSS1LREItcGx1Zy1pbi91dGlscy9sb2cudHNcIjt0eXBlIENvbG9yVHlwZSA9ICdzdWNjZXNzJyB8ICdpbmZvJyB8ICdlcnJvcicgfCAnd2FybmluZycgfCBrZXlvZiB0eXBlb2YgQ09MT1JTO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29sb3JMb2cobWVzc2FnZTogc3RyaW5nLCB0eXBlPzogQ29sb3JUeXBlKSB7XHJcbiAgbGV0IGNvbG9yOiBzdHJpbmcgPSB0eXBlIHx8IENPTE9SUy5GZ0JsYWNrO1xyXG5cclxuICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgIGNhc2UgJ3N1Y2Nlc3MnOlxyXG4gICAgICBjb2xvciA9IENPTE9SUy5GZ0dyZWVuO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ2luZm8nOlxyXG4gICAgICBjb2xvciA9IENPTE9SUy5GZ0JsdWU7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnZXJyb3InOlxyXG4gICAgICBjb2xvciA9IENPTE9SUy5GZ1JlZDtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICd3YXJuaW5nJzpcclxuICAgICAgY29sb3IgPSBDT0xPUlMuRmdZZWxsb3c7XHJcbiAgICAgIGJyZWFrO1xyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coY29sb3IsIG1lc3NhZ2UpO1xyXG59XHJcblxyXG5jb25zdCBDT0xPUlMgPSB7XHJcbiAgUmVzZXQ6ICdcXHgxYlswbScsXHJcbiAgQnJpZ2h0OiAnXFx4MWJbMW0nLFxyXG4gIERpbTogJ1xceDFiWzJtJyxcclxuICBVbmRlcnNjb3JlOiAnXFx4MWJbNG0nLFxyXG4gIEJsaW5rOiAnXFx4MWJbNW0nLFxyXG4gIFJldmVyc2U6ICdcXHgxYls3bScsXHJcbiAgSGlkZGVuOiAnXFx4MWJbOG0nLFxyXG4gIEZnQmxhY2s6ICdcXHgxYlszMG0nLFxyXG4gIEZnUmVkOiAnXFx4MWJbMzFtJyxcclxuICBGZ0dyZWVuOiAnXFx4MWJbMzJtJyxcclxuICBGZ1llbGxvdzogJ1xceDFiWzMzbScsXHJcbiAgRmdCbHVlOiAnXFx4MWJbMzRtJyxcclxuICBGZ01hZ2VudGE6ICdcXHgxYlszNW0nLFxyXG4gIEZnQ3lhbjogJ1xceDFiWzM2bScsXHJcbiAgRmdXaGl0ZTogJ1xceDFiWzM3bScsXHJcbiAgQmdCbGFjazogJ1xceDFiWzQwbScsXHJcbiAgQmdSZWQ6ICdcXHgxYls0MW0nLFxyXG4gIEJnR3JlZW46ICdcXHgxYls0Mm0nLFxyXG4gIEJnWWVsbG93OiAnXFx4MWJbNDNtJyxcclxuICBCZ0JsdWU6ICdcXHgxYls0NG0nLFxyXG4gIEJnTWFnZW50YTogJ1xceDFiWzQ1bScsXHJcbiAgQmdDeWFuOiAnXFx4MWJbNDZtJyxcclxuICBCZ1doaXRlOiAnXFx4MWJbNDdtJ1xyXG59IGFzIGNvbnN0O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXEdpdFByb2plY3RzXFxcXEFJLUtEQi1wbHVnLWluXFxcXHV0aWxzXFxcXG1hbmlmZXN0LXBhcnNlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cXFxcdXRpbHNcXFxcbWFuaWZlc3QtcGFyc2VyXFxcXGluZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9HaXRQcm9qZWN0cy9BSS1LREItcGx1Zy1pbi91dGlscy9tYW5pZmVzdC1wYXJzZXIvaW5kZXgudHNcIjt0eXBlIE1hbmlmZXN0ID0gY2hyb21lLnJ1bnRpbWUuTWFuaWZlc3RWMztcclxuXHJcbmNsYXNzIE1hbmlmZXN0UGFyc2VyIHtcclxuICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgc3RhdGljIGNvbnZlcnRNYW5pZmVzdFRvU3RyaW5nKG1hbmlmZXN0OiBNYW5pZmVzdCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobWFuaWZlc3QsIG51bGwsIDIpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTWFuaWZlc3RQYXJzZXI7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1EsT0FBTyxXQUFXO0FBQ2pTLE9BQU9BLFNBQVEsV0FBQUMsZ0JBQWU7QUFDOUIsU0FBUyxvQkFBb0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDQTdCLElBQU0sUUFBUSxRQUFRLElBQUksWUFBWTtBQUt0QyxJQUFNLFdBQXNDO0FBQUEsRUFDMUMsa0JBQWtCO0FBQUEsRUFDbEIsTUFBTSxRQUFRLGtEQUFlO0FBQUEsRUFDN0IsU0FBUztBQUFBLEVBQ1QsYUFB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QU0sS0FBSyxDQUFDO0FBQUEsRUFDaEU7QUFBQSxFQUNBLFdBQUFEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTDtBQUFBLElBQ0EsbUJBQW1CO0FBQUEsSUFHbkIsUUFBUTtBQUFBLElBQ1Isc0JBQXNCO0FBQUEsSUFDdEIsZUFBZTtBQUFBLE1BQ2IsT0FBTztBQUFBLFFBQ0wsU0FBU0YsU0FBUSxVQUFVLFdBQVcsVUFBVTtBQUFBLFFBQ2hELFlBQVlBLFNBQVEsVUFBVSxjQUFjLFVBQVU7QUFBQSxRQUN0RCxPQUFPQSxTQUFRLFVBQVUsU0FBUyxZQUFZO0FBQUEsUUFDOUMsY0FBY0EsU0FBUSxVQUFVLFdBQVcsVUFBVSxXQUFXO0FBQUEsTUFDbEU7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNMLFNBQVMsQ0FBQyxVQUFVLGtCQUFrQixnQkFBZ0IsYUFBYTtBQUFBLFFBQ25FLFNBQVMsQ0FBQyxtQkFBbUIsa0JBQWtCO0FBQUEsTUFDakQ7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQkcsU0FBUSx3QkFBd0I7QUFBQSxRQUNoRCxnQkFBZ0IsZUFBYTtBQUMzQixnQkFBTSxFQUFFLEtBQUssTUFBTSxNQUFNLElBQUlDLE1BQUssTUFBTSxVQUFVLElBQUs7QUFDdkQsZ0JBQU0sY0FBYyxJQUFJLE1BQU0sR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUN4QyxnQkFBTSxPQUFPLGNBQWMsZUFBZSxLQUFLO0FBRS9DLGNBQUksU0FBUyxnQkFBZ0I7QUFDM0IsbUJBQU8sMEJBQTBCO0FBQUEsVUFDbkM7QUFFQSxpQkFBTyxnQkFBZ0I7QUFBQSxRQUN6QjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7QUFFRCxTQUFTLGVBQWUsS0FBYTtBQUNuQyxRQUFNLGdCQUFnQixJQUFJLE9BQU8sY0FBYyxHQUFHO0FBRWxELFNBQU8sSUFBSSxZQUFZLEVBQUUsUUFBUSxlQUFlLE9BQUssRUFBRSxZQUFZLENBQUM7QUFDdEU7QUFFQSxJQUFJLHVCQUErQixZQUFZO0FBRS9DLFNBQVMsaUNBQWlDO0FBQ3hDLHlCQUF1QixZQUFZO0FBRW5DLFNBQU87QUFDVDtBQUVBLFNBQVMsY0FBc0I7QUFDN0IsU0FBTyxJQUFJLEtBQUssSUFBSSxJQUFJLEtBQUssUUFBUTtBQUN2QzsiLAogICJuYW1lcyI6IFsicGF0aCIsICJyZXNvbHZlIiwgImlzRGV2IiwgInBhdGgiLCAibWFuaWZlc3QiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiLCAicmVzb2x2ZSIsICJwYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIiwgIm1hbmlmZXN0IiwgIm1ha2VNYW5pZmVzdCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSIsICJyZXNvbHZlIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIiwgInB1YmxpY0RpciIsICJpc0RldiIsICJwYXRoIl0KfQo=
