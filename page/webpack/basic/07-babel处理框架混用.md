---
date: 2025-09-24 17:43:48
title: 07-Babel处理框架混用 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/25cf12
categories:
  - Webpack
coverImg: /img/webpack_babel.jpeg
tags:
  - babel的基础使用
---

# 框架混用
> 在上一章我们配置 `Vue` 如何使用 `tsx`,现在我们想让`React` 和 `Vue` 在同一个项目进行混用
> 有些项目会用到两个框架，我们就用`webpack `简单搭建一下 **框架的混用** <br/>
> 我们复制 **处理React** 和 **处理Vue** 这两章的配置进行搭建

 ::: list-warning 现在我们有几个问题
   -  在 `vue` 中使用了 `tsx` , 如何避免与 `react` 的 `tsx` 语法冲突呢？
   -  如果我是 `vue` 父组件，我想引入`React` 子组件?
   -  如果我是 `React` 父组件，我想引入`vue` 子组件?
 ::: 
### 准备工作
- 在 `src/index.js`文件中
   ```js
  import { createApp } from 'vue'; // vue
  import App from 'page/vue/App'; // vue
  import React from 'react'; // react
  import ReactDOM from 'react-dom/client'; // react
  import { ReactApp } from 'page/react/App'; // react

  // vue
  const app = createApp(App);
  app.mount('#app');
  
  // react
  console.log('ReactApp', ReactApp);
  
  ReactDOM.createRoot(document.getElementById('root')).render(<ReactApp />);
  
  ```

### 避免 `react` 的 `tsx` 语法冲突

####    冲突原因

- 目前如果我们这样写 `babel.config.js`配置
  ::: details 查看更多
  ```js [babel.config.js]
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
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
    plugins: [
      [
        '@vue/babel-plugin-jsx',
        {
          optimize: true,
          transformOn: true, // 必须启用事件语法转换
        },
      ],
    ],
  ```
  :::

- 我们执行`npm run build` 然后运行`index.html` 出现了问题
  ::: details 查看报错
   <img src="https://pic1.zhimg.com/80/v2-ed846914194e4fbab4c7f7a37fc8eba2_1020w.png" />
  ::: 


- **错误原因**

  - :one: 问题出在` Vue` 和 `React` 的 `JSX` 转换逻辑冲突。

  - :two: **混合使用 Vue 和 React 的 JSX 转换逻辑**
    ::: details 查看详情
     - `@vue/babel-plugin-jsx` 会将` JSX` 转换为 `Vue` 的 `h()` 函数（**Vue 的虚拟 DOM 节点**）。
     - `@babel/preset-react` 会将` JSX` 转换为 `React.createElement()`。
    ::: 
  
  - :three: **未隔离 Vue/React 的编译环境**
    - **所有文件**（**包括 React 组件**）都应用了 `Vue` 的 `JSX`转换插件。


#### 解决方案一 (`vtsx`)

  1. 为 `vue的JSX` 文件创建一个另一个扩展名如：`.vtsx`

  2. 将`vue`中的`tsx`扩展名修改成 `.vtsx`
  
  3. 在 `webpack` 配置文件中
     ::: details 查看详情
      - `webpack.config.js` 配置项
        ```js{6-34} [webpack.config.js]
          module.exports = {
           // 其余配置
            module: {
              rules: [
                // 其余配置
                 {
                  test: /\.(vue)$/, // 处理 .vue 和
                  loader: 'vue-loader',
                },
                 {
                  test: /\.(vtsx)$/,
                  exclude: /node_modules/,
                  use: {
                    loader: 'babel-loader',
                    options: {
                      plugins: ['@vue/babel-plugin-jsx'],
                    },
                  },
                },
                 {
                  test: /\.(js|jsx|ts|tsx)$/,
                  exclude: /node_modules/,
                  use: {
                    loader: 'babel-loader',
                    options: {
                      presets: [
                        [
                          '@babel/preset-react',
                          { runtime: 'automatic' },
                        ],
                      ],
                    },
                  },
                }
              ]
            }
          };
        ```
      ::: 
4.  修改 `babel.config.js` 配置项 
    ::: details 查看详情
     ```js [babel.config.js]
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
       ]
     }
    ```
    :::

