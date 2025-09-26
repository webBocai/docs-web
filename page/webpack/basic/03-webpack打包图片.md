---
date: 2025-09-18 15:53:48
title: 03-webpack处理图片文件 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/25cf12
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - Webpack 基础
---

# Webpack处理静态资源(二)

 > **我们会继续使用上一章的配置，在此基础上增加配置**

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
   ::: details  Loader 组合
     - :page_facing_up:   **url-loader**：将小于指定大小的图片转换为 `Base64 格式内嵌到代码中`,减少`HTTP`请求。若文件超过  制，则自动调用 `file-loader` 处理
     - :page_facing_up:   **file-loader**：将文件复制到输出目录(如 `dist`),并返回文件路径,**常用于处理大体积图片**
   ::: 
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
::: details 配置选项说明
 - :one: **`limit`**(仅 `url-loader`)设置文件大小阈值（单位：字节） 超过阈值的文件由 `file-loader` 处理
 - :two:  **`outputPath`**：指定资源输出目录（相对于 `output.path`）
 - :three:  **`name`**：控制输出文件名格式，支持哈希值（如 `[hash:8]`）避免缓存问题
 - :four:  **`esModule`**：设为 `false` 可解决部分场景下资源路径的模块化问题(如` CSS` 中引用字体)
:::


##### 两个loader之间的关系
::: details 功能继承
  - :one: `url-loader` 是 `file-loader` 的增强版，它在内部封装了 `file-loader` 的功能。
  - :two:  当图片文件大小超过 `limit` 阈值时，`url-loader` 会自动调用 `file-loader` 处理文件，无需显式配置 `file-loader`
:::

::: list-tip 核心区别
 - :round_pushpin:  `url-loader` 可将小文件（如小于 `8KB`）转为 `Base64` 格式内联到代码中，减少 HTTP 请求
 - :round_pushpin:  `file-loader` 仅负责将文件复制到输出目录并返回路径，适用于大文件或无需内联的场景
:::

