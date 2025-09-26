---
date: 2025-09-20 07:53:48
title: 05-Babel处理React文件 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/25cf12
categories:
  - Webpack
coverImg: /img/webpack_babel.jpeg
tags:
  - babel的基础使用
---

#  Babel处理React
> **我们会继续使用上一章的配置，在此基础上增加配置**
### 一、 安装 react

:gear: react 需要安装两个 `react` 和`react-dom`

``` sh 
npm i react react-dom
```

#### 1. 初始化react文件

 :gear: 在 `src` 目录下创建 `page/react/App.jsx`

  ```jsx [App.react]
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
:gear: 在 `src/index.js` 文件中添加以下代码

```js [index.js]
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactApp } from 'page/react/App.jsx'; // react
// react
ReactDOM.createRoot(document.getElementById('root')).render(<ReactApp />);
```

:gear: 在根目录中`index.html` 中添加 `react`的根

```html [index.html]
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

#### 2. 配置react预设

:gear: 安装`@babel/preset-react`

```sh
npm  i @babel/preset-react -D
```
:gear: 修改 `webpack` 配置文件 新增 `jsx` 和 `tsx` 扩展名解析
  ```js [webpack.config.js]
  module.exports = {
    module: {
      rules: [
        // 省略其他配置
          {
            test: /\.js$/, // [!code --]
            test: /\.(js|jsx|tsx|ts)$/, // [!code ++]
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader'
             }
           }
       ]
     }
  };
```
:gear: 在`babel.config.js` 添加 这个预设

```js [babel.config.js]
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: 'defaults', // 兼容主流浏览器最新两个版本
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/preset-react', // [!code ++]  [!code focus]
  ],
};

```

:gear: 打包 `npm run build ` 查看结果
 ::: details 查看效果
<img src="https://pica.zhimg.com/80/v2-58f49fad9f8de8189a92dca7a5df1cac_1020w.png" />
 ::: 

#### 3. 预设的参数

- :one: `runtime`： 
    - **默认值**
      - `Babel 7` (旧版本): **默认 runtime:  `classic`**。
      - ` Babel 8` (当前版本): **默认 runtime:  `automatic`**
    -  **作用：控制 JSX 的转换方式**
    - `'classic'` **旧版模式**，需 **手动导入React**。
       ::: details 查看代码例子
       - :gear: 在 `babel` 配置文件中
          ```js [babel.config.js]
            module.exports =   {
                 "presets": [
                   [
                     "@babel/preset-react",
                     {
                       "runtime": "classic"  // 在 Babel 7 中，这行可以省略
                     }
                   ]
                 ]
               }
          ```
        - :gear: 在 `React` 代码文件中

          ```jsx [index.react]
              import React from 'react';
              function App() {
                return <div>Hello World</div>;
              }
          ```
       :::

    - `'automatic'`  自动从 `react/jsx-runtime` 导入 `JSX` 函数（**推荐**，**代码更简洁**）。
      ::: details 查看代码例子
       - :gear: 在 `babel` 配置文件中
         ```js [babel.config.js]
            module.exports =  {
             "presets": [
               [
                 "@babel/preset-react",
                 {
                  "runtime": "automatic" // 在 Babel 8 中，这行可以省略
                 }
               ]
             ]
           }
         ```
       - :gear: 在 `React` 代码文件中
        ```jsx [index.react]
          // 你不再需要 import React from 'react';
          // 这让组件代码更简洁
          function App() {
            return <div>Hello World</div>;
          }
        ```
        :::
    - **关键区别**：必须在每个使用 `JSX` 的文件顶部写 `import React from 'react';`。
- :two: **`development`**  **默认值：`false`**

  - **作用**：是否 **添加开发环境下的调试信息**（如**组件名称提示**）。
     ::: details 查看代码例子
      ```js [babel.config.js]
       module.exports = {
         presets: [
           [
             '@babel/preset-react',
             {
               development: process.env.BABEL_ENV === 'development', // 根据环境自动开启
             },
           ],
         ],
       };  
      ```
     :::