5. 执行 `npm run build` 查看效果就没问题了
   ::: details 查看效果
   <img src="https://picx.zhimg.com/80/v2-7a550890372bdda8c3dd5a8382a749ce_1020w.png" style="zoom:67%;" />
   :::
6. 但是此时还有问题，我们虽然解决了` vue` 使用 `tsx` 的问题，但是我在`.vue`文件中直接写`tsx` 语法就有问题
  - 这是我们只处理了`.vtsx` 并没有处理 `.vue`里面的`tsx` 语法
    ::: details 查看效果
     <img src="https://pica.zhimg.com/80/v2-9ee28c562a54d37de0d5cd55f8472815_720w.png" style="zoom:67%;" />
    :::


- `babel-loader` 需要处理直接放到配置文件里面，使用 `overrides` 更精细的去处理这些扩展文件 
  ::: details 查看详情
   - 在 `babel-loader` 配置选项中有`overrides`属性 是一个用于**针对特定文件或条件应用不同 Babel 配置的选项**。
   - 它允许你根据**文件路径、环境变量、文件扩展名**等条件，**为不同的文件覆盖或扩展配置**。
  :::
  
- 修改 `babel.config.js`  进行配置

   ```js{21-52} [babel.config.js]
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
   
     overrides: [
       {
         test: /\.(vtsx|vue)$/, //单独进行配置
         exclude: [
           /node_modules/,
           path.resolve(__dirname, 'src/page/react'), // ✅ 排除 React 目录
         ],
         plugins: [
           [
             '@vue/babel-plugin-jsx',
             {
               optimize: true,
               transformOn: true, // 必须启用事件语法转换
             },
           ],
         ], // ✅ // Vue JSX 转换
       },
       // React 文件：使用 React 的 JSX 转换
       {
         test: /\.(js|jsx|ts|tsx)$/,
         exclude: [
           /node_modules/,
           path.resolve(__dirname, 'src/page/vue'), // ✅ 排除 Vue 目录
         ],
         presets: [
           [
             '@babel/preset-react', // ✅ 仅 React JSX
             { runtime: 'automatic' },
           ],
         ],
       },
     ],
   };
   
   ```

- 修改`webpack.config.js`配置
   ```js
   // webpack.config.js
   module.exports = {
    // 其余配置
     module: {
       rules: [
        // ... 其余配置
          {
           test: /\.(js|jsx|ts|tsx)$/,  // [!code --]  
           test: /\.(js|jsx|ts|tsx|vtsx)$/,  // [!code ++]  添加vtsx
           exclude: /node_modules/,
           use: {
             loader: 'babel-loader',
             options: {
               presets: [
                 [
                   '@babel/preset-react',
                   { runtime: 'automatic' },
                 ],
               ],
             },
           },
         }
       ]
     }
   };
   ```

#### 解决方案二（`xxx.vue.tsx`)

- `vue` 的 `tsx` 扩展名不进行更改，但是必须添加前缀 `xxxx.vue.tsx` 这样的格式

- 我们还是在 `babel.config.js` 进行更改把 `vtsx` 的配置更改成 `.vue.tsx` 这样的配置
   ::: details 查看详情
     ```js [babel.config.js]
    module.exports = {
      // ...其它配置
       overrides: [
         {
           test: /\.(vue\.tsx|vue)$/, // 将vtsx删除
           exclude: [
             /node_modules/,
             path.resolve(__dirname, 'src/page/react'), // ✅ 排除 React 目录
           ],
           plugins: [
             [
               '@vue/babel-plugin-jsx',
               {
                 optimize: true,
                 transformOn: true, // 必须启用事件语法转换
               },
             ],
           ], // ✅ // Vue JSX 转换
         },
         // React 文件：使用 React 的 JSX 转换
         {
           test: /\.(js|jsx|ts|tsx)$/,
           exclude: [
             /node_modules/,
             path.resolve(__dirname, 'src/page/vue'), // ✅ 排除 Vue 目录
           ],
           presets: [
             [
               '@babel/preset-react', // ✅ 仅 React JSX
               { runtime: 'automatic' },
             ],
           ],
         },
       ],
    }

     ```
   ::: 

- 最后将`webpack`配置文件的`vtsx`删除就🆗了

###  `Vue`组件与`React`组件互相传参

