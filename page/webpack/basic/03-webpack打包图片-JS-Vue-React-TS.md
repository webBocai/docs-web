---
date: 2025-09-01 15:53:48
title: 03-打包图片与js文件 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/25cf12
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - Webpack 基础
---

# Webpack处理静态资源(二)

### 一、Webpack处理图片与字体

####  0.准备工作

 1. 在 `src` 目录下创建`asset`文件夹创建 `imgs`文件夹和 `fonts`文件夹存放图片和字体
  - :gear: 在 `src/asset/css/index.css` 使用图片和字体文件

     ```css [index.css]
     @font-face {
         font-family: 'CustomFont';       /* 自定义字体名称（随意命名） */
         src: url('../fonts/www.otf') format('opentype'); 
         /* 路径根据项目结构调整，建议使用相对路径 */
     }
     .content{
         color: red;
         font-size: 40px;
         user-select:all;
         font-family: 'CustomFont';
     }
     .bg{
         min-width: 300px;
         min-height: 1300px;
         background-image: url('../asset/img/qd.jpg');
         background-repeat: no-repeat;
     }
     ```
2.  **format格式如下**
    | 字体文件后缀  | `format()` 参数       | 适用场景                   |
    | ------------ | --------------------- | -------------------------- |
    | `.woff2`     | `'woff2'`             | 现代浏览器首选，压缩率最高   |
    | `.woff`      | `'woff'`              | 广泛兼容，压缩适中          |
    | `.ttf`       | `'truetype'`          | 旧设备或 Android 兼容       |
    | `.otf`       | `'opentype'`          | 部分高级排版需求            |
    | `.eot`       | `'embedded-opentype'` | IE 兼容（已淘汰）           |
  - :gear: 在 `src/components/cps.js` 文件中
       ```js [cps.js]
       import '@/css/index.css';
       import w664 from '@/asset/img/w644.jpg';
       
       const img = document.createElement('img');
       img.src = w664;
       document.body.appendChild(img);
       
       const bg = document.createElement('div');
       bg.classList.add('bg');
       document.body.appendChild(bg);
       
       ```

#### 1. Webpack4.x处理方式

- :round_pushpin: `webapck5.x` 之前处理图片和字体的时候是通过 `url-loader` 和  `file-loader` 来处理

#####   图片资源处理

- :card_index_dividers: **Loader 组合**
  - :page_facing_up:   **url-loader**：将小于指定大小的图片转换为 `Base64 格式内嵌到代码中`,减少`HTTP`请求。若文件超过  制，则自动调用 `file-loader` 处理
  - :page_facing_up:   **file-loader**：将文件复制到输出目录(如 `dist`),并返回文件路径,常用于处理大体积图片
- :gear: **配置示例**：

  ```js{6-11} [webpack.config.js]
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192, // 小于 8KB 转为 Base64
            name: '[name].[hash:8].[ext]', // 文件名格式
            outputPath: 'images/', // 输出目录
            esModule: false // 解决路径引用问题（如 HTML 中 src 属性）
          }
        }
      }
    ]
  }
  ```

#####   字体文件处理

- :card_index_dividers: **Loader 组合**
  - :page_facing_up: **url-loader** 或 **file-loader**：
     -  :page_with_curl:  处理 `.woff`, `.woff2`, `.eot`, `.ttf`, `.svg` 等字体文件，原理与图片处理类似
- :gear: **配置示例**：

```js{6-9} [webpack.config.js]
module: {
  rules: [
    {
      test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[hash:8].[ext]',
          outputPath: 'fonts/' // 输出到 fonts 目录
        }
      }
    }
  ]
}
```

##### 关键配置选项说明

- **`limit`**（仅 `url-loader`）：设置文件大小阈值（单位：字节），超过阈值的文件由 `file-loader` 处理
- **`outputPath`**：指定资源输出目录（相对于 `output.path`）
- **`name`**：控制输出文件名格式，支持哈希值（如 `[hash:8]`）避免缓存问题
- **`esModule`**：设为 `false` 可解决部分场景下资源路径的模块化问题（如` CSS` 中引用字体)

##### 两个loader之间的关系

- **功能继承**

  - `url-loader` 是 `file-loader` 的增强版，它在内部封装了 `file-loader` 的功能。当图片文件大小超过 `limit` 阈值时，`url-loader` 会自动调用 `file-loader` 处理文件，无需显式配置 `file-loader`

