---
date: 2025-09-26 15:53:48
title: 08-webpack其它配置的认识 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/25cf12
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - Webpack 基础
---
## 一、`Plugin`

### 1.认识`plugin`

- `Webpack`的另一个核心是`Plugin`，`Plugin`和`loader`的区别是什么?

  - `loader` **仅针对文件级别的转换**，转换为 `Webpack` 可识别的模块，**使其能够加入依赖图**,无法影响 `Webpack` 的 **整体构建流程**

  - `Plugin`功能则更强大，**执行更加广泛的任务**，不仅能处理文件，还能修改 ` Webpack ` 的内部状态 **影响输出结果** 如：**打包优化、资源管理、环境变量注入**

   **协作关系**：`Loader` 和 `Plugin` **并非竞争关系，而是互补** 。Loader 负责模块转换，Plugin 负责流程扩展，共同构成 Webpack 的生态体系


### 2.`CleanWebpackPlugin`

####    介绍

-  前面我们使用的过程中，每次修改了一些配置，重新打包时，都需要 **手动删除打包文件夹**：
- 我们可以借助于一个插件来帮助我们完成，这个插件就是`CleanWebpackPlugin`；

#### 安装并配置

 - 安装

   ```sh
   npm install clean-webpack-plugin -D
   ```

- 在 `webpack.config.js`

  ```js [webpack.config.js]
  const { CleanWebpackPlugin } = require('clean-webpack-plugin');
  module.exports = {
      // ...其他省略
     plugins: [
      new CleanWebpackPlugin(),
    ],
  }
  ```

- 其实在 `Webpack 5.20.0+` 之后，我们可以不用这个插件了，`webpack` 本身已经 **开始支持配置清除了**

  ```js [webpack.config.js]
  module.exports = {
    output: {
      path: path.resolve(__dirname, 'dist'),
      clean: true // 自动清理 dist 目录
    }
  };
  ```

### 3.`HtmlWebpackPlugin`

#### 介绍

- 另外我们还有一个**不太规范的地方**,我们的HTML文件是**编写在根目录下**的，而最终打包的**dist文件夹**中是没有`index.html`文件的

- 在**进行项目部署**的时，必然也是需要有对应的入口文件`index.html`,所以我们也需要对`index.html`**进行打包处理**；

#### 安装并配置

- **安装**

  ```sh
  npm install html-webpack-plugin -D
  ```

- 在 `webpack.config.js`

   ```js [webpack.config.js]
   const htmlPlugin = require('html-webpack-plugin');
   module.exports = {
       // ...其他省略
      plugins: [
        new htmlPlugin({title: 'webpack' }),
     ],
   }
   ```

#### 生成`index.html`分析

- 我们会发现，现在自动在dist文件夹中，生成了一个`index.html`的文件
- 该文件中也自动添加了我们打包的`dist.js`文件

```html [index.html]
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>webpack</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script defer="defer" src="dist.js"></script>
  </head>
  <body></body>
</html>

```


::: details 这个文件是如何生成的呢？
- 默认情况下是根据 `ejs` 的一个模板来生成的
- 在 `html-webpack-plugin` 的源码中，有一个 `default_index.ejs` 模块
::: 


#### 自定义HTML模板

 ::: details 如果我们想在自己的模块中加入一些比较特别的内容：
 - 比如添加一个`noscript`标签，在用户的JavaScript被关闭时，给予响应的提示；
 - 比如在开发`vue`或者`react`项目时，我们需要一个可以挂载后续组件的根标签;
 ::: 

- 这个我们需要一个属于自己的`index.html`模块

   ```html [index.html]
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title><%= htmlWebpackPlugin.options.title %></title>
       <link rel="icon" href="<%= BASE_URL %>favicon.ico" />
     </head>
     <body>
       <noscript>You need to enable JavaScript to run this app.</noscript>
       <div id="app" style="margin-bottom: 10px"></div>
       <hr />
       <div id="root"></div>
     </body>
   </html>
   
   ```

#### 自定义模板数据填充

