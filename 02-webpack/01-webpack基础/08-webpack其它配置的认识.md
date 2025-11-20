---
date: 2025-09-26 15:53:48
title: 08-其它配置的认识 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/08-webpack其它配置的认识
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - Webpack 基础
---
# Webpack 其它配置的认识

## 一、Plugin

### 1. 认识 Plugin

`Webpack` 的另一个核心是 `Plugin`，它与 `Loader` 有着本质的区别。

**Loader 的特点：**

`Loader` 仅针对文件级别的转换，它的作用是将文件转换为 `Webpack` 可识别的模块，使其能够加入依赖图。但 `Loader` 无法影响 `Webpack` 的整体构建流程。

**Plugin 的特点：**

`Plugin` 功能更强大，能执行更加广泛的任务。它不仅能处理文件，还能修改 `Webpack` 的内部状态，影响输出结果。常见的应用场景包括：打包优化、资源管理、环境变量注入等。

**协作关系：**

`Loader` 和 `Plugin` 并非竞争关系，而是互补的。`Loader` 负责模块转换，`Plugin` 负责流程扩展，两者共同构成 `Webpack` 的生态体系。

---

### 2. CleanWebpackPlugin

#### 插件介绍

在之前的使用过程中，每次修改配置并重新打包时，都需要手动删除打包文件夹。为了自动化这个过程，我们可以使用 `CleanWebpackPlugin` 插件来帮助我们完成清理工作。

#### 安装并配置

首先安装插件：

```bash
npm install clean-webpack-plugin -D
```

然后在 `webpack.config.js` 中配置：

```js
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  // ...其他配置省略
  plugins: [
    new CleanWebpackPlugin(),
  ],
}
```

#### 使用 Webpack 5 内置功能

实际上，在 `Webpack 5.20.0+` 之后，我们可以不再依赖这个插件。`Webpack` 本身已经开始支持配置清除功能：

```js
module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true // 自动清理 dist 目录
  }
};
```

---

### 3. HtmlWebpackPlugin

#### 插件介绍

在之前的配置中存在一个不太规范的地方：HTML 文件是编写在根目录下的，而最终打包的 `dist` 文件夹中并没有 `index.html` 文件。

在进行项目部署时，必然需要有对应的入口文件 `index.html`，所以我们也需要对 `index.html` 进行打包处理。

#### 安装并配置

首先安装插件：

```bash
npm install html-webpack-plugin -D
```

然后在 `webpack.config.js` 中配置：

```js
const htmlPlugin = require('html-webpack-plugin');

module.exports = {
  // ...其他配置省略
  plugins: [
    new htmlPlugin({ title: 'webpack' }),
  ],
}
```

#### 生成的 index.html 分析

现在会发现，在 `dist` 文件夹中自动生成了一个 `index.html` 文件。该文件中也自动添加了我们打包的 `dist.js` 文件：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>webpack</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script defer="defer" src="dist.js"></script>
  </head>
  <body></body>
</html>
```

**这个文件是如何生成的呢？**

默认情况下是根据 `EJS` 的一个模板来生成的。在 `html-webpack-plugin` 的源码中，有一个 `default_index.ejs` 模板。

#### 自定义 HTML 模板

如果我们想在自己的模板中加入一些特别的内容，该怎么办呢？

比如添加一个 `<noscript>` 标签，在用户的 JavaScript 被关闭时给予响应的提示；或者在开发 `Vue` 或 `React` 项目时，需要一个可以挂载后续组件的根标签。

这时我们需要一个属于自己的 `index.html` 模板。在根目录创建 `public/index.html`：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= htmlWebpackPlugin.options.title %></title>
    <link rel="icon" href="<%= BASE_URL %>favicon.ico" />
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="app" style="margin-bottom: 10px"></div>
    <hr />
    <div id="root"></div>
  </body>
</html>
```

#### 自定义模板数据填充

在上面的代码中，会有一些类似 `<% 变量 %>` 的语法，这是 `EJS` 模板填充数据的方式。

在配置 `HtmlWebpackPlugin` 时，我们可以添加如下配置：

**template：** 指定我们要使用的模板所在的路径

**title：** 在进行 `htmlWebpackPlugin.options.title` 读取时，就会读到该信息

```js
const htmlPlugin = require('html-webpack-plugin');

module.exports = {
  // ...其他配置省略
  plugins: [
    new htmlPlugin({ 
      template: './public/index.html', 
      title: 'webpack' 
    }),
  ],
}
```

---

### 4. DefinePlugin

#### 插件介绍

但是，这个时候编译还是会报错，因为在我们的模板中使用到一个 `BASE_URL` 的常量：