- **核心区别**

  - `url-loader` 可将小文件（如小于 `8KB`）转为 `Base64` 格式内联到代码中，减少 HTTP 请求
  - `file-loader` 仅负责将文件复制到输出目录并返回路径，适用于大文件或无需内联的场景

##### 为何图片配置中可能只看到 `url-loader`

  - **隐式依赖**
    - 即使配置中仅使用 `url-loader`，当文件超过 `limit` 时，`file-loader` 会被自动调用。因此，**必须同时安装 `file-loader`**，否则会因依赖缺失导致打包失败
  - **典型配置示例**
    - 此配置未显式调用 `file-loader`，但实际运行时，大文件会通过 `file-loader` 处理 

  ```js
  {
    test: /\.(png|jpg|gif)$/,
    use: {
      loader: 'url-loader',
      options: {
        limit: 8192,  // 超过 8KB 调用 file-loader
        name: '[name].[hash:8].[ext]',
        outputPath: 'images/'
      }
    }
  }
  ```

  - **依赖要求**
    - `url-loader` 并不直接包含 `file-loader` 的代码，而是通过调用其 API 实现功能。若未安装 `file-loader`，当文件超过 `limit` 时会抛出错误

##### **兼容性注意事项**

- **Webpack 版本**：`Webpack 4.x` 及更早版本需安装 `url-loader@1.x` 和 `file-loader@5.x`

```powershell
npm install url-loader@1.1.2 file-loader@5.0.2 --save-dev
```

##### **图片路径错误**

- **`esModule` 配置**： `Webpack 4.x `中，若 `file-loader` 的 `esModule` 选项未设为 `false`，可能导致图片路径输出为 `[object Module]`。需在配置中显式关闭 

```js
options: {
  esModule: false  // 关闭 ES 模块语法
}
```

##### **总结**

- 在 `Webpack 5.x` 之前，**图片和字体文件主要依赖 `url-loader` 和 `file-loader`**，通过合理配置 `limit` 和输出路径，实现资源优化如 `Base64 内联`）与文件管理。`Webpack5.x `后，可通过内置的 `asset/resource` 类型替代

#### 2.Webpack5.x处理方式

##### 1.为什么5的版本和4版本有不同处理方式？

- `Webpack5.x` 的 `asset` 模块通过 **原生资源处理机制** 替代了 `url-loader` 和 `file-loader`，提供更简洁的配置、更高的性能
- **完全无需依赖第三方 Loader**。根据文件类型选择 `asset/resource`（字体）或 `asset`（图片自动优化），**即可高效管理静态资源**

##### 2.资源模块类型

- **资源模块类型(asset module type)**，通过添加 4 种新的模块类型，来替换这些 loader：

######   1.`asset/resource`

  - `asset/resource` 发送一个单独的文件并导出 URL

    - `5.x`之前通过使用`file-loader` 实现
      - 之前讲过了`file-loader`不过多赘述了
    
  - 如何使用`asset/resource`

    - 在我们的配置文件中
    
    ```js
     // ... 省略其他配置 
     module: {
        rules: [
          // ... 省略其他配置
          {
            test: /.(jpg|png|gif|jpe?g|svg)$/,
            type: 'asset/resource',
          },
        ],
      },
    ```
    
    - 如图我们会有一个疑问，我只配置了一个图片扩展名的配置 怎么字体文件，**怎么也进入打包文件中呢**？
    - 因为我们之前准备工作的时候，进行引入字体文件， 通过`css语法 @font-face`引入的字体文件，在使用`css`文件的时候，**会将他放进`webpack` 依赖图中**，处理`css`的时候，我们用`css-loader` 来处理**转换`css`模块**，让`webpack`识别
        - 我们用`asset/resource`这个模式去解析图片文件，**打包的时候会生成图片文件**，根据生成效果**并在使用图片的时候返回一个url**
    
    <div style="text-align:center">
    <img src="https://pic1.zhimg.com/80/v2-85b0e72472368fb74fed02cc6cf3f449_720w.png" style="zoom:40%;margin-right:20px;" />
    <img src="https://picx.zhimg.com/80/v2-d752da4cb13abd0dd061266ad59d8185_720w.png" style="zoom:50%;" />
     </div>

###### 2.`asset/inline` 

  - `asset/inline`  **资源转换为 `Base64 格式内嵌到代码中`**
  
