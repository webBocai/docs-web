---
date: 2025-09-22 17:43:48
title: 06-处理Vue
permalink: /pages/06-babel-handle-vue
categories:
  - Webpack
coverImg: /img/webpack_babel.jpeg
tags:
  - Babel 基础使用

---

# Babel 处理 Vue

> 本文将在上一章配置的基础上增加 Vue 的处理配置。需要将上一章 React 配置相关内容先移除，但 TypeScript 预设保留。

## 安装 Vue 依赖

在 `webpack` 环境下使用 `vue` 需要安装 `vue` 和 `vue-loader`：

```bash
npm i vue
npm i vue-loader -D
```

## 初始化 Vue 文件

在 `src` 目录下创建 `page/vue/App.vue` 文件：

```vue
<template>
  <h1>{{ title }}</h1>
  <div>{{ context }}</div>
</template>

<script>
export default {
  data() {
    return {
      title: 'vue',
      context: 'vue',
    }
  },
}
</script>

<style lang="less" scoped>
h1 {
  color: #09f185;
  font-size: 40px;
}
div {
  color: #f10962;
  font-size: 20px;
}
</style>
```

## 配置 vue-loader

### 添加基础配置

在 `webpack.config.js` 配置文件中添加 `vue-loader` 配置：

```js{6-13}
module.exports = {
  // ...其余配置
  module: {
    rules: [
      // 省略其他配置
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
          },
        ],
      },
    ]
  }
}
```

### 添加 VueLoaderPlugin

此时打包会报错，这是因为我们必须添加 `@vue/compiler-sfc` 来对 `template` 进行解析，同时需要引入 `VueLoaderPlugin` 插件：

```js{1,16}
const { VueLoaderPlugin } = require('vue-loader/dist/index')

module.exports = {
  // ...其余配置
  module: {
    rules: [
      // 省略其他配置
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
          },
        ],
      },
    ]
  },
  plugins: [new VueLoaderPlugin()],
}
```

### 配置入口文件

在 `src/index.js` 文件中添加 Vue 应用的渲染代码：

```js
import { createApp } from 'vue'
import App from 'page/vue/App'

// 创建并挂载 Vue 应用
const app = createApp(App)
app.mount('#app')
```

### 验证配置

执行 `npm run build` 查看效果：

