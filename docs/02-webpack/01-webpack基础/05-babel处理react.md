---
date: 2025-09-20 07:53:48
title: 05-处理React
permalink: /webpack/4fhq6
categories:
  - Webpack
coverImg: /img/webpack_babel.jpeg
tags:
  - Babel 基础使用
---

# Babel 处理 React

> 本文将在上一章配置的基础上，继续增加 React 和 TypeScript 的处理配置

## 安装 React 依赖

React 项目需要安装两个核心包：`react` 和 `react-dom`

```bash
npm i react react-dom
```

## 初始化 React 文件

### 创建 React 组件

在 `src` 目录下创建 `page/react/App.jsx` 文件：

```jsx
import React from 'react'

export const ReactApp = () => {
  const [count, setCount] = React.useState(0)
  
  return (
    <>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </>
  )
}
```

### 配置入口文件

在 `src/index.js` 文件中添加 React 应用的渲染代码：

```js
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReactApp } from 'page/react/App.jsx'

// 渲染 React 应用
ReactDOM.createRoot(document.getElementById('root')).render(<ReactApp />)
```

### 添加 HTML 根节点

在根目录的 `index.html` 中添加 React 的挂载节点：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="./build/index.js"></script>
  </body>
</html>
```

## 配置 React 预设

### 安装预设包

安装 `@babel/preset-react` 预设：

```bash
npm i @babel/preset-react -D
```

### 修改 Webpack 配置

在 `webpack.config.js` 中新增对 `jsx` 和 `tsx` 扩展名的解析：

```js{4}
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}
```

### 配置 Babel 预设

在 `babel.config.js` 中添加 React 预设：

```js{12}
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: 'defaults',
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/preset-react',
  ],
}
```

### 验证配置

执行打包命令 `npm run build`，查看效果：

![React 打包效果](https://pica.zhimg.com/80/v2-58f49fad9f8de8189a92dca7a5df1cac_1020w.png)

## React 预设参数详解

### runtime 参数

**作用：** 控制 JSX 的转换方式

**默认值：**

- Babel 7（旧版本）：默认 `classic`
- Babel 8（当前版本）：默认 `automatic`

#### classic 模式（旧版模式）

需要手动导入 React，适用于旧项目迁移。

**Babel 配置：**

```js
module.exports = {
  presets: [
    [
      '@babel/preset-react',
      {
        runtime: 'classic'  // Babel 7 中可以省略
      }
    ]
  ]
}
```

**React 代码示例：**

```jsx
import React from 'react'

function App() {
  return <div>Hello World</div>
}
```

**关键特点：** 必须在每个使用 JSX 的文件顶部写 `import React from 'react'`

#### automatic 模式（推荐）

自动从 `react/jsx-runtime` 导入 JSX 函数，代码更简洁。

**Babel 配置：**

```js
module.exports = {
  presets: [
    [
      '@babel/preset-react',
      {
        runtime: 'automatic'  // Babel 8 中可以省略
      }
    ]
  ]
}
```

**React 代码示例：**

```jsx
// 不再需要 import React from 'react'
function App() {
  return <div>Hello World</div>
}
```

**优势：** 代码更简洁，无需手动导入 React

### development 参数

**作用：** 是否添加开发环境下的调试信息（如组件名称提示）

**默认值：** `false`

**配置示例：**

```js
module.exports = {
  presets: [
    [
      '@babel/preset-react',
      {
        development: process.env.BABEL_ENV === 'development',
      },
    ],
  ],
}
```

### importSource 参数

**作用：** 指定由哪个库来提供 JSX 的转换函数

**默认值：** `react`

**生效前提：** 此选项仅在 `runtime` 被设置为 `automatic` 时才有效

#### 使用 React（默认值）

**适用场景：** 所有标准的、纯粹的 React 项目

**Babel 配置：**

```js
module.exports = {
  presets: [
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        importSource: 'react',  // 默认值，可以不设置
      },
    ],
  ],
}
```

**说明：** 如果不写 `importSource` 这个配置，Babel 就会默认使用这个值。它告诉 Babel，JSX 是为 React 服务的。

**转换结果：** Babel 会生成从 `react` 包中导入 JSX 运行时的代码

```js
import { jsx } from "react/jsx-runtime"
```

#### 使用 Emotion

**适用场景：** 使用 Emotion 这个 CSS-in-JS 库的项目

**安装依赖：**

```bash
npm install @emotion/react @emotion/babel-plugin  --save-dev
```

**Babel 配置：**

```js
module.exports = {
  presets: [
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        importSource: '@emotion/react',
      },
    ],
  ],
  "plugins": [
    // Emotion 官方推荐 添加这个插件的好处是，它能提供更好的调试体验 
    // 比如在开发者工具中显示更有意义的组件名）和更优的性能（比如更智能的 CSS 压缩和优化）。
    "@emotion/babel-plugin"
  ]
}
```

**说明：** Emotion 提供了强大的 `css prop` 功能，但这并非 React 的标准功能。通过将 `importSource` 指向 `@emotion/react`，Babel 会使用 Emotion 提供的、经过特殊改造的 JSX 转换函数，这个函数能正确识别并处理 `css prop`，将其转化为实际的 CSS 类和样式。

**React 代码示例：**

```jsx
import { css } from '@emotion/react'

