---
date: 2025-09-29 14:24:00
title: 14-压缩js-css-html
permalink: /pages/14-webpack压缩优化
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - webpack优化
  - 代码压缩

---

## Terser：JavaScript 压缩

### 认识 Terser

`Terser` 是目前最流行的 JavaScript 压缩工具。在早期，开发者通常使用 `uglify-js` 来压缩和混淆 JavaScript 代码，但该项目已经停止维护，并且不支持 ES6+ 语法。

`uglify-es` 是从 `uglify-js` fork 出来的扩展版本，而 `Terser` 则是 `uglify-es` 的分支项目，主要保持了与 `uglify-es` 和 `uglify-js@3` 在 API 和 CLI 方面的兼容性。

### Terser 的工作原理

`Terser` 通过三个核心模块协同工作来完成代码压缩：

**Parser（解析器）** 负责读取 JavaScript 代码并将其转换成抽象语法树（AST）。这是整个压缩流程的基础，没有 AST，后续的混淆和压缩工作就无法进行。

**Mangler（名称混淆器）** 的目标是缩短变量名和函数名。例如，它会将 `myLongVariableName` 这样的变量名压缩成 `a`。由于这些长变量名在代码中可能被多次使用，缩短它们可以显著减少文件体积。`Mangler` 会智能地确保在整个代码范围内，所有同名变量都被一致地替换，不会破坏代码逻辑。

**Compressor（代码压缩器）** 是最核心的优化步骤。它会分析 AST 并应用各种优化规则：

移除"死代码"（永远不会被执行的代码）：

```javascript
if (false) {
  const a = 10;
  console.log(a);
}
```

移除 `console.log` 或其他调试代码

计算常量表达式，例如 `2 + 3` 会直接被替换为 `5`

进行大量的代码逻辑简化，在保持功能不变的前提下使用更短的语法

### 安装与基础使用

`Terser` 是一个独立的工具，可以单独安装和使用。

#### 安装方式

全局安装：

```bash
npm install terser -g
```

项目内安装：

```bash
npm install terser -D
```

#### 实践示例

在项目中创建 `terser` 文件夹，并创建 `index.js` 文件：

```javascript
const a = false;
if (a) {
  console.log(2);
}

const obj = {
  name: 'obj',
  foo: function () {
    let layout = Math.random();
    return layout;
  },
};
obj.foo();
```

### Compressor 配置详解

这是 `Terser` 功能最强大、选项也最多的部分，通过精细调整可以实现极致的压缩效果。

**defaults** 默认值为 `true`，通过设置为 `false` 可以禁用大部分默认启用的代码压缩

**arrows** 默认值为 `true`，会将 `class` 或 `object` 中符合条件的函数转换成箭头函数。注意：函数必须有返回值，且不能包含 `console` 或使用 `this`，否则无法转换

**arguments** 默认值为 `true`，将函数中使用的 `arguments[index]` 转换成对应的形参名称

**unused** 默认值为 `true`，移除未使用的变量（可以与 `webpack` 的 `usedExports` 配合实现 Tree Shaking）

**dead_code** 默认值为 `true`，删除永远无法访问的代码。需要注意的是，`Terser` 只能删除静态分析中可以确定无法访问的代码：

```javascript
// 可以被移除
if (false) {}

// 可以被移除
const a = false;
if (a) {}

// 无法被移除（let 声明的变量可能在后续发生变化）
let b = false;
if (b) {}

// 可以被移除（表达式结果确定）
if (1 > 2) {}

// 无法被移除（运行时才能确定结果）
let c = 1;
let d = 2;
if (c > d) {}
```

**drop_console** 默认值为 `false`，传递 `true` 可以移除所有 `console.*` 函数调用。如果只想移除部分控制台输出，可以传递一个数组，如 `['log', 'info']`

**drop_debugger** 默认值为 `true`，删除 `debugger;` 语句

执行压缩命令：

```bash
npx terser index.js -c dead_code=true,arrows=true -o index.min.js
```

压缩后的 `index.min.js` 文件：

