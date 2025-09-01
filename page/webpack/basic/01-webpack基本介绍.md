### 1.Webpack到底是什么呢？

- 官方的解释: webpack is a `static `  `module `  `bundler ` for `modern ` **JavaScript applications**

  - 中文解释：webpack 是一个**静态模块打包的工具**，用于现代JavaScript 应用程序

- 我们来对上面的解释进行拆解:

  - **打包bundler：** webpack是一个打包工具，能将我们的写的代码，进行打包压缩
  - **静态的static：**我们最终打包的代码是一个**静态资源**，然后**部署到静态服务器中**
  - **模块module：** webpack 支持各种**模块化开发**，如: `ES Module  Common  AMD CMD`
  - **现代的modern：** webpack之前，前端开发有着各种兼容性问题，并且开发效率非常低 

- webpack官方图片

  - webpack 将**各种模块依赖**用webpack 构建**打包成静态资源**

    <img src="https://picx.zhimg.com/80/v2-6f84a2e1f7e8d66c8ae68f89448d196f_720w.png" style="zoom:80%;" />

  

[webpack官网文档](https://webpack.js.org/)

### 2.Webpack能做什么？

- 在webpack5.x之前 **初始的** `功能只能处理`  **JavaScript** 文件，但是在webpack在5.x之后**能处理图片和字体静态资源**

- webpack 只能处理这几种有限的文件吗？当然不是

  - **CSS的处理**

    - CSS文件模块的加载、提取
    - Less、Sass等预处理器的处理

  - **HTML资源的处理**

    - 打包HTML资源文件；

  - **转换框架的代码**

    - 结合loader 或babel 对 `Vue React Aunluar`框架进行转换

  - **JavaScript的打包**

    - 将ES6转换成ES5的语法

    - TypeScript的处理，将其转换成JavaScript

- 还有很多高级功能等。。。 


### 3.Webpack的使用前提

- 需要熟悉` HTML CSS  JavaScript `
- 需要了解 `node` 基础知识
  -  `npm` `npx` ` require` 全局变量 `path` 等

### 4.Webpack的安装

- 执行安装

  ```powershell
  npm install webpack  webpack-cli -D  // 局部安装
  npm install wbapck webpack-cli -g // 全局安装
  ```

- webpack的安装目前分为两个：`webpack、webpack-cli`

- 为什么需要安装 `webpack-cli ?` 他是干啥的，为什么需要它?

  - 从 4.x 版本开始，**Webpack 核心包（`webpack`）仅包含打包功能**，而命令行交互、配置初始化等操作由 `webpack-cli` 实现。若未安装 `webpack-cli`，运行 `webpack` 命令时会提示以下错误：

    - ` The CLI moved into a separate package: webpack-cli. Please install 'webpack-cli' in addition to webpack itself to use the CLI.`

  - Webpack 3.x 及之前的架构

    - 在 Webpack 3.x 及更早版本中，CLI 是**核心包的一部分**。用户通过全局或本地安装 `webpack` 后，可以直接通过 `webpack` 命令执行构建，**无需额外安装 CLI**。这种设计虽然方便，但导致：
      - **核心包臃肿**：CLI 功能与核心代码深度耦合。
      - **维护困难**：CLI 的更新需要与核心包同步，灵活性差

  - 总结：**4.x开始 Webpack 核心包（`webpack`）仅包含打包功能，Webpack 核心已完全依赖 `webpack-cli` 处理命令行逻辑**


- Webpack 与 Webpack-CLI 的职责分离
  - **Webpack 核心**：负责模块打包的核心逻辑（如依赖图构建、代码转换、优化等），但它本身不直接处理命令行操作或配置初始化
  - **Webpack-CLI**：提供命令行接口（CLI），**解析用户输入的命令参数**（如 `webpack entry.js bundle.js`）和配置文件（如 `webpack.config.js`），最终调用 Webpack 的 API 启动打包流程

### 5.Webpack执行过程

-  当我执行 webpack 这个命令的时候,webpack是如何执行到webpack-cli的呢？
   - 执行webpack命令，**会执行node_modules下的.bin目录下的webpack**
   - webpack在执行时是依赖webpack-cli的，如果没有安装就会报错；
   - 而webpack-cli中代码执行时，**才是真正利用webpack进行编译和打包的过程**；
   - **所以在安装webpack时，我们需要同时安装webpack-cli**

### 6.Webpack的默认打包

- 当我们安装`webpack`成功之后，可以执行 `npx  webpack` 命令进行执行打包

- 为什么用npx 进行执行命令？ [可以参考我的这篇文章, npx的使用](https://juejin.cn/post/7387731346733580303)

- 生成一个dist文件夹，里面存放一个main.js的文件，就是我们打包之后的文件:

  - 这个文件中的代码被压缩和丑化了； 
  - 另外我们发现代码中依然存在ES6的语法，比如箭头函数、const等
  - 这是因为默认情况下webpack并不清楚我们打包后的文件是否需要转成ES5之前的语法，后续我们需要通过babel来进行转换和设置；

  ![](https://picx.zhimg.com/80/v2-595dffb7dd8d2733ddcf3b38d7b564c0_1420w.png)

- 我们发现是可以正常进行打包的，但是有一个问题，webpack是如何确定我们的入口的呢？

  - 当我们运行`webpack`时，`webpack`会查找当前目录下的`src/index.js`作为入口；
  - 如果当前项目中没有存在`src/index.js`文件，**那么会报错**

- 当然，我们也可以通过运行命令来指定入口和出口

  ``` shell  
  npx webpack --entry ./src/main.js--output-path ./build
  ```

- 查看页面效果，**因为我们能还没有配置插件**，在我们学习插件之前可以先通过这种方法**临时来看打包页面效果**

  - 在根目录创建`index.html` 将打包的js文件引入到这个`index.html`
  - 然后使用 vscode 插件的`live Server` 执行 `index.html`
  - 在` index.html`文件中

  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
       //引入打包文件
      <script src="./build/index.js"></script>
    </body>
  </html>
  
  ```

### 7.Webpack的配置文件

- 我们发现如果在命令行去使用命令，感觉非常鸡肋，有什么方法吗？当然有的

- 首先我们可以在`package.json` 去配置`webpack`

  - 在`package.json`里面 `webpack`命令可以省略 `npx`

  ```json
  {
    "name": "01",
    "version": "1.0.0",
    "main": "index.js",
    "scripts": {
      "build": "webpack"
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

- 然后我们在根目录中创建 `webpack.config.js` 

  ```js
  const path = require('path');
  module.exports = {
    entry: './src/main.js',  // 入口文件 默认是 ./src/index.js
    output: {
      path: path.resolve(__dirname, 'dist'), // 将文件输出到当前目录下，dist文件中，没有就创建一个文件夹
      filename: 'bundle.js', // 生成 bundle.js文件 
    }
  }   
  ```

- 最后我们执行 `npm run build` 就可以进行最基础的打包

### 8.Webpack的指定配置文件

- 如果我们的配置文件并不是`webpack.config.js`的名字，而是其他的名字呢？

  - 比如我们将`webpack.config.js`修改成了 `vite.config.js`；

  - 这个时候我们可以通过--config 来指定对应的配置文件

    ```powershell
    npx webpack --config  vite.config.js
    ```

  - 但是每次这样执行命令会非常繁琐，所以我们可以在`package.json`中增加一个新的脚本

    ```json
     "scripts": {
       // "build": "webpack"
         "build":"webpack --config vite.config.js"
     }
    ```

    <img src="https://pica.zhimg.com/80/v2-6a5b472364b3f998e5a1cbf71d3271fb_720w.png" style="zoom:67%; " />
### 9.Webpack依赖图

- `webpack`到底是如何对我们的项目进行打包的呢？
  - `webpack`在处理**应用程序**时，它会根据命令或者**配置文件里面的`entry`找到入口文件**；
  - **从入口开始**，`会生成一个依赖关系图`，这个依赖关系图会包含应用程序中所需的所有模块（比如`.js文件`、`css文件`、`图片`、`字 体`等）；
  - **然后遍历图结构**，打包一个个模块（根据文件的不同使用不同的`loader`来**解析**）

<img src="https://picx.zhimg.com/80/v2-6f84a2e1f7e8d66c8ae68f89448d196f_720w.png" style="zoom:80%;" />