- 上面的代码中，会有一些类似这样的语法`<% 变量%>`，这个是`EJS`**模块填充数据**的方式，在根目录创建 `public/index.html`
  ::: details 在配置 `HtmlWebpackPlugin` 时，我们可以添加如下配置
  - `template`：指定我们要使用的模块所在的路径；
  -  `title`：在进行`htmlWebpackPlugin.options.title`读取时，就会读到该信息；
  ::: 

   ```js [webpack.config.js]
   const htmlPlugin = require('html-webpack-plugin');
   module.exports = {
       // ...其他省略
      plugins: [
        new htmlPlugin({ template: './public/index.html', title: 'webpack' }),
     ],
   }
   ```

### 4.`DefinePlugin`

#### 介绍

-  但是，这个时候**编译还是会报错**，因为在我们的模块中还使用到一个 `BASE_URL` 的常量：
-  <img src="https://picx.zhimg.com/80/v2-27ef24f9fdb1446e8b011a59bb5f9187_1020w.png" style="zoom:67%;" />
  ::: details 报错原因
   -  这是因为在编译template模块时，有一个`BASE_URL`： `<link rel="icon" href="<%= BASE_URL %>favicon.ico">`，但是我们并没有设置过这个常量值，所以会出现**没有定义的错误**；
  ::: 

-
  -
  - 
#### 配置使用

- 这个 `DefinePlugin` 是 `webpack` 自带插件的我们**不需要自己去安装**
  ::: details 为什么要两个引号呢？
    这是因为第一个引号他不是字符串，而是类似于`js`的`eval`语句,所以需要两个引号进行包裹
  ::: 

  ```js [举例.js]
  window.a = 100;
  window.eval('console.log(window.a)'); // 输出：100
  ```

  ```js [webpack.config.js]
  const { DefinePlugin } = require('webpack');
  module.exports = {
      // ...其他省略
     plugins: [
       new DefinePlugin({ BASE_URL: "'./'" }),   
    ]
  }
  ```

- 这个时候，编译 `template` 就可以正确的编译了，会读取到 `BASE_URL` 的值；

## 二、Mode配置

#### 1.介绍

- Mode配置选项，可以告知`webpack`使用相应模式的内置优化： 默认值是`production`（**什么都不设置的情况下**）； 
- 可选值有：`none `| `development'`| `production`；

#### 2.`development`


  ::: details  **`development` 模式** **核心特点**
   - **调试友好**：生成未压缩的代码，**保留源代码的可读性**，并为模块和块`chunk`生成有意义的命名（如 `[name].js`）
   - **环境变量**：自动设置 `process.env.NODE_ENV` 为 `'development'`，供第三方库（如 React）启用开发工具（**如错误提示、热更新等**）
   - **构建优化**：启用 `NamedChunksPlugin`（命名块）和 `NamedModulesPlugin`(命名模块)  禁用代码压缩、`Tree Shaking` 等生产优化，以提高构建速度
   - **适用场景**：本地开发、调试阶段。
  ::: 
 - **示例配置**

  ```js [webpack.config.js]
  module.exports = {
    mode: 'development',
    devtool: 'source-map' // 开发环境推荐使用快速 source map
  };
  ```

#### 3.`production`
::: details **`production` 模式**  **核心特点**
  - **性能优化**：启用一系列代码压缩和优化插件，包括：
    - `TerserPlugin`（压缩 JS）
    - `ModuleConcatenationPlugin`（模块合并）
    - `FlagDependencyUsagePlugin`（标记未使用依赖）
    -  生成短且确定的哈希 ID（如 `[contenthash]`），**便于长期缓存**

  - **环境变量**：设置 `process.env.NODE_ENV` 为 `'production'`，许多库（如 Vue、React）会据此移除开发模式代码

  - **代码行为**： 删除未使用的导出（`Tree Shaking`） **压缩变量名**、**移除注释和空白符，生成最小化文件**

  - **适用场景**：**生产环境部署**
  ::: 
- 
  - **示例配置**：
  ```JS
  module.exports = {
    mode: 'production',
    optimization: {
      minimize: true, // 默认启用
      minimizer: [new TerserPlugin({ /* 自定义压缩选项 */ })]
    }
  };
  ```