-  `5.x`之前通过使用`url-loader` 实现
   
    - 之前讲过了`url-loader`不过多赘述了
    
- 如何使用`asset/inline`

    - 在我们的配置文件中

    ```js
     // ... 省略其他配置 
     module: {
        rules: [
          // ... 省略其他配置
          {
            test: /.(jpg|png|gif|jpe?g|svg)$/,
            type: 'asset/inline',
          },
        ],
      },
    ```
    - 我们用`asset/inline`这个模式去解析图片文件 我们打包出的文件**没有生成图片文件**，根据生成效果 **看到内嵌在代码中,并且是`base64`**

    <div style="text-align:center">
    <img src="https://picx.zhimg.com/80/v2-2cf2447e5c18b2ee4fbb2edcaba9ccac_720w.png" style="zoom:40%;margin-right:20px;" />
    <img src="https://picx.zhimg.com/80/v2-dff493bad35ce66420b2a8688148a549_720w.png" style="zoom:50%;" />
     </div>

###### 3.`asset/source`

  - `asset/source `**导出资源的源代码**
  
-  之前通过使用raw-loader 实现；
   
      - 安装`raw-loader`
      
        ```powershell
        npm install raw-loader --save-dev
        ```
      
      - `4.x`配置文件中
      
        ```js
        module.exports = {
        module: {
            rules: [
              {
                test: /\.(txt|svg|css)$/,  // 匹配目标文件
                use: 'raw-loader'          // 无需复杂参数
              }
            ]
        }
        };
        ```
      
        
      
      -  **将文件内容作为原始字符串导入** 的 Loader。它的作用类似于直接读取文件的二进制内容，但以字符串形式暴露给 JavaScript 模块，适用于需要直接操作文件原始数据的场
      
      - **功能定位**
      
        - 不进行任何转译（如 Babel）、不处理依赖（如 CSS 中的 `@import`），**仅将文件内容转为字符串**。
      
      - 创建`data.txt`
      
      ```txt
      const a = 123
      ```
      
      - 在`src/components/cps.js`文件中
      
      ```js
      import text from './data.txt';
      console.log('text', text);
      ```
      
      <img src="https://picx.zhimg.com/80/v2-500429dbb892f02d6e025dfe395fb128_720w.png" style="zoom:;float:left;" />

###### 4.`asset `

  - `asset `在导出一个资源转换为 `Base64 格式内嵌到代码中`和发送一个单独的文件之间自动选择

  - **为什么要限制大小？**

   - 这是因为小的**图片转换`base64`**之后可以**和页面一起被请求**，减少不必要的请求过程；

   - 而**大的图片也进行转换`base64`**，反而会**影响页面的请求速度**；

   - 所以大的图片直接文件**复制到输出目录，并返回路径**

- `5.x`之前通过使用 `url-loader`，**并且`limit`配置资源体积限制实现；**

- `5.x` 我们该如何**限制大小呢?**
  
   - 步骤一：**将type修改为asset**；
   - 添加一个`parser属性`，**并且制定`dataUrl`的条件，添加`maxSize`属性**；
     - 注意：无论是`url-loader`还是 `maxSize` 他们**单位是字节（bytes）**我设置的的 `maxSize: 200 * 200` 实际是 `40000 字节（约 39KB）`，而非像素尺寸 `200×200px`，**记住不要搞混淆了**
   
   ```js
   module.exports = {
       // ....省略其他配置
       {
           test: /.(jpg|png|gif|jpe?g|svg)$/,
           type: 'asset',
           parser: {
             dataUrlCondition: {
               maxSize: 200 * 200,
             },
           },
       }
   }     
   
   ```

- 如图所示：

   - 第一图我们打包出来,**文件输出目录就一张图片 **因为就一张大图占有空间**超出了设置大小**

   - 小图片我**设置成背景图片** 它的原图像素大小是`201*251` 空间占用大小是 `7kb`，**39>7 所以这个转换为`base64`**

   - 大图片我**设置图片** 它的原图像素大小是`647*825` 空间占用大小是 `280 Kb`,**39<280 直接文件**复制到输出目录，**并返回`http`路径**

<div style="text-align:center">
 <img src="https://picx.zhimg.com/80/v2-6e2e925cf781ac20ee6d8a5eed2f0596_720w.png" style="zoom:40%;" />
 <img src="https://picx.zhimg.com/80/v2-b14a5d12b1fbddf7710c69a0119e68a3_720w.png" style="zoom:80%;" />