![错误提示](https://picx.zhimg.com/80/v2-27ef24f9fdb1446e8b011a59bb5f9187_1020w.png)

**报错原因：**

这是因为在编译 `template` 模板时，有一个 `BASE_URL` 引用：`<link rel="icon" href="<%= BASE_URL %>favicon.ico">`。但我们并没有设置过这个常量值，所以会出现没有定义的错误。

#### 配置使用

`DefinePlugin` 是 `Webpack` 自带的插件，我们不需要单独安装。

**为什么要两个引号呢？**

因为第一个引号内的内容不是字符串，而是类似于 JavaScript 的 `eval` 语句，所以需要两个引号进行包裹。

```js
window.a = 100;
window.eval('console.log(window.a)'); // 输出：100
```

在 `webpack.config.js` 中配置：

```js
const { DefinePlugin } = require('webpack');

module.exports = {
  // ...其他配置省略
  plugins: [
    new DefinePlugin({ BASE_URL: "'./'" }),
  ]
}
```

这样，编译 `template` 就可以正确读取到 `BASE_URL` 的值了。

---

## 二、Mode 配置

### 1. Mode 介绍

`Mode` 配置选项可以告知 `Webpack` 使用相应模式的内置优化。默认值是 `production`（什么都不设置的情况下）。

可选值有：`none` | `development` | `production`

---

### 2. development 模式

**核心特点：**

**调试友好：** 生成未压缩的代码，保留源代码的可读性，并为模块和代码块（`chunk`）生成有意义的命名（如 `[name].js`）

**环境变量：** 自动设置 `process.env.NODE_ENV` 为 `'development'`，供第三方库（如 `React`）启用开发工具（如错误提示、热更新等）

**构建优化：** 启用 `NamedChunksPlugin`（命名块）和 `NamedModulesPlugin`（命名模块），禁用代码压缩、`Tree Shaking` 等生产优化，以提高构建速度

**适用场景：** 本地开发、调试阶段

**示例配置：**

```js
module.exports = {
  mode: 'development',
  devtool: 'source-map' // 开发环境推荐使用快速 source map
};
```

---

### 3. production 模式

**核心特点：**

**性能优化：** 启用一系列代码压缩和优化插件，包括：

- `TerserPlugin`（压缩 JS）
- `ModuleConcatenationPlugin`（模块合并）
- `FlagDependencyUsagePlugin`（标记未使用依赖）
- 生成短且确定的哈希 ID（如 `[contenthash]`），便于长期缓存

**环境变量：** 设置 `process.env.NODE_ENV` 为 `'production'`，许多库（如 `Vue`、`React`）会据此移除开发模式代码

**代码行为：** 删除未使用的导出（`Tree Shaking`），压缩变量名、移除注释和空白符，生成最小化文件

**适用场景：** 生产环境部署

**示例配置：**

```js
module.exports = {
  mode: 'production',
  optimization: {
    minimize: true, // 默认启用
    minimizer: [new TerserPlugin({ /* 自定义压缩选项 */ })]
  }
};
```

---

### 4. none 模式

**核心特点：**

**禁用默认优化：** 不启用任何内置优化插件（如压缩、`Tree Shaking`）

**环境变量：** 不会自动设置 `process.env.NODE_ENV`，需手动配置

**调试与灵活性：** 输出未优化的原始代码，适合需要完全控制构建流程的场景

**适用场景：** 自定义复杂配置、调试优化问题或特殊构建需求（如测试环境）

**示例配置：**

```js
module.exports = {
  mode: 'none',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('test') // 手动设置环境变量
    })
  ]
};
```

---

### 5. 对比总结

| 特性            | development               | production            | none                   |
| --------------- | ------------------------- | --------------------- | ---------------------- |
| **代码压缩**    | 不压缩                    | 压缩并优化            | 不压缩                 |
| **环境变量**    | `NODE_ENV=development`    | `NODE_ENV=production` | 无自动设置             |
| **模块/块命名** | 有意义的名称（如 `main`） | 短哈希（如 `a1b2c3`） | 原始 ID（如 `0`, `1`） |
| **构建速度**    | 快                        | 慢（因优化步骤多）    | 中等                   |
| **调试支持**    | 完整 Source Map           | 可选 Source Map       | 无默认 Source Map      |
| **典型用途**    | 本地开发                  | 生产部署              | 自定义配置、测试环境   |

---

## 三、区分开发和生产配置

### 1. 为什么需要区分配置

目前我们所有的 `Webpack` 配置信息都是放到一个配置文件中的：`webpack.config.js`。

当配置越来越多时，这个文件会变得越来越不容易维护。并且某些配置是在开发环境需要使用的，某些配置是在生产环境需要使用的，当然某些配置是在开发和生产环境都会使用的。

所以，我们最好对配置进行划分，方便我们维护和管理。

---

### 2. 如何区分配置

**在启动时如何区分不同的配置呢？**

**方案一（推荐）：** 编写两个不同的配置文件，开发和生产时，分别加载不同的配置文件

**方案二：** 使用相同的一个入口配置文件，通过设置参数来区分它们

**在根目录创建 `config` 文件夹：**

创建 `webpack.prod.js` - `Webpack` 的生产打包文件

创建 `webpack.dev.js` - `Webpack` 的开发打包文件

创建 `webpack.common.js` - `Webpack` 的公共打包文件

在 `package.json` 中的 `scripts` 进行修改：

```json
"scripts": {
  "build": "webpack --config ./config/webpack.prod.js",
  "dev": "webpack serve --config ./config/webpack.dev.js"
}
```

---

### 3. 入口文件解析

首先我们先把 `webpack.config.js` 的所有配置复制给这三个文件，然后逐一拆解。

**会遇到的问题：**

之前编写入口文件的规则是：`./src/index.js`。但如果配置文件所在的位置变成了 `config` 目录，是否应该变成 `../src/index.js` 呢？

如果写成 `../src/index.js`，会发现是报错的，依然要写成 `./src/index.js`。

**原因分析：**

这是因为入口文件其实是和另一个属性有关：`context`。

**context 的作用：**

官方说法是默认为当前路径（但经过测试，默认应该是 `Webpack` 的启动目录）。

我们的启动目录是在 `package.json` 所在位置，所以 `context` 默认的路径就是根目录。因此我们还是要写成 `./src/index.js`。

在 `./config/webpack.dev.js` 文件中：

```js
module.exports = {
  mode: 'development',
  context: path.resolve(__dirname), // 修改成当前路径
  entry: '../src/index.js',
}
```

在 `./config/webpack.prod.js` 文件中：

```js
module.exports = {
  mode: 'production',
  context: path.resolve(__dirname), // 修改成当前路径
  entry: '../src/index.js',
}
```

---

### 4. 分割代码

根据刚刚创建的三个文件进行处理。首先需要安装一个合并插件：

```bash
npm install webpack-merge -D
```

我们把公共配置提取到 `webpack.common.js` 文件中，处理 `CSS`、`JS`、静态资源、`Vue`、`TS`、`Babel`、`React` 的配置。

**webpack.common.js 完整代码：**

```js
const path = require('node:path');
const { VueLoaderPlugin } = require('vue-loader/dist/index');
const htmlPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname),
  entry: '../src/index.js',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
      },
      {
        test: /\.(jpg|png|gif|jpe?g|svg)$/,
        type: 'asset',
        generator: {
          filename: 'img/[name].[hash:6][ext]',
        },
        parser: {
          dataUrlCondition: {
            maxSize: 287 * 1024,
          },
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.vue', '.tsx', '.mjs', '.json', '.cjs', '.ts'],
    alias: {
      '@': path.resolve(__dirname, '../src'),
      components: path.resolve(__dirname, '../src/components'),
      page: path.resolve(__dirname, '../src/page'),
    },
  },
  plugins: [
    new VueLoaderPlugin(),
    new htmlPlugin({ 
      template: '../public/index.html', 
      title: 'webpack' 
    }),
    new DefinePlugin({
      BASE_URL: "'../public'",
    }),
  ],
};
```

**在 webpack.prod.js 中使用 merge 合并 common：**

```js
const path = require('node:path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: 'index.js',
    publicPath: './',  // 静态资源路径  
  },
  plugins: [new CleanWebpackPlugin()],
});
```

**在 webpack.dev.js 中使用 merge 合并 common：**

```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    hot: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3000',
      },
    ],
  },
});
```

---

## 四、开发环境、生产环境、none 的深度对比

### 1. development 模式详解

当 `mode` 设置为 `development` 时，`Webpack` 的首要目标是让你能快速启动、快速重新构建，并且容易调试。

**内部启用的主要插件/配置：**

**NamedModulesPlugin：** 将模块 ID 从数字替换为更易读的路径名，方便调试

**NamedChunksPlugin：** 将代码块（`chunk`）ID 替换为可读的名称

**devtool: 'eval'：** 生成 `Source Map` 最快的方式，虽然信息量较少，但对于快速开发和热更新（`HMR`）来说是最佳选择

**Webpack 默认配置示例：**

```js
// webpack.development.js
// 模拟 `mode: 'development'` 时 Webpack 的内部行为

const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: '[name].chunk.js',
  },
  devtool: 'eval',
  optimization: {
    minimize: false, // 禁用压缩以加快构建速度
    moduleIds: 'named',
    chunkIds: 'named',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
};
```

---

### 2. production 模式详解

当 `mode` 设置为 `production` 时，`Webpack` 会尽一切可能优化输出的代码，使其加载更快、体积更小。

**内部启用的主要插件/配置：**

**TerserWebpackPlugin：** 负责压缩（`minify`）、丑化（`mangle`）JavaScript 代码，移除注释、`console`、`debugger` 等，并执行死代码消除（`dead-code elimination`）等优化

**ModuleConcatenationPlugin：** 启用作用域提升（`Scope Hoisting`），将多个模块尽可能合并到一个函数作用域中，减少函数声明和闭包带来的运行时开销和代码体积

**SideEffectsFlagPlugin：** 识别 `package.json` 中的 `sideEffects` 标志，为 `Tree Shaking` 提供支持

**FlagDependencyUsagePlugin：** 配合 `Tree Shaking`，检测并标记模块中哪些 `export` 被实际使用

**NoEmitOnErrorsPlugin：** 如果在编译过程中出现错误，阻止 `Webpack` 生成任何输出文件，防止将有问题的代码部署到生产环境

**CSS 压缩：** 如果使用了 `mini-css-extract-plugin`，在生产模式下会自动尝试使用 `css-minimizer-webpack-plugin` 来压缩 CSS

**Webpack 默认配置示例：**

```js
// webpack.production.js
// 模拟 `mode: 'production'` 时 Webpack 的内部行为

const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: '[name].[contenthash].chunk.js',
  },
  devtool: false, // 不生成 source map
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
    concatenateModules: true, // 启用 Scope Hoisting
    usedExports: true, // 启用 Tree Shaking
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
};
```

---

### 3. none 模式详解

`none` 模式就像一张白纸。`Webpack` 不会为你添加任何默认的优化或插件。输出的代码会非常接近你的原始代码（仅经过模块化包装）。

**适用场景：**

需要完全自定义所有优化策略时

在学习 `Webpack` 时，通过 `none` 模式可以更清晰地看到 `Webpack` 的模块打包原理，不受任何优化的干扰

用于创建库（`library`）时，不希望 `Webpack` 对其进行任何形式的压缩或优化，而是将这个工作交给使用该库的开发者

**Webpack 默认配置示例：**

```js
// webpack.none.js
// 模拟 `mode: 'none'` 时的行为

const path = require('path');

module.exports = {
  mode: 'none',
  entry: './src/index.js',
  output: {
    filename: 'bundle.raw.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: false,
  optimization: {
    minimize: false,
    concatenateModules: false,
    usedExports: false,
  },
};
```

---

### 4. 三种模式完整对比

| 特性/配置              | development (开发环境)         | production (生产环境)                  | none (无模式)      |
| ---------------------- | ------------------------------ | -------------------------------------- | ------------------ |
| **核心目标**           | 快速构建、调试友好             | 性能最优、包体最小                     | 不启用任何默认优化 |
| `process.env.NODE_ENV` | 设置为 `"development"`         | 设置为 `"production"`                  | 不设置             |
| **代码压缩/优化**      | 否                             | 是（默认使用 `TerserPlugin`）          | 否                 |
| **Source Maps**        | `eval`（速度最快）             | `false`（不生成）                      | `false`（不生成）  |
| **Tree Shaking**       | 部分启用（标记 `sideEffects`） | 完全启用                               | 否                 |
| **Scope Hoisting**     | 否                             | 是（使用 `ModuleConcatenationPlugin`） | 否                 |
| **模块/代码块 ID**     | 使用可读的名称                 | 使用数字 ID（优化包体大小）            | 使用数字 ID        |
| **缓存**               | 默认禁用，保证最新代码生效     | 默认启用，利用持久化缓存提升构建速度   | 否                 |
| **错误处理**           | 编译错误时不会退出             | 编译错误时会退出                       | 否                 |

---

### 5. development 模式的 Tree Shaking 详解

**疑问：** `development` 模式的 `Tree Shaking` "部分启用"是什么意思？

在 `development` 模式下，"部分启用" `Tree Shaking` 指的是 `Webpack` 只会执行 `Tree Shaking` 的第一步：识别和标记。

**具体流程：**

**识别标记（sideEffects）：** `Webpack` 会读取项目中 `package.json` 文件里的 `"sideEffects": false` 字段。当看到这个标记时，它就"知道"这个包里的模块如果没有被直接导出和使用，就是可以被移除的"死代码"。它会在内部对这些模块进行标记。

**但不会真正移除代码：** 为了保证最快的构建和重新构建速度，在开发模式下，`Webpack` 并不会执行第二步，也就是真正地从最终生成的 `bundle.js` 文件中把这些标记好的"死代码"给删除掉。

**总结：**

**开发模式（development）：** 只"标记"出哪些是无用的代码，但为了速度，并不真正"摇掉"（移除）它们。这就是所谓的"部分启用"。

**生产模式（production）：** 不仅会"标记"，还会执行完整的分析，将所有无用的代码从最终的打包结果中彻底"摇掉"（移除），以实现最小的包体积。

---

## 完整案例代码

[→ 完整案例代码](https://github.com/webBocai/webpack-/tree/main/03_pulgin)

