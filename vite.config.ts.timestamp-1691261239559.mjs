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
  name: isDev ? "\u592A\u957F\u4E0D\u770B - \u5F00\u53D1\u7248" : "AI\u8BFE\u4EE3\u8868 - B\u7AD9\u5B66\u4E60\u52A9\u624B, \u89C6\u9891\u603B\u7ED3, \u5B57\u5E55\u5217\u8868, GPT-4",
  version: "1.5.1",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QudHMiLCAidXRpbHMvcGx1Z2lucy9hZGQtaG1yLnRzIiwgInV0aWxzL3BsdWdpbnMvY3VzdG9tLWR5bmFtaWMtaW1wb3J0LnRzIiwgInV0aWxzL3BsdWdpbnMvbWFrZS1tYW5pZmVzdC50cyIsICJ1dGlscy9sb2cudHMiLCAidXRpbHMvbWFuaWZlc3QtcGFyc2VyL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXEdpdFByb2plY3RzXFxcXEFJLUtEQi1wbHVnLWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9HaXRQcm9qZWN0cy9BSS1LREItcGx1Zy1pbi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBwYXRoLCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcblxyXG5pbXBvcnQgbWFuaWZlc3QgZnJvbSAnLi9tYW5pZmVzdCc7XHJcbmltcG9ydCBhZGRIbXIgZnJvbSAnLi91dGlscy9wbHVnaW5zL2FkZC1obXInO1xyXG5pbXBvcnQgY3VzdG9tRHluYW1pY0ltcG9ydCBmcm9tICcuL3V0aWxzL3BsdWdpbnMvY3VzdG9tLWR5bmFtaWMtaW1wb3J0JztcclxuaW1wb3J0IG1ha2VNYW5pZmVzdCBmcm9tICcuL3V0aWxzL3BsdWdpbnMvbWFrZS1tYW5pZmVzdCc7XHJcblxyXG5jb25zdCByb290ID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKTtcclxuY29uc3QgcGFnZXNEaXIgPSByZXNvbHZlKHJvb3QsICdwYWdlcycpO1xyXG5jb25zdCBhc3NldHNEaXIgPSByZXNvbHZlKHJvb3QsICdhc3NldHMnKTtcclxuY29uc3Qgb3V0RGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0Jyk7XHJcbmNvbnN0IHB1YmxpY0RpciA9IHJlc29sdmUoX19kaXJuYW1lLCAncHVibGljJyk7XHJcblxyXG5jb25zdCBpc0RldiA9IHByb2Nlc3MuZW52Ll9fREVWX18gPT09ICd0cnVlJztcclxuY29uc3QgaXNQcm9kdWN0aW9uID0gIWlzRGV2O1xyXG5cclxuLy8gRU5BQkxFIEhNUiBJTiBCQUNLR1JPVU5EIFNDUklQVFxyXG5jb25zdCBlbmFibGVIbXJJbkJhY2tncm91bmRTY3JpcHQgPSB0cnVlO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQHNyYyc6IHJvb3QsXHJcbiAgICAgICdAYXNzZXRzJzogYXNzZXRzRGlyLFxyXG4gICAgICAnQHBhZ2VzJzogcGFnZXNEaXJcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCh7XHJcbiAgICAgIGpzeEltcG9ydFNvdXJjZTogJ0BlbW90aW9uL3JlYWN0JyxcclxuICAgICAgYmFiZWw6IHtcclxuICAgICAgICBwbHVnaW5zOiBbJ0BlbW90aW9uL2JhYmVsLXBsdWdpbiddXHJcbiAgICAgIH1cclxuICAgIH0pLFxyXG4gICAgbWFrZU1hbmlmZXN0KG1hbmlmZXN0LCB7XHJcbiAgICAgIGlzRGV2LFxyXG4gICAgICBjb250ZW50U2NyaXB0Q3NzS2V5OiByZWdlbmVyYXRlQ2FjaGVJbnZhbGlkYXRpb25LZXkoKVxyXG4gICAgfSksXHJcbiAgICBjdXN0b21EeW5hbWljSW1wb3J0KCksXHJcbiAgICBhZGRIbXIoeyBiYWNrZ3JvdW5kOiBlbmFibGVIbXJJbkJhY2tncm91bmRTY3JpcHQsIHZpZXc6IHRydWUgfSlcclxuICBdLFxyXG4gIHB1YmxpY0RpcixcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyLFxyXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDQwOTYwMDAsXHJcbiAgICAvKiogQ2FuIHNsb3dEb3duIGJ1aWxkIHNwZWVkLiAqL1xyXG4gICAgLy8gc291cmNlbWFwOiBpc0RldixcclxuICAgIG1pbmlmeTogaXNQcm9kdWN0aW9uLFxyXG4gICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IGlzUHJvZHVjdGlvbixcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgaW5wdXQ6IHtcclxuICAgICAgICBjb250ZW50OiByZXNvbHZlKHBhZ2VzRGlyLCAnY29udGVudCcsICdpbmRleC50cycpLFxyXG4gICAgICAgIGJhY2tncm91bmQ6IHJlc29sdmUocGFnZXNEaXIsICdiYWNrZ3JvdW5kJywgJ2luZGV4LnRzJyksXHJcbiAgICAgICAgcG9wdXA6IHJlc29sdmUocGFnZXNEaXIsICdwb3B1cCcsICdpbmRleC5odG1sJyksXHJcbiAgICAgICAgaW5qZWN0U2NyaXB0OiByZXNvbHZlKHBhZ2VzRGlyLCAnY29udGVudCcsICdpbmplY3QnLCAnc2NyaXB0LnRzJylcclxuICAgICAgfSxcclxuICAgICAgd2F0Y2g6IHtcclxuICAgICAgICBpbmNsdWRlOiBbJ3NyYy8qKicsICd2aXRlLmNvbmZpZy50cycsICdwYWNrYWdlLmpzb24nLCAnbWFuaWZlc3QudHMnXSxcclxuICAgICAgICBleGNsdWRlOiBbJ25vZGVfbW9kdWxlcy8qKicsICdzcmMvKiovKi5zcGVjLnRzJ11cclxuICAgICAgfSxcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdzcmMvcGFnZXMvW25hbWVdL2luZGV4LmpzJyxcclxuICAgICAgICBjaHVua0ZpbGVOYW1lczogaXNEZXYgPyAnYXNzZXRzL2pzL1tuYW1lXS5qcycgOiAnYXNzZXRzL2pzL1tuYW1lXS5baGFzaF0uanMnLFxyXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiBhc3NldEluZm8gPT4ge1xyXG4gICAgICAgICAgY29uc3QgeyBkaXIsIG5hbWU6IF9uYW1lIH0gPSBwYXRoLnBhcnNlKGFzc2V0SW5mby5uYW1lISk7XHJcbiAgICAgICAgICBjb25zdCBhc3NldEZvbGRlciA9IGRpci5zcGxpdCgnLycpLmF0KC0xKTtcclxuICAgICAgICAgIGNvbnN0IG5hbWUgPSBhc3NldEZvbGRlciArIGZpcnN0VXBwZXJDYXNlKF9uYW1lKTtcclxuXHJcbiAgICAgICAgICBpZiAobmFtZSA9PT0gJ2NvbnRlbnRTdHlsZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvY3NzL2NvbnRlbnRTdHlsZSR7Y2FjaGVJbnZhbGlkYXRpb25LZXl9LmNodW5rLmNzc2A7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGBhc3NldHMvW2V4dF0vJHtuYW1lfS5jaHVuay5bZXh0XWA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGZpcnN0VXBwZXJDYXNlKHN0cjogc3RyaW5nKSB7XHJcbiAgY29uc3QgZmlyc3RBbHBoYWJldCA9IG5ldyBSZWdFeHAoLyggfF4pW2Etel0vLCAnZycpO1xyXG5cclxuICByZXR1cm4gc3RyLnRvTG93ZXJDYXNlKCkucmVwbGFjZShmaXJzdEFscGhhYmV0LCBMID0+IEwudG9VcHBlckNhc2UoKSk7XHJcbn1cclxuXHJcbmxldCBjYWNoZUludmFsaWRhdGlvbktleTogc3RyaW5nID0gZ2VuZXJhdGVLZXkoKTtcclxuXHJcbmZ1bmN0aW9uIHJlZ2VuZXJhdGVDYWNoZUludmFsaWRhdGlvbktleSgpIHtcclxuICBjYWNoZUludmFsaWRhdGlvbktleSA9IGdlbmVyYXRlS2V5KCk7XHJcblxyXG4gIHJldHVybiBjYWNoZUludmFsaWRhdGlvbktleTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2VuZXJhdGVLZXkoKTogc3RyaW5nIHtcclxuICByZXR1cm4gYCR7KERhdGUubm93KCkgLyAxMDApLnRvRml4ZWQoKX1gO1xyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXEdpdFByb2plY3RzXFxcXEFJLUtEQi1wbHVnLWluXFxcXG1hbmlmZXN0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9HaXRQcm9qZWN0cy9BSS1LREItcGx1Zy1pbi9tYW5pZmVzdC50c1wiO2ltcG9ydCBwYWNrYWdlSnNvbiBmcm9tICcuL3BhY2thZ2UuanNvbic7XHJcblxyXG5jb25zdCBpc0RldiA9IHByb2Nlc3MuZW52Ll9fREVWX18gPT09ICd0cnVlJztcclxuXHJcbi8qKlxyXG4gKiBBZnRlciBjaGFuZ2luZywgcGxlYXNlIHJlbG9hZCB0aGUgZXh0ZW5zaW9uIGF0IGBjaHJvbWU6Ly9leHRlbnNpb25zYFxyXG4gKi9cclxuY29uc3QgbWFuaWZlc3Q6IGNocm9tZS5ydW50aW1lLk1hbmlmZXN0VjMgPSB7XHJcbiAgbWFuaWZlc3RfdmVyc2lvbjogMyxcclxuICBuYW1lOiBpc0RldiA/ICdcdTU5MkFcdTk1N0ZcdTRFMERcdTc3MEIgLSBcdTVGMDBcdTUzRDFcdTcyNDgnIDogJ0FJXHU4QkZFXHU0RUUzXHU4ODY4IC0gQlx1N0FEOVx1NUI2Nlx1NEU2MFx1NTJBOVx1NjI0QiwgXHU4OUM2XHU5ODkxXHU2MDNCXHU3RUQzLCBcdTVCNTdcdTVFNTVcdTUyMTdcdTg4NjgsIEdQVC00JyxcclxuICB2ZXJzaW9uOiAnMS41LjEnLFxyXG4gIGRlc2NyaXB0aW9uOiBwYWNrYWdlSnNvbi5kZXNjcmlwdGlvbixcclxuICBiYWNrZ3JvdW5kOiB7XHJcbiAgICBzZXJ2aWNlX3dvcmtlcjogJ3NyYy9wYWdlcy9iYWNrZ3JvdW5kL2luZGV4LmpzJyxcclxuICAgIHR5cGU6ICdtb2R1bGUnXHJcbiAgfSxcclxuICBhY3Rpb246IHtcclxuICAgIGRlZmF1bHRfcG9wdXA6ICdzcmMvcGFnZXMvcG9wdXAvaW5kZXguaHRtbCcsXHJcbiAgICBkZWZhdWx0X2ljb246ICdsb2dvLnBuZydcclxuICB9LFxyXG4gIGljb25zOiB7XHJcbiAgICAnMTI4JzogJ2xvZ28tMTI4LnBuZycsXHJcbiAgICAnMzQnOiAnbG9nby0zNC5wbmcnLFxyXG4gICAgJzE2JzogJ2xvZ28tMTYucG5nJ1xyXG4gIH0sXHJcbiAgLy8gb2F1dGgyOiB7XHJcbiAgLy8gY2xpZW50X2lkOiAnNjAwMzk5OTc5MTAwLW5uZzZja3Frdmc1NTZxbGdocm1lNGppOHYwNWZuZzVsLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tJyxcclxuICAvLyBzY29wZXM6IFsnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC91c2VyaW5mby5wcm9maWxlJ11cclxuICAvLyB9LFxyXG4gIGNvbnRlbnRfc2NyaXB0czogW1xyXG4gICAge1xyXG4gICAgICBtYXRjaGVzOiBbJ2h0dHBzOi8vd3d3LmJpbGliaWxpLmNvbS92aWRlby8qJywgJ2h0dHBzOi8va2VkYWliaWFvLnByby8qJywnaHR0cDovL2xvY2FsaG9zdDozMDAwLyonLCdodHRwczovL3d3dy5rZWRhaWJpYW8ucHJvLyonXSxcclxuICAgICAgLy8gbWF0Y2hlczogWyc8YWxsX3VybHM+J10sXHJcbiAgICAgIGpzOiBbJ3NyYy9wYWdlcy9jb250ZW50L2luZGV4LmpzJ10sXHJcbiAgICAgIC8vIEtFWSBmb3IgY2FjaGUgaW52YWxpZGF0aW9uXHJcbiAgICAgIC8vIGNzczogWydhc3NldHMvY3NzL2NvbnRlbnRTdHlsZTxLRVk+LmNoanVuay5jc3MnXVxyXG4gICAgICBjc3M6IFtdXHJcbiAgICB9XHJcbiAgXSxcclxuICB3ZWJfYWNjZXNzaWJsZV9yZXNvdXJjZXM6IFtcclxuICAgIHtcclxuICAgICAgcmVzb3VyY2VzOiBbXHJcbiAgICAgICAgJ2Fzc2V0cy9qcy8qLmpzJyxcclxuICAgICAgICAnYXNzZXRzL2pzLyouanMubWFwJyxcclxuICAgICAgICAnYXNzZXRzL2Nzcy8qLmNzcycsXHJcbiAgICAgICAgJ3NyYy9wYWdlcy9pbmplY3RTY3JpcHQvaW5kZXguanMnLFxyXG4gICAgICAgICdsb2dvLnBuZydcclxuICAgICAgICAvLyAnaWNvbi0xMjgucG5nJyxcclxuICAgICAgICAvLyAnaWNvbi0zNC5wbmcnXHJcbiAgICAgIF0sXHJcbiAgICAgIG1hdGNoZXM6IFsnKjovLyovKicsICc8YWxsX3VybHM+J11cclxuICAgIH1cclxuICBdLFxyXG4gIHBlcm1pc3Npb25zOiBbJ2JhY2tncm91bmQnLCAnc3RvcmFnZSddXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBtYW5pZmVzdDtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxHaXRQcm9qZWN0c1xcXFxBSS1LREItcGx1Zy1pblxcXFx1dGlsc1xcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxHaXRQcm9qZWN0c1xcXFxBSS1LREItcGx1Zy1pblxcXFx1dGlsc1xcXFxwbHVnaW5zXFxcXGFkZC1obXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L0dpdFByb2plY3RzL0FJLUtEQi1wbHVnLWluL3V0aWxzL3BsdWdpbnMvYWRkLWhtci50c1wiO2ltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHR5cGUgeyBQbHVnaW5PcHRpb24gfSBmcm9tICd2aXRlJztcclxuXHJcbmNvbnN0IGlzRGV2ID0gcHJvY2Vzcy5lbnYuX19ERVZfXyA9PT0gJ3RydWUnO1xyXG5cclxuY29uc3QgRFVNTVlfQ09ERSA9IGBleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpe307YDtcclxuXHJcbmZ1bmN0aW9uIGdldEluamVjdGlvbkNvZGUoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nLCAncmVsb2FkJywgJ2luamVjdGlvbnMnLCBmaWxlTmFtZSksIHtcclxuICAgIGVuY29kaW5nOiAndXRmOCdcclxuICB9KTtcclxufVxyXG5cclxudHlwZSBDb25maWcgPSB7XHJcbiAgYmFja2dyb3VuZD86IGJvb2xlYW47XHJcbiAgdmlldz86IGJvb2xlYW47XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhZGRIbXIoY29uZmlnPzogQ29uZmlnKTogUGx1Z2luT3B0aW9uIHtcclxuICBjb25zdCB7IGJhY2tncm91bmQgPSBmYWxzZSwgdmlldyA9IHRydWUgfSA9IGNvbmZpZyB8fCB7fTtcclxuICBjb25zdCBpZEluQmFja2dyb3VuZFNjcmlwdCA9ICd2aXJ0dWFsOnJlbG9hZC1vbi11cGRhdGUtaW4tYmFja2dyb3VuZC1zY3JpcHQnO1xyXG4gIGNvbnN0IGlkSW5WaWV3ID0gJ3ZpcnR1YWw6cmVsb2FkLW9uLXVwZGF0ZS1pbi12aWV3JztcclxuXHJcbiAgY29uc3Qgc2NyaXB0SG1yQ29kZSA9IGlzRGV2ID8gZ2V0SW5qZWN0aW9uQ29kZSgnc2NyaXB0LmpzJykgOiBEVU1NWV9DT0RFO1xyXG4gIGNvbnN0IHZpZXdIbXJDb2RlID0gaXNEZXYgPyBnZXRJbmplY3Rpb25Db2RlKCd2aWV3LmpzJykgOiBEVU1NWV9DT0RFO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogJ2FkZC1obXInLFxyXG4gICAgcmVzb2x2ZUlkKGlkKSB7XHJcbiAgICAgIGlmIChpZCA9PT0gaWRJbkJhY2tncm91bmRTY3JpcHQgfHwgaWQgPT09IGlkSW5WaWV3KSB7XHJcbiAgICAgICAgcmV0dXJuIGdldFJlc29sdmVkSWQoaWQpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgbG9hZChpZCkge1xyXG4gICAgICBpZiAoaWQgPT09IGdldFJlc29sdmVkSWQoaWRJbkJhY2tncm91bmRTY3JpcHQpKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhY2tncm91bmQgPyBzY3JpcHRIbXJDb2RlIDogRFVNTVlfQ09ERTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGlkID09PSBnZXRSZXNvbHZlZElkKGlkSW5WaWV3KSkge1xyXG4gICAgICAgIHJldHVybiB2aWV3ID8gdmlld0htckNvZGUgOiBEVU1NWV9DT0RFO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UmVzb2x2ZWRJZChpZDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuICdcXDAnICsgaWQ7XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxHaXRQcm9qZWN0c1xcXFxBSS1LREItcGx1Zy1pblxcXFx1dGlsc1xcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxHaXRQcm9qZWN0c1xcXFxBSS1LREItcGx1Zy1pblxcXFx1dGlsc1xcXFxwbHVnaW5zXFxcXGN1c3RvbS1keW5hbWljLWltcG9ydC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovR2l0UHJvamVjdHMvQUktS0RCLXBsdWctaW4vdXRpbHMvcGx1Z2lucy9jdXN0b20tZHluYW1pYy1pbXBvcnQudHNcIjtpbXBvcnQgdHlwZSB7IFBsdWdpbk9wdGlvbiB9IGZyb20gJ3ZpdGUnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3VzdG9tRHluYW1pY0ltcG9ydCgpOiBQbHVnaW5PcHRpb24ge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnY3VzdG9tLWR5bmFtaWMtaW1wb3J0JyxcclxuICAgIHJlbmRlckR5bmFtaWNJbXBvcnQoKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgbGVmdDogYFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNvbnN0IGR5bmFtaWNJbXBvcnQgPSAocGF0aCkgPT4gaW1wb3J0KHBhdGgpO1xyXG4gICAgICAgICAgZHluYW1pY0ltcG9ydChcclxuICAgICAgICAgIGAsXHJcbiAgICAgICAgcmlnaHQ6ICcpfSdcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9O1xyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cXFxcdXRpbHNcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cXFxcdXRpbHNcXFxccGx1Z2luc1xcXFxtYWtlLW1hbmlmZXN0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9HaXRQcm9qZWN0cy9BSS1LREItcGx1Zy1pbi91dGlscy9wbHVnaW5zL21ha2UtbWFuaWZlc3QudHNcIjtpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB0eXBlIHsgUGx1Z2luT3B0aW9uIH0gZnJvbSAndml0ZSc7XHJcblxyXG5pbXBvcnQgY29sb3JMb2cgZnJvbSAnLi4vbG9nJztcclxuaW1wb3J0IE1hbmlmZXN0UGFyc2VyIGZyb20gJy4uL21hbmlmZXN0LXBhcnNlcic7XHJcblxyXG5jb25zdCB7IHJlc29sdmUgfSA9IHBhdGg7XHJcblxyXG5jb25zdCBkaXN0RGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICcuLicsICdkaXN0Jyk7XHJcbmNvbnN0IHB1YmxpY0RpciA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAncHVibGljJyk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYWtlTWFuaWZlc3QoXHJcbiAgbWFuaWZlc3Q6IGNocm9tZS5ydW50aW1lLk1hbmlmZXN0VjMsXHJcbiAgY29uZmlnOiB7IGlzRGV2OiBib29sZWFuOyBjb250ZW50U2NyaXB0Q3NzS2V5Pzogc3RyaW5nIH1cclxuKTogUGx1Z2luT3B0aW9uIHtcclxuICBmdW5jdGlvbiBtYWtlTWFuaWZlc3QodG86IHN0cmluZykge1xyXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHRvKSkge1xyXG4gICAgICBmcy5ta2RpclN5bmModG8pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1hbmlmZXN0UGF0aCA9IHJlc29sdmUodG8sICdtYW5pZmVzdC5qc29uJyk7XHJcblxyXG4gICAgLy8gTmFtaW5nIGNoYW5nZSBmb3IgY2FjaGUgaW52YWxpZGF0aW9uXHJcbiAgICBpZiAoY29uZmlnLmNvbnRlbnRTY3JpcHRDc3NLZXkpIHtcclxuICAgICAgbWFuaWZlc3QuY29udGVudF9zY3JpcHRzLmZvckVhY2goc2NyaXB0ID0+IHtcclxuICAgICAgICBzY3JpcHQuY3NzID0gc2NyaXB0LmNzcy5tYXAoY3NzID0+XHJcbiAgICAgICAgICBjc3MucmVwbGFjZSgnPEtFWT4nLCBjb25maWcuY29udGVudFNjcmlwdENzc0tleSlcclxuICAgICAgICApO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmcy53cml0ZUZpbGVTeW5jKG1hbmlmZXN0UGF0aCwgTWFuaWZlc3RQYXJzZXIuY29udmVydE1hbmlmZXN0VG9TdHJpbmcobWFuaWZlc3QpKTtcclxuXHJcbiAgICBjb2xvckxvZyhgTWFuaWZlc3QgZmlsZSBjb3B5IGNvbXBsZXRlOiAke21hbmlmZXN0UGF0aH1gLCAnc3VjY2VzcycpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdtYWtlLW1hbmlmZXN0JyxcclxuICAgIGJ1aWxkU3RhcnQoKSB7XHJcbiAgICAgIGlmIChjb25maWcuaXNEZXYpIHtcclxuICAgICAgICBtYWtlTWFuaWZlc3QoZGlzdERpcik7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBidWlsZEVuZCgpIHtcclxuICAgICAgaWYgKGNvbmZpZy5pc0Rldikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbWFrZU1hbmlmZXN0KHB1YmxpY0Rpcik7XHJcbiAgICB9XHJcbiAgfTtcclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXEdpdFByb2plY3RzXFxcXEFJLUtEQi1wbHVnLWluXFxcXHV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxHaXRQcm9qZWN0c1xcXFxBSS1LREItcGx1Zy1pblxcXFx1dGlsc1xcXFxsb2cudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L0dpdFByb2plY3RzL0FJLUtEQi1wbHVnLWluL3V0aWxzL2xvZy50c1wiO3R5cGUgQ29sb3JUeXBlID0gJ3N1Y2Nlc3MnIHwgJ2luZm8nIHwgJ2Vycm9yJyB8ICd3YXJuaW5nJyB8IGtleW9mIHR5cGVvZiBDT0xPUlM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb2xvckxvZyhtZXNzYWdlOiBzdHJpbmcsIHR5cGU/OiBDb2xvclR5cGUpIHtcclxuICBsZXQgY29sb3I6IHN0cmluZyA9IHR5cGUgfHwgQ09MT1JTLkZnQmxhY2s7XHJcblxyXG4gIHN3aXRjaCAodHlwZSkge1xyXG4gICAgY2FzZSAnc3VjY2Vzcyc6XHJcbiAgICAgIGNvbG9yID0gQ09MT1JTLkZnR3JlZW47XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnaW5mbyc6XHJcbiAgICAgIGNvbG9yID0gQ09MT1JTLkZnQmx1ZTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICdlcnJvcic6XHJcbiAgICAgIGNvbG9yID0gQ09MT1JTLkZnUmVkO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ3dhcm5pbmcnOlxyXG4gICAgICBjb2xvciA9IENPTE9SUy5GZ1llbGxvdztcclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG5cclxuICBjb25zb2xlLmxvZyhjb2xvciwgbWVzc2FnZSk7XHJcbn1cclxuXHJcbmNvbnN0IENPTE9SUyA9IHtcclxuICBSZXNldDogJ1xceDFiWzBtJyxcclxuICBCcmlnaHQ6ICdcXHgxYlsxbScsXHJcbiAgRGltOiAnXFx4MWJbMm0nLFxyXG4gIFVuZGVyc2NvcmU6ICdcXHgxYls0bScsXHJcbiAgQmxpbms6ICdcXHgxYls1bScsXHJcbiAgUmV2ZXJzZTogJ1xceDFiWzdtJyxcclxuICBIaWRkZW46ICdcXHgxYls4bScsXHJcbiAgRmdCbGFjazogJ1xceDFiWzMwbScsXHJcbiAgRmdSZWQ6ICdcXHgxYlszMW0nLFxyXG4gIEZnR3JlZW46ICdcXHgxYlszMm0nLFxyXG4gIEZnWWVsbG93OiAnXFx4MWJbMzNtJyxcclxuICBGZ0JsdWU6ICdcXHgxYlszNG0nLFxyXG4gIEZnTWFnZW50YTogJ1xceDFiWzM1bScsXHJcbiAgRmdDeWFuOiAnXFx4MWJbMzZtJyxcclxuICBGZ1doaXRlOiAnXFx4MWJbMzdtJyxcclxuICBCZ0JsYWNrOiAnXFx4MWJbNDBtJyxcclxuICBCZ1JlZDogJ1xceDFiWzQxbScsXHJcbiAgQmdHcmVlbjogJ1xceDFiWzQybScsXHJcbiAgQmdZZWxsb3c6ICdcXHgxYls0M20nLFxyXG4gIEJnQmx1ZTogJ1xceDFiWzQ0bScsXHJcbiAgQmdNYWdlbnRhOiAnXFx4MWJbNDVtJyxcclxuICBCZ0N5YW46ICdcXHgxYls0Nm0nLFxyXG4gIEJnV2hpdGU6ICdcXHgxYls0N20nXHJcbn0gYXMgY29uc3Q7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0UHJvamVjdHNcXFxcQUktS0RCLXBsdWctaW5cXFxcdXRpbHNcXFxcbWFuaWZlc3QtcGFyc2VyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxHaXRQcm9qZWN0c1xcXFxBSS1LREItcGx1Zy1pblxcXFx1dGlsc1xcXFxtYW5pZmVzdC1wYXJzZXJcXFxcaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L0dpdFByb2plY3RzL0FJLUtEQi1wbHVnLWluL3V0aWxzL21hbmlmZXN0LXBhcnNlci9pbmRleC50c1wiO3R5cGUgTWFuaWZlc3QgPSBjaHJvbWUucnVudGltZS5NYW5pZmVzdFYzO1xyXG5cclxuY2xhc3MgTWFuaWZlc3RQYXJzZXIge1xyXG4gIHByaXZhdGUgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICBzdGF0aWMgY29udmVydE1hbmlmZXN0VG9TdHJpbmcobWFuaWZlc3Q6IE1hbmlmZXN0KTogc3RyaW5nIHtcclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShtYW5pZmVzdCwgbnVsbCwgMik7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYW5pZmVzdFBhcnNlcjtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErUSxPQUFPLFdBQVc7QUFDalMsT0FBT0EsU0FBUSxXQUFBQyxnQkFBZTtBQUM5QixTQUFTLG9CQUFvQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBN0IsSUFBTSxRQUFRLFFBQVEsSUFBSSxZQUFZO0FBS3RDLElBQU0sV0FBc0M7QUFBQSxFQUMxQyxrQkFBa0I7QUFBQSxFQUNsQixNQUFNLFFB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LFlBQVksQ0FBQztBQUN0RTtBQUVBLElBQUksdUJBQStCLFlBQVk7QUFFL0MsU0FBUyxpQ0FBaUM7QUFDeEMseUJBQXVCLFlBQVk7QUFFbkMsU0FBTztBQUNUO0FBRUEsU0FBUyxjQUFzQjtBQUM3QixTQUFPLElBQUksS0FBSyxJQUFJLElBQUksS0FBSyxRQUFRO0FBQ3ZDOyIsCiAgIm5hbWVzIjogWyJwYXRoIiwgInJlc29sdmUiLCAiaXNEZXYiLCAicGF0aCIsICJtYW5pZmVzdCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSIsICJyZXNvbHZlIiwgInBhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiLCAibWFuaWZlc3QiLCAibWFrZU1hbmlmZXN0IiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIiwgInJlc29sdmUiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiLCAicHVibGljRGlyIiwgImlzRGV2IiwgInBhdGgiXQp9Cg==