</div>
##### 3.资源模块如何设置文件名称和导出路径

###### 1.全局配置所有输出规则

- 方式一：**修改`output`**，添加`assetModuleFilename`属性；

  - `assetModuleFilename`是 **全局配置所有 Asset Modules 类型文件的输出规则**

  ```js
  module.exports = {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'index.js',
      assetModuleFilename: 'img/[name].[hash:6].[ext]',
    }
    // .....省略其他配置
  }
  ```
- 可以看到**字体和图片**都放到一个`img`文件夹下了

<img src="https://picx.zhimg.com/80/v2-2fb372e948ed05ef96984c748f995b2c_720w.png" style="zoom:67%;float:left" />

  - ##### 适用文件类型

  | **文件类型**   | **常见扩展名**                          | **典型场景**                                    |
  | -------------- | --------------------------------------- | ----------------------------------------------- |
  | 图片资源       | `.png`、`.jpg`、`.jpeg`、`.gif`、`.svg` | CSS 中的 `background-image`                     |
  | 字体文件       | `.otf`、`.ttf`、`.woff`、`.woff2`       | `@font-face` 引入的字体（如图像中的 `www.otf`） |
  | 音视频文件     | `.mp3`、`.mp4`、`.ogg`                  | 多媒体资源引入                                  |
  | 其他二进制文件 | `.pdf`、`.zip`                          | 直接导入的文档或压缩包                          |

###### 2.每个资源类型单独配置

- 方式二：在Rule中，添加一个`generator`属性，并且设置`filename`

```js
 module: {
    rules: [
      // ...省略其他配置
      {
        test: /.(jpg|png|gif|jpe?g|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 200 * 200,
          },
        },
        generator: {
          filename: 'asset/imgs/[name].[hash:6].[ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
        type: 'asset',
        generator: {
          filename: 'asset/fonts/[name].[hash:6].[ext]',
        },
      },
    ],
  },
        
```

- 可以看到图片中我们打包文件成功为**字体文件**和**图片文件**分出**单独目录**进行管理

<img src="https://picx.zhimg.com/80/v2-d0273bc23ece79471791bdc965b31266_720w.png" style="zoom:67%;float:left;" />

- 我们这里介绍几个最常用的placeholder：
  - **[ext]**： 处理文件的扩展名；
  - **[name]**：处理文件的名称；
  - **[hash]**：文件的内容，使用MD4的散列函数处理，生成的一个128位的hash值（32个十六进制）；



### 二、`Babel`处理` Vue`、`React`、`TS `、`ES6+转ES5`

#### 1.为什么需要babel？

- 在开发中我们**很少直接去接触babel**，但是babel对于前端开发来说，目前是不可缺少的一部分：
  - 开发中，我们想要使用`ES6+的语法`，想要使用`TypeScript`，开发`React项目`，它们都是离不开Babel的；
- 那么，`Babel`到底是什么呢？
  - `Babel`**是一个工具链**，主要用于将`ECMAScript 2015+`代码转换为向后兼容版本的JavaScript；
  - 将`React`  `TypeScript` 这种框架和静态语言转换为` JavaScript`
- `ES6`语法用babel进行转换

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

- **babel转换结果**

