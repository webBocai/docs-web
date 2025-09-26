---
date: 2025-09-01 15:44:09
title: 01-webpack基本介绍 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/b4220e
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - Webpack 基础
---


# Webpack基础介绍

### 一、介绍

 #### 1.Webpack是什么?
 
- **官方的解释**: `webpack` is a `static `  `module `  `bundler ` for `modern ` **JavaScript applications**
- **中文解释**：`webpack` 是一个**静态模块打包的工具**，用于**现代JavaScript 应用程序**


::: list-tip Webpack是什么呢?
- :label: **打包 builder：** `webpack`是一个打包工具，能将我们的写的代码，**进行打包压缩**
- :label:  **静态的 static：** 我们最终打包的代码是一个**静态资源**，然后**部署到静态服务器中**
- :label:  **模块 module：** `webpack` 支持各种**模块化开发**，如: `ES Module  Common  AMD CMD`
- :label: **现代的 modern：** `webpack` 之前，前端开发有着各种兼容性问题，并且开发效率非常低 
:::
  



- :file_folder: webpack 将**各种模块依赖**用webpack 构建**打包成静态资源**  [webpack官网文档](https://webpack.js.org/)

-  webpack官方图片

    <img src="https://picx.zhimg.com/80/v2-6f84a2e1f7e8d66c8ae68f89448d196f_720w.png" style="zoom:80%;" />



#### 2.Webpack能做什么？

- 在webpack5.x之前 **初始的** `功能只能处理`  **JavaScript** 文件，但是在webpack在5.x之后**能处理图片和字体静态资源**

- webpack 只能处理这几种有限的文件吗？当然不是

  - :card_index_dividers: **CSS的处理**

    - :page_facing_up: CSS文件模块的加载、提取
    -  :page_facing_up: Less、Sass等预处理器的处理

  - :card_index_dividers: **HTML资源的处理**

    - :page_facing_up: 打包HTML资源文件；

  - :card_index_dividers: **转换框架的代码**

     - :page_facing_up: 结合loader 或babel 对 `Vue React Aunluar`框架进行转换

  - :card_index_dividers: **JavaScript的打包**

    - :page_facing_up: 将ES6转换成ES5的语法

    -  :page_facing_up: TypeScript的处理，将其转换成JavaScript

- 还有很多高级功能等。。。 


#### Webpack的使用前提

- :label:  需要熟悉` HTML CSS  JavaScript `
-  :label:  需要了解 `node` 基础知识
    -  :bookmark: `npm` `npx` ` require` 全局变量 `path` 等
### 二、Webpack的基本使用
#### 1.Webpack的安装

- :gear: 执行安装
::: code-group
```sh [npm 局部安装]
  npm install webpack  webpack-cli -D  

```
```sh [npm 全局安装]
 npm install wbapck webpack-cli -g 
```
:::
- :gear: webpack的安装目前分为两个：`webpack、webpack-cli`

- :gear: 为什么需要安装 `webpack-cli ?` 他是干啥的，为什么需要它?
    - :link: 从 4.x 版本开始，**Webpack 核心包（`webpack`）仅包含打包功能**，而命令行交互、配置初始化等操作由 `webpack-cli` 实现。

 ::: list-danger 注意
 若未安装 `webpack-cli`，运行 `webpack` 命令时会提示以下错误：` The CLI moved into a separate package: webpack-cli. Please install 'webpack-cli' in addition  to webpack itself to use the CLI.`
 :::

  - :gear: `Webpack 3.x` 及之前的架构 CLI 是**核心包的一部分**。
  - :gear: 用户通过全局或本地安装 `webpack` 后，可以直接通过 `webpack` 命令执行构建，**无需额外安装 CLI**。这种设计虽然方便，会导致：
     - :link:  **核心包臃肿**：CLI 功能与**核心代码深度耦合**。
     - :link:  **维护困难**：CLI 的更新需要与**核心包同步，灵活性差**
  - :gear: **4.x开始Webpack核心包（`webpack`）仅包含打包功能，Webpack 核心已完全依赖`webpack-cli` 处理命令行逻辑**

 ::: details Webpack和Webpack-cli职责分离
  - :one:  **Webpack 核心**：负责模块打包的核心逻辑（**如依赖图构建、代码转换、优化等**）,但它本身不直接处理命令行操作或配置初始化
  - :two:  **Webpack-CLI**：提供命令行接口`cli`，**解析用户输入的命令参数**
    -  :link:  命令操作(如 `webpack entry.js bundle.js`) 和 配置文件(如 `webpack.config.js`) 最终都会使用 Webpack 的 API 启动打包流程
:::

#### 2.Webpack执行过程
 ::: details Webpack执行过程
  1. 执行webpack命令，**会执行node_modules下的.bin目录下的webpack**
  2. webpack在执行时是依赖 `webpack-cli`的，如果**没有安装**就会**报错**；
  3. 而webpack-cli中代码执行时，才是真正利用 **webpack进行编译和打包的过程**；
  4. **所以在安装webpack时，我们需要同时安装webpack-cli**
 :::


#### 3.Webpack的默认打包

- :card_index_dividers: 当我们安装`webpack`成功之后，可以执行 `npx  webpack` 命令进行执行打包
  > [!WARNING] 为什么用npx 进行执行命令？
  >   [可以参考我的这篇文章, npx的使用](https://juejin.cn/post/7387731346733580303)
  

- :card_index_dividers:  生成一个`dist`文件夹，里面存放一个`main.js`的文件，就是我们打包之后的文件:

   ::: details 打包之后的文件
   - :one: 这个文件中的**代码被压缩和丑化了**； 
   - :two: 另外我们发现代码中依然**存在ES6的语法**，比如`箭头函数、const`等
   - :three: 这是因为默认情况下`webpack`并不清楚我们打包后的文件是否需要**转成ES5及之前的语法**，后续我们需要通过`babel`来**进行转换和设置**；
   :::

  ![](https://picx.zhimg.com/80/v2-595dffb7dd8d2733ddcf3b38d7b564c0_1420w.png)

- 我们发现是可以正常进行打包的，但是有一个问题，**webpack是如何确定我们的入口的呢**？
  > [!IMPORTANT] 确定入口
  >   -  :label: 当我们运行`webpack`时，`webpack`会查找当前目录下的`src/index.js`作为入口；
  >   -  :label: 如果当前项目中没有存在`src/index.js`文件，**那么会报错**

- :card_index_dividers: 当然，我们也可以通过**运行命令来指定入口和出口**

  ``` shell [npm] 
  npx webpack --entry ./src/main.js--output-path ./build
  ```

- :card_index_dividers: 查看页面效果，**因为我们能还没有配置插件**，在我们学习插件之前可以先通过这种方法**临时来看打包页面效果**
  - :page_facing_up: 在根目录创建`index.html` 将打包的js文件引入到这个`index.html`
  - :page_facing_up: 然后使用 vscode 插件的`live Server` 执行 `index.html`
  - :page_facing_up: 在 `index.html` 文件中

  ```html [index.html]
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
       // 引入打包文件
      <script src="./build/index.js"></script>
    </body>
  </html>
  
  ```

#### 4.Webpack的配置文件

 1. 我们发现如果在命令行去使用命令，感觉非常鸡肋，有什么方法吗？当然有的

 2.  首先我们可以在`package.json` 去配置`webpack`

  -  :label: 在 `package.json` 里面 `webpack`命令可以省略 `npx`

  ```json [package.json]
  {
    "name": "01",
    "version": "1.0.0",
    "main": "index.js",
    "scripts": {
      "build": "webpack" // [!code focus]
    },
    "author": "",
    "license": "ISC",
    "description": "",
    "devDependencies": {
      "webpack": "^5.99.5",
      "webpack-cli": "^6.0.1"
    }
  }
  ```

 3. 然后我们在根目录中创建 `webpack.config.js` 

  ```js [webpack.config.js]
  const path = require('path');
  module.exports = {
    entry: './src/main.js',  // 入口文件 默认是 ./src/index.js
    output: {
      path: path.resolve(__dirname, 'dist'), // 将文件输出到当前目录下，dist文件中，没有就创建一个文件夹
      filename: 'bundle.js', // 生成 bundle.js文件 
    }
  }   
  ```

 4. 最后我们执行 `npm run build` 就可以进行最基础的打包


#### 5.Webpack的指定配置文件

1. 如果我们的配置文件并不是`webpack.config.js`的名字，而是其他的名字呢？

   - 比如我们将`webpack.config.js`修改成了 `vite.config.js`；

   - 这个时候我们可以通过 `--config` 来指定对应的配置文件

     ```sh [npm]
     npx webpack --config  vite.config.js
     ```

 2.  但是每次这样执行命令会非常繁琐，所以我们可以在`package.json`中增加一个新的脚本
     ```json [package.json]
      "scripts": {
        // "build": "webpack" // [!code --]
          "build":"webpack --config vite.config.js" // [!code ++]
      }
     ```
      <img src="https://pica.zhimg.com/80/v2-6a5b472364b3f998e5a1cbf71d3271fb_1420w.png" style="zoom:67%; " />

#### 6.Webpack依赖图
- :safety_pin: `webpack` 到底是如何对我们的**项目进行打包的呢**？
::: details 打包流程
  1. `webpack`在处理**应用程序**时，它会根据命令或者**配置文件里面的`entry`找到入口文件**
  2.  **从入口开始**，会**生成一个依赖关系图**，这个**依赖关系图**会包含应用程序中**所需的所有模块** 
      -   如：`.js文件`、`css文件`、`图片`、`字体` 等静态资源文件
  3.  **然后遍历图结构**，打包一个个模块（根据文件的不同使用不同的`loader`来**解析**）
:::
- :safety_pin: `webpack`官网图片表示将所有静态资源打包解析，转换成浏览器能认识的静态资源

<img src="https://picx.zhimg.com/80/v2-6f84a2e1f7e8d66c8ae68f89448d196f_720w.png" style="zoom:80%;" />


<!-- > **文档风 & 博客风** -->

<!-- ::: item-info xxxx
这是一个信息提示框。
- 它支持**多行**内容和 *Markdown* 语法。
::: -->