![Vue 打包效果](https://pic1.zhimg.com/80/v2-26e718c21b18992ccc1b1912b70b3630_1420w.png)

## Vue 中使用 JSX/TSX 语法

### 安装 JSX 插件

首先需要安装一个 `babel` 插件来处理 Vue 中的 JSX/TSX 语法。详细文档可以查看 [babel-plugin-jsx 官方文档](https://github.com/vuejs/babel-plugin-jsx/blob/main/packages/babel-plugin-jsx/README-zh_CN.md)。

```bash
npm install @vue/babel-plugin-jsx -D
```

## JSX 插件参数详解

### transformOn 参数

**作用：** 将 `on: { click: xx }` 转换为 `onClick: xxx`

**默认值：** `false`

**建议：** 开启此选项

#### 默认未启用（transformOn: false）

```js
// JSX 输入
<button on={{ click: handleClick }}>Click</button>

// 编译输出
h('button', { on: { click: handleClick } }, 'Click')
```

#### 启用后（transformOn: true）

```js
// JSX 输入
<button onClick={handleClick}>Click</button>

// 编译输出
h('button', { onClick: handleClick }, 'Click')
```

### optimize 参数

**作用：** 启用静态内容优化（类似 Vue 模板的静态节点提升），减少渲染开销

**默认值：** `false`

**建议：** 开启此选项以提升性能

### isCustomElement 参数

**作用：** 自定义元素检测函数，用于标记非 Vue 组件的原生自定义元素（如 Web Components）

**类型：** `(tag: string) => boolean`

**默认值：** `undefined`

#### 配置示例

在 `babel.config.js` 文件中：

```js
module.exports = {
  plugins: [
    ["@vue/babel-plugin-jsx", {
      isCustomElement: (tag) => {
        // 匹配以 "ion-" 开头的标签（如 Ionic 框架组件）
        return tag.startsWith('ion-') 
        // 或明确指定标签名
        || ['my-web-component', 'vue-google-map'].includes(tag)
      }
    }]
  ]
}
```

#### JSX 使用示例

```jsx
// JSX 输入
<div>
  <ion-button onClick={handleClick}>Click</ion-button>
  <my-web-component title="Hello" />
</div>
```

这些标签会被直接渲染为原生自定义元素，而非 Vue 组件。

### mergeProps 参数

**作用：** 自动合并分散的 `props`（如 `class`、`style`、`on*` 事件）

**默认值：** `true`

#### 未启用（mergeProps: false）

```js
// JSX 输入
<div
  class="header"
  style={{ color: 'red' }}
  onClick={handleClick}
  onCustomEvent={handleCustom}
/>

// 编译输出（Vue 3）
h('div', {
  class: "header",
  style: { color: 'red' },
  onClick: handleClick,
  onCustomEvent: handleCustom
})
```

**问题：** 如果父组件传递了额外的 `class` 或 `style`，需要手动合并（如 `class: [props.class, 'header']`）。

#### 默认启用（mergeProps: true）

```js
// JSX 输入
<div
  class="header"
  style={{ color: 'red' }}
  onClick={handleClick}
  onCustomEvent={handleCustom}
/>

// 编译输出（Vue 3）
h('div', _mergeProps({
  class: "header",
  style: { color: 'red' },
  onClick: handleClick,
  onCustomEvent: handleCustom
}, otherProps))
```

**优势：** 自动合并外部传入的 `class`、`style` 和事件（如父组件传递的 `className` 或 `onClick`），无需手动处理。

### enableObjectSlots 参数

**作用：** 是否启用对象形式的插槽语法

**默认值：** 

- Vue 3：`false`
- Vue 2 兼容模式：需要手动开启

#### 启用后（enableObjectSlots: true）

```jsx
// 父组件 JSX
<Child
  v-slots={{
    // 默认插槽
    default: () => <div>默认内容</div>,
    // 具名插槽
    footer: (props) => <span>{props.text}</span>
  }}
/>

// 编译输出（Vue 3）
h(Child, null, {
  default: () => h("div", null, "默认内容"),
  footer: (props) => h("span", null, props.text)
})
```

#### 禁用后（enableObjectSlots: false）

```jsx
// 父组件 JSX（Vue 3 原生写法）
<Child>
  {{
    default: () => <div>默认内容</div>,
    footer: (props) => <span>{props.text}</span>
  }}
</Child>

// 编译输出
h(Child, null, {
  default: () => h("div", null, "默认内容"),
  footer: (props) => h("span", null, props.text)
})
```

### pragma 参数

**作用：** 自定义 JSX 编译后的函数名（高级用法）

**类型：** `string`

**默认值：** 

- Vue 3：`createVNode`
- Vue 2：`vueJsxCompat`

#### 默认行为（Vue 3）

```js
// JSX 输入
<div>Hello</div>

// 编译输出
import { createVNode as _createVNode } from 'vue'
_createVNode('div', null, 'Hello')
```

#### 自定义 pragma

**Babel 配置：**

```js
{
  plugins: [
    ["@vue/babel-plugin-jsx", {
      pragma: 'myCustomCreateElement' // 自定义函数名
    }]
  ]
}
```

**编译结果：**

```js
// JSX 输入
<div>Hello</div>

// 编译输出
import { myCustomCreateElement as _createVNode } from './custom-renderer'
_createVNode('div', null, 'Hello')
```

## 完整配置示例

### Webpack 配置

在 `webpack.config.js` 配置文件中：

```js
module.exports = {
  // ...省略其它配置
  module: {
    rules: [
      // ...省略扩展名配置
      {
        test: /\.(jsx|tsx|js|ts)$/,
        loader: 'babel-loader',
      },
      {
        test: /\.vue$/,
        use: ['babel-loader', 'vue-loader'],
      },
    ]
  }
}
```

### Babel 配置

在 `babel.config.js` 文件中：

```js{20-28}
const path = require('path')

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
    [
      '@babel/preset-typescript',
      {
        allExtensions: true,
        isTSX: true,
      },
    ],
  ],
  plugins: [
    [
      '@vue/babel-plugin-jsx', // 核心插件，负责转换 Vue JSX
      {
        optimize: true,
        transformOn: true, // 必须启用事件语法转换
      },
    ],
  ],
}
```

## 在 Vue 项目中使用 JSX/TSX

在项目中有两种使用方式：

1. 在 `.vue` 文件中使用 JSX/TSX
2. 使用 `.jsx` 或 `.tsx` 扩展名

### 在 .vue 文件中使用

#### 使用 setup 函数（推荐）

当配置好 `babel-plugin-jsx` 插件后，可以在 `src/page/vue` 目录下创建一个 `myComponent.vue` 文件：

```vue
<script lang="tsx">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)

    const increment = () => {
      count.value++
    }

    return () => (
      <div>
        <p>Count: {count.value}</p>
        <button onClick={increment}>Increment</button>
      </div>
    )
  },
})
</script>
```

#### 使用 setup 语法糖（不推荐）

**不推荐原因：**

- 这种方式比较迂回，通常不推荐，因为它混合了两种不同的渲染范式
- 增加了复杂性：您需要创建一个额外的"包装"组件
- 范式混用：在一个组件内同时使用模板语法和 JSX 会让代码难以理解和维护

**迂回的方式：**

```vue
<template>
  <jsx />
</template>

<script lang="tsx" setup>
import { ref } from 'vue'

const count = ref(0)
const props = defineProps({ num: Number })
console.log('props', props)

const increment = () => {
  count.value++
}

const jsx = () => (
  <div>
    <p>Count: {count.value}</p>
    <button onClick={increment}>Increment</button>
  </div>
)
</script>
```

**在 App.vue 中使用：**

```vue
<template>
  <h1>{{ title }}</h1>
  <div>{{ context }}</div>
  <MyComponent />
</template>

<script>
import MyComponent from './myComponent.vue'

export default {
  components: { MyComponent },
  data() {
    return {
      title: 'vue',
      context: 'vue',
    }
  },
}
</script>
```

### 使用 .tsx 扩展名（推荐）

在 `src/page/vue` 目录创建 `tsx/index.tsx` 文件：

```tsx
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'VueHello',
  setup() {
    const count = ref(10001)
    const increment = () => count.value++
    
    return () => (
      <div className="vue-component">
        <h1>Vue TSX Component</h1>
        <h2 onClick={increment}>Count: {count.value}</h2>
      </div>
    )
  },
})
```

更多操作可以查看 [Vue 官方文档 - 渲染函数 & JSX](https://cn.vuejs.org/guide/extras/render-function#declaring-render-function)。

### 使用 JSX 组件

在 `App.vue` 组件中引入并使用：

```vue
<template>
  <h1>{{ title }}</h1>
  <div>{{ context }}</div>
  <myComponent />
</template>

<script>
import myComponent from './myComponent.vue'

export default {
  components: { myComponent },
  data() {
    return {
      title: 'vue',
      context: 'vue',
    }
  },
}
</script>

<style lang="less" scoped>
h1 {
  color: #09f185;
  font-size: 40px;
}
div {
  color: #f10962;
  font-size: 20px;
}
</style>
```

## 完整案例代码

查看完整的项目代码示例：[GitHub 仓库地址](https://github.com/webBocai/webpack-/tree/main/02_css_img_js_vue_react)