const titleStyles = css`
  color: cornflowerblue;
  font-family: sans-serif;
  &:hover {
    color: orange;
  }
`

function Title() {
  // 这个 css prop 不是标准的 React API，它是由 Emotion 提供的
  return <h1 css={titleStyles}>Hello Emotion!</h1>
}
```

**转换结果：**

```js
import { jsx } from "@emotion/react/jsx-runtime"
```

#### 使用 Preact

**适用场景：** 使用 Preact 库的项目（Preact 是一个轻量级的 React 替代方案）

**安装依赖：**

```bash
npm install preact
```

**Babel 配置：**

```js
module.exports = {
  presets: [
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        importSource: 'preact',
      },
    ],
  ],
}
```

**说明：** 如果你想在项目中使用 Preact，但依然享受 `automatic` 运行时带来的便利（无需手动 import），就需要将 `importSource` 设置为 `preact`。

**React 代码示例：**

```jsx
// 神奇的是，写的 JSX 代码可以和 React 的一模一样，不会报错
function MyComponent() {
  return <p>Hello, this is a Preact component.</p>
}
```

**转换结果：**

```js
import { jsx } from "preact/jsx-runtime"
```

### throwIfNamespace 参数

**作用：** 是否禁止使用 XML 命名空间标签（如 `<svg:circle>`）

**默认值：** `true`

**配置示例：**

```js
{
  throwIfNamespace: false  // 允许使用（默认是 true，遇到会报错）
}
```

### pure 参数

**作用：** 是否在编译时添加 JSX 中的纯注释（如 `/*#__PURE__*/`，用于 Tree Shaking）

**默认值：** `true`

**配置示例：**

```js
{
  pure: true  // 默认开启
}
```

## React 预设完整配置示例

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.5%, not dead',
        useBuiltIns: 'usage',
        corejs: 3,
        modules: false,
        bugfixes: true
      }
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        development: process.env.NODE_ENV === 'development'
      }
    ]
  ]
}
```

## 处理 TypeScript 文件

### 创建 TypeScript 组件

在 `src` 目录下创建 `page/react/App/index.tsx` 文件：

```tsx
import React from 'react'

interface Person {
  name: string
  age: number
  gender: string
}

const PersonComponent = () => {
  const p1: Person = {
    name: 'zhangsan',
    age: 18,
    gender: 'male',
  }
  
  return (
    <div>
      <h1>{p1.name}</h1>
      <h1>{p1.age}</h1>
      <h1>{p1.gender}</h1>
    </div>
  )
}

export default PersonComponent
```

### 在 App.jsx 中引入

```jsx
import React from 'react'
import PersonComponent from './index.tsx'

export const ReactApp = () => {
  const [count, setCount] = React.useState(0)
  
  return (
    <>
      <PersonComponent/>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </>
  )
}
```

### 安装 TypeScript 预设

```bash
npm i @babel/preset-typescript -D
```

## TypeScript 预设参数详解

### allExtensions 参数

**作用：** 所有处理的文件都视为 TypeScript（如果 `isTSX` 也为 `true`，则视为 TSX）

**默认值：** `false`

**适用场景：** 在 `.js` 文件中使用 `ts` 语法

**代码示例：** `mixed.js` 文件

```js
let name: string = "world"
console.log(`Hello, ${name}`)
```

**Babel 配置：**

```js
module.exports = {
  presets: [
    [
      '@babel/preset-typescript',
      { allExtensions: true }
    ]
  ]
}
```

**效果：** 正常情况下，Babel 不会对 `.js` 文件应用 TypeScript 预设。启用 `allExtensions: true` 后，它会正确地剥离 `string` 这个类型注解。

### isTSX 参数

**作用：** 强制将文件当作 TSX（TypeScript + JSX）处理（即使扩展名不是 `.tsx`）

**默认值：** `false`

**适用场景：** 在 `.ts` 文件中使用 JSX 语法

**代码示例：** `component.ts` 文件

```ts
export const MyComponent = () => <div>你好</div>
```

**Babel 配置：**

```js
module.exports = {
  presets: [
    [
      '@babel/preset-typescript',
      { isTSX: true, allExtensions: true }
    ],
    '@babel/preset-react'  // 仍然需要这个预设来转换 JSX
  ]
}
```

