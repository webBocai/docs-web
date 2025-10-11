---
date: 2025-09-22 17:43:48
title: 06-Babel处理Vue文件 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/06-babel处理vue
categories:
  - Webpack
coverImg: /img/webpack_babel.jpeg
tags:
  - babel的基础使用
---
# 处理`Vue`
> **我们会继续使用上一章的配置，在此基础上增加配置，需要将上一章 React配置东西先移除，TypeScript 预设不用删除**
### 一、安装`vue`

 在 `webpack ` 环境下使用`vue` 需要安装 `vue-loader` 

```sh
npm i vue
npm i vue-loader -D
```

#### 初始化`vue`文件

在 `src` 目录下创建  `page/vue/App.vue` 

```vue [App.vue]
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
    };
  },
};
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
####  配置 vue-loader 

 然后在配置文件中添加 `vue-loader`  配置

  ```js{6-13} [webpack.config.js]
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

 打包会报错，这是因为我们必须添加` @vue/compiler-sfc` 来对 `template` 进行解析

```js
const { VueLoaderPlugin } = require('vue-loader/dist/index');
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
  plugins: [new VueLoaderPlugin()], // [!code ++]
}


```

- 在`src/index.js`文件中添加以下代码
```js
// import './components/cps.js';
import { createApp } from 'vue'; // vue
import App from 'page/vue/App'; // vue
// import React from 'react'; // react
// import ReactDOM from 'react-dom/client'; // react
import { ReactApp } from 'page/react/App'; // react
// vue
const app = createApp(App);
app.mount('#app');
// react
// ReactDOM.createRoot(document.getElementById('root')).render(<ReactApp />);

```

- 执行`npm run build`  查看效果

<img src="https://pic1.zhimg.com/80/v2-26e718c21b18992ccc1b1912b70b3630_1420w.png"  />

### 二、`vue`中使用`tsx`语法


<!-- #### 1.`vue`中使用`tsx`语法 -->