![](https://picx.zhimg.com/80/v2-e3c60c683295dc0095562dcac4893ea9_1020w.png)

更多详情查看 [babel官网](https://babeljs.io/repl#?browsers=es5&build=&builtIns=false&corejs=3.21&spec=true&loose=false&code_lz=MYewdgzgLgBAhjAvDAjABgNwChSVgIyRgAoBKRAPgG8sYZcIQAbAUwDomQBzYgJn96ksAXxxM4ECDAAKLAE6MwNeuGhyArsCgg5xOFxallMKAAsAlhDb6WRG7VGiGsAA4oiYFgHcZ8xcQByFAAOANIgA&forceAllTransforms=true&modules=umd&shippedProposals=false&evaluate=false&fileSize=false&timeTravel=false&sourceType=script&lineWrap=true&presets=react%2Cstage-2&prettier=false&targets=&version=7.27.0&externalPlugins=%40babel%2Fplugin-transform-block-scoping%407.27.0%2C%40babel%2Fplugin-transform-arrow-functions%407.25.9%2C%40babel%2Fplugin-proposal-class-properties%407.18.6%2C%40babel%2Fplugin-transform-class-static-block%407.26.0%2C%40babel%2Fplugin-syntax-class-properties%407.12.13%2C%40babel%2Fplugin-transform-classes%407.25.9&assumptions=%7B%7D)

#### 2.`babel`命令行使用

###### 1.介绍

-  `babel`本身可以作为一个**独立的工具**（和`postcss`一样），可以和`webpack`等构建工具配置使用，**也可以单独使用**。

###### 2.安装

- 如果我们希望在**命令行尝试使用babel**，需要安装如下库：

  - `@babel/core`：`babel`的核心代码，必须安装；
  - `@babel/cli`：可以让我们在命令行使用babel；

  ```powershell
  npm install @babel/cli @babel/core -D
  ```

###### 3.使用

- 使用babel来处理我们的源代码

  - `src`：是源文件的目录

  - `--out-dir`：指定要输出的文件夹dist；

  ```powershell
  npx babel src --out-dir dist
  ```

  - 此时我们发现并没有转换啊，**仅复制文件，显示出来**

###### 4.没有转换成功的原因

- 这是因为我们**没有安装`bable`的插件和预设**

  - **实际行为**
    - 对 `.js` 文件
      - **ES6+ 语法（如箭头函数、`class`、`const` 等）** ❌ 不会转换，因为缺少 `@babel/preset-env` 或相关插件。Babel 默认无任何转换行为。
      - **JSX 语法（如 `<div></div>`）** ❌ 不会转换，因为需要 `@babel/preset-react` 插件。
    - 对 `.ts` / `.tsx` 文件
      - ❌ **直接报错**，因为 Babel 默认只处理 `.js` 文件，且需要 `@babel/preset-typescript` 来解析 `TypeScript `语法。
  - **根本原因**
    - Babel 的行为完全由 **插件和预设** 决定。没有安装任何插件/预设时：
      - **仅复制文件**，不做任何语法转换
      - **不支持 `TypeScript`** 或 `JSX `解析

###### 5.插件的使用

- 比如我们需要转换箭头函数，那么我们就可以使用箭头函数转换相关的插件：` @babel/plugin-transform-arrow-functions`

  ```powershell
  npm install @babel/plugin-transform-arrow-functions -D
  ```

  - 然后使用命令 已经将**箭头函数转成`ES5`的函数**

  ```powershell
  npx babel src --out-dir dist --plugins=@babel/plugin-transform-arrow-functions
  ```

- 但是查看转换后的结果：我们会发现**`const `并没有转成var  构造函数也没有转换**

  - 这是因为`plugin-transform-arrow-functions`，并没有提供这样的功能,它只能做箭头函数的转换
  - 我们需要使用`plugin-transform-block-scoping`和``@babel/plugin-transform-classes` 来完成这样的功能；
    - `plugin-transform-block-scoping` **处理将`const let` 转成`var`**
    - `@babel/plugin-transform-classes`将**类转换成`ES5`的构造函数**
  - 安装`plugin-transform-block-scoping`和``@babel/plugin-transform-classes`

  ```
  npm install @babel/plugin-transform-block-scoping -D 
  ```

  - 执行命令

  ```powershell
  npx babel src --out-dir dist --plugins=@babel/plugin-transform-block-scoping
   ,@babel/plugin-transform-arrow-functions,@babel/plugin-transform-classes
  ```

- 这样处理将`const let` 转成`var`,将**类转换成`ES5`的构造函数**, 将**箭头函数转成`ES5`的函数**

#### 3.`Babel`的预设`preset-env`

- 但是如果要转换的内容过多，一个个设置是比较麻烦的，**我们可以使用预设（preset）**：

  - 安装`@babel/preset-env`预设

  ```powershell
  npm install @babel/preset-env -D
  ```

  - 执行下面命令
    -  他会把 `src` 目录下所有`js`都会进行转换

  ```powershell
  npx babel src --out-dir dist --presets=@babel/preset-env
  ```
  注意：**图片中我这里我用的`src1`目录下进行转换的**
  ![](https://pic1.zhimg.com/80/v2-f4cdcb1f090c98378363fc4a2ec8b8aa_1020w.png)
##### 1.`preset-env`预设的参数

######    参数介绍

  - `target`:  **> 0.25%, not dead**

    - `> 0.25%` → 代码要兼容“全球使用率超过 0.25% 的浏览器”（比如主流浏览器的最新几个版本）。
    - `not dead` → 排除那些已经“死掉”的浏览器（比如 IE 11、旧版 Safari 等）。
    - **效果**：Babel 会按这个条件，只转换目标浏览器不支持的语法。

  - **`corejs`**

    - 这个是什么？
      - Babel 可以将 `ES6+` 的**新语法**（如箭头函数、`class`）转成 `ES5`，但**`新的 API`**（如 `Promise`、`Array.from`）无法通过语法转换实现，必须用代码模拟。
      - `core-js` 就是用来“模拟”这些新 API 的代码库。比如，在 IE11 中运行 `new Set([1, 2, 3])`，如果没有 `core-js`，就会直接报错；有了 `core-js`，它会用 `ES5` 代码实现 `Set` 的功能。

    -  **与 Babel 的关系**
      
      - Babel 负责**语法转换**（如 `() => {}` → `function() {}`）。
      - `core-js` 负责**`API` 模拟**（如 `Promise`、`Array.includes`）。
      
    -  **版本差异**
      
      - `core-js@2`
        - 支持大部分 `ES6+ API`，但**不覆盖实例方法**（如 `[1, 2, 3].includes(1)`）。
        - 已停止维护，**不推荐使用**。
      - `core-js@3`
        - 支持 **`ES6+`** 的全部 `API`，包括实例方法（如 `array.includes`、`string.padStart`）。
        - 持续更新，**推荐使用**。
      
    - **作用**：指定 `core-js` 的版本（必须安装对应的版本）。
    
      -  **为什么需要显式指定 `corejs` 版本？**
    
        Babel 默认不处理新 `API`，必须通过 `corejs: 3` 明确告诉它使用 `core-js@3` 的 `Polyfill`。
    
      ```js
      npm install core-js@3 --save
      ```
    
  - `useBuiltIns`
  
    - 可选值
      - `'usage'` → 按需添加（只加代码中用到的 `API`，**推荐**）
        -  按需加载 `Polyfill`（比如 `Promise`、`Array.includes` 等新 `API`）
        - **效果**：Babel 会检查你的代码，只在你用到新 `API `的地方，自动插入对应的兼容代码。
        - **优点**：生成的代码体积更小。
      - `'entry'` → 在入口文件手动导入 `import 'core-js'`，根据目标环境添加全部 `Polyfill`。
      - `false` → 不自动添加 `Polyfill`（需手动处理兼容性）。


  - `modules`

    - **作用**：是否将 ES6 模块语法（`import/export`）转成其他模块格式。
    - 可选值
      - `'auto'` → 由 Webpack 等打包工具决定（默认）。
      - `false` → 保留 ES6 模块语法（推荐，便于 Webpack 做 Tree Shaking）。
      - `'commonjs'` → 转成 `CommonJS `格式（适合 `Node.js`）。
  - **`shippedProposals`**
      - **作用**：是否启用浏览器已支持的提案特性（如某些 ES2022 特性）。

    ```js
    shippedProposals: true  // 直接使用浏览器已实现的提案语法
    ```

  - `bugfixes`
      - **作用**：根据目标环境自动修复已知的语法 Bug（推荐开启）。

    ```
    bugfixes: true
    ```

  - **`loose`**
      - **作用**：以“宽松模式”生成代码（代码更简洁，但可能不符合标准）。

    ```js
    loose: true
    ```

###### 参数在命令行使用

```powershell
npx babel src --out-dir dist--presets=@babel/preset-env,{"targets":"> 0.25%, not dead","useBuiltIns":"usage","corejs":3}
```

#### 4.`Babel-loader`的使用

##### 配置

- 在实际开发中，我们通常会在构建工具中通过配置babel来对其进行使用的，比如在`webpack`中。

-  那么我们就需要去安装相关的依赖：

  - 如果之前已经安装了`@babel/core`，那么这里不需要再次安装；

  ```powershell
  npm install babel-loader @babel/core -D // 没有安装 @babel/core
  npm install babel-loader  -D   // 安装了 @babel/core
  ```

-  我们可以设置在配置文件中设置规则，在加载`js`文件时，使用我们的babel：

```js
	module: {
		rules: [
			// 省略其他配置
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			}
		]
	},
```

- 如果我们就这样设置了**没有配置预设或者插件**，还是跟刚刚一样 不会有任何转换变化如果遇到`ts`和`tsx`还会报错
-  如果我们一个个去安装使用插件，那么需要手动来管理大量的babel插件，我们可以直接给`webpack`提供一个`preset`，`webpack` 会根据我们的预设来加载对应的插件列表，并且将其传递给`babel`
- 如果之前没有安装`@babel/preset-env`预设

```powershell
npm install @babel/preset-env -D
```

- 然后在配置文件中新增预设

```js
module: {
  rules: [
    // 省略其他配置
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
           options: {
            presets: ['@babel/preset-env'],
            /** 这里可以配置插件 但是使用了预设可以不配插件
             plugins: [
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              '@babel/plugin-transform-arrow-functions' // 转换箭头函数
            ]
            **
          },
         },
       }
    }
 ]
```

##### 配置项中使用预设参数

- 我现在想让预设配置**能自动根据你指定的目标环境把** ` ES6+ 代码转换成兼容的 ES5 代码。`

```js
module: {
  rules: [
    // 省略其他配置
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
           options: {
              presets: [
              ['@babel/preset-env', { 
                targets: 'defaults', // 兼容主流浏览器最新两个版本
                useBuiltIns: 'entry', // 在入口文件全局引入 Polyfill
                corejs: 3
              }],
              ['@babel/preset-react', { runtime: 'automatic' }]
            ],
          },
         },
       }
    }
 ]
```

- 目前配置文件太多东西了，我们直接把`babel`配置项单独提取出去，我们创建一个`babel.config.js`

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
  ],
};

```

- 然后将 `webpack `配置文件里面的预设参数给移除
- 如果我们没有移除配置项，`babel.config.js`和options选项那个优先级更高呢？
  - `babel.config.js` **优先级更高**

```js
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
    }
 ]