#### 4.**`none`**
::: details **`none`模式 核心特点**
  - **禁用默认优化**：**不启用任何内置优化插件**（如压缩、`Tree Shaking`）
  - **环境变量**：不会自动设置 `process.env.NODE_ENV`，需手动配置
  - **调试与灵活性**：**输出未优化的原始代码**，适合需要完全控制构建流程的场景
  - **适用场景**：**自定义复杂配置**、调试优化问题或特殊构建需求（如测试环境）
::: 

  - **示例配置**：

   ```JS [webpack.config.js]
   module.exports = {
     mode: 'none',
     plugins: [
       new webpack.DefinePlugin({
         'process.env.NODE_ENV': JSON.stringify('test') // 手动设置环境变量
       })
     ]
   };
   ```

#### 5.对比总结

| 特性            | `development`             | `production`                              | `none`                 |
| --------------- | ------------------------- | ----------------------------------------- | ---------------------- |
| **代码压缩**    | 不压缩                    | 压缩并优化                                | 不压缩                 |
| **环境变量**    | `NODE_ENV=development`    | `NODE_ENV=production`                     | 无自动设置             |
| **模块/块命名** | 有意义的名称（如 `main`） | 短哈希（如 `a1b2c3`）                     | 原始 ID（如 `0`, `1`） |
| **构建速度**    | 快                        | 慢（因优化步骤多）                        | 中等                   |
| **调试支持**    | 完整 Source Map           | 可选 Source Map（如 `hidden-source-map`） | 无默认 Source Map      |
| **典型用途**    | 本地开发                  | 生产部署                                  | 自定义配置、测试环境   |



## 三、区分开发和生产配置

### 1.为什么需要区分配置

目前我们所有的`webpack`配置信息都是放到一个配置文件中的：`webpack.config.js`
 ::: details 当配置越来越多时，这个文件会变得越来越不容易维护；
   并且某些配置是在**开发环境需要使用的**，某些配置是在**生成环境需要使用的**，当然某些配置是在**开发和生成环境都会使用的** 所以，我们最好对**配置进行划分，方便我们维护和管理**
   :::


### 2.如何区分
  ::: details 在启动时如何可以区分不同的配置呢?
   - 方案一：编写两个不同的配置文件，开发和生成时，分别加载不同的配置文件即可(**推荐使用**)
   - 方式二：使用相同的一个入口配置文件，通过设置参数来区分它们；
   :::
::: details 在根目录创建`config`文件夹
  - 创建 `webpack.prod.js` `webpack`的生产打包文件
  - 创建 `webpack.dev.js` `webpack`的测试打包文件
  - 创建 `webpack.common.js` `webpack`的公共的打包文件
:::
 在`packge.json`中的`script` 进行修改

  ```json [package.json]
   "scripts": {
      "build": "webpack --config ./config/webpack.prod.js",
      "dev": "webpack server --config ./config/webpack.dev.js"
    },
  ```

### 3.入口文件解析

 首先我们先把 `webpack.config.js` 所有配置先复制给这三个文件，等会我们**逐一拆解**
 :::details  问题
   - 我们之前编写入口文件的规则是这样的：`./src/index.js`，但是如果我们的配置文件所在的位置变成了`config `目录，我们是否应 该变成`../src/index.js`呢？
   - 如果我们`../src/index.js`这样编写，会发现是报错的，依然要写成`./src/index.js`；
  :::
  这是因为入口文件其实是和另一个属性时有关的`context`；

  :::details  `context` 解决上面的问题
    - 官方说法：默认是当前路径（但是经过测试，**默认应该是`webpack`的启动目录**）
    - 我们启动目录是在`package.json`,所有`context` 默认的路径就是根目录下，所以我们还是依然要写成`./src/index.js`；
   :::

- 在 `./config/webpack.dev.js` 文件中

  ```js [webpack.dev.js]
  module.exports = {
    mode: 'development',
    context: path.resolve(__dirname), // 修改成当前路径
    entry: '../src/index.js',
  }
  ```
- 在 `./config/webpack.prod.js` 文件中
  ```js [webpack.prod.js]
   module.exports = {
     mode: 'production',
     context: path.resolve(__dirname), // 修改成当前路径
     entry: '../src/index.js',
   }
   ```

### 4.分割代码