![压缩结果](https://picx.zhimg.com/80/v2-e554541532ed77af7d8acf24c4bdab5f_1020w.png)

::: tip 更多配置选项
查看 [Terser 官方文档的 Compress 选项](https://github.com/terser/terser?tab=readme-ov-file#compress-options)
:::

### Mangler 配置详解

名称混淆是影响代码压缩率和安全性的关键配置部分。

**toplevel** 默认为 `false`，设置为 `true` 会对顶层作用域中的变量名进行混淆。使用 `-m` 参数时会默认混淆非顶层作用域的变量名

**keep_classnames** 默认为 `false`，是否保持依赖的类名称

**keep_fnames** 默认为 `false`，是否保持原来的函数名称

执行命令：

```bash
npx terser index.js -c dead_code=true,arrows=true -m toplevel=true,keep_classnames=true,keep_fnames=true -o index.min.js
```

![混淆结果](https://pica.zhimg.com/80/v2-ca592a06b05a9fa6b55dbf77089547e6_1020w.png)

::: tip 更多配置选项
查看 [Terser 官方文档的 Mangle 选项](https://github.com/terser/terser?tab=readme-ov-file#mangle-options)
:::

### Parser 配置

`Parser` 的配置相对较少，因为它的任务比较单纯，就是解析代码。通常情况下不需要修改默认配置。

::: tip 更多配置选项
查看 [Terser 官方文档的 Parse 选项](https://github.com/terser/terser?tab=readme-ov-file#parse-options)
:::

### 在 Webpack 中使用

#### 安装插件

在 `webpack` 的 `production` 模式下，默认已经使用了 `Terser`。但如果需要自定义配置，建议显式安装以避免幻影依赖问题：

```bash
yarn add terser-webpack-plugin -D
```

#### 配置示例

`webpack` 中的 `optimization.minimizer` 属性在 `production` 模式下默认使用 `TerserPlugin`。我们可以创建 `TerserPlugin` 实例来覆盖默认配置。

在 `webpack.config.js` 中：

**extractComments** 默认为 `true`，表示会将注释抽取到单独的文件中

**parallel** 默认为 `true`，使用多进程并发运行提高构建速度，默认并发数量为 `os.cpus().length - 1`

**terserOptions** 设置 `Terser` 相关配置：

- `compress` 设置压缩相关选项
- `mangle` 设置名称混淆选项，可以直接设置为 `true`
- `toplevel` 顶层变量是否进行转换
- `keep_classnames` 保留类的名称
- `keep_fnames` 保留函数的名称

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/terser/index.js',
  // ...其余配置
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            defaults: false,
            dead_code: true,
          },
          mangle: true,
          keep_fnames: false,
        },
      }),
    ],
  },
};
```

最终打包效果：

![打包结果](https://picx.zhimg.com/80/v2-2093b207ad53a928f4751ba8e6a2ccc5_1020w.png)

::: tip 更多配置选项
查看 [terser-webpack-plugin 官方文档](https://github.com/webpack-contrib/terser-webpack-plugin)
:::

> [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/08_webpack%20js_%E5%8E%8B%E7%BC%A9)  
## cssnano：CSS 压缩

### 认识 cssnano

`cssnano` 是一个基于 Node.js 开发的 CSS 压缩和优化工具，它是 `PostCSS` 的一个插件。`cssnano` 会压缩和优化 CSS 文件，移除空格、注释，合并重复的规则等，以减小最终文件的大小，从而提升网站加载速度。

虽然 `cssnano` 是一个独立的 CSS 压缩工具，但它需要结合 `PostCSS` 生态系统使用。

### 安装依赖

需要安装三个 npm 包：`PostCSS` 命令行工具、`PostCSS` 本身和 `cssnano`：

```bash
yarn add -D postcss postcss-cli cssnano
```

### 基础使用

在 `src` 目录下创建 `input.css`：

```css
/*
  这是一个多行注释。
  默认情况下它应该被移除。
*/
h1 {
  margin: 10px 10px 10px 10px; /* 这个外边距应该被优化 */
  color: #ff0000;
  font-size: 16px;
  font-weight: bold;
}

/* 这是一个单行注释 */
h2 {
  color: #ff0000; /* 选择器不同，但颜色规则是相同的 */
}