```

#### 5. 处理React

##### 安装 react

- react 需要安装两个 `react` 和`react-dom`

```
npm i react react-dom
```

##### 初始化react文件

- 在`src`目录下创建 `page/react/App.jsx`

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

- 在`src/index.js`文件中添加以下代码

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactApp } from 'page/react/App.jsx'; // react
// react
ReactDOM.createRoot(document.getElementById('root')).render(<ReactApp />);
```

- 在 根目录中`index.html` 中添加 react的根

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

#####  配置react预设

- 安装`@babel/preset-react`

```powershell
npm  i @babel/preset-react -D
```

- 在`babel.config.js` 添加 这个预设

```powershell
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
    '@babel/preset-react',
  ],
};

```

- `npm run build ` 查看效果

<img src="https://pica.zhimg.com/80/v2-58f49fad9f8de8189a92dca7a5df1cac_1020w.png" style="float:left;" />

##### 预设的参数

- `runtime`：

  - **作用**：控制 JSX 的转换方式。
  - 可选值
    - `'classic'` → 旧版模式，需手动导入 React（默认）。
    - `'automatic'` → 自动从 `react/jsx-runtime` 导入 JSX 函数（**推荐**，代码更简洁）。

  ```js
  runtime: 'automatic'  // 无需手动写 `import React from 'react'`
  ```

