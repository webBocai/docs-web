---
date: 2025-09-19 16:53:48
title: 04-webpack处理js文件 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/25cf12
categories:
  - Webpack
coverImg: /img/webpack_babel.jpeg
tags:
  - Webpack 基础
---

#  Babel转换ES6+ 转ES5

### 一、为什么需要babel？

- :file_folder: 在开发中我们**很少直接去接触babel**，但是babel对于前端开发来说，目前是不可缺少的一部分
- :file_folder: 开发中，我们想要使用`ES6+的语法`，想要使用`TypeScript`，开发`React项目`，它们都是离不开Babel的；
- :card_index_dividers: 那么，`Babel`到底是什么呢？
  - :page_facing_up:`Babel`**是一个工具链**，主要用于将`ES6+`代码转换为向后兼容版本的`JavaScript`；
  - :page_facing_up: 将`React`  `TypeScript` 这种框架和静态语言转换为` JavaScript`
-  :gear: `ES6`语法用babel进行转换
    ```js
    const a = 10;
    const b = ()=>{
      console.log(2222)
    }
    class Person{
     constructor(age){
      this.age = age
     }
    }
    const p1 = new Person('18')
    
    ```

- :page_with_curl: **babel转换结果**

  ![](https://picx.zhimg.com/80/v2-e3c60c683295dc0095562dcac4893ea9_1020w.png)

- :link: 更多详情查看 [babel官网](https://babeljs.io/repl#?browsers=es5&build=&builtIns=false&corejs=3.21&spec=true&loose=false&code_lz=MYewdgzgLgBAhjAvDAjABgNwChSVgIyRgAoBKRAPgG8sYZcIQAbAUwDomQBzYgJn96ksAXxxM4ECDAAKLAE6MwNeuGhyArsCgg5xOFxallMKAAsAlhDb6WRG7VGiGsAA4oiYFgHcZ8xcQByFAAOANIgA&forceAllTransforms=true&modules=umd&shippedProposals=false&evaluate=false&fileSize=false&timeTravel=false&sourceType=script&lineWrap=true&presets=react%2Cstage-2&prettier=false&targets=&version=7.27.0&externalPlugins=%40babel%2Fplugin-transform-block-scoping%407.27.0%2C%40babel%2Fplugin-transform-arrow-functions%407.25.9%2C%40babel%2Fplugin-proposal-class-properties%407.18.6%2C%40babel%2Fplugin-transform-class-static-block%407.26.0%2C%40babel%2Fplugin-syntax-class-properties%407.12.13%2C%40babel%2Fplugin-transform-classes%407.25.9&assumptions=%7B%7D)

### 二、`babel`命令行使用

#### 1.介绍

-  `babel`本身可以作为一个**独立的工具**（和`postcss`一样），可以和`webpack`等构建工具配置使用，**也可以单独使用**。

#### 2.安装

- :gear: 如果我们希望在**命令行尝试使用babel**，需要安装如下库：

  - :round_pushpin: `@babel/core`：`babel`的核心代码，必须安装；
  -  :round_pushpin: `@babel/cli`：可以让我们在命令行使用`babel`；

  ```sh
  npm install @babel/cli @babel/core -D
  ```

#### 3.使用

- :gear: 使用babel来处理我们的源代码

  - :round_pushpin: `src`：是源文件的目录

  -  :round_pushpin: `--out-dir`：指定要输出的文件夹dist；

  ```sh
  npx babel src --out-dir dist
  ```
- :question: 此时我们发现并**没有转换**，**仅复制文件，显示出来**

#### 4.没有转换成功的原因

- 这是因为我们**没有安装`bable`的插件和预设** 

  - :round_pushpin: `babel` 对 `.js` 文件
    - 1.**ES6+ 语法（如箭头函数、`class`、`const` 等）** ❌ 不会转换，因为缺少 `@babel/preset-env` 或相关插件。Babel 默认无任何转换行为。
    - 2.**JSX 语法（如 `<div></div>`）** ❌不会转换，因为需要 `@babel/preset-react` 插件。
  - :round_pushpin: `babel` 对 `.ts` / `.tsx` 文件
    - ❌ **直接报错**，因为 Babel 默认只处理 `.js` 文件，且需要 `@babel/preset-typescript` 来解析 `TypeScript `语法。
  - :round_pushpin: **根本原因**
    - 1.`Babel` 的行为完全由 **插件和预设** 决定。**没有安装任何插件/预设时**：
    - 2.**仅复制文件**,不做任何语法转换, **不支持 `TypeScript`** 或 `JSX `解析

#### 5.插件的使用

 1. 比如我们需要转换箭头函数，那么我们就可以使用**箭头函数转换相关的插件**：
  - 安装 ` @babel/plugin-transform-arrow-functions`
     ```sh
     npm install @babel/plugin-transform-arrow-functions -D
     ```

  - 然后使用命令 已经将**箭头函数转成`ES5`的函数**

     ```sh
     npx babel src --out-dir dist --plugins=@babel/plugin-transform-arrow-functions
     ```

2. 但是查看转换后的结果：我们会发现 **`const `并没有转成var构造函数也没有转换**

  - :round_pushpin:因为`plugin-transform-arrow-functions` 并没有提供这样的功能,**只能做箭头函数的转换**
  - :round_pushpin:使用`plugin-transform-block-scoping`和`@babel/plugin-transform-classes` 来完成功能；
    - :one: `plugin-transform-block-scoping` **处理将`const let` 转成`var`**
    - :two: `@babel/plugin-transform-classes`将**类转换成`ES5`的构造函数**
  - :gear: 安装`plugin-transform-block-scoping`和`@babel/plugin-transform-classes`

    ```sh
    npm install @babel/plugin-transform-block-scoping -D 
    ```

  - :gear: 执行命令

    ```sh
    npx babel src --out-dir dist --plugins=@babel/plugin-transform-block-scoping
     ,@babel/plugin-transform-arrow-functions,@babel/plugin-transform-classes
    ```

- :round_pushpin: 这样处理将`const let` 转成`var`,将**类转换成`ES5`的构造函数**, 将**箭头函数转成`ES5`的函数**

### 三、`Babel`的预设`preset-env`

1. 但是如果要转换的内容过多，**一个个设置是比较麻烦**，**我们可以使用预设（preset）**：

2. 安装`@babel/preset-env`预设

   ```sh
   npm install @babel/preset-env -D
   ```

3. 执行下面命令，他会把 `src` 目录下所有`js`都会进行转换
    
    ```sh
    npx babel src --out-dir dist --presets=@babel/preset-env
    ```
  注意：**图片中我这里我用的`src1`目录下进行转换的**

  ![](https://pic1.zhimg.com/80/v2-f4cdcb1f090c98378363fc4a2ec8b8aa_1020w.png)
  
#### 1.`preset-env`预设的参数
  `preset-env` 预设的出现帮助我们将一些新特性转换成ES5的代码，可以让旧版本浏览器识别
  ######    参数介绍

   - :one: `targets`: **默认值：空对象`{}`**  
     -  **举例： `> 0.25%, not dead`**

        -  `> 0.25%` → 要兼容**全球使用率超过 0.25% 的浏览器**(比如主流浏览器的最新几个版本)
        -  `not dead` → 排除那些 **已经“死掉”的浏览器**（比如 `IE11`、`旧版 Safari` 等）。
        -  **效果**：Babel 会按这个条件，**只转换目标浏览器不支持的语法**。
 
   - :two: **`corejs`**  这个是什么？**默认值：`2.0`**
   
     - Babel 可以将 `ES6+` 的**新语法**（如箭头函数 `class`）转成 `ES5`，**然后用代码模拟ES6语法**
        ::: details  查看详情
          **ES6+新增的特性**，在**ES5里面是没有**的 `Promise`、`Array.from` 无法**通过语法转换实现，必须用代码模拟**。
        :::
      

     - `core-js` 就是用来 **“模拟”这些新 API 的代码库**
        ::: details  查看详情
         在  `IE11 ` 中运行 `new Set([1, 2, 3])`，如果没有 `core-js`，就会**直接报错**；有了 `core-js`，它会用 `ES5`  代 码实现 `Set` 的功能
        :::
 
     -  :round_pushpin: **与 Babel 的关系**
        ::: details  查看详情
         - :bookmark_tabs: Babel 负责 **语法转换**（如 `() => {}` → `function() {}`）。
         - :bookmark_tabs: `core-js` 负责 **API模拟**（如 `Promise`、`Array.includes`）。
        :::
       

        
       
     - :round_pushpin:  **版本差异**
        ::: details  查看详情
          - `core-js@2`
            - :one: 支持大部分 `ES6+ API`，但 **不覆盖实例方法**（如 `[1, 2, 3].includes(1)`）。

            - :two: 已停止维护，**不推荐使用**。
            
         - `core-js@3`

           - :one: 支持 **ES6+** 的全部 `API`，**包括实例方法**（如 `array.includes`、`string.padStart`）。

           - :two: 持续更新，**推荐使用**。
        :::
     
       
     - :round_pushpin: **作用**：指定 `core-js` 的版本（**必须安装对应的版本**）。

     - :round_pushpin: **为什么需要显式指定 `corejs` 版本？**
       -  :bookmark_tabs: Babel 默认不处理新 `API`，必须通过 `corejs: 3` 明确告诉它使用 `core-js@3` 的 `Polyfill`。
          ```sh
          npm install core-js@3 --save
          ```
      
   - :three: `useBuiltIns` 处理 **兼容性方式** **默认值：`false`**

     -  :round_pushpin: 我们安装`core-js`之后如何使用呢？是**按需加载还是手动加载?**
        ::: details  查看属性
        - `'usage'` 按需添加（只加代码中用到的 `API`，**推荐**）
           - **按需加载**： `Polyfill`（比如 `Promise`、`Array.includes` 等新 `API`）
           - **效果**：`Babel` 会**检查你的代码** 只在你用到新 `API `的地方**自动插入对应的兼容代码**
           - **优点**：生成的代码体积更小。
        - `'entry'`在入口文件手动导入 `import 'core-js'`根据目标环境添加全部`Polyfill`。
        -  `false`  不自动添加 `Polyfill`（**需手动处理兼容性**）。
        :::
 
 
 
   - :four:`modules` 选择模块化  **默认值：`auto`**

     - :round_pushpin: **作用**：是否将 ES6 模块语法（`import/export`）转成其他模块格式 
         ::: details  查看属性
          - `'auto'` 由 Webpack 等打包工具决定（默认）。
          - `false` 保留 ES6 模块语法**推荐**，便于 `Webpack` 做 `Tree Shaking`
          - `'commonjs'` 转成 `CommonJS `格式（适合 `Node.js`）。
          - :link: [更多查看 `babel-preset-env 里面的modules属性`](https://babeljs.io/docs/babel-preset-env#modules)
         :::
    
    
   - :five: **`shippedProposals`** 启用最新特性  **默认值：`false`**
       - :round_pushpin: **作用**：是否启用浏览器已支持的提案特性（如最新的ES2025特性）。
         ```js
         shippedProposals: true  // 直接使用浏览器已实现的提案语法
         ```
 
   - :six: `bugfixes` **默认值：`false`**
       -  :round_pushpin: **作用**：根据目标环境**自动修复已知的语法** `Bug`（**推荐开启**）。
          ```js
          bugfixes: true
          ```
 
   - :seven: **`loose`**  **默认值：`false`**
       - :round_pushpin: **作用**：以 **宽松模式生成代码**（代码更简洁，**但可能不符合标准**）。
         ```js
         loose: true
         ```
   - :link:[更多参数请查看 `babel-preset-env官网`](https://babeljs.io/docs/babel-preset-env)

###### 参数在命令行使用

```sh
npx babel src --out-dir dist--presets=@babel/preset-env,{"targets":"> 0.25%, not dead","useBuiltIns":"usage","corejs":3}
```

#### 2.`Babel-loader`的使用
:gear: 在实际开发中 我们通常会在构建工具中通过配置babel来对其进行使用的，比如在`webpack`中

 ##### 在webpack配置`babel`
 - :gear: 那么我们就需要去安装相关的依赖 如果之前已经安装了`@babel/core` 这里不需要再次安装

    ```sh
    npm install babel-loader @babel/core -D // 没有安装 @babel/core
    npm install babel-loader  -D   // 安装了 @babel/core
    ```

 - :gear:我们可以设置在配置文件中设置规则，在加载`js`文件时，使用我们的 `babel-loader`
   ```js{4-10} [webpack.config.js]
   	module: {
   		rules: [
   			// 省略其他配置
   			{
   				test: /\.(js)$/,
   				exclude: /node_modules/,
   				use: {
   					loader: "babel-loader"
   				}
   			}
   		]
   	},
   ```

- :one: 如果我们就这样设置了**没有配置预设或者插件**，还是跟刚刚一样不会有任何转换变化 如果遇到**ES6+新特性** 在 **旧浏览器执行还会报错**
- :two: 如果我们**一个个去安装使用插件**，那么**需要手动来管理大量的babel插件**
   ::: details  查看详情
     - :one: 我们可以直接给`webpack`提供一个`preset`，`webpack` 会根据我们的预设来加载对应的插件列表，并且将其传递给 `babel`
     - :two: 如果没有安装 `@babel/preset-env`预设 需要管理 **转换let、const、class转换ES5插件**

    ```js [webpack.config.js]
      module: {
        rules: [
          // 省略其他配置
            {
              test: /\.(js)$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader'
                 options: {
                   plugins: [  // [!code focus]
                    ['@babel/plugin-proposal-class-properties', { loose: true }],  // [!code focus]
                    '@babel/plugin-transform-arrow-functions'  // [!code focus]  转换箭头函数
                  ]
                },
               },
             }
            ]
          }
      
     ```
    :::

- :three: 安装预设
   ```sh
   npm install @babel/preset-env -D
   ```

- :gear: 然后在配置文件中 **新增预设配置**

     ```js [webpack.config.js]
     module: {
       rules: [
         // 省略其他配置
           {
             test: /\.(js)$/,
             exclude: /node_modules/,
             use: {
               loader: 'babel-loader'
                options: {
                 presets: ['@babel/preset-env'], //  [!code focus] [!code ++]
                 // 这里可以配置插件 但是使用了预设可以不配插件
                  plugins: [ // [!code --]
                   ['@babel/plugin-proposal-class-properties', { loose: true }], // [!code --]
                   '@babel/plugin-transform-arrow-functions' //  [!code --] 
                 ]  
               },
              },
            }
           ]  
        }
      
     ```

##### 配置项中使用预设参数

- :gear: 我现在想让预设配置**能自动根据你指定的目标环境把** ` ES6+ 代码转换成兼容的 ES5 代码。`

    ```js [webpack.config.js]
    module: {
      rules: [
        // 省略其他配置
          {
            test: /\.(js)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader'
               options: {
                  presets: [
                  ['@babel/preset-env', { 
                    targets: 'defaults', // [!code ++] 兼容主流浏览器最新两个版本
                    useBuiltIns: 'entry', // [!code ++] 在入口文件全局引入 Polyfill
                    corejs: 3 // [!code ++]
                  }],
                ],
              },
             },
           }
        }
     ]
    ```
- :gear: 目前配置文件太多东西了 我们直接把 `babel` 配置项单独提取出去 我们创建`babel.config.js` 文件
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
      ],
    };
    
    ```

- :one: 然后将 `webpack `配置文件里面的**预设参数给移除**
- :two: 如果我们没有移除配置项，`babel.config.js`和options选项那个优先级更高呢？
  - `babel.config.js` **优先级更高**
  ```js [webpack.config.js]
  module: {
    rules: [
      // 省略其他配置
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
           }
         }
     ]
  }
  ```