**效果：** 如果不设置 `isTSX: true`，Babel 会因为在 `.ts` 文件中遇到 `<` 符号而抛出语法错误。启用此选项后，它就能正确解析 JSX。

### jsxPragma 参数

**作用：** 指定 JSX 转换后的函数名（默认是 `React.createElement`）

**默认值：** `React.createElement`

**适用场景：** 配合非 React 的 JSX 运行时（如 Vue 3 的 `h` 函数）

**代码示例：** `component.tsx` 文件

```jsx
const element = <div />
```

**Babel 配置：**

```js
module.exports = {
  presets: [
    [
      '@babel/preset-typescript',
      { jsxPragma: 'h' }
    ]
  ]
}
```

**转换结果对比：**

```js
// 默认输出
const element = React.createElement("div", null)

// 使用 jsxPragma: "h" 后的输出
const element = h("div", null)
```

### allowNamespaces 参数

**作用：** 是否保留 TypeScript 的命名空间（`namespace`）语法

**默认值：** `true`（转换为普通对象）

**适用场景：** 需要保留命名空间结构

**代码示例：** `module.ts` 文件

```ts
namespace MyNamespace {
  export const value = 42
}
```

**Babel 配置：**

```js
module.exports = {
  presets: [
    ['@babel/preset-typescript', { allowNamespaces: true }]  // 默认值，可以不写
  ]
}
```

**说明：** 这个选项默认开启，所以不需要额外配置。如果你把它设为 `false`，上面的代码会导致解析错误。

### allowDeclareFields 参数

**作用：** 是否允许在类的字段上使用 `declare` 关键字

**默认值：** `false`

**说明：** 例如 `declare name: string;`，这些字段在运行时没有任何效果，它们只是用来告知 TypeScript 那些在其他地方被初始化的属性的存在。启用后，Babel 会在转换时简单地移除它们。

**适用场景：** 需要保留类属性的类型声明

**代码示例：** `class.ts` 文件

```ts
class MyClass {
  declare myProp: string  // 描述一个在运行时会存在的属性
}
```

**Babel 配置：**

```js
module.exports = {
  presets: [
    ['@babel/preset-typescript', { allowDeclareFields: true }]
  ]
}
```

**效果：** 如果不启用此选项，Babel 会抛出错误。启用后，`declare myProp: string;` 这会在转换过程中被完全移除。

### onlyRemoveTypeImports 参数

**作用：** 启用后，Babel 将仅仅移除 `import type` 语句

**默认值：** `false`

**说明：** 对于那些可能只用于类型的常规 `import` 语句（例如 `import { MyInterface } from './types'`），它不会移除。这是一个针对超大型代码库的性能优化选项，但准确性可能会降低。通常建议保持其默认值 `false`，让 Babel 自行判断哪些导入需要移除。

**适用场景：** 避免误删普通导入

**代码示例：** `index.ts` 文件

```ts
import type { TypeA } from './types'  // 会被移除
import { TypeB } from './types'       // 开启此选项后，可能不会被移除

let x: TypeA
let y: TypeB
```

**Babel 配置：**

```js
module.exports = {
  presets: [
    ['@babel/preset-typescript', { onlyRemoveTypeImports: true }]
  ]
}
```

**效果：** 设置 `onlyRemoveTypeImports` 为 `true`，会被移除 `import type`，普通导入则不会移除。

### optimizeConstEnums 参数

**作用：** 是否内联 `const enum` 的值

**默认值：** `false`

**说明：** 当设为 `true` 时，所有使用 `const enum` 的地方都会被替换为其实际值，并且 `enum` 对象本身会被完全移除。这可以生成更小、更快的代码。

**适用场景：** 减少代码体积，但可能影响调试

**代码示例：** `index.ts` 文件

```ts
const enum Direction {
  Up,
  Down,
}

let myDirection = Direction.Up
```

**Babel 配置：**

```js
module.exports = {
  presets: [
    ['@babel/preset-typescript', { optimizeConstEnums: true }]
  ]
}
```

**转换结果：**

```js
// 优化后：Direction.Up 被直接替换为 0
let myDirection = 0
```

### rewriteImportExtensions 参数

**作用：** 重写导入路径的扩展名

**默认值：** `false`

**说明：** 这在将 TypeScript 编译为原生 ESM 时非常有用，因为浏览器和 Node.js 的 ESM 要求导入路径必须包含文件扩展名。

**适用场景：** 构建原生 ES 模块（ESM）应用

**代码示例：** `main.ts` 文件

```ts
import { helper } from './helper'
helper()
```

**Babel 配置：**

```js
module.exports = {
  presets: [
    ['@babel/preset-typescript', { rewriteImportExtensions: true }]
  ]
}
```

**转换后的输出：**

```js
// 注意导入路径的变化
import { helper } from './helper.js'
helper()
```

**使用建议：**