- :three: **`importSource`** **默认值：`react`**

  - **作用**：`importSource` 的核心作用是指定由哪个库来提供 `JSX` 的**转换函数**。
  - **生效前提**： 此选项仅在 `runtime` 被设置为 `automatic` 时才有效。在旧的 classic 模式下，这个选项会被忽略。
  - `react` 值
     ::: details 查看属性
      - :zero: 设置配置文件
        ```js [babel.config.js]
          module.exports = {
            presets: [
              [
                '@babel/preset-react',
                {
                  "runtime": "automatic" // 值必须是 automatic Babel 8可以省略
                  importSource: 'react', // 默认值可以不设置
                },
              ],
            ],
          };  
         ```
      - :one: **用途**: 用于所有**标准的、纯粹**的 `React` 项目。
      - :two: **说明**: 如果您不写 `importSource` 这个配置，`Babel `就会默认使用这个值。它告诉 `Babel`，`JSX` 是为 `React` 服务的。
      - :three: **Babel 转换结果**: Babel 会生成从 react 包中导入 JSX 运行时的代码。
          ```js
           import { jsx } from "react/jsx-runtime";
          ```
     :::
   - `@emotion/react` 值
     ::: details 查看属性
      - :zero: 设置配置文件
        ```js [babel.config.js]
          module.exports = {
            presets: [
              [
                '@babel/preset-react',
                {
                  "runtime": "automatic" // 值必须是 automatic Babel 8可以省略
                  importSource: '@emotion/react', 
                },
              ],
            ],
          };  
         ```
      - :one: **安装Emotion库** `npm install @emotion/react`
      - :two: **用途**: 用于使用 `Emotion` 这个 `CSS-in-JS` 库的项目。
      - :three: **说明**: `Emotion` 提供了强大的 `css prop` 功能，但这并 `非React` 的标准功能。通过将 `importSource `指向 `@emotion/react`，`Babel` 会使用 `Emotion` 提供的、经过特殊改造的 `JSX `转换函数，这个函数能正确识别并处理 `css prop`，将其转化为实际的 `CSS` 类和样式。
      - :four: **在React文件**, 这个 `css prop` 不是标准的 `React API`，它是由 `Emotion `提供的
         ```js
         import { css } from '@emotion/react';
         const titleStyles = css`
           color: cornflowerblue;
           font-family: sans-serif;
           &:hover {
             color: orange;
           }
         `;
         
         function Title() {
           // 这个 css prop 不是标准的 React API，它是由 Emotion 提供的
           return <h1 css={titleStyles}>Hello Emotion!</h1>;
         }
         ```
      - :five: **Babel 转换结果**: Babel 会生成从 `@emotion/react` 包中导入 JSX 运行时的代码。
         ```js
          import { jsx } from "@emotion/react/jsx-runtime";
          ```
      
      :::
    - `preact` 值
       ::: details 查看属性
        - :zero: 设置配置文件
          ```js [babel.config.js]
            module.exports = {
              presets: [
                [
                  '@babel/preset-react',
                  {
                    "runtime": "automatic" // 值必须是 automatic Babel 8可以省略
                    importSource: 'preact', 
                  },
                ],
              ],
            };  
           ```
        - :one: **安装preact库** `npm install preact`
        - :two: **用途**: 用于使用 `Preact` 库的项目。`Preact`是一个轻量级的 `React` 替代方案。
        - :three: **说明**: 如果你想在项目中使用 `Preact`，但依然享受 `automatic` 运行时带来的便利（无需手动 `import`），就需要将 `importSource` 设置为 `preact`。
        - :four: **在React文件中** 神奇的是，写的 `JSX `代码可以和 `React` 的一模一样 **不会报错**
           ```js
             function MyComponent() {
              return <p>Hello, this is a Preact component.</p>;
            }
           ```
        - :five: **Babel 转换结果**: Babel 会生成从 `preact` 包中导入 JSX 运行时的代码。
           ```js
            import { jsx } from "preact/jsx-runtime";
            ```
        :::

