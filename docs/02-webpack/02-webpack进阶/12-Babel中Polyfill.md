---
date: 2025-09-29 14:24:00
title: 12-Polyfill的使用 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /webpack/1aftt
categories:
  - Webpack
coverImg: /img/webpack_babel.jpeg
tags:
  - babel的进阶使用
---

## 理解 Polyfill

### Polyfill 的核心概念

`Polyfill` 这个词翻译为"垫片"，它的作用是为旧版本浏览器提供现代 JavaScript 特性的实现。

当我们使用 ES6+ 新增的 API（如 `Promise`、`fetch`、`includes` 等）时，这些特性在 ES5 环境中是不存在的。`Babel` 虽然能够转换语法（比如箭头函数转换为普通函数），但无法凭空创造不存在的 API。这时就需要 `Polyfill` 来"填充"这些缺失的功能，相当于为老旧的浏览器打上补丁。

### 安装依赖

#### Babel 7.4.0 之前的方式

在 `Babel 7.4.0` 之前，官方推荐使用 `@babel/polyfill` 包，但这个包现在已经被废弃：

```bash
npm install @babel/polyfill --save
```

![polyfill废弃提示](https://picx.zhimg.com/80/v2-71a5f3b9f5b113a60b7c31360a8f2c5c_720w.png)

#### 现代化方案

从 `Babel 7.4.0` 开始，推荐使用 `core-js` 和 `regenerator-runtime` 的组合方案：

```bash
npm install core-js regenerator-runtime --save
```

**关于 regenerator-runtime：** 这个库专门用于模拟生成器函数（`Generator`）和迭代器（`Iterator`）的底层机制。实际上，`async/await` 就是 `Generator` 函数和 `Promise` 的语法糖，让异步代码看起来像同步代码一样直观。

```javascript
// 生成器函数示例
function* myNumberGenerator() {
  yield 1; // 暂停，返回 { value: 1, done: false }
  yield 2; // 暂停，返回 { value: 2, done: false }
  return 3; // 结束，返回 { value: 3, done: true }
}
```

## 配置 Polyfill

### core-js 的作用

`Babel` 能够转换 ES6+ 的新语法（如箭头函数、`class`），但对于新的 API（如 `Promise`、`Array.from`），仅靠语法转换是无法实现的，必须用代码模拟。

`core-js` 就是用来模拟这些新 API 的代码库。举个例子，在 IE11 中运行 `new Set([1, 2, 3])`，如果没有 `core-js`，浏览器会直接报错；有了 `core-js`，它会用 ES5 代码实现 `Set` 的功能。

::: info Babel 与 core-js 的分工

- `Babel` 负责**语法转换**（如 `() => {}` → `function() {}`）
- `core-js` 负责 **API 模拟**（如 `Promise`、`Array.includes`）
  :::

### 基础配置

在 `babel.config.js` 文件中配置 `@babel/preset-env` 的相关属性。

**配置项说明：**

`useBuiltIns` 设置 `polyfill` 的使用方式

`corejs` 设置 `core-js` 的版本号，推荐使用 `3.x` 版本

`proposals` 是否支持提议阶段的特性，设置为 `true` 后，`Babel` 会引入处于提案阶段的 API polyfill

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.1%, last 2 versions, not dead',
        corejs: {
          version: 3,
          proposals: true
        }
      },
    ],
  ],
};
```

### useBuiltIns 详解

这个配置项决定了如何将 `core-js` 模拟的 API 引入到项目中。以下代码在 ES5 中是不存在的：

```javascript
fetch('www.baidu.com')
  .then((res) => {
    console.log(res);
    return res.json();
  })
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.error(err);
  });
```

**三种配置模式：**

`false` 不自动添加 `Polyfill`，需要手动处理兼容性

`'usage'` **（推荐）** 按需添加，只引入源代码中实际使用的 API

`'entry'` 在入口文件手动导入完整的 `polyfill`

::: warning 使用 usage 模式的注意事项
如果在 `babel-loader` 配置中使用了 `exclude: /node_modules/` 排除了第三方库，可能需要改用 `entry` 模式。详见[相关文档](https://webbocai.github.io/docs-web/pages/25cf12.html#%E5%8F%82%E6%95%B0%E4%BB%8B%E7%BB%8D)。
:::

#### usage 模式工作原理

::: details Polyfill 的工作机制

如果 `babel-loader` 配置时没有排除 `node_modules`，需要添加 `modules: 'commonjs'` 配置，否则会报错：

```
'import' and 'export' may appear only with 'sourceType: module'
```

**错误原因分析：**

**Babel 的工作：** `@babel/preset-env` 在 `index.js` 中检测到需要 `Promise` 的 `polyfill`，于是插入了 `import 'core-js/...'` 语句

**Webpack 的工作：** `Webpack` 看到 `import 'core-js/...'`，去 `node_modules` 查找对应的文件

**冲突点：** 如果 `Webpack` 配置没有 `exclude: /node_modules/`，那么 `core-js` 文件也会被 `babel-loader` 处理。问题在于 `babel-loader` 将 `core-js` 文件当作普通脚本而非模块解析，当遇到 `import` 语句时就会报错

**解决方案（不推荐）：** 添加 `modules: 'commonjs'` 强制将 `import` 转换为 `require`，虽然可行但不如直接排除 `node_modules` 简单高效

:::

**配置示例：**

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.1%, last 2 versions, not dead',
        corejs: 3,
        useBuiltIns: 'usage',
        // 不推荐使用，建议在 webpack 配置中排除 node_modules
        // modules: 'commonjs',
      },
    ],
  ],
};
```

