# twind

## 目录

- [twind](#twind)
  - [目录](#目录)
  - [介绍](#介绍)
  - [插件 - (代码提示)](#插件---代码提示)

## 介绍

一个基于 [`TailwindCSS V2`](https://v2.tailwindcss.com/docs) 的原子 CSS 类名库，主要有以下吸引人的特性。

- 可同时在 `JS` 中使用 `CSS、TailwindCSS`

- 比 `TailwindCSS` 更丰富的特性（样式分组等等）

## 插件 - (代码提示)

1. tsserver（typescript 服务）

   通过 `tsserver（typescript 服务）` 来提供 twind 的代码提示（代码感应）。

   已在 `tsconfig.json` 中配置了 twind 的 [`typescript-plugin`](https://github.com/tw-in-js/typescript-plugin)

   - 配置

     > 注意：请在开发时，将 **「TypeScript 版本」** 设置为 **「工作区版本」**，如有其他疑惑请自行进入[仓库](https://github.com/tw-in-js/typescript-plugin)了解

     - `VSCode` 中

       运行 `typescript.selectTypeScriptVersion` 命令，将 `TypeScript` 版本切换至「工作区版本」（node_modules/typescript/lib）

     - `WebStorm` 或其他

       自行摸索配置..

2. VSCode-Plugin

   插件市场搜索 `Twind Intellisense` 后自行安装即可。