- 首先我们需要安装一个`babel`插件帮我去处理 `vue` 中的`tsx`语法

  - 安装 `babel-plugin-jsx` [ 详细可以查看文档](https://github.com/vuejs/babel-plugin-jsx/blob/main/packages/babel-plugin-jsx/README-zh_CN.md)

  ```sh
  npm install @vue/babel-plugin-jsx -D
  ```

#####    插件参数


- :one: `transformOn`  **默认值**: `"false"`   (**建议开启**)
    - **作用**：`on: { click: xx }` 是否转换为 `onClick: xxx`
     ::: details 查看代码例子
     - **默认未启用** `transformOn: false`
     ```js
     // 输入（JSX）
     <button on={{ click: handleClick }}>Click</button>
     
     // 输出（编译后）
     h('button', { on: { click: handleClick } }, 'Click')
     ```

     - 启用 `transformOn: true`

     ```         js
     // 输入（JSX）
     <button onClick={handleClick}>Click</button>
     
     // 输出（编译后）
     h('button', { onClick: handleClick }, 'Click')      
     ```
     :::

- :two: `optimize`  **默认值**： `false`  (**建议开启**)
    - **作用**：启用静态内容优化（类似Vue模板的静态节点提升），减少渲染开销。

- :three: `isCustomElement` **默认值**：`undefined`
   - **类型**：`(tag: string) => boolean`
   - **作用**：**自定义元素检测函数**，用于**标记非 `Vue` 组件的原生自定义元素**（如 `Web Components`）。
      ::: details 查看代码例子
      - 在 `babel.config.js`文件中
        ```js [babel.cofig.js]
        // babel.config.js
        module.exports = {
          plugins: [
            ["@vue/babel-plugin-jsx", {
              isCustomElement: (tag) => {
                // 匹配以 "ion-" 开头的标签（如 Ionic 框架组件）
                return tag.startsWith('ion-') 
                // 或明确指定标签名
                || ['my-web-component', 'vue-google-map'].includes(tag);
              }
            }]
          ]
        };
      ```
      - JSX使用

        ```jsx
        // 输入（JSX）
        <div>
          <ion-button onClick={handleClick}>Click</ion-button>
          <my-web-component title="Hello" />
        </div>
        ```
      - 输出（编译后）
      - 这些标签会被直接渲染为原生自定义元素，而非 Vue 组件
      :::
 
- :four: `mergeProps` **默认值**：`true`
   - 作用：**自动合并分散的 `props`**（如`class`、`style`、`on*`事件）。
     ::: details 查看代码例子
     - **未启用 `mergeProps: false `**
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

     - **问题**：如果父组件传递了额外的 `class` 或 `style`，需要手动合并（如 `class: [props.class, 'header']`）。

     - **默认启用 `mergeProps: true`**
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

      - **优势**：自动合并外部传入的 `class`、`style` 和事件（如父组件传递的 `className` 或 `onClick`），无需手动处理。
     :::

- :five: `enableObjectSlots` **默认值**：`true`  (`Vue3`中默认`false` `Vue2` **兼容模式需要手动开启**)
  - 作用：是否 **启用对象形式的插槽语法**
     ::: details 查看代码例子
      - **启用 `enableObjectSlots: true`**
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
     
      - **禁用 `enableObjectSlots: false`**
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
     ::: 
- :six:**`pragma`** **默认值**：`createVNode` (`Vue3`) / `vueJsxCompat` (`Vue2`)
  - 类型：`string`
  - 作用：自定义 `JSX` 编译后的函数名（高级用法） **默认行为（Vue 3）**
      ::: details 查看代码例子
      - 默认行为 `vue3`
        ```js
        // JSX 输入
        <div>Hello</div>
        
        // 编译输出
        import { createVNode as _createVNode } from 'vue'
        _createVNode('div', null, 'Hello')
        ```
  
     - **自定义 `pragma`**

        ```js
        // Babel 配置
        {
          plugins: [
            ["@vue/babel-plugin-jsx", {
              pragma: 'myCustomCreateElement' // 自定义函数名
            }]
          ]
        }
       ```
     - 开发和编译的结果
       ```jsx
        // JSX 输入
        <div>Hello</div>
        
        // 编译输出
        import { myCustomCreateElement as _createVNode } from './custom-renderer'
        _createVNode('div', null, 'Hello')
        ```
      :::

  <!-- - 如果你的项目中没有`react` 可以直接在 `babel.config.js` 里面的 `plugins` 这样写 -->

  #### 完整配置示例
   在 `webpack`配置文件中
   ```js [babel.config.js]
     module.exports = {
       // ...省略其它配置
       module:{
         rules:[
           // ...省略扩展名配置
           {
             test: /\.(jsx|tsx|js|ts)$/,
             // use: {
             // loader: 'babel-loader'
             // }
             loader: 'babel-loader', // [!code ++]
           },
           { // [!code ++]
             test: /\.vue$/, // [!code ++]
             use: ['babel-loader', 'vue-loader'], // [!code ++]
           }, // [!code ++]
         ]
       }
     }
   ```
  在`babel.cofig.js`
  ``` js{20-28} [babel.config.js]
  const path = require('path');
  module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: 'defaults', // 兼容主流浏览器最新两个版本
          useBuiltIns: 'usage', // 在入口文件全局引入 Polyfill
          corejs: 3,
        },
      ],
      [
        '@babel/preset-typescript',
        {
          allExtensions: true, // 允许所有文件扩展名使用 TS
          isTSX: true, // 启用 TSX 支持
        },
      ],
    ],
    plugins: [ // [!code focus]
          [ // [!code focus]
            '@vue/babel-plugin-jsx', // 这是关键插件，负责转换 Vue JSX [!code focus]
            { // [!code focus]
              optimize: true, // [!code focus]
              transformOn: true, // [!code focus] 必须启用事件语法转换
            }, // [!code focus]
        ], // [!code focus]
     ] // [!code focus]
  };
  
  ```

#### 在vue项目使用`jsx`或`tsx`
在项目中有两种使用方式 一种是在 扩展名 `.vue` 使用 另一种扩展名直接就是 `.jsx` 或者 `.tsx` 

  ##### 扩展名为`.vue` 

  - 当我们配置好 `babe-plugin-jsx`这个插件就可以在在`src/page/vue` 目录下创建 一个 `myComponet.vue`
    ```vue [myComponet.vue]
    <script lang="tsx">
    import { defineComponent, ref } from 'vue';
    
    export default defineComponent({
      setup() {
        const count = ref(0);
    
        const increment = () => {
          count.value++;
        };
    
        return () => (
          <div>
            <p>Count: {count.value}</p>
            <button onClick={increment}>Increment</button>
          </div>
        );
      },
    });
    </script>
    ```

- 使用`setup` 语法糖 (**不推荐**)
  - 首先官方写法中还未支持`jsx` 方式，只能采用一种迂回的方式使用
    ::: details 不推荐原因
     - 这种方式比较迂回，通常不推荐，因为它混合了两种不同的渲染范式。
     - 增加了复杂性：您需要创建一个额外的“包装”组件
     - 范式混用：在一个组件内同时使用**模板语法和 JSX** 会让**代码难以理解和维护**。
    ::: 
  - 迂回的方式使用 `setup`语法糖
     ::: details 查看案列
       ```vue
       <template>
         <jsx />
       </template>
       <script lang="tsx" setup>
       import { ref } from 'vue';
       
       const count = ref(0);
       const props = defineProps({ num: Number });
       console.log('props', props);
       
       const increment = () => {
         count.value++;
       };
       
       const jsx = () => (
         <div>
           <p>Count: {count.value}</p>
           <button onClick={increment}>Increment</button>
         </div>
       );
       </script>
       ```
    
     - 将此组件放进 `App.vue`
     
     ```vue
     <template>
       <h1>{{ title }}</h1>
       <div>{{ context }}</div>
       <MyComponet />
     </template>
     <script>
     import MyComponet from './myComponet.vue';
     export default {
       components: { Hello },
       data() {
         return {
           title: 'vue',
           context: 'vue',
         };
       },
     };
     </script>
     
     ```
     :::


#####  扩展名为`.tsx` 

- 在 `src/page/vue` 目录创建`tsx/index.tsx`

  ```tsx
  import { defineComponent, onMounted, ref, useTemplateRef, watch } from 'vue';
  export default defineComponent({
    name: 'VueHello',
    setup() {
      const count = ref(10001);
      const increment = () => count.value++;
      return () => (
        <div className="vue-component">
          <h1>Vue TSX Component</h1>
          <h2 onClick={increment}>Count: {count.value}</h2>
        </div>
      );
    },
  });
  
  ```
  - 更多操作可以查看 [vue官方文档JSX](https://cn.vuejs.org/guide/extras/render-function#declaring-render-function) <p></p>


  ##### 使用JSX组件 

  - 在 `App.vue` 组件中

    ```vue [App.vue]
    <template>
      <h1>{{ title }}</h1>
      <div>{{ context }}</div>
      <myComponet />
    </template>
    <script>
       import myComponet from './myComponet.vue';
       export default {
         components: { myComponet },
         data() {
           return {
             title: 'vue',
             context: 'vue',
           };
         },
       };
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

 > [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/02_css_img_js_vue_react)