![usage 模式示例](https://picx.zhimg.com/80/v2-a9111ee993f1908536733a9e942114f9_1020w.png)

#### entry 模式使用场景

当项目依赖的某个第三方库使用了较新的特性，而 `webpack` 配置中又排除了 `node_modules`，这时如果代码在低版本浏览器中运行，就会因为缺少对应的 API 实现而报错。这种情况下可以使用 `entry` 模式。

**配置步骤：**

在 `babel.config.js` 中设置：

```javascript
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.1%, last 2 versions, not dead',
        corejs: 3,
        useBuiltIns: 'entry',
      },
    ],
  ],
};
```

在入口文件中手动导入：

```javascript
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

## TypeScript 编译方案

在 `src` 目录下创建 `main.ts` 文件：

```typescript
const add = (num1: number, num2: number) => {
  return num1 + num2;
};
console.log(add(10, 20));
```

### 方案一：tsc 编译器

#### 安装 TypeScript

使用 `TypeScript Compiler` 将 TypeScript 转换为 JavaScript：

```bash
npm install typescript -D
```

生成 TypeScript 配置文件：

```bash
npx tsc --init
```

生成的配置文件如下：

![tsconfig.json](https://picx.zhimg.com/80/v2-845d8a6c03be39522dab98b5c644a60d_1020w.png)

执行编译命令：

```bash
npx tsc main.ts
```

![编译结果](https://picx.zhimg.com/80/v2-31a66cd1a86cae6baabc8baab8eecda1_1020w.png)

输出的 `main.js` 文件：

```javascript
var add = function (num1, num2) {
    return num1 + num2;
};
console.log(add(10, 20));
```

### 方案二：ts-loader

#### 安装依赖

在 `webpack` 环境中手动执行 `tsc` 编译非常不便，可以使用 `ts-loader` 自动化处理：

```bash
npm install ts-loader -D
```

#### Webpack 配置

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
    ],
  },
};
```

#### 示例代码

在 `main.ts` 中：

```typescript
export const post = (num1: number, num2: number) => {
  fetch('www.baidu.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ num1, num2 }),
  })
    .then((res) => {
      console.log(res);
      return res.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
};
```

在 `src/index.ts` 中：

```typescript
import { post } from './main.ts';

const num1 = 1;
const num2 = 2;
post(num1, num2);
```

执行 `yarn build` 即可成功打包。

#### 方案评估

**优点：** 提供完整的类型检查，类型错误会在编译时报错

```typescript
import { post } from './main.ts';

const num1 = 1;
const num2 = '20'; // 错误：应该传入 number 类型
post(num1, num2);
```

![类型错误提示](https://picx.zhimg.com/80/v2-487807241e4b0f34ce5191a333bf6b09_1020w.png)

**缺点：** 不包含 `polyfill`，在低版本浏览器中可能出现兼容性问题

### 方案三：babel-loader

#### 安装预设

除了使用 `TypeScript Compiler`，也可以使用 `Babel` 来编译 TypeScript。虽然可以使用插件 `@babel/transform-typescript`，但更推荐使用预设 `@babel/preset-typescript`：

```bash
npm install @babel/preset-typescript -D
```

#### 配置文件

`webpack.config.js` 配置：

```javascript
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: false,
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
};
```

`babel.config.js` 配置：

```javascript
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.01%, last 2 versions, not dead',
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/preset-typescript',
  ],
};
```

#### 方案评估

**优点：** 包含 `polyfill` 支持，无需担心低版本浏览器的兼容性问题

**缺点：** 缺少类型检查，类型错误不会在编译时报错

### 方案四：最佳实践

#### 组合方案

我们应该同时利用 `ts-loader` 和 `babel` 的优势：

使用 `tsc` 进行类型检查

使用 `babel` 进行代码转换和 `polyfill` 注入

#### 实现方式

在 `package.json` 中利用 npm 脚本的生命周期，在打包前先执行类型检查：

```json
{
  "name": "10-babel-polyfill",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "check": "tsc --noEmit",
    "prebuild": "yarn run check",
    "build": "webpack"
  }
}
```

::: tip 工作流程
当执行 `yarn build` 时，npm 会自动先执行 `prebuild` 钩子，运行类型检查。只有类型检查通过后，才会继续执行实际的 `webpack` 打包命令。这样既保证了类型安全，又确保了运行时的浏览器兼容性。
:::

## 总结

通过合理配置 `Babel` 和 `TypeScript`，我们可以在享受现代 JavaScript 特性的同时，确保代码能够在各种浏览器环境中正常运行。

推荐使用 `usage` 模式的 `polyfill` 配置，并结合 TypeScript 类型检查，既能减小打包体积，又能保证代码质量。