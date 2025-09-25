---
date: 2025-09-22 17:43:48
title: 06-Babel处理Vue文件 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/25cf12
categories:
  - Webpack
coverImg: /img/webpack_babel.jpeg
tags:
  - babel的基础使用
---
# 处理`Vue`

#### 一、安装`vue`

 在 `webpack ` 环境下使用`vue` 需要安装 `vue-loader` 

```sh
npm i vue
npm i vue-loader-D
```

##### 初始化`vue`文件

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
##### 配置 vue-loader 

 然后在配置文件中添加 `vue-loader`  配置

```js [webpack.config.js]
//
module: {
  rules: [
    // 省略其他配置
      {
        test: /.vue$/,
        use: [
          {
            loader: 'vue-loader',
          },
        ],
      },
    ]
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
        test: /.vue$/,
        use: [
          {
            loader: 'vue-loader',
          },
        ],
      },
    ]
  }
 
}
 plugins: [new VueLoaderPlugin()],

```

- 在`src/index.js`文件中添加以下代码
```js
// import './components/cps.js';
import { createApp } from 'vue'; // vue
import App from 'page/vue/App'; // vue
import React from 'react'; // react
import ReactDOM from 'react-dom/client'; // react
import { ReactApp } from 'page/react/App'; // react
// vue
const app = createApp(App);
app.mount('#app');
// react
ReactDOM.createRoot(document.getElementById('root')).render(<ReactApp />);

```

- 执行`npm run build`  查看效果

<img src="https://pic1.zhimg.com/80/v2-26e718c21b18992ccc1b1912b70b3630_1420w.png"  />

<!-- #### 二、`React`与`Vue`框架混合使用

- 有些项目会用到两个框架，我们就用`webpack `简单搭建一下 **框架的混用**
- 现在我们有几个问题
  -  在`vue`中使用`tsx`语法 如何使用呢？
  -  在`vue`中使用了`tsx`, 如何避免与`react`的`tsx`语法冲突呢？
  -  如果我是`vue` 父组件，我想引入`React` 子组件
  - 如果我是`React` 父组件，我想引入`vue` 子组件

##### 1.`vue`中使用`tSX`语法