h1 {
  padding: 20px; /* 这个重复的选择器应该被合并 */
}
```

创建 `postcss.config.js` 配置文件。`preset` 有三个选项：

`default` 最常用的预设

`advanced` 功能最全的预设，需要额外安装 `npm install cssnano-preset-advanced --save-dev`

`lite` 轻量且功能较少的预设

```javascript
module.exports = {
  plugins: [
    require('cssnano')({
      preset: 'default',
    }),
  ],
};
```

执行压缩命令，它会读取 `input.css`，使用配置文件进行处理，然后将结果保存到 `output.css`：

```bash
npx postcss input.css -o output.css
```

输出结果：

![压缩结果](https://pica.zhimg.com/80/v2-8688a2c1273a40ed74e8f0c0c426f5ec_1020w.png)

### 配置选项详解

**discardComments** 删除规则、选择器和声明中及其周围的注释。注意，任何标有 `!` 的特殊注释会默认保留

**cssDeclarationSorter** 根据 CSS 的属性名称对 CSS 声明进行排序，排序后的 CSS 在压缩时会更小，因为相似的字符串会更多

排序方式有三种：

`alphabetical` 默认按字母顺序从 a 到 z 排列

`smacss` 从最重要、影响最大的属性到最不重要的属性排序：Box 布局和空间 → Border 边框 → Background 背景 → Text 文本 → Other 其它

`concentric-css` 从盒外模型向内移动到内在变化：Positioning 定位 → Visibility 可见 → Box model 盒子模型 → Dimensions 元素大小 → Text 文本

示例：

输入：

```css
body {
  animation: none;
  color: #C55;
  border: 0;
}
```

输出：

```css
body {
  animation: none;
  border: 0;
  color: #C55;
}
```

**mergeLonghand** 将分散的属性合并为简写属性

**calc** 尽可能减少 CSS `calc` 表达式，确保浏览器兼容性和压缩

**autoprefixer** 根据 `browsers` 选项删除不必要的前缀

::: warning 使用 autoprefixer 的注意事项
该功能需要修改预设为 `advanced`，并安装高级变换插件。查看 [Advanced transforms](https://cssnano.github.io/cssnano/docs/advanced-transforms/)
:::

::: tip 查找配置参数
`cssnano` 的优化项名称几乎和它的插件包名一一对应，规则通常是：`postcss-` + 优化项名称（驼峰命名转为短横线连接）。例如：

- `discardComments` → `postcss-discard-comments`
- `mergeLonghand` → `postcss-merge-longhand`

在 npm 中查询对应的包即可查看详细参数。查看[更多优化选项](https://cssnano.github.io/cssnano/docs/what-are-optimisations/)
:::
> [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/css-nano-test)  

### 在 Webpack 中使用

在 `webpack` 中使用 `css-minimizer-webpack-plugin`，它是基于 `cssnano` 开发的 webpack 插件。

#### 安装依赖

```bash
yarn add css-minimizer-webpack-plugin -D
yarn add cssnano-preset-advanced -D
```

#### 配置示例

在 `index.css` 文件中：

```css
.title {
  color: red;
  font-size: 40px;
  -moz-border-radius: 10px; /* 这个前缀会被移除 */
  border-radius: 10px;
}
```

在 `src/index.js` 中：

```js
import './asset/css/test.css';

const div = document.createElement('div');
div.classList.add('title');
div.textContent = '你好';
document.body.appendChild(div);
```

在 `webpack.config.js` 中配置：

**parallel** 默认为 `true`，使用多进程并发运行提高构建速度，默认并发数量为 `os.cpus().length - 1`

**minimizerOptions** 配置 `cssnano` 的具体选项，因为使用了 `autoprefixer`，所以 `preset` 使用 `advanced` 高级版本

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      // ...terser 配置
      new CssMinimizerPlugin({
        parallel: true,
        minimizerOptions: {
          preset: [
            'advanced',
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].css',
    }),
  ],
};
```

输出结果，前缀被成功移除：

```css
.title{border-radius:10px;color:red;font-size:40px}
```

## JavaScript 中的 Tree Shaking

### 理解 Tree Shaking

