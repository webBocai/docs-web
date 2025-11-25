---
date: 2025-09-27 05:53:48
title: 09-开发环境服务器配置
permalink: /webpack/c2a49
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - Webpack 基础
---

## 一、为什么需要搭建本地服务器

在日常开发中，我们需要频繁执行两个操作才能看到代码效果：

1. 运行 `npm run build` 编译代码
2. 通过 `live server` 或浏览器打开 `index.html` 查看效果

这种重复操作严重影响开发效率。理想的开发环境应该能够在文件变化时自动完成编译和展示。

为了实现自动编译，`webpack` 提供了三种解决方案：

1. **`webpack watch mode`** - 适合简单项目的文件监听方案
2. **`webpack-dev-server`** - 最常用的开发服务器，适合大多数前端项目
3. **`webpack-dev-middleware`** - 适合需要高度自定义和全栈开发（SSR）的高级场景

---

## 二、Webpack Watch Mode 文件监听

`webpack` 的 `watch` 模式可以监听文件变化，当文件修改后自动重新构建。

### 1. 命令行方式

直接在终端使用 `watch` 参数：

```bash
# 使用 npx
npx webpack --watch

# 或者使用缩写
npx webpack -w
```

### 2. 配置脚本方式

在 `package.json` 中添加脚本命令：

```json
{
  "scripts": {
    "watch": "webpack --watch",
    "dev": "webpack --watch --mode=development"
  }
}
```

然后运行：

```bash
npm run watch
```

### 3. 配置文件方式

在 `webpack.config.js` 中直接配置：

```js
module.exports = {
  // ... 其他配置
  watch: true,
  watchOptions: {
    // 监听配置选项
  }
};
```

### 4. 详细的 watchOptions 配置

`watchOptions` 提供了丰富的配置项来控制监听行为：

```js
module.exports = {
  watch: true,
  watchOptions: {
    // 忽略监听的文件或文件夹
    ignored: /node_modules/,
    
    // 轮询间隔时间（单位：毫秒）
    poll: 1000,
    
    // 聚合时间（将多个更改聚合到一次重构建）
    aggregateTimeout: 300,
    
    // 设置轮询的系统文件数量限制
    followSymlinks: false
  }
};
```

::: warning 注意
`watch mode` 本身**没有自动刷新浏览器的功能**。虽然可以配合 VSCode 的 `live-server` 插件使用，但这不是最佳实践。如果需要实时重新加载（`live reloading`）功能，建议使用 `webpack-dev-server`。
:::

---

## 三、Webpack Dev Server 开发服务器

### 1. 安装和基础配置

安装 `webpack-dev-server`：

```bash
npm install webpack-dev-server -D
```

在 `webpack.config.js` 中添加配置：

```js
module.exports = {
  // ... 其他配置
  devServer: {
    // 开发服务器配置
  }
};
```

在 `package.json` 中配置启动脚本：

```json
{
  "scripts": {
    "dev": "webpack serve --config ./webpack.config.js"
  }
}
```

### 2. 内存编译机制

`webpack-dev-server` 在编译后**不会输出任何文件**，而是将打包后的 `bundle` 文件**保留在内存中**。这是通过使用 `memfs`（memory-fs，webpack 自己开发的内存文件系统）库实现的，可以显著提升构建速度。

---

## 四、模块热替换（HMR）

### 1. 什么是 HMR

`HMR` 的全称是 `Hot Module Replacement`，即**模块热替换**。它可以在应用程序运行过程中，替换、添加、删除模块，而无需重新刷新整个页面，只更新变更内容，从而节省宝贵的开发时间。

`HMR` 的核心优势：

**保留应用状态** - 不重新加载整个页面，可以保留某些应用程序的状态不丢失

**快速更新** - 只更新需要变化的内容，节省开发时间

**即时反馈** - 修改 CSS、JS 源代码后，立即在浏览器更新，相当于直接在浏览器的 `devtools` 中修改样式

### 2. 启用 HMR

从 `webpack-dev-server v4` 开始，**HMR 默认启用**。但你也可以显式配置：

```js
module.exports = {
  devServer: {
    hot: true
  }
};
```

浏览器控制台会显示 HMR 相关信息：