- :four: **`throwIfNamespace`**  **默认值：`true`**

  - **作用**：是否禁止使用 XML 命名空间标签（如 `<svg:circle>`）
     ```js [js]
     throwIfNamespace: false  // 允许使用（默认是 true，遇到会报错）
     ```

- :five: **`pure`**  **默认值：`true`**

  - **作用**：是否在编译时添加 `JSX` 中的**纯注释**（如 `/*#__PURE__*/`，用于 `Tree Shaking`）。

    ```js
    pure: true  // 默认开启 
    ```

#### 4. 配置示例

 ```js{14-21} [babel.config.js]
 // 在 Babel 配置或 Webpack 的 babel-loader 中
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
     [ // [!code focus]
       '@babel/preset-react', // [!code focus]
       {  // [!code focus]
         runtime: 'automatic', // [!code focus]
         development: process.env.NODE_ENV === 'development' // [!code focus]
       }  // [!code focus]
     ]   // [!code focus]
   ]
 }
 ```

### 二、处理TS或TSx

 #### 创建文件
 
   在 `src` 目录下创建一个 `index.tsx` 文件 路径`page/react/App/index.tsx`

  ```tsx [index.react]
  import React from 'react';
  interface Person {
    name: string;
    age: number;
    gender: string;
  }
  const PersonComponent = () => {
    const p1: Person = {
      name: 'zhangsan',
      age: 18,
      gender: 'male',
    };
    return (
      <div>
        <h1>{p1.name}</h1>
        <h1>{p1.age}</h1>
        <h1>{p1.gender}</h1>
      </div>
    );
  };
  
  export default PersonComponent;
  
  ```

 在 `App.jsx` 进行引入

```jsx [App.react]
import React from 'react'
import  PersonComponent from  './index.tsx'
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
#### 安装ts预设

安装 `preset-typescript`
 ```sh
 npm i @babel/preset-typescript -D
 ```

#### 预设参数

- :one: `allExtensions` **默认值:** `false`

  - **作用**：所有处理的文件都视为 `TypeScript` (**如果 `isTSX` 也为 `true`，则视为 `TSX`**)。如果你在 `.js` 文件中也使用了 `TypeScript` 语法。这个选项会非常有用
  - **场景**：在 `.js` 文件中使用` ts` 语法。
    ::: details 查看更多
     - 代码示例: `mixed.js` 的文件:
      ```js
       let name: string = "world";
       console.log(`Hello, ${name}`);
      ```
     - `Babel` 配置:
      ```js [babel.config.js]
         module.exports = {
           "presets": [
             [
               "@babel/preset-typescript",
               { "allExtensions": true }
             ]
           ]
         }
      ```
     - 结果: 正常情况下，`Babel` 不会对 `.js` 文件应用 `TypeScript` 预设。启用 `allExtensions: true `后，它会正确地剥离： `string` 这个类型注解。
    :::

- :two:`isTSX` **默认值：`false`**
  - **默认情况下**，`Babel` 会根据文件扩展名（`.tsx`）来判断。当你的 `.ts` 文件中包含了 `JSX` 语法时，这个选项会非常有用。
  - **作用**：强制将文件当作 **TSX**（`TypeScript + JSX`）处理（即使扩展名不是 `.tsx`），
  - **场景**：在 `.ts` 文件中使用` JSX` 语法。
     ::: details 查看更多
       - 代码示例: `component.ts` 的文件:
          ```ts [component.ts]
            export const MyComponent = () => <div>你好</div>;
          ```
       - `Babel` 配置:

          ```js [babel.config.js]
          module.exports = {
            "presets": [
              [
                "@babel/preset-typescript",
                { "allExtensions": true }
              ],
               "@babel/preset-react"  // 你仍然需要这个预设来转换 JSX
            ]
          }
          ```
       - 结果: 如果不设置 `isTSX: true`，`Babel `会因为在 `.ts `文件中遇到 `<` 符号而**抛出语法错误**。启用此选项后，它就能正确解析 `JSX`
      :::

- :three:`jsxPragma`  **默认值：`React.createElement"`**

  - **作用**：指定 JSX 转换后的函数名（默认是 `React.createElement`）。
  - **场景**：配合非 React 的` JSX `运行时（如 Vue 3 的 `h` 函数）。
    ::: details 查看更多
     - 代码示例: `component.tsx` 的文件:
      ```js [component.react]
       const element = <div />;
      ```
     - `Babel` 配置:
      ```js [babel.config.js]
      module.exports = {
        "presets": [
          [
            "@babel/preset-typescript",
            { "jsxPragma": "h" }
          ]
        ]
      }
      ```
    - 转换后的输出:
    ```js
    // 默认输出
    const element = React.createElement("div", null);
    // 使用 jsxPragma: "h" 后的输出
    const element = h("div", null);
    ```
    :::