`Tree Shaking` 在计算机领域的意思是"删除死代码"（`dead_code`），用于消除未调用的代码。在函数式编程中尽量使用纯函数，纯函数无副作用，可以放心地消除。

JavaScript 的 `Tree Shaking` 效果从 ES6 出现 `import`/`export` 后才开始实现。打包工具 `Rollup` 是第一个支持这个特性的工具。`Webpack 4` 及以上版本默认支持 Tree Shaking，通过 `usedExports` 和 `sideEffects` 可以实现更高效的代码优化。

### usedExports 配置

在 `src` 目录下创建 `utils/index.js`：

```javascript
export const foo = () => {
  console.log('foo');
};

export const bar = () => {
  console.log('bar');
};

export const add = (a, b) => a + b;
```

在 `src/index.js` 中：

```javascript
import { foo, bar } from './utils/index.js';
foo();
bar();
```

将 `mode` 设置为 `development` 模式，因为在 `production` 模式下，webpack 默认的优化会影响我们观察效果。可以先注释 `terser` 配置项。

设置 `usedExports` 为 `true` 和 `false` 对比打包后的代码。当 `usedExports` 设置为 `true` 时，会有一段注释：`unused harmony export xxxx`。

**这段注释的意义：** 告知 `Terser` 在优化时可以删除这段代码。

在 `webpack.config.js` 中：

```javascript
module.exports = {
  optimization: {
    minimize: true,
    usedExports: true,
    minimizer: [
      // ...其它配置
    ],
  },
};
```

执行打包命令，因为注释了 `terser` 配置并将 `mode` 设置为 `development`，可以看到：

`usedExports` 将需要删除的代码进行标记注释，当启用 `terser` 配置时，会根据标记注释删除对应代码。