![HMR 启用效果](https://picx.zhimg.com/80/v2-b945bd287ad002297a62aed31589c652_1020w.png)

### 3. 配置模块热更新

虽然 `HMR` 已启用，但默认情况下修改代码仍会刷新整个页面。需要手动指定哪些模块启用热更新。

首先创建测试文件 `utils/index.js`：

```js
console.log('测试');
```

然后在 `src/index.js` 中配置热更新逻辑：

```js
import './utils/index';

if (module.hot) {
  module.hot.accept('./utils/index.js', () => {
    console.log('热更新');
  });
}
```

::: danger 重要提示
引入模块时**不要解构使用其中的内容**，否则会导致全局刷新。

```js
// ❌ 错误示例
import { a } from './utils/index';

// ✅ 正确示例
import './utils/index';
```

:::

### 4. HMR 高级配置

#### hot 配置项的三种值

```js
module.exports = {
  devServer: {
    hot: true  // 或 false 或 'only'
  }
};
```

**`hot: true`** - 先尝试热更新，失败后自动刷新整个页面

**`hot: 'only'`** - 只进行热更新，失败也不刷新页面

**`hot: false`** - 完全关闭 HMR，总是刷新整个页面

#### 构建失败不刷新页面

配合 `liveReload` 选项可以控制构建失败时的行为：

```js
module.exports = {
  devServer: {
    hot: 'only',
    liveReload: false
  }
};
```

设置 `liveReload: false` 后的行为流程：

1. 代码有语法错误，webpack 构建失败，浏览器不会有任何变化，控制台显示错误
2. 修复代码并保存
3. webpack 重新构建成功
4. 由于 `liveReload` 是 `false`，dev-server 不会命令浏览器刷新
5. 需要**手动刷新浏览器**才能看到修复后的效果

::: tip 提示
通常情况下，当 `hot` 开启时，`liveReload` 会自动失效，无需手动关闭。
:::

---

## 五、主机和端口配置

### 1. host 配置

`host` 用于设置主机地址，默认值是 `localhost`。如果希望其他设备也可以访问开发服务器，可以设置为 `0.0.0.0`：

```js
module.exports = {
  devServer: {
    hot: true,
    host: '0.0.0.0'
  }
};
```

#### localhost 和 0.0.0.0 的区别

**`localhost`** - 本质上是一个域名，通常会被解析成 `127.0.0.1`

**`127.0.0.1`** - 回环地址（Loop Back Address），表示主机自己发出的数据包直接被自己接收。当你在浏览器输入 `localhost:8080` 时，最终会被解析成 `127.0.0.1:8080`，然后被本地的 `8080` 端口捕获

**`0.0.0.0`** - 监听 IPv4 上所有的地址，根据端口找到不同的应用程序。监听 `0.0.0.0` 时，同一网段下的其他主机可以通过 IP 地址访问你的开发服务器

### 2. port、open、compress 配置

```js
module.exports = {
  devServer: {
    hot: true,
    host: '0.0.0.0',
    port: 9999,        // 设置监听端口，默认 8080
    open: true,        // 自动打开浏览器，默认 false
    compress: true     // 为静态文件开启 gzip 压缩，默认 false
  }
};
```

配置 `compress: true` 后，可以在浏览器的网络面板中看到响应头包含 `Content-Encoding: gzip`：

![gzip 压缩效果](https://pic1.zhimg.com/80/v2-4fc2890d2ba2bf352c3628ce399bc1d0_1020w.png)

---

## 六、静态资源配置（static）

### 1. 为什么需要 static 配置

有些静态资源（图片、字体文件或 `index.html` 本身）我们不想让 `webpack` 打包处理，但需要提供一个访问路径。

在 `webpack-dev-server 4.x` 版本中，使用 `static` 选项替换了旧的 `contentBase` 选项。

### 2. 前置准备

安装 `html-webpack-plugin` 插件，让开发服务器能够找到 `index.html` 文件：

```bash
npm install html-webpack-plugin -D
```

在项目根目录创建 `index.html`：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello</h1>
</body>
</html>
```

在 `webpack.config.js` 中配置插件：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // ... 其他配置
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
};
```

### 3. static 配置方式

#### 方式一：字符串形式（单个目录）

这是最简单的形式，只指定一个静态资源目录：

```js
module.exports = {
  devServer: {
    static: 'public'  // 默认值就是 'public'
  }
};
```

在 `public` 文件夹下创建两个 JS 文件 `aaa.js` 和 `bbb.js`。

在 `index.html` 中引入：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello</h1>
  <script src="./aaa.js"></script>
  <script src="/bbb.js"></script>
</body>
</html>
```

::: warning 注意
放在 `public` 文件夹下的静态资源，引入时直接访问根路径即可，**不需要加 `public` 前缀**。无论使用绝对路径还是相对路径，只要最终指向根路径并能找到资源即可。
:::

运行 `npm run dev`，效果如下：

![单个目录配置效果](https://picx.zhimg.com/80/v2-d172937900372b39a7ab8b09b23f3adb_1020w.png)

#### 方式二：数组形式（多个目录）

当需要从多个位置提供静态文件时使用：

创建 `content` 文件夹，将 `public` 文件夹中的 `bbb.js` 移动过去。

```js
module.exports = {
  devServer: {
    static: ['public', 'content']
  }
};
```

`index.html` 保持不变：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello</h1>
  <script src="./aaa.js"></script>
  <script src="/bbb.js"></script>
</body>
</html>
```

运行 `npm run dev`，效果如下：

![多个目录配置效果](https://pic1.zhimg.com/80/v2-08205c4f203af8d21d4c39b6fc7ad9fa_1020w.png)

#### 方式三：对象形式（单个目录高级配置）

对单个目录进行更精细的控制：

```js
const path = require('path');

module.exports = {
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),  // 静态资源目录
      publicPath: '/js',                          // 虚拟路径前缀
      watch: true                                 // 监听文件变化，变化时刷新页面
    }
  }
};
```

`publicPath: '/js'` 表示在访问资源时会自动加上 `/js` 前缀。

运行 `npm run dev`，直接访问会报错：

![虚拟路径配置错误](https://pica.zhimg.com/80/v2-d2be56fb694bef45c1b5d09b25fa1059_1020w.png)

修改 `index.html`，在路径中加上 `/js` 前缀：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello</h1>
  <script src="./js/aaa.js"></script>
</body>
</html>
```

这种配置等同于在 `public` 目录下创建 `js` 文件夹并将 `aaa.js` 放进去，然后将 `publicPath` 设置为 `/`：

```js
module.exports = {
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/',
      watch: true
    }
  }
};
```

运行效果：

![虚拟路径配置成功](https://picx.zhimg.com/80/v2-c6e9df7314c1d8f4e940312020485b3a_1020w.png)

#### 方式四：对象数组形式（多个目录高级配置）

这是最灵活的配置方式，可以为多个不同的静态目录应用不同的规则：

```js
const path = require('path');

module.exports = {
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
        watch: true
      },
      {
        directory: path.join(__dirname, 'content'),
        publicPath: '/js',
        watch: true
      }
    ]
  }
};
```

在 `index.html` 中：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello</h1>
  <script src="./js/aaa.js"></script>
  <script src="./js/bbb.js"></script>
</body>
</html>
```