- 根据刚刚所创建的三个文件，进行处理，首先我们需要安装一个合并插件`webpack-merge`
- 我们先把一下公共配置提取到`common` 文件中，处理：`css` `js ` `静态资源` `vue` `ts` `babel` `react`的配置提取出来
- :::details  `webpack.common.js`查看详细代码
    ```js [webpack.common.js]
     const path = require('node:path');
     const { VueLoaderPlugin } = require('vue-loader/dist/index');
     const htmlPlugin = require('html-webpack-plugin');
     const { DefinePlugin } = require('webpack');
     module.exports = {
       mode: 'development',
       context: path.resolve(__dirname),
       entry: '../src/index.js',
       module: {
         rules: [
           {
             test: /\.css$/,
             use: ['style-loader', 'css-loader', 'postcss-loader'],
           },
           {
             test: /\.less$/,
             use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
           },
           {
             test: /.(jpg|png|gif|jpe?g|svg)$/,
             type: 'asset',
             generator: {
               filename: 'img/[name].[hash:6][ext]',
             },
             parser: {
               dataUrlCondition: {
                 maxSize: 287 * 1024,
               },
             },
           },
           {
             test: /\.(js|jsx)$/,
             exclude: /node_modules/,
             use: {
               loader: 'babel-loader',
             },
           },
           {
             test: /.vue$/,
             loader: 'vue-loader',
           },
         ],
       },
       resolve: {
         extensions: ['.js', '.jsx', '.vue', '.tsx', '.mjs', '.json', '.cjs', '.ts'],
         alias: {
           '@': path.resolve(__dirname, '../src'),
           components: path.resolve(__dirname, '../src/components'),
           page: path.resolve(__dirname, '../src/page'),
         },
       },
       plugins: [
         new VueLoaderPlugin(),
         new htmlPlugin({ template: '../public/index.html', title: 'webpack' }),
         new DefinePlugin({
           BASE_URL: "'../public'",
         }),
       ],
     };
   
   ```

  :::

- 在`webpack.pro.js`中，使用 `merge` 进行合并`common`

   ```js
   const path = require('node:path');
   const { CleanWebpackPlugin } = require('clean-webpack-plugin');
   const { merge } = require('webpack-merge');
   const common = require('./webpack.common');
   module.exports = merge(common, {
     mode: 'production',
     output: {
       path: path.resolve(__dirname, '../build'),
       filename: 'index.js',
         publicPath: './',  // 静态资源路径  
     },
     plugins: [new CleanWebpackPlugin()],
   });
   
   ```

- 在`webpack.dev.js`中，使用 `merge` 进行合并`common`

  ```js
  const { merge } = require('webpack-merge');
  const common = require('./webpack.common');
  module.exports = merge(common, {
    mode: 'development',
    devServer: {
      hot: true,
      proxy: [
        {
          context: ['/api'],
          target: 'http://localhost:3000',
        },
      ],
    },
  });
  
  ```

## 四、开发环境、生产环境、none的区别

### 1.开发环境 `development`

当 `mode` 设置为 `development` 时，Webpack 的首要目标是让你能**快速启动、快速重新构建，并且容易调试。**
 :::details  内部启用的主要插件/配置： 
  1. `NamedModulesPlugin`: 将模块 ID 从数字替换为更易读的路径名，方便调试。
  2. `NamedChunksPlugin`: 同样，将代码块（chunk）ID 替换为可读的名称。
  3. `devtool: 'eval'`: 这是生成`Source Map `最快的方式，虽然信息量较少，但对于快速开发和 **热更新（HMR）** 来说是最佳选择。
   :::