| 方案                                    | 适用场景             | 优点                 | 缺点                       |
| :-------------------------------------- | -------------------- | -------------------- | -------------------------- |
| **vue createApp** <br/> **React reactRoot** | 少量的跨框架页面     | 简单易用             | 操作`dom` 易用性不高       |
| **Web Components**                      | 长期维护的跨框架项目 | 标准规范，无框架依赖 | 需处理 Shadow DOM 样式隔离 |
| **编译转换**                            | 小型混合功能         | 开发便捷             | 兼容性维护成本高           |
| **微前端**                              | 大型复杂应用         | 独立开发部署         | 通信和路由处理复杂         |

- **以上方案我们目前先练习第一个，在后面我们在慢慢了解其他几个方案**

#### 创建文件

在`src/page/react`创建 `test.tsx` 给`vue`页面使用

```tsx
import React from 'react';

const TestReact = ({ count, onUpdate }) => {
  return (
    <>
      <h1>react接收传参</h1>
      <div onClick={onUpdate(1)}>{count}</div>
    </>
  );
};

export default TestReact;


```

在 `src/page/vue/vue-tsx/` 创建 `test.vue.tsx` 给`react`页面使用

```tsx
import { defineComponent, inject, onMounted } from 'vue';

const TextVue = defineComponent({
  setup() {
    const count = inject('count');
    const setCount = inject('setCount');

    return () => (
      <div>
        <h4>Vue 接收传参</h4>
        <div onClick={() => setCount(count + 1)}>{count}</div>
      </div>
    );
  },
});
export default TextVue;


```

 在  `App.tsx` 中使用 `vue`组件 `test.vue.tsx` 

```tsx
import React, { useEffect, useRef } from 'react'

import { createApp,h } from 'vue'
import VueWrapper from '../vue/vue-tsx/text.vue.tsx'
export const ReactApp = () => {
  const [count, setCount] = React.useState(0)
  const vueContainerRef = useRef(null)
  const vueAppRef = useRef(null)
  useEffect(() => {
    if (vueContainerRef.current && !vueAppRef.current) {
      // 创建 Vue 实例并挂载
      vueAppRef.current = createApp({
         render: () => h(VueWrapper),
        provide: {
          count,
          setCount
        }
      })
      vueAppRef.current.mount(vueContainerRef.current)
    }else if (vueContainerRef.current) {
      // 更新 Vue 实例
      vueAppRef.current.$forceUpdate()
    }
    return () => {
      // 卸载 Vue 实例
      if (vueAppRef.current) {
        vueAppRef.current.unmount()
        vueAppRef.current = null
      }
    }
  }, [count])

  return (
    <>     
    <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <h1>
        react
       <div ref={vueContainerRef} />
      </h1>
    </>
  )
}

```

在 `src/page/vue`  创建 `index.vue.tsx`  然后使用React组件 `test.tsx`

```tsx
import { defineComponent, onMounted, ref, useTemplateRef, watch } from 'vue';
import ReactIndex from '../../react/test.tsx';
import { createRoot } from 'react-dom/client';
import React from 'react';
export default defineComponent({
  name: 'VueHello',
  setup() {
    const count = ref(10001);
    const increment = () => count.value++;
    const reactContainerRef = useTemplateRef('reactContainerChild');
    const PropsCount = (value: number) => {
      return {
        count: value,
        onUpdate: (num: number) => () => {
          count.value = value + num;
        },
      };
    };
    const createReactComponents = (value: number) => {
      const reactElement = React.createElement(ReactIndex, PropsCount(value));
      createRoot(reactContainerRef.value).render(reactElement);
    };
    onMounted(() => {
      if (reactContainerRef.value) {
        createReactComponents(count.value);
      }
    });
    watch(
      () => count.value,
      (newValue, oldValue) => {
        createReactComponents(newValue);
      }
    );
    return () => (
      <div className="vue-component">
        <h3>
          <div ref="reactContainerChild" />
        </h3>
      </div>
    );
  },
});

```

- 执行 `npm run build` 查看效果  这样就没问题
 ::: details 查看效果
 <img src="https://picx.zhimg.com/80/v2-c1f3aa369457cc0e155e00c2830a1302_1020w.png"  />
 ::: 

 > [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/02_css_img_js_vue_react)