- 用打包工具（`Webpack`、`Vite` 等）？默认 `false` 就行
- 不用打包工具，想直接在浏览器或 Node.js（ESM）里跑？需要设置为 `true`

### jsxPragmaFrag 参数

**作用：** 与 `jsxPragma` 类似，但它专门用于 JSX 片段（`<>...</>`）

**默认值：** `React.Fragment`

**适用场景：** 使用非 React 的 JSX 库

**代码示例：** `component.tsx` 文件

```tsx
const fragment = <></>
```

**Babel 配置：** 为了使用一个自定义的 `Fragment` 组件

```js
module.exports = {
  presets: [
    [
      '@babel/preset-typescript',
      { jsxPragmaFrag: 'Fragment' }
    ]
  ]
}
```

**转换后的输出：**

```js
// 默认输出
const fragment = React.createElement(React.Fragment, null)

// 使用 jsxPragmaFrag: "Fragment" 后的输出
const fragment = React.createElement(Fragment, null)
```

### disallowAmbiguousJSXLike 参数

**作用：** 是否禁止可能产生歧义的 JSX 语法

**默认值：** `false`

**说明：** 是否禁止那些看起来像 TypeScript 类型断言（`<Type>value`）的 JSX 语法，这有助于避免解析错误。

**适用场景：** 在 `.tsx` 文件中编写复杂的泛型函数，以避免语法歧义

**代码示例：** `component.tsx` 文件

```tsx
// 这个语法既可以被解释为一个返回 JSX <T> 元素的函数
// 也可以被解释为一个名为 T 的泛型箭头函数
const ambiguous = <T>() => {}
```

**Babel 配置：**

```js
module.exports = {
  presets: [
    [
      '@babel/preset-typescript',
      { isTSX: true, disallowAmbiguousJSXLike: true }
    ]
  ]
}
```

**效果：** 启用此选项后，Babel 会将 `<T>()` 视为一个泛型类型参数，而不是一个 JSX 元素，从而避免了解析冲突。如果你确实想写一个名为 `T` 的 JSX 组件，你应该写成 `<T />` 以消除歧义。

**消除歧义的方法：**

**情况一：本意是想定义一个泛型函数**

添加一个逗号（推荐的技巧）：这个逗号明确地告诉解析器，这是一个泛型参数列表，而不是 JSX。

```tsx
const ambiguous = <T,>() => {}
```

添加一个泛型约束：

```tsx
const ambiguous = <T extends any>() => {}
```

**情况二：本意是想返回一个名为 T 的 JSX 组件**

```tsx
// 假设 T 是一个已经定义好的组件
const T = () => <span>Component T</span>

// 这个函数返回一个 T 组件的实例
const myComponentRenderer = () => <T />
```

### ignoreExtensions 参数（已废弃）

**作用：** 告诉 Babel 忽略具有特定扩展名的文件，即使其他配置（如 `allExtensions`）试图包含它们

**默认值：** `false`

**说明：** 这个选项已经被废弃。推荐使用 Babel 顶层的 `ignore` 配置项来代替，因为它功能更强大且更通用。

**替代方案示例：**

```js
module.exports = {
  presets: [
    ['@babel/preset-typescript', { allExtensions: true }]
  ],
  // 使用顶层的 ignore 来排除 .d.ts 文件
  ignore: [
    '**/*.d.ts'
  ]
}
```

## TypeScript 预设完整配置示例

```js
module.exports = {
  presets: [
    [
      '@babel/preset-typescript',
      {
        allExtensions: false,           // 默认只处理 .ts/.tsx
        isTSX: false,                   // 默认不强制 TSX 模式
        jsxPragma: 'React.createElement', // 默认 React
        allowNamespaces: true,          // 允许命名空间
        allowDeclareFields: false,      // 不允许 declare 字段
        onlyRemoveTypeImports: false,   // 智能删除类型导入
        optimizeConstEnums: false,      // 不优化常量枚举
        rewriteImportExtensions: false, // 不重写扩展名
      },
    ],
  ],
}
```

## 注意事项

**类型擦除：** Babel 只删除 TypeScript 类型，不进行类型检查（需用 `tsc` 单独检查）。

**兼容性：** 部分高级 TypeScript 语法（如装饰器 `@Decorator`）需额外插件（如 `@babel/plugin-proposal-decorators`）。

## 项目完整配置

在 `babel.config.js` 中进行完整配置：

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: 'defaults',
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
}
```

执行 `npm run build` 进行打包查看效果：

![TypeScript 打包效果](https://pic1.zhimg.com/80/v2-3c0dd15179b9671eaabe1cf56a58f489_1420w.png)

## 完整案例代码

查看完整的项目代码示例：[GitHub 仓库地址](https://github.com/webBocai/webpack-/tree/main/02_css_img_js_vue_react)