当 `mode` 设置为 `development` 时 ，webpack 默认的配置 
:::details `development` 时 webpack 默认的配置 
  ```js [webpack.config.js]
  // webpack.development.js
  // 该文件模拟 `mode: 'development'` 时 Webpack 的内部行为
  
  const path = require('path');
  const webpack = require('webpack'); // 引入 webpack 以使用内置插件
  
  module.exports = {
    // 在 development 模式下，Webpack 会默认进行以下核心配置
    mode: 'development',
  
    // 入口文件
    entry: './src/index.js',
  
    // 输出配置
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      // 在开发模式下，通常会使用更具描述性的文件名
      // Webpack 内部会使用 NamedChunksPlugin 来实现类似效果
      chunkFilename: '[name].chunk.js',
    },
  
    // devtool 会被默认设置为 'eval'
    // 这是为了最快的重新构建速度，对调试友好
    devtool: 'eval',
  
    // 优化项
    optimization: {
      // 在开发模式下，代码压缩是禁用的，以加快构建速度
      minimize: false,
      // Webpack 会添加以下插件，让模块和代码块的 ID 更具可读性
      // 这等同于内部使用了 new webpack.NamedModulesPlugin() 和 new webpack.NamedChunksPlugin()
      moduleIds: 'named',
      chunkIds: 'named',
    },
  
    plugins: [
      // Webpack 内部会自动定义 process.env.NODE_ENV
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
    ],
  };
  
  ```
:::
### 2.开发环境 `production`

 当 `mode` 设置为 `production` 时，Webpack 会尽一切可能去**优化输出的代码，使其加载更快、体积更小。**

 :::details  内部启用的主要插件/配置：

  1. **`TerserWebpackPlugin`**: 这是最重要的插件之一。它负责**压缩**（`minify`）、**丑化**（`mangle`）`JavaScript` 代码，**移除注释、console、debugger** 等，并执行一些**如死代码消除**（`dead-code elimination`）的优化。
  2. **`ModuleConcatenationPlugin`**: 启用**作用域提升**（`Scope Hoisting`）。它会将多个模块尽可能地合并到一个函数作用域中，以**减少函数声明和闭包带来的运行时开销和代码体积**。
  3. **`SideEffectsFlagPlugin`**: 识别 `package.json` 中的 `sideEffects` 标志，为 Tree Shaking 提供支持。
  4. **`FlagDependencyUsagePlugin`**: 配合 Tree Shaking，检测并标记模块中哪些 `export` 被实际使用了。
  5. **`NoEmitOnErrorsPlugin`**: 如果在编译过程中出现任何错误，它会阻止 Webpack 生成任何输出文件。这可以防止将有问题的代码部署到生产环境。
  6. **CSS 压缩**: 如果你使用了像 `mini-css-extract-plugin` 这样的插件，在生产模式下，Webpack 也会自动尝试使用 `css-minimizer-webpack-plugin` 来压缩 CSS
::: 
当 `mode` 设置为 `prodution` 时 ，webpack 默认的配置 
:::details `prodution`在webpack 默认的配置
  ```js [webpack.production.js]
  // webpack.production.js
  // 该文件模拟 `mode: 'production'` 时 Webpack 的内部行为
  
  const path = require('path');
  const webpack = require('webpack');
  const TerserPlugin = require('terser-webpack-plugin'); // 生产模式默认使用的压缩插件
  
  module.exports = {
    // 在 production 模式下，Webpack 会默认进行以下核心配置
    mode: 'production',
  
    entry: './src/index.js',
  
    output: {
      filename: 'bundle.min.js',
      path: path.resolve(__dirname, 'dist'),
      // 生产模式下，文件名通常会包含 hash 以利用浏览器缓存
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].chunk.js',
    },
  
    // 生产模式下，devtool 默认为 false，不生成 source map
    devtool: false,
  
    // 优化项
    optimization: {
      // 启用代码压缩
      minimize: true,
      // 指定压缩器为 TerserPlugin
      minimizer: [
        new TerserPlugin({
          // Terser 插件的配置...
          // 例如，可以配置移除 console.log
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
      // 启用 ModuleConcatenationPlugin (Scope Hoisting)
      concatenateModules: true,
      // 启用 Tree Shaking，`usedExports` 会标记出哪些导出的模块被使用了
      usedExports: true,
      // Webpack 会自动使用确定的数字 ID，有利于长期缓存
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
    },
  
    plugins: [
      // Webpack 内部会自动定义 process.env.NODE_ENV
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      // 在生产模式下，如果编译出错，则不生成任何文件
      // 这相当于内部使用了 new webpack.NoEmitOnErrorsPlugin()
    ],
  };
  
  ```
:::

### 3.none模式