- 首先我们需要安装一个`babel`插件帮我去处理 `vue` 中的`tsx`语法

  - 安装 [` babel-plugin-jsx`](https://github.com/vuejs/babel-plugin-jsx/blob/main/packages/babel-plugin-jsx/README-zh_CN.md)详细可以查看文档

  ```js
  npm install @vue/babel-plugin-jsx -D
  ```

  - 如果你的框架中没有`react` 可以直接在 `babel.config.js` 中这样写

  ``` js
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
    plugins: [
          [
            '@vue/babel-plugin-jsx',
            {
              optimize: true,
              transformOn: true, // 必须启用事件语法转换
            },
          ],
     ]
  };
  
  ```

######    插件参数


-  `transformOn`

  - **类型**: `"boolean"`

  - **默认值**: `"false"`

  - **作用**：`on: { click: xx }` 转换为 `onClick: xxx`

    - 未启用 `transformOn` (默认)

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

- `optimize`

  - **类型**：`boolean`
  - **默认值**：`false`
  - **作用**：启用静态内容优化（类似Vue模板的静态节点提升），减少渲染开销。

- `isCustomElement`

  - **类型**：`(tag: string) => boolean`

  - **默认值**：`undefined`

  - **作用**：自定义元素检测函数，用于**标记非`Vue`组件的原生自定义元素**（如Web Components）。

    - 配置方式（Babel 或 Vue CLI）

    ```js
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

    ```html
    // 输入（JSX）
    <div>
      <ion-button onClick={handleClick}>Click</ion-button>
      <my-web-component title="Hello" />
    </div>
    
    // 输出（编译后）
    // 这些标签会被直接渲染为原生自定义元素，而非 Vue 组件
    ```

-  `mergeProps`

  - 类型：`boolean`

  - 默认值：`true`

  - 作用：自动合并分散的props（如`class`、`style`、`on*`事件）。

    - **未启用 `mergeProps`（或设为 `false`）**

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

    ​     **问题**：如果父组件传递了额外的 `class` 或 `style`，需要手动合并（如 `class: [props.class, 'header']`）。

    - **启用 `mergeProps: true`**

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

      **优势**：自动合并外部传入的 `class`、`style` 和事件（如父组件传递的 `className` 或 `onClick`），无需手动处理。

- `enableObjectSlots`

  - 类型：`boolean`

  - 默认值：`true` (`Vue3`中默认`false`)

  - 作用：启用对象形式的插槽语法（`Vue2`兼容模式需要手动开启）。
  
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
  
- **`pragma`**
  
  - 类型：`string`
  - 默认值：`createVNode` (`Vue3`) / `vueJsxCompat` (`Vue2`)
  - 作用：自定义`JSX`编译后的函数名（高级用法）。
        - **默认行为（Vue 3）**
  
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
    -------------
    // JSX 输入
    <div>Hello</div>
    
    // 编译输出
    import { myCustomCreateElement as _createVNode } from './custom-renderer'
    _createVNode('div', null, 'Hello')
    ```

###### 扩展名为`.vue` 

- 当我们配置好 `babe-plugin-jsx`这个插件就可以在在`src/page/vue` 目录下创建 一个 `myComponet.vue`

```vue
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

- 使用`setup` 语法糖

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

######     扩展名为`.tsx` 

- 在`src/page/vue` 目录创建`tsx/index.tsx`

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
    return () => (
      <div className="vue-component">
        <h1>Vue TSX Component</h1>
        <h2 onClick={increment}>Count: {count.value}</h2>
      </div>
    );
  },
});

```

##### 2. 避免`react`的`tsx`语法冲突

######    冲突原因

- 目前如果我们这样写 `babel.config.js`配置

```js
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

我们执行`npm run build` 然后运行`index.html` 出现了问题

<img src="https://pic1.zhimg.com/80/v2-ed846914194e4fbab4c7f7a37fc8eba2_1020w.png" style="zoom:80%; float:left;" />

- **错误原因**

  - 问题出在` Vue` 和 `React` 的 `JSX` 转换逻辑冲突。
  - **混合使用 Vue 和 React 的 JSX 转换逻辑**
    - `@vue/babel-plugin-jsx` 会将` JSX` 转换为 `Vue` 的 `h()` 函数（Vue 的虚拟 DOM 节点）。
    - `@babel/preset-react` 会将` JSX` 转换为 `React.createElement()`。
  - **未隔离 Vue/React 的编译环境**
    - 所有文件（包括 React 组件）都应用了 `Vue` 的 `JSX`转换插件。


###### 解决方案一(`vtsx`)

  - 为`vue的JSX`文件创建一个另一个扩展名如：`.vtsx`

    - 将`vue`中的`tsx`扩展名修改成 `.vtsx`

    - 在`webpack`配置文件中
    
    ```js
    // webpack.config.js
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

    - `babel.config.js`配置项
    
    ```js
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
    
    执行`npm run build` 查看效果就没问题了

<img src="https://picx.zhimg.com/80/v2-7a550890372bdda8c3dd5a8382a749ce_1020w.png" style="zoom:67%; float:left;" />

- 但是此时还有问题，我们虽然解决了` vue`使用`tsx`的问题，但是我在`.vue`文件中直接写`tsx` 语法就有问题
  - 这是我们只处理了`.vtsx` 并没有处理 `.vue`里面的`tsx` 语法

<img src="https://pica.zhimg.com/80/v2-9ee28c562a54d37de0d5cd55f8472815_720w.png" style="zoom:67%;float:left;" />

- 现在我们直接把 `babel-loader`需要处理直接放到配置文件里面，更精细的去处理这些扩展文件
  - 在`babel-loader`配置选项中有`overrides`属性 是一个用于**针对特定文件或条件应用不同 Babel 配置的选项**。它允许你根据**文件路径、环境变量、文件扩展名**等条件，**为不同的文件覆盖或扩展配置**。
- 在`babel.config.js` 进行配置

```js
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
       {
        test: /\.(js|jsx|ts|tsx|vtsx)$/,  // 添加vtsx
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

###### 解决方案二（`xxx.vue.tsx`)

- `vue`的`tsx`扩展名不进行更改，但是必须添加前缀`xxxx.vue.tsx`这样的格式

- 我们还是在`babel.config.js`进行更改把`vtsx`的配置更改成`.vue.tsx`这样的配置

```js
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
```

- 最后将`webpack`配置文件的`vtsx`删除就🆗了

##### 3. `Vue`组件与`React`组件互相传参

| 方案                                    | 适用场景             | 优点                 | 缺点                       |
| :-------------------------------------- | -------------------- | -------------------- | -------------------------- |
| **vue createApp**  **React reactRoot ** | 少量的跨框架页面     | 简单易用             | 操作`dom` 易用性不高       |
| **Web Components**                      | 长期维护的跨框架项目 | 标准规范，无框架依赖 | 需处理 Shadow DOM 样式隔离 |
| **编译转换**                            | 小型混合功能         | 开发便捷             | 兼容性维护成本高           |
| **微前端**                              | 大型复杂应用         | 独立开发部署         | 通信和路由处理复杂         |

- **以上方案我们目前先练习第一个，在后面我们在慢慢了解其他几个方案**

- 在`src/page/react`创建 `test.tsx` 给`vue`页面使用

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

- 在`src/page/vue/vue-tsx/`创建 `test.vue.tsx` 给`react`页面使用

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

- 在 `App.tsx`中使用 `vue`组件`test.vue.tsx`

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

- 在`src/page/vue` 创建`index.vue.tsx`  然后使用React组件`test.tsx`

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

<img src="https://picx.zhimg.com/80/v2-c1f3aa369457cc0e155e00c2830a1302_1020w.png" style="zoom:67%;float:left" /> -->