- **`development`**

  - **作用**：是否添加开发环境下的调试信息（如组件名称提示）。

  ```js
  development: process.env.NODE_ENV === 'development'  // 根据环境自动开启
  ```

- **`importSource`**

  - **作用**：指定 `JSX` 运行时函数的导入路径（配合 `runtime: 'automatic'` 使用）

  ```js
  importSource: '@emotion/react'  // 使用 Emotion 库的 JSX 运行时
  ```

- **`throwIfNamespace`**

  - **作用**：是否禁止使用 XML 命名空间标签（如 `<svg:circle>`）

  ```powershell
  throwIfNamespace: false  // 允许使用（默认是 true，遇到会报错）
  ```

- **`pure`**

  - **作用**：是否在编译时移除 JSX 中的纯注释（如 `/*#__PURE__*/`，用于 Tree Shaking）。

  ```js
  pure: true  // 默认开启
  ```

- **配置示例**

```js
// 在 Babel 配置或 Webpack 的 babel-loader 中
{
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

#### 6.处理TS或TSx

##### 创建文件

- 在`src`目录下创建一个`index.tsx`文件 路径`page/react/App/index.tsx`

```tsx
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

- 在`App.jsx` 进行引入

```jsx
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

##### 安装ts预设并配置

- 安装

```powershell
npm i @babel/preset-typescript -D
```

- 配置在`babel.config.js` 进行配置

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
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};

```