- :four: `allowNamespaces`  **默认：`true`** 转换为普通对象

  - **作用**：是否保留 `TypeScript` 的 **命名空间**（`namespace`）语法
  - **场景**：需要**保留命名空间结构**。
     ::: details 查看更多
      - 代码示例: `module.ts` 的文件:
      ```ts [module.ts]
       namespace MyNamespace {
           export const value = 42;
         }
      ```
      - `Babel 配置`: **这个选项默认开启，所以不需要额外配置**。如果你把它设为 `false`，上面的代码会**导致解析错误**。
     ```js [babel.config.js]
     module.exports =  {
        presets: [
         // 默认值 allowNamespaces 可以不写
         ['@babel/preset-typescript', { allowNamespaces: true  }] 
       ]
     }
    
      ```
     :::



- :five: `allowDeclareFields` **默认：`false`** 

  - **作用**：是否允许在类的字段上使用 `declare `关键字 
     ::: details 解释
       (例如`declare name: string;`),这些字段在**运行时没有任何效果**，它们只是用来告知 `TypeScript `那些在其他地方被初始化的属性的存在，**启用后，Babel 会在转换时简单地移除它们**
     :::
  - **场景**：需要**保留类属性**的类型声明。
    ::: details 查看更多
      - 代码示例: `class.ts` 的文件:
      ```ts [class.ts]
        class MyClass {
          declare myProp: string; // 描述一个在运行时会存在的属性
        }
      ```
      - `Babel 配置`: **这个选项默认开启，所以不需要额外配置**。如果你把它设为 `false`，上面的代码会**导致解析错误**。
     ```js [babel.config.js]
      module.exports = {
         presets: [
           // 默认值 allowNamespaces 可以不写
           ['@babel/preset-typescript', { "allowDeclareFields": true  }] 
         ]
      }
      ```
     - 结果: **如果不启用此选项**，`Babel` 会抛出错误。启用后，`declare myProp: string`; 这会**在转换过程中被完全移除**。
     :::

- :six:`onlyRemoveTypeImports`  **默认：`false`** 

  - **作用**：启用后，Babel将 **仅仅移除**  `import type `语句
      ::: details 解释
      对于那些可能只用于类型的常规 `import` 语句（例如 `import { MyInterface } from './types'`），**它不会移除**。这是一个针对超大型代码库的性能优化选项，但准确性可能会降低。通常建议保持其默认值 `false`，让 `Babel` **自行判断哪些导入需要移除**。
     :::
  - **场景**：**避免误删普通导入**。
     ::: details 查看更多
      - 代码示例: `index.ts` 的文件:
      ```ts [index.ts]
       import type { TypeA } from './types'; // 会被移除
       import { TypeB } from './types';     // 开启此选项后，可能不会被移除
       let x: TypeA;
       let y: TypeB;
      ```
      - `Babel 配置`: 设置`onlyRemoveTypeImports` 为 `true` , 会被移除`import type`，**普通导入则不会移除**
     ```js [babel.config.js]
      module.exports = {
        presets: [
          // 默认值 onlyRemoveTypeImports 可以不写
          ['@babel/preset-typescript', { onlyRemoveTypeImports: true  }] 
        ]
      }
      ```
     :::