运行效果：

![多个目录高级配置效果](https://picx.zhimg.com/80/v2-b0cc9e367b31146842aa0e217d7f0b7f_1020w.png)

---

## 七、Proxy 代理配置

### 1. 跨域问题场景

在 `index.js` 入口文件中请求百度：

```js
const post = () => {
  fetch('http://www.baidu.com')
    .then((res) => {
      console.log(res);
      return res.text();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
};

post();
```

直接访问会报跨域错误：

![跨域错误](https://pic1.zhimg.com/80/v2-0eaab4dfc889bd4d2fcc16e5d9ef25f7_1020w.png)

### 2. 使用 Proxy 解决跨域

`webpack-dev-server` 的 `proxy` 功能基于 `http-proxy-middleware` 库实现。从 `webpack-dev-server 4.0` 开始使用新的配置方式：

```js
module.exports = {
  devServer: {
    proxy: [
      {
        context: ['/api'],
        target: 'https://www.baidu.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    ]
  }
};
```

修改 `index.js` 中的请求路径：

```js
const post = () => {
  fetch('/api')
    .then((res) => {
      console.log(res);
      return res.text();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
};

post();
```

运行代码，成功获取百度的 HTML 结构：

![代理成功](https://pic1.zhimg.com/80/v2-0f3f0aff1617eae34418a496ac308b39_1020w.png)

### 3. 新旧版本配置对比

在 `webpack-dev-server v3.x` 及更早版本中，配置方式如下：

```js
// v3 写法（旧版本）
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://www.baidu.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      },
      '/auth': {
        target: 'https://www.baidu.com',
        changeOrigin: true,
        pathRewrite: { '^/auth': '' }
      }
    }
  }
};
```

**旧版本的痛点**：如果多个路径的代理规则完全相同，就会产生很多重复的配置代码，不易维护。新版本的数组配置方式通过 `context` 数组可以更优雅地处理这种情况。

---

## 八、History API Fallback 配置

### 1. 问题场景

`historyApiFallback` 是开发中常见的属性，默认值为 `false`。它主要解决 SPA 页面在路由跳转后刷新页面时返回 404 错误的问题。

未配置时刷新页面会出现 404 错误：

![404 错误](https://picx.zhimg.com/80/v2-423ffc2672a47195f772da21b2b847f0_1020w.png)

### 2. 布尔值配置

设置为 `true` 后，刷新页面时如果返回 404 错误，会自动返回 `index.html` 的内容：

```js
module.exports = {
  devServer: {
    historyApiFallback: true
  }
};
```

配置后的效果：

![配置 historyApiFallback 后](https://pic1.zhimg.com/80/v2-78a345bc8ba6a807db72d9da2296b4ab_1020w.png)

### 3. 对象配置

通过配置 `rewrites` 属性，可以更精细地控制不同路径的重定向行为：

```js
module.exports = {
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/about/, to: '/views/index.html' },
        { from: /./, to: '/views/404.html' }
      ]
    }
  }
};
```

这个配置的含义是：

**匹配 `/about` 开头的路径** - 重定向到 `/views/index.html`

**其他所有路径** - 重定向到 `/views/404.html`

---

## 九、更多配置

`webpack-dev-server` 还提供了许多其他实用的配置选项，详情请查看 [官方文档](https://webpack.docschina.org/configuration/dev-server/)。

**完整示例代码**：[GitHub - webpack 配置案例](https://github.com/webBocai/webpack-/tree/main/03_pulgin)