---
date: 2025-05-15 09:43:30
title: webpack构建React<TkTitleTag type="ep-primary" text="构建" position="right" />
permalink: /react/944c8a
categories:
   - React
coverImg: /img/react_ts.jpeg
tags:
 - React构建
---
# webpack 创建React项目

###  1.使用[create-react-app](https://cra.nodejs.cn/) 创建项目

- create-react-app 底层是通过webpack构建的

####          快速开始

```bash [npm]
npx create-react-app my-app
cd my-app
npm start
```

####         创建应用

#####            npx

```bash [npm]
npx create-react-app@latest my-app
```

#####          npm

```bash [npm]
npm init react-app my-app
```

`npm init <initializer>` 在 npm 6+ 中可用

#####           yarn

```bash [yarn]
yarn create react-app my-app
```

##### 创建 TypeScript 应用
::: code-group
```bash [npm]
npx create-react-app my-app --template typescript 

```
```bash[yarn]
yarn create react-app my-app --template typescript
```
:::