##### 为何图片配置中可能只看到 `url-loader`

  1.  **隐式依赖**
      - :round_pushpin: 即使配置中仅使用 `url-loader`，当文件超过 `limit` 时，`file-loader` 会被自动调用。因此，**必须同时安装 `file-loader`**，否则会因**依赖缺失导致打包失败**
  2.  **典型配置示例**
      - :round_pushpin: 此配置未显式调用 `file-loader`，但实际运行时，大文件会通过 `file-loader` 处理 

      ```js [webpack.config.js]
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

  3.  **依赖要求**
      - :round_pushpin: `url-loader` 并不直接包含 `file-loader` 的代码，而是通过调用其 API 实现功能。
      - :round_pushpin: 若未安装 `file-loader`，当文件超过 `limit` 时会抛出错误

##### **兼容性注意事项**

-   **Webpack 版本**：`Webpack 4.x` 及更早版本需安装 `url-loader@1.x` 和 `file-loader@5.x`

    ```sh
    npm install url-loader@1.1.2 file-loader@5.0.2 --save-dev
    ```

##### **图片路径错误**

-   **`esModule` 配置**： `Webpack 4.x `中，若 `file-loader` 的 `esModule` 选项未设为 `false`，可能导致图片路径输出为 `[object Module]` **需在配置中显式关闭**

    ```js
    options: {
      esModule: false  // 关闭 ES 模块语法
    }
    ```

##### **总结**
::: list-tip 两个loader结合使用
 - :round_pushpin:  在 `Webpack 5.x` 之前，**图片和字体文件主要依赖 `url-loader` 和 `file-loader`**
 - :round_pushpin:  通过合理配置 `limit` 和输出路径，实现资源优化如 `Base64 内联`）与文件管理。`Webpack5.x `后，可通过内置的 `asset/resource` 类型替代
:::


#### 2.Webpack5.x处理方式
::: details 处理方式
  - `Webpack5.x` 的 `asset` 模块通过 **原生资源处理机制** 替代了 `url-loader` 和 `file-loader`，**提供更简洁的配置、更高的性能**
::: 
##### 为什么5的版本和4版本有不同处理方式？
::: details 区别
  - **完全无需依赖第三方 Loader**。根据文件类型选择 `asset/resource`（字体）或 `asset`（图片自动优化），**即可高效管理静态资源**
::: 
##### 资源模块类型
::: details 源模块类型
 -  **资源模块类型(asset module type)**，通过添加 4 种新的模块类型，来替换这些 `loader`
::: 


###### 1. `asset/resource`

  - :card_index_dividers: `asset/resource` 发送一个单独的文件并导出 URL
    -  :page_facing_up: `5.x`之前通过使用`file-loader` 实现，之前讲过了`file-loader`不过多赘述了
    - :page_facing_up: 如何使用`asset/resource`,在我们的配置文件中
      ```js [webpack.config.js]
       // ... 省略其他配置 
       module: {
          rules: [
            // ... 省略其他配置
            {
              test: /.(jpg|png|gif|jpe?g|svg)$/, 
              type: 'asset/resource',  // [!code focus]
            },
          ],
        },
      ```
      ::: details 查看效果
      <div style="display:flex; justify-content:center;">
        <img src="https://pic1.zhimg.com/80/v2-85b0e72472368fb74fed02cc6cf3f449_1420w.png" style="zoom:40%; margin-right:20px" />
        <img src="https://picx.zhimg.com/80/v2-d752da4cb13abd0dd061266ad59d8185_1420w.png" style="zoom:40%;" />
      </div>
      :::
  - :file_folder: 如图我们会有一个疑问，**只配置了一个图片扩展名的配置** 怎么 **字体文件也打包呢**？
    ::: details 字体文件也打包怎么也被打包了？
      - :one:   因为我们之前准备工作的时候，进行引入字体文件， 通过`css语法 @font-face`引入的字体文件
      -  :two:  在使用 `css` 文件的时候，**会将他放进`webpack` 依赖图中**，处理`css`的时候，我们用`css-loader` 来处理**转换`css`模块**,找出其中引用的**所有外部资源（图片、字体等）**，并将它们作为模块依赖项交给 Webpack。
      -  :three:  **Webpack5** 强大的默认行为：Webpack 5 内置的资源模块非常智能,对于那些由其他 `loader` (如 `css-loader`) 发现、但又没有在 `webpack.config.js` 中明确配置规则的文件类型,`webpack`会自动应用默认的**资源处理规则**`asset/resource`，将其作为静态资源输出
    :::
 - :file_folder: 在 `Webpack5`以下的版本对于刚刚这种情况是**如何处理的呢？**
    ::: details 不同版本如何处理的呢？
      - :one:  **Webpack 5 不会报错**，而是会**自动应用默认的资源处理规则**，将其作为静态资源输出。
      - :two: **在 Webpack 4 及更早版本中**，如果没有找到对应的 loader (比如 `file-loader` 或 `url-loader`)，Webpack 就会抛出错误：
         -  :x: `"You may need an appropriate loader to handle this file type"` 的错误。
    :::
    


###### 2.`asset/inline` 

 1. `asset/inline` **资源转换为  `Base64 格式内嵌到代码中`**
   
 2. `5.x`之前通过使用`url-loader`实现, 之前讲过了`url-loader`不过多赘述了
     
 3.  如何使用`asset/inline` 在我们的配置文件中
     ```js [webpack.config.js]
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
4. 我们用`asset/inline`这个模式去解析图片文件 我们打包出的文件**没有生成图片文件**，根据生成效果 **看到内嵌在代码中,并且是`base64`**
  ::: details 查看效果
  <div style="display:flex; justify-content:center; margin:20px 0;">
     <img src="https://picx.zhimg.com/80/v2-2cf2447e5c18b2ee4fbb2edcaba9ccac_720w.png" style="zoom:50%;margin-right:20px;" />
     <img src="https://picx.zhimg.com/80/v2-dff493bad35ce66420b2a8688148a549_720w.png" style="zoom:50%;" />
  </div>
   :::

###### 3.`asset/source`

  ::: list-default 功能定位
  - 不进行任何转译（如 `Babel`）、不处理依赖（如 CSS 中的 `@import`），**仅将文件内容转为字符串**。
  :::   
   -  `asset/source `**导出资源的源代码** 在`webpack5.x`之前通过使用`raw-loader` 实现；

     
      - :one: 安装 `raw-loader`
      
        ```sh
        npm install raw-loader --save-dev
        ```
      
      -  :two: `4.x` 配置文件中
          ::: details 查看配置文件
          - **将文件内容作为原始字符串导入** 的 `Loader`。它的作用类似于**直接读取文件的二进制内容**，但以字符串形式暴露给 `JavaScript` 模块，**适用于需要直接操作文件原始据**
           ```js [webpack.config.js]
            module.exports = {
              module: {
                  rules: [
                    {
                      test: /\.(txt|svg|css)$/,  // [!code focus]
                      use: 'raw-loader'          // [!code focus]
                    }
                  ]
              }
            };
           ```
          :::
        
      -  :three: `5.x` 配置文件中，我们就可以不在需要`raw-loader`,直接使用 `asset/source` 
         ```js [webpack.config.js]
               module.exports = {
                 module: {
                     rules: [
                       {
                         test: /\.(txt|svg|css)$/,  
                         // use: 'raw-loader'   // [!code --]
                         type: 'asset/source',        // [!code ++] [!code focus]
                       }
                     ]
                 }
               };
          ```

  - :four:  创建`data.txt`
      
       ```txt
       const a = 123
       ```
      
  - :five: 在 `src/components/cps.js` 文件中
      
      ```js [cps.js]
      import text from './data.txt';
      console.log('text', text);
      ```
      ::: details 查看效果
      <img src="https://picx.zhimg.com/80/v2-500429dbb892f02d6e025dfe395fb128_1420w.png"  />
      ::: 
      