![usedExports 标记](https://picx.zhimg.com/80/v2-616f91ec68e9798f9d445b038d9aa353_1020w.png)

启用 `terser` 后的打包结果，可以看到 `add` 函数被成功移除：

![Tree Shaking 结果](https://pic1.zhimg.com/80/v2-97d2be50a1dbe56293a2bdfb0310635d_1020w.png)

### sideEffects 配置

`sideEffects` 用于告知 `webpack compiler` 哪些模块有副作用。如果有副作用就不移除该模块。

**副作用的定义：** 模块或函数内部是否修改了外部变量值，如果有就是副作用。

在 `utils` 文件夹中新增 `lyrc.js`：

```javascript
const mul = (num1, num2) => {
  return num1 * num2;
};
```

在 `src/index.js` 中：

```javascript
import { bar, foo } from './utils/index';
import './utils/lyrc.js';

bar();
foo();
```

可以看到 `lyrc.js` 模块我们都没有使用，但这个模块没有被删除：

![未移除的模块](https://pic1.zhimg.com/80/v2-e0b7382c49c02c3bcb288fd5e0c0012f_1020w.png)

这时需要在 `package.json` 中配置 `sideEffects`。设置为 `false` 表示告知 webpack 项目代码全部都没有副作用，没有使用到的模块全部可以删除：

```json
{
  "sideEffects": false
}
```

配置后，`lyrc.js` 模块被成功移除：

![移除成功](https://picx.zhimg.com/80/v2-62e7656b1bf3b7c077a543d02229e35b_1020w.png)

#### 处理有副作用的代码

但是在某些场景下，我们的代码不可避免地需要使用有副作用的函数。举例说明，在 `lyrc.js` 中：

```javascript
export const mul = (num1, num2) => {
  return num1 * num2;
};
window.add = 2;
```

在 `index.js` 中：

```javascript
import { bar, foo } from './utils/index';
import './utils/lyrc.js';

bar();
foo();
window.total = window.add + 1;
```

如果直接将 `sideEffects` 设置为 `false`，这个模块会被移除，计算结果就会出现问题。我们应该告诉 `sideEffects` 哪些模块存在副作用不要删除：

```json
{
  "sideEffects": ["./src/utils/lyrc.js"]
}
```

这样执行打包后，输出结果会保留对应的副作用模块，但没有使用的函数或变量一样会被删除：

![保留副作用模块](https://picx.zhimg.com/80/v2-aee0be5c99549d3fa88d5e153312e823_1020w.png)

::: warning CSS 文件的处理
当使用 CSS 文件时，如果设置了 `sideEffects` 但没有告知它保留 CSS，webpack 会把 CSS 模块移除，不会进行打包：

```javascript
// index.js 中
import './index.css';
```

```json
// package.json 中
{
  "sideEffects": ["./src/utils/lyrc.js", "*.css"]
}
```

:::

### usedExports 与 sideEffects 的区别

`usedExports` 主要标记模块中哪些变量或函数没有使用，打上魔法注释标记，让 `terser` 进行删除。

`sideEffects` 根据用户的配置决定哪些模块可以删除，哪些模块因为有副作用需要保留。

> [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/08_webpack%20js_%E5%8E%8B%E7%BC%A9)  

## CSS 中的 Tree Shaking

### PurgeCSS 介绍

CSS 中的 `Tree Shaking` 概念借鉴了 ES6 模块的思想，但它不属于静态分析剔除未使用的代码，而是使用第三方工具实现类似效果。

常见的 CSS Tree Shaking 工具有 [`uncss`](https://github.com/uncss/uncss)、[`parcel-plugin-purifycss`](https://www.npmjs.com/package/parcel-plugin-purifycss) 和 [`PurgeCSS`](https://purgecss.com/introduction.html)（目前使用最多的工具）。

`PurgeCSS` 相比其他工具，它是近几年更新频率很高的一个剔除无用 CSS 库，而其他两个库已经在 5-6 年前停止更新。

`PurgeCSS` 是一款用于移除未使用 CSS 的工具。构建网站时，你可能会使用 CSS 框架（如 `TailwindCSS`、`Bootstrap` 等），但只会使用框架的一小部分，导致包含大量未使用的 CSS 样式。

#### 工作原理

`PurgeCSS` 的工作原理非常简单：

**扫描文件** 读取指定的文件，通常是 HTML、JavaScript、Vue 或 React 组件等

**记录使用的类名** 在这些文件中，用正则表达式找到所有用到的 CSS 类名（比如 `<div class="card active">`，就记下 `card` 和 `active`）

**比对和删除** 将所有 CSS 样式与已用类名列表进行比对，凡是没在列表里出现的样式，统统删除。最后生成一个干净、轻量的 CSS 文件

### 安装与配置

大多数构建工具和框架都使用 `PostCSS`，配置 `PurgeCSS` 最简单的方法是使用其 PostCSS 插件。

#### 安装依赖

```bash
yarn add -D @fullhuman/postcss-purgecss postcss postcss-cli
```

#### 准备测试文件

创建 `./src/css/main.css` 文件：

```css
/* main.css */
.used-class {
  color: green;
}

.unused-class {
  color: red;
}

.btn {
  padding: 8px;
}

.btn-primary {
  background-color: blue;
}

/* 一个将被 JS 动态添加的类 */
.is-active {
  font-weight: bold;
}
```

创建 `./src/index.html` 文件：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PurgeCSS Test</title>
  <link rel="stylesheet" href="../dist/main.css">
</head>
<body>
  <h1 class="used-class">Hello World</h1>
  <button class="btn btn-primary">Click Me</button>
  <div id="dynamic-element">Dynamic Content</div>
</body>
</html>
```

在 `package.json` 中添加命令：

```json
{
  "scripts": {
    "build:css": "postcss ./src/css/style.css -o ./dist/style.css",
    "watch:css": "postcss ./src/css/style.css -o ./dist/style.css --watch"
  }
}
```

#### 配置 PostCSS 和 PurgeCSS

创建 `postcss.config.js` 文件：

**content** 告诉 `PurgeCSS` 去哪里扫描使用的 CSS 类名

```javascript
content: [
  './src/**/*.html',
  './src/**/*.vue',
  './src/**/*.js',
]
```

**safelist** 主动"保护"一些不能被删除的类名

```javascript
safelist: {
  // 直接保护单个类名
  standard: ['active', 'show-modal'],
  
  // 使用正则表达式保护一批类名
  // 保护所有以 'bg-' 或 'text-' 开头的类名
  deep: [/^(bg|text)-/],
  
  // 保护由 JavaScript 动态添加的、带有子选择器的类
  greedy: [/^(dropdown|modal|carousel)-/],
}
```

**keyframes 和 fontFace** 默认情况下，`PurgeCSS` 也会移除未使用的 `@keyframes` 和 `@font-face`

```javascript
keyframes: false, // 设为 true 则不清除任何 @keyframes
fontFace: false,  // 设为 true 则不清除任何 @font-face
```

**variables** 是否移除未使用的 CSS 自定义属性（CSS Variables）

```javascript
variables: false // 设为 true 则会移除未使用的 --my-color 这种变量
```

**blocklist** 阻止 CSS 选择器出现在最终输出中，即使 `PurgeCSS` 看到这些选择器被使用也会移除

为什么需要这个？因为 `PurgeCSS` 默认提取器的工作方式非常"朴素"：扫描 HTML 文件过程中，如果 CSS 类名与 HTML 标签重名，会导致一些冲突，使得未使用的类名无法被移除。

例如在 `style.css` 中：

```css
.title {
  color: red;
}
```

在 `index.html` 中存在 `title` 标签导致无法被移除：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>PurgeCSS Test</title>
  </head>
  <body>
  </body>
</html>
```

这时配置 `blocklist` 可以将一些名字拉入黑名单（但必须慎用）：

```javascript
blocklist: ['title']
```

一些可能冲突的 HTML 标签：

![冲突标签列表](https://pica.zhimg.com/80/v2-da33a6f567e44099e42c84aa81fbc97c_1020w.png)

完整的 `postcss.config.js` 配置：

```javascript
const { purgeCSSPlugin } = require('@fullhuman/postcss-purgecss');

// 只有在生产环境（production）才进行 CSS 清理
const inProduction = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    inProduction && purgeCSSPlugin({
      content: [
        './src/**/*.html',
        './src/**/*.vue',
        './src/**/*.js',
      ],
      safelist: {
        standard: ['active', 'show-modal'],
        deep: [/^(bg|text)-/],
        greedy: [/^(dropdown|modal|carousel)-/],
      },
      keyframes: false,
      fontFace: false,
      variables: false,
      blocklist: ['title']
    })
  ].filter(Boolean)
};
```

::: tip 更多配置选项
查看 [PurgeCSS 官方文档的配置选项](https://purgecss.com/configuration.html#options)
:::
> [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/PurgeCss)  
### 在 Webpack 中使用

#### 前置条件

在 `webpack` 配置中可以直接使用 `purgecss-webpack-plugin` 插件，或者在使用 `webpack` 的 `postcss-loader` 时使用 PostCSS 插件。

使用 `purgecss-webpack-plugin` 的前提是必须先使用 `mini-css-extract-plugin`。

#### 安装依赖

```bash
npm install purgecss-webpack-plugin -D
```

#### 配置示例

```js
const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, 'src'),
};

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
    }),
  ],
};
```

## Scope Hoisting：作用域提升

### 概念介绍

`Scope Hoisting`（作用域提升）是从 `webpack 3` 开始增加的一个新功能，它可以对作用域进行提升，使 webpack 打包后的代码更小、运行更快。

默认情况下，webpack 打包会有很多的函数作用域，包括一些 IIFE（立即执行函数表达式）。无论是从最开始的代码运行，还是加载一个模块，都需要执行一系列的函数。`Scope Hoisting` 可以将函数合并到一个模块中来运行。

![默认打包结果](https://pic1.zhimg.com/80/v2-fcf474e94654b5415c31ed729abec489_1020w.png)

### 使用方式

使用 `Scope Hoisting` 非常简单，webpack 已经内置了对应的模块。

在 `production` 模式下，这个模块会默认启用。在 `development` 模式下，需要手动开启。

在 `webpack.config.js` 的 `plugins` 中进行配置：

```javascript
const webpack = require('webpack');

module.exports = {
  // 省略其它配置
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
};
```

打包运行结果，对比默认情况，代码减少了很多：

![优化后的结果](https://pic1.zhimg.com/80/v2-98cb76f87f862848e46bcac4c3b45227_1020w.png)

## HTML 压缩

之前使用了 `HtmlWebpackPlugin` 插件来生成 HTML 模板，它还有一些其他的配置选项。

### 配置选项

**inject** 设置打包的资源插入的位置，可选值：`true`、`'head'`、`'body'`、`false`

当传递 `'body'` 时，所有 JS 资源都将放在 body 元素的底部

`'head'` 将把脚本放在 head 元素中

传递 `true` 将根据 `scriptLoading` 选项把脚本添加到 head 或 body 元素中

通过 `false` 将禁用自动注入

**cache** 设置为 `true` 时，只有当文件被更改时才输出

**minify** 如果设置为 `true`，生成的 HTML 将使用 [`html-minifier-terser`](https://github.com/terser/html-minifier-terser#options-quick-reference) 插件进行压缩

### 配置示例

```js [webpack.config.js]
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      cache: true,
      minify: {
        // 移除注释
        removeComments: true,
        // 移除空属性
        removeEmptyAttributes: true,
        // 移除默认属性
        removeRedundantAttributes: true,
        // 折叠空白字符
        collapseWhitespace: true,
        // 压缩内联的 CSS
        minifyCSS: true,
        // 压缩 JavaScript
        minifyJS: {
          mangle: {
            toplevel: true
          }
        }
      }
    }),
  ]
};
```

::: tip 更多配置选项
查看 [html-webpack-plugin 官方文档](https://github.com/jantimon/html-webpack-plugin)
:::

## HTTP 压缩

### 压缩原理

HTTP 压缩是一种内置在服务器和客户端之间的技术，用于改善传输速度和带宽利用率。

### 工作流程

HTTP 压缩的工作流程分为三步：

**第一步** HTTP 数据在服务器发送前就已经被压缩（可以在 webpack 中完成）

**第二步** 兼容的浏览器在向服务器发送请求时，会告知服务器自己支持哪些压缩格式

![浏览器请求头](https://picx.zhimg.com/80/v2-086d5f2e32e70db727208d3d97bc3a37_1440w.png)

**第三步** 服务器在浏览器支持的压缩格式下，直接返回对应的压缩后的文件，并在响应头中告知浏览器

::: warning Nginx 配置注意事项
在 Nginx 本地部署时一定要打开 gzip，否则服务器可能默认不支持返回 gzip 文件

```nginx
server {
  listen 5500;
  root /path/to/your/dist;

  location ~ \.js$ {
    gzip_static on;
    add_header Content-Encoding gzip;
  }
}
```

:::

![服务器响应头](https://picx.zhimg.com/80/v2-fe9ca3a0644692debb2791af9ef7740a_1440w.png)

### 常见压缩格式

**compress** UNIX 的 `compress` 程序的方法（历史性原因，不推荐大多数应用使用，应该使用 `gzip` 或 `deflate`）

**deflate** 基于 deflate 算法（定义于 RFC 1951）的压缩，使用 `zlib` 数据格式封装

**gzip** GNU zip 格式（定义于 RFC 1952），是目前使用比较广泛的压缩算法

**br** 一种新的开源压缩算法，专为 HTTP 内容的编码而设计

### Webpack 文件压缩

webpack 中相当于实现了 HTTP 压缩的第一步操作，可以使用 `CompressionPlugin`。

#### 安装依赖

```bash
npm install compression-webpack-plugin -D
```

#### 配置示例

在 `webpack.config.js` 中：

**test** 配置哪些文件需要压缩

**threshold** 设置文件从多大开始压缩

**minRatio** 至少的压缩比例

**algorithm** 采用的压缩算法

**include** 包含哪些文件

**exclude** 排除哪些文件

```javascript
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  // 省略其它配置
  plugins: [
    new CompressionPlugin({
      test: /\.(css|js)$/,
      threshold: 300,
      algorithm: 'gzip',
    }),
  ]
};
```

## 打包分析工具

### 打包时间分析

在 webpack 中可以使用 `speed-measure-webpack-plugin` 插件来分析 loader 和 plugin 执行的时间。

这个插件默认不支持 webpack 5，可以使用 fork 出来的插件 `speed-measure-webpack-v5-plugin`，使用方法与原本插件一致。

```bash
npm install speed-measure-webpack-v5-plugin -D
```

基础使用方式：

```javascript
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-v5-plugin');
const smp = new SpeedMeasureWebpackPlugin();

const config = {
  // webpack 的配置
};

module.exports = smp.wrap(config);
```

#### 与 MiniCssExtractPlugin 的兼容问题

如果同时使用 `mini-css-extract-plugin` 和 `speed-measure-webpack-v5-plugin`，会产生冲突导致报错。

![冲突错误](https://picx.zhimg.com/80/v2-54164dab84095a2ea49bea6aad6d7e89_1440w.png)

解决方案参考 [GitHub issue](https://github.com/stephencookdev/speed-measure-webpack-plugin/issues/167#issuecomment-976836861)：

在 `smp.wrap` 中先添加 webpack 配置，通过 wrap 函数返回值进行插件赋值。wrap 函数返回值与你传入的 webpack 配置项有关系，传入对象返回对象，传入函数返回函数。

```javascript
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-v5-plugin');
const smp = new SpeedMeasureWebpackPlugin();

const config = (env) => {
  return {
    // webpack 配置项
  };
};

module.exports = (env) => {
  const webpackConfig = config(env);
  const cssPluginIndex = webpackConfig.plugins.findIndex(
    (e) => e.constructor.name === 'MiniCssExtractPlugin'
  );
  const cssPlugin = webpackConfig.plugins[cssPluginIndex];
  const configToExport = smp.wrap(webpackConfig);
  configToExport.plugins[cssPluginIndex] = cssPlugin;
  return configToExport;
};
```

打包后可以看到各种 loader 和 plugin 的执行时间：

![执行时间统计](https://pic1.zhimg.com/80/v2-31869ced7cec77893874304eb6486688_1440w.png)

### 打包文件分析（webpack 官方工具）

在 `package.json` 文件中配置命令：

```json
{
  "scripts": {
    "build:json": "webpack --profile --json=state.json"
  }
}
```

执行 `npm run build:json` 可以获取一个 `state.json` 文件。这个文件我们自己分析不太方便，需要借助 [webpack 官方分析工具](https://webpack.github.io/analyse/)。

![webpack 分析工具](https://picx.zhimg.com/80/v2-30f0a75b413db070c333ed3d8bac3fcf_1440w.png)

### 打包文件分析（可视化插件）

使用 `webpack-bundle-analyzer` 工具，可以非常直观地查看包大小。

#### 安装依赖

```bash
npm install webpack-bundle-analyzer -D
```

#### 配置使用

在 `webpack.config.js` 中：

**analyzerPort** 设置端口号

```javascript
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  // 其它配置
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerPort: 9090
    })
  ]
};
```

执行打包后会自动弹出一个 9090 端口的网页，展示可视化的打包分析：

![可视化分析](https://pic1.zhimg.com/80/v2-0ba45df5d9c145084bf74f5b1fbce697_1440w.png)

::: tip 更多配置选项
查看 [webpack-bundle-analyzer 文档](https://www.npmjs.com/package/webpack-bundle-analyzer)
:::

## 总结

本文详细介绍了 webpack 中的各种压缩和优化技术：

**JavaScript 压缩** 使用 `Terser` 进行代码压缩和混淆，支持删除死代码、移除 console、优化常量表达式等

**CSS 压缩** 使用 `cssnano` 移除空格、注释，合并重复规则，配合 `css-minimizer-webpack-plugin` 在 webpack 中使用

**Tree Shaking** 通过 `usedExports` 和 `sideEffects` 配置，移除未使用的 JavaScript 代码；使用 `PurgeCSS` 移除未使用的 CSS 样式

**作用域提升** 使用 `Scope Hoisting` 减少函数作用域，提升代码运行效率

**HTML 压缩** 配置 `html-webpack-plugin` 的 `minify` 选项

**HTTP 压缩** 使用 `compression-webpack-plugin` 生成 gzip 压缩文件

**打包分析** 使用时间分析插件和可视化工具优化构建性能

合理使用这些优化技术，可以显著减小打包体积，提升应用加载速度和运行性能。

> [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/08_webpack%20js_%E5%8E%8B%E7%BC%A9)  