- :seven: `optimizeConstEnums`  **默认：`false`** 

  - **作用**：制是否内联 `const enum` 的值。
    ::: details 解释
      当设为 `true` 时，所有使用 `const enum` 的地方都会被替换为其实际值，并且 `enum` 对象本身会被完全移除。这可以生成更小、更快的代码
     :::
  - **场景**：**减少代码体积，但可能影响调试**。
     ::: details 查看更多
      - 代码示例: `index.ts` 的文件:
       ```ts [index.ts]
        const enum Direction {
          Up,
          Down,
        }
        let myDirection = Direction.Up;
       ```
      - `Babel 配置`:  当设为 `true` 时，所有使用 `const enum` 的地方都会被替换为其实际值，并且 `enum` 对象本身会被完全移除。这可以生成更小、更快的代码
      ```ts [babel.config.js]
       module.exports = {
          presets: [
           ['@babel/preset-typescript', { optimizeConstEnums: true }]
         ]
       }
       ```
     :::

 

- :eight: `rewriteImportExtensions` **默认：`false`** 

  - **作用**：**重写导入路径的扩展名**。这在将 `TypeScript` 编译为原生 `ESM`  时非常有用，因为 **浏览器 和 Node.js** 的 `ESM` 要求**导入路径** 必须包含 **文件扩展名**
  - **场景**：**构建原生 ES 模块 (ESM) 应用**
    ::: details 查看更多
      - 代码示例: `main.ts` 的文件:
       ```ts [index.ts]
        import { helper } from './helper';
        helper();
       ```
      - Babel 配置: 
      ```ts [babel.config.js]
       module.exports = {
          presets: [
            { "rewriteImportExtensions": true }
         ]
       }
       ```
      - 转换后的输出:
       ```js
        // 注意导入路径的变化
       import { helper } from './helper.js';
       helper();
       ```
      - 总结一下 
        -  **用打包工具** （`Webpack`, `Vite` 等）？ → **不需要配置**，默认 `false `就行。
        -  **不用打包工具** 想直接在**浏览器**或 `Node.js` (`ESM`) 里跑？ → 需要设置为 true。
     :::
  

- :nine: `jsxPragmaFrag`    **默认值**: `React.Fragment`
  - **作用**:  与  `jsxPragma` 类似，但它专门用于 JSX 片段 (`<>...</>`)。
  - **场景：** 使用**非 React 的 JSX 库**
    ::: details 查看更多
     - 代码示例: `component.tsx` 的文件:
     ```tsx [component.react]
     const fragment = <></>;
     ```
     - Babel 配置 **为了使用一个自定义的 `Fragment` 组件** :
     ```js [babel.config.js]
        module.exports = {
          "presets": [
            [
              "@babel/preset-typescript",
              { "jsxPragmaFrag": "Fragment" }
            ]
          ]
        }
     ```
     - 转换后的输出:
     ```js
     // 默认输出
     const fragment = React.createElement(React.Fragment, null);
     // 使用 jsxPragmaFrag: "Fragment" 后的输出
     const fragment = React.createElement(Fragment, null);
     ```
    :::