###### 4.`asset `

  - `asset `在导出一个资源转换为 `Base64 格式内嵌到代码中`和发送一个**单独的文件**之间**自动选择**

  - **为什么要限制大小？**
     ::: details 为什么要限制大小？
     - :one: 这是因为小的**图片转换`base64`**之后可以**和页面一起被请求**，减少不必要的请求过程；
     - :two: 而**大的图片也进行转换`base64`**，反而会**影响页面的请求速度**；
     - :three: 所以大的图片直接文件**复制到输出目录，并返回路径**
     :::

- `5.x`之前通过使用 `url-loader`，**并且`limit`配置资源体积限制实现；**

- `5.x` 我们该如何**限制大小呢?**
     ::: details 如何限制大小？
     - :one: **将type修改为asset**；
     - :two: 添加一个`parser属性`，**并且制定`dataUrl`的条件，添加`maxSize`属性**；
     :::
    ::: list-default 注意
    - 无论是`url-loader`还是 `maxSize` 他们 **单位是字节（bytes）** 设置的的 `maxSize: 200 * 200` 实际是 `40000 字节（约 39KB）`，而非像素尺寸 `200×200px`，**记住不要搞混淆了**
    :::  
- :gear:  修改配置文件
     ```js [webpack.config.js]
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

   - :one: 第一图我们打包出来,**文件输出目录就一张图片 **因为就一张大图占有空间**超出了设置大小**

   - :two: 小图片我**设置成背景图片** 它的原图像素大小是`201*251` 空间占用大小是 `7kb`，**39>7 所以这个转换为`base64`**

   - :three: 大图片我**设置图片** 它的原图像素大小是`647*825` 空间占用大小是 `280 Kb`,**39<280 直接文件**复制到输出目录，**并返回`http`路径**
  ::: details 查看效果
  <div style="display:flex">
   <img src="https://picx.zhimg.com/80/v2-6e2e925cf781ac20ee6d8a5eed2f0596_1020w.png" style="zoom:30%;" />
   <img src="https://picx.zhimg.com/80/v2-b14a5d12b1fbddf7710c69a0119e68a3_1020w.png" style="zoom:30%;" />
  </div>
  ::: 
  
#### 3.资源模块如何设置文件名称和导出路径
- :round_pushpin: 设置导出路径有两种方案：**全局配置** 和 **每个资源单独配置**

  ###### 全局配置所有输出规则

   -  :one: **修改`output`**，添加`assetModuleFilename`属性；
     - :round_pushpin: `assetModuleFilename`是 **全局配置所有 Asset Modules 类型文件的输出规则**
     - :round_pushpin: 修改配置文件
       ```js [webpack.config.js]
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
  - :two: 可以看到**字体和图片**都放到一个`img`文件夹下了

     <img src="https://picx.zhimg.com/80/v2-2fb372e948ed05ef96984c748f995b2c_1420w.png" style="zoom:50%;"/>

  - :three: 适用文件类型

    | **文件类型**   | **常见扩展名**                          | **典型场景**                                    |
    | -------------- | --------------------------------------- | ----------------------------------------------- |
    | 图片资源       | `.png`、`.jpg`、`.jpeg`、`.gif`、`.svg` | CSS 中的 `background-image`                     |
    | 字体文件       | `.otf`、`.ttf`、`.woff`、`.woff2`       | `@font-face` 引入的字体（如图像中的 `www.otf`） |
    | 音视频文件     | `.mp3`、`.mp4`、`.ogg`                  | 多媒体资源引入                                  |
    | 其他二进制文件 | `.pdf`、`.zip`                          | 直接导入的文档或压缩包                          |

###### 每个资源类型单独配置

- :one: 在`Rule`中，添加一个`generator`属性，并且设置`filename`

   ```js [webpack.config.js]
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

- :two: 可以看到图片中我们打包文件成功为**字体文件**和**图片文件**分出**单独目录**进行管理

    <img src="https://picx.zhimg.com/80/v2-d0273bc23ece79471791bdc965b31266_1420w.png" style="zoom:50%;" />

- :three: 我们这里介绍几个最常用的`placeholder`
   ::: list-default 最常用的属性
    - **`[ext]`**：处理文件的扩展名；
    - **`[name]`**：处理文件的名称；
    - **`[hash]`**：文件的内容，使用MD4的散列函数处理，生成的一个128位的hash值（32个十六进制）；
   :::   