`none` 模式就像一张白纸。Webpack 不会为你添加任何默认的优化或插件。输出的代码会非常接近你的原始代码（**仅经过模块化包装**）。
:::details 这种模式的适用场景

  1. 当你需要完全自定义所有优化策略时。
  2. 在学习 Webpack 时，通过 `none` 模式可以更清晰地看到 Webpack 的模块打包原理，而不受任何优化的干扰。
  3. 用于创建库（library）时，你可能不希望 Webpack 对其进行任何形式的压缩或优化，而是将这个工作交给使用该库的开发者。
:::

:::details  `none`在webpack 默认的配置

  ```js
  // webpack.none.js
  // 该文件模拟 `mode: 'none'` 时的行为
  
  const path = require('path');
  
  module.exports = {
    // 当 mode 设置为 'none' 时，Webpack 不会启用任何默认的优化
    mode: 'none',
    // 入口
    entry: './src/index.js',
    // 输出
    output: {
      filename: 'bundle.raw.js',
      path: path.resolve(__dirname, 'dist'),
    },
    // devtool 默认为 false
    devtool: false,
    // optimization 对象中的所有优化选项都默认为 false 或关闭状态
    optimization: {
      minimize: false, // 不压缩
      concatenateModules: false, // 不进行作用域提升
      usedExports: false, // 不进行 tree shaking 标记
      // ... 其他所有优化均为关闭状态
    },
  };
  ```
:::
  

### 4.总结

| 特性 / 配置                 | `development` (开发环境)                                     | `production` (生产环境)                              | `none` (无模式)        |
| --------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- | ---------------------- |
| **核心目标**                | **快速构建**、**调试友好**                                   | **性能最优**、**包体最小**                           | **不启用任何默认优化** |
| `process.env.NODE_ENV`      | 设置为 `"development"`                                       | 设置为 `"production"`                                | 不设置                 |
| **代码压缩/优化**           | 否                                                           | **是** (默认使用 `TerserPlugin`)                     | 否                     |
| **Source Maps (`devtool`)** | `eval` (速度最快)                                            | `false` (不生成)                                     | `false` (不生成)       |
| **Tree Shaking**            | 部分启用 (标记 `sideEffects`)                                | **完全启用**                                         | 否                     |
| **Scope Hoisting**          | 否                                                           | **是** (使用 `ModuleConcatenationPlugin`)            | 否                     |
| **模块/代码块 ID**          | 使用**可读的名称** (`NamedModulesPlugin`, `NamedChunksPlugin`) | 使用**数字 ID** (优化包体大小)                       | 使用数字 ID            |
| **缓存**                    | 默认禁用，以保证最新代码生效                                 | 默认启用，利用持久化缓存提升后续构建速度             | 否                     |
| **错误处理**                | 在编译错误时**不会退出** (`NoEmitOnErrorsPlugin` 未启用)     | 在编译错误时**会退出** (`NoEmitOnErrorsPlugin` 启用) | 否                     |

- 疑问：`development` `Tree Shaking` 部分启用是是什么意思？
- 在 `development`（开发）模式下,**部分启用**  `Tree Shaking` 指的是 Webpack **只会执行 Tree Shaking 的第一步：识别和标记**。
  :::details 具体来说：
     1. **识别标记 (`sideEffects`)**：Webpack 会读取你项目中 `package.json` 文件里的 `"sideEffects": false` 这个字段。当它看到这个标记时，它就“知道”这个包里的模块如果没有被直接导出和使用，就是可以被移除的“死代码”。它会在内部对这些模块进行标记。

     2. **但不会真正移除代码**：然而，为了保证**最快的构建和重新构建速度**，在开发模式下，Webpack **并不会执行第二步**，也就是真正地从最终生成的 `bundle.js` 文件中把这些标记好的“死代码”给删除掉。
  :::

  ::: tip  **总结一下**
  1. **开发模式 (`development`)**：只“标记”出哪些是无用的代码，但为了速度，并不真正“摇掉”（移除）它们。这就是所谓的“部分启用”。
  2. **生产模式 (`production`)**：不仅会“标记”，还会执行完整的分析，将所有无用的代码从最终的打包结果中彻底“摇掉”（移除），以实现最小的包体积。
  :::
  
    