- :one::zero: `disallowAmbiguousJSXLike`    **默认值**: `false`

  - **作用**: 是否禁止可能产生歧义的 `JSX` 语法。具体来说，是否**禁止那些看起来像**  `TypeScript` **类型断言** (`<Type>value`) 的` JSX `语法，这有**助于避免解析错误**。
  
  - **场景：**  在 `.tsx` 文件中**编写复杂的泛型函数**，以避免语法歧义
     ::: details 查看更多
     - 代码示例: `component.tsx` 的文件:
     ```tsx [component.react]
     // 这个语法既可以被解释为一个返回 JSX <T> 元素的函数
     // 也可以被解释为一个名为 T 的泛型箭头函数
     const ambiguous = <T>() => {};
     ```
     - Babel 配置 **为了使用一个自定义的 `Fragment` 组件** :
     ```js [babel.config.js]
        module.exports = {
          "presets": [
            [
              "@babel/preset-typescript",
              { "isTSX": true, "disallowAmbiguousJSXLike": true}
            ]
          ]
        }
     ```
     - **结果:** 启用此选项后，Babel 会将 `<T>()` 视为一个**泛型类型参数**，而不是一个 `JSX` 元素，**从而避免了解析冲突**。如果你确实想写一个名为 `T `的 `JSX `组件，**你应该写成 `<T /> `以消除歧义**。
     - 情况一：你的本意是想定义一个泛型函数
       - 添加一个逗号（推荐的技巧）: 这个逗号明确地告诉解析器，这是一个泛型参数列表，**而不是 JSX**。
            ```tsx
            const ambiguous = <T,>() => {};
            ```
        -  添加一个泛型约束:
            ```tsx
             const ambiguous = <T extends any>() => {};
            ```
      -  情况二：你的本意是想返回一个名为 T 的 JSX 组件
          ```tsx
          // 假设 T 是一个已经定义好的组件
           const T = () => <span>Component T</span>;
           // 这个函数返回一个 T 组件的实例
           const myComponentRenderer = () => <T />;
          ```
    
    :::
- :one::one: `ignoreExtensions ` (**已废弃**) **默认：`false`** 
  - 作用:  告诉 `Babel` 忽略**具有特定扩展名的文件**，即使其他配置（如 `allExtensions`）**试图包含它们**
  - 说明: **这个选项已经被废弃**。推荐使用 `Babel` 顶层的 `ignore` 配置项来代替，**因为它功能更强大且更通用**。
     ::: details 查看更多
     - 替代方案示例 
       ```js [babel.config.js]
         module.exports = {
         "presets": [
           ["@babel/preset-typescript", { "allExtensions": true }]
         ],
         // 使用顶层的 ignore 来排除 .d.ts 文件
         "ignore": [
           "**/*.d.ts"
         ]
       }
       ```
     ::: 


#### 完整配置示例

```js [babel.config.js]
module.exports = {
  presets: [
    [
      '@babel/preset-typescript',
      {
        allExtensions: false,   // 默认只处理 .ts/.tsx
        isTSX: false,          // 默认不强制 TSX 模式
        jsxPragma: 'React.createElement', // 默认 React
        allowNamespaces: false,
        allowDeclareFields: false,
        onlyRemoveTypeImports: true, // 默认删除类型导入
        optimizeConstEnums: false,
        rewriteImportExtensions: false,
      },
    ],
  ],
};
```

  #### 注意事项
  ::: list-info 注意事项
  1. **类型擦除**：`Babel` 只删除 `TypeScript` 类型，**不进行类型检查**（需用 `tsc` 单独检查）。
  2. **兼容性**：部分高级` TypeScript` 语法（如装饰器 `@Decorator`）需额外插件（如 `@babel/plugin-proposal-decorators`）。
  :::

#### 项目配置

 - 在 `babel.config.js` 进行配置
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
       '@babel/preset-react',
       '@babel/preset-typescript', // [!code ++]  [!code focus]
     ],
   };
   
   ```

- `npm run build`然后进行打包查看效果

![](https://pic1.zhimg.com/80/v2-3c0dd15179b9671eaabe1cf56a58f489_1420w.png)



 > [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/02_css_img_js_vue_react)