- `npm run build`然后进行打包查看效果

![](https://pic1.zhimg.com/80/v2-3c0dd15179b9671eaabe1cf56a58f489_720w.png)

##### 预设参数

-  `allExtensions`

  - **作用**：将 **所有文件**（如 `.js`、`.jsx`）当作 TypeScript 处理（默认只处理 `.ts`、`.tsx`）。
  - **场景**：混合 `TypeScript `和 `JavaScript` 的项目（慎用）。

  ```js
  presets: [
    ['@babel/preset-typescript', { allExtensions: true }]
  ]
  ```

-  `isTSX`

  - **作用**：强制将文件当作 **TSX**（TypeScript + JSX）处理（即使扩展名不是 `.tsx`）。
  - **场景**：在 `.ts` 文件中使用` JSX` 语法。

  ```js
  presets: [
    ['@babel/preset-typescript', { isTSX: true }]
  ]
  ```

-  `jsxPragma`

  - **作用**：指定 JSX 转换后的函数名（默认是 `React.createElement`）。
  - **场景**：配合非 React 的` JSX `运行时（如 Vue 3 的 `h` 函数）。

  ```js
  presets: [
    ['@babel/preset-typescript', { 
      jsxPragma: 'h' // 转换 JSX 为 h('div')
    }]
  ]
  ```

-  `allowNamespaces`

  - **作用**：是否保留 TypeScript 的 **命名空间**（`namespace`）语法（默认：`false`，转换为普通对象）。
  - **场景**：需要保留命名空间结构。

  ```js
  presets: [
    ['@babel/preset-typescript', { allowNamespaces: true }]
  ]
  ```

-  `allowDeclareFields`

  - **作用**：是否允许 `TypeScript` 的 **类属性声明**（`declare class Foo { bar: string }`）（默认：`false`）。
  - **场景**：需要保留类属性的类型声明。

  ```js
  presets: [
    ['@babel/preset-typescript', { allowDeclareFields: true }]
  ]
  ```

- `onlyRemoveTypeImports`

  - **作用**：仅删除 **类型导入**（如 `import type { Foo } from '...'`），保留普通导入（默认：`true`）。
  - **场景**：避免误删普通导入。

  ```js
  presets: [
    ['@babel/preset-typescript', { onlyRemoveTypeImports: false }]
  ]
  ```

- `optimizeConstEnums`

  - **作用**：优化 **常量枚举**（`const enum`），直接替换为值（默认：`false`）。
  - **场景**：减少代码体积，但可能影响调试。

  ```js
  presets: [
    ['@babel/preset-typescript', { optimizeConstEnums: true }]
  ]
  ```

- `rewriteImportExtensions`

  - **作用**：将 TypeScript 的 `.ts`、`.tsx` 导入扩展名改为 `.js`（默认：`false`）。
  - **场景**：用于 `Node.js ESM `或浏览器直接加载 ES 模块。


-  **完整配置示例**

  ```js
  // babel.config.js
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

  ### **注意事项**
  
  1. **类型擦除**：Babel 只删除 TypeScript 类型，**不进行类型检查**（需用 `tsc` 单独检查）。
  2. 兼容性
     - 部分高级` TypeScript` 语法（如装饰器 `@Decorator`）需额外插件（如 `@babel/plugin-proposal-decorators`）。

#### 7.处理`Vue`

##### 安装`vue`

- 在`webpack `环境下使用`vue` 需要安装`vue-loader`

```powershell
npm i vue
npm i vue-loader-D
```

##### 初始化`vue`文件

- 在`src`目录下创建 `page/vue/App.vue`

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

- 然后在配置文件中添加`vue-loader` 配置

```js
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
    }
 ]
```

- 打包会报错，这是因为我们必须添加`@vue/compiler-sfc`来对`template`进行解析

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
    }
  ]
}
 plugins: [new VueLoaderPlugin()],
}
```

- 在`src/index.js`文件中添加以下代码
  -  此时搭建出`Vue`和`React`  混合框架的雏形

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

<img src="https://pic1.zhimg.com/80/v2-26e718c21b18992ccc1b1912b70b3630_1020w.png" style="float:left;" />

#### 8.`React`与`Vue`框架混合使用

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

<img src="https://picx.zhimg.com/80/v2-c1f3aa369457cc0e155e00c2830a1302_1020w.png" style="zoom:67%;float:left" />
