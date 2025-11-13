## 一、Webpack 处理图片与字体

### 1. 准备工作

**创建目录结构**

在 `src` 目录下创建 `asset` 文件夹，其中包含 `imgs` 文件夹和 `fonts` 文件夹，分别用于存放图片和字体文件。

**在 CSS 中使用图片和字体**

在 `src/asset/css/index.css` 中使用图片和字体文件：

```css
@font-face {
    font-family: 'CustomFont';       /* 自定义字体名称(随意命名) */
    src: url('../fonts/www.otf') format('opentype'); 
    /* 路径根据项目结构调整,建议使用相对路径 */
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

**字体格式参考表**

| 字体文件后缀 | `format()` 参数       | 适用场景                  |
| ------------ | --------------------- | ------------------------- |
| `.woff2`     | `'woff2'`             | 现代浏览器首选,压缩率最高 |
| `.woff`      | `'woff'`              | 广泛兼容,压缩适中         |
| `.ttf`       | `'truetype'`          | 旧设备或 Android 兼容     |
| `.otf`       | `'opentype'`          | 部分高级排版需求          |
| `.eot`       | `'embedded-opentype'` | IE 兼容(已淘汰)           |

**在 JS 中引入图片**

在 `src/components/cps.js` 文件中：

```js
import '@/css/index.css';
import w664 from '@/asset/img/w644.jpg';

const img = document.createElement('img');
img.src = w664;
document.body.appendChild(img);

const bg = document.createElement('div');
bg.classList.add('bg');
document.body.appendChild(bg);
```

### 2. Webpack 4.x 处理方式

在 `webpack 5.x` 之前，处理图片和字体是通过 `url-loader` 和 `file-loader` 来实现的。

**图片资源处理**

Loader 组合说明：

**url-loader** 将小于指定大小的图片转换为 Base64 格式内嵌到代码中，减少 HTTP 请求。若文件超过限制，则自动调用 `file-loader` 处理。

**file-loader** 将文件复制到输出目录(如 `dist`)，并返回文件路径。常用于处理大体积图片。

配置示例：

```js [webpack.confog.js]
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
          esModule: false // 解决路径引用问题(如 HTML 中 src 属性)
        }
      }
    }
  ]
}
```

**字体文件处理**

使用 `url-loader` 或 `file-loader` 处理 `.woff`、`.woff2`、`.eot`、`.ttf`、`.svg` 等字体文件，原理与图片处理类似。

配置示例：

```js [webpack.confog.js]
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

**关键配置选项说明**

1. `limit` (仅 `url-loader`) 设置文件大小阈值(单位：字节)，超过阈值的文件由 `file-loader` 处理。
2. `outputPath` 指定资源输出目录(相对于 `output.path`)。
3. `name` 控制输出文件名格式，支持哈希值(如 `[hash:8]`)避免缓存问题。
4. `esModule` 设为 `false` 可解决部分场景下资源路径的模块化问题(如 CSS 中引用字体)。

**两个 Loader 之间的关系**

1. **功能继承**：`url-loader` 是 `file-loader` 的增强版，
   - 它在内部封装了 `file-loader` 的功能。当图片文件大小超过 `limit` 阈值时，`url-loader` 会自动调用 `file-loader` 处理文件，无需显式配置 `file-loader`。

2. **核心区别**：`url-loader` 可将小文件(如小于 `8KB`)转为 `Base64` 格式内联到代码中，减少 HTTP 请求；
   - `file-loader` 仅负责将文件复制到输出目录并返回路径，适用于大文件或无需内联的场景。

**为什么图片配置中可能只看到** `url-loader`?

- **隐式依赖**：即使配置中仅使用 `url-loader`，当文件超过 `limit` 时，`file-loader` 会被自动调用。因此，**必须同时安装 `file-loader`**，否则会因依赖缺失导致打包失败。

- 此配置未显式调用 `file-loader`，但实际运行时，大文件会通过 `file-loader` 处理：

```js [webpack.confog.js]
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

依赖要求：`url-loader` 并不直接包含 `file-loader` 的代码，而是通过调用其 API 实现功能。若未安装 `file-loader`，当文件超过 `limit` 时会抛出错误。

**兼容性注意事项**

Webpack 版本：`Webpack 4.x` 及更早版本需安装 `url-loader@1.x` 和 `file-loader@5.x`：

```bash
npm install url-loader@1.1.2 file-loader@5.0.2 --save-dev
```

**图片路径错误问题**

`esModule` 配置：在 `Webpack 4.x` 中，若 `file-loader` 的 `esModule` 选项未设为 `false`，可能导致图片路径输出为 `[object Module]`。需在配置中显式关闭：

```js
options: {
  esModule: false  // 关闭 ES 模块语法
}
```

**总结**

  在 `Webpack 5.x` 之前，**图片和字体文件主要依赖 `url-loader` 和 `file-loader`**

  通过合理配置 `limit` 和输出路径，实现资源优化(如 `Base64` 内联)与文件管理。`Webpack 5.x` 后，可通过内置的 `asset/resource` 类型替代。

### 3. Webpack 5.x 处理方式

**为什么 5.x 版本和 4.x 版本有不同处理方式？**
::: tip 不同版本的处理方式
- `Webpack 5.x` 的 `asset` 模块通过**原生资源处理机制**替代了 `url-loader` 和 `file-loader`，提供更简洁的配置、更高的性能，
- **完全无需依赖第三方 Loader**。根据文件类型选择 `asset/resource`(字体)或 `asset`(图片自动优化)，**即可高效管理静态资源**。
:::


**资源模块类型**

资源模块类型(`asset module type`)，通过添加 4 种新的模块类型，来替换这些 `loader`。

#### 3.1 asset/resource

`asset/resource` 发送一个单独的文件并导出 URL 在 `5.x` 之前通过使用 `file-loader` 实现。

**如何使用 asset/resource**

在配置文件中：

```js [webpack.config.js]
// ... 省略其他配置 
module: {
  rules: [
    // ... 省略其他配置
    {
      test: /\.(jpg|png|gif|jpe?g|svg)$/,
      type: 'asset/resource', // [!code ++]
    },
  ],
},
```

**疑问：为什么字体文件也进入打包文件中？**

我们只配置了图片扩展名的规则，字体文件是如何也进入打包文件中的呢？

::: warning 解释
- 这是因为在准备工作时，我们通过 CSS 语法 `@font-face` 引入了字体文件。在使用 CSS 文件时，**字体文件会被放进 `webpack` 依赖图中**。
- 处理 CSS 时，我们用 `css-loader` 来处理**转换 CSS 模块**，让 `webpack` 识别。
:::


我们用 `asset/resource` 这个模式去解析图片文件，**打包时会生成图片文件**，根据生成效果**并在使用图片时返回一个 URL**。

::: details 查看图片
<div style="display:flex">
 <img src="https://pic1.zhimg.com/80/v2-85b0e72472368fb74fed02cc6cf3f449_720w.png" style="zoom:40%;margin-right:40px;"  />
 <img src="https://picx.zhimg.com/80/v2-d752da4cb13abd0dd061266ad59d8185_720w.png" style="zoom:40%;margin-right:20px;"/>
</div>
:::



#### 3.2 asset/inline

`asset/inline` **资源转换为 Base64 格式内嵌到代码中**。在 `5.x` 之前通过使用 `url-loader` 实现。

**如何使用 asset/inline**

在配置文件中：

```js [webpack.config.js]
// ... 省略其他配置 
module: {
  rules: [
    // ... 省略其他配置
    {
      test: /\.(jpg|png|gif|jpe?g|svg)$/,
      type: 'asset/inline', // [!code ++]
    },
  ],
},
```

使用 `asset/inline` 这个模式去解析图片文件，打包出的文件**没有生成图片文件**，根据生成效果**看到内嵌在代码中，并且是 `base64`**。
::: details 查看图片
<div style="display:flex">
<img src="https://picx.zhimg.com/80/v2-2cf2447e5c18b2ee4fbb2edcaba9ccac_720w.png" style="zoom:50%;margin-right:20px;" />
<img src="https://picx.zhimg.com/80/v2-dff493bad35ce66420b2a8688148a549_720w.png" style="zoom:40%;" />
</div>
:::

#### 3.3 asset/source

`asset/source` **导出资源的源代码**。之前通过使用 `raw-loader` 实现。

**raw-loader 介绍**

安装 `raw-loader`：

```bash
npm install raw-loader --save-dev
```

在 `4.x` 配置文件中：

```js [webpack.config.js]
module.exports = {
  module: {
    rules: [
      {
        test: /\.(txt|svg|css)$/,  // 匹配目标文件
        use: 'raw-loader'          // 无需复杂参数 // [!code ++]
      }
    ]
  }
};
```

**将文件内容作为原始字符串导入**的 `Loader`。它的作用类似于直接读取文件的二进制内容，但以字符串形式暴露给 `JavaScript` 模块，适用于**需要直接操作文件原始数据的场景**。

**功能定位**：不进行任何转译(如 Babel)、不处理依赖(如 CSS 中的 `@import`) **仅将文件内容转为字符串**。

**使用示例**

创建 `data.txt`：

```txt
const a = 123
```

在 `src/components/cps.js` 文件中：

```js
import text from './data.txt';
console.log('text', text);
```

控制台会直接输出文件的原始文本内容。

<img src="https://picx.zhimg.com/80/v2-500429dbb892f02d6e025dfe395fb128_1420w.png"  />

#### 3.4 asset

`asset` 在导出一个资源转换为 Base64 格式内嵌到代码中和发送一个单独的文件之间自动选择。

**为什么要限制大小？**

这是因为小的**图片转换 `base64`** 之后可以**和页面一起被请求**，减少不必要的请求过程；

而**大的图片也进行转换 `base64`**，反而会**影响页面的请求速度**；所以大的图片直接**文件复制到输出目录，并返回路径**。

在 `5.x` 之前通过使用 `url-loader`，**并且配置 `limit` 资源体积限制实现**。

- **如何在 5.x 中限制大小？**
   1. 步骤一：**将 type 修改为 asset**
   
   2. 步骤二：添加一个 `parser` 属性，**并且制定 `dataUrl` 的条件，添加 `maxSize` 属性**
   
   3. 注意：无论是 `url-loader` 还是 `maxSize`，它们**单位是字节(bytes)**。设置的 `maxSize: 200 * 200` 实际是 `40000 字节(约 39KB)`，而非像素尺寸 `200×200px`，**不要搞混淆了**。

   ```js{8-12} [webpack.config.js]
   module.exports = {
     // ....省略其他配置
     module: {
       rules: [
         {
           test: /\.(jpg|png|gif|jpe?g|svg)$/,
           type: 'asset',
           parser: {
             dataUrlCondition: {
               maxSize: 200 * 200,
             },
           },
         }
       ]
     }
   }
   ```

打包效果：
::: details 查看图片
<div style="display:flex">
 <img src="https://picx.zhimg.com/80/v2-6e2e925cf781ac20ee6d8a5eed2f0596_720w.png" style="zoom:40%;" />
 <img src="https://picx.zhimg.com/80/v2-b14a5d12b1fbddf7710c69a0119e68a3_720w.png" style="zoom:50%;" />
</div>
:::
第一图我们打包出来，**文件输出目录就一张图片**，因为就一张大图占有空间**超出了设置大小**。

小图片**设置成背景图片**，它的原图像素大小是 `201*251`，空间占用大小是 `7kb`，**39>7 所以这个转换为 `base64`**。

大图片**设置图片**，它的原图像素大小是 `647*825`，空间占用大小是 `280 Kb`，**39<280 直接文件复制到输出目录，并返回 `http` 路径**。


### 4. 资源模块如何设置文件名称和导出路径

#### 4.1 全局配置所有输出规则

方式一：**修改 `output`**，添加 `assetModuleFilename` 属性。

`assetModuleFilename` 是**全局配置所有 Asset Modules 类型文件的输出规则**。

```js [webpack.config.js]
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js',
    assetModuleFilename: 'img/[name].[hash:6].[ext]', // [!code ++]
  }
  // .....省略其他配置
}
```

可以看到**字体和图片**都放到一个 `img` 文件夹下了。

<img src="https://picx.zhimg.com/80/v2-2fb372e948ed05ef96984c748f995b2c_1420w.png" style="zoom:67%;"  />

**适用文件类型**

| **文件类型**   | **常见扩展名**                          | **典型场景**                                  |
| -------------- | --------------------------------------- | --------------------------------------------- |
| 图片资源       | `.png`、`.jpg`、`.jpeg`、`.gif`、`.svg` | CSS 中的 `background-image`                   |
| 字体文件       | `.otf`、`.ttf`、`.woff`、`.woff2`       | `@font-face` 引入的字体(如图像中的 `www.otf`) |
| 音视频文件     | `.mp3`、`.mp4`、`.ogg`                  | 多媒体资源引入                                |
| 其他二进制文件 | `.pdf`、`.zip`                          | 直接导入的文档或压缩包                        |

#### 4.2 每个资源类型单独配置

方式二：在 Rule 中，添加一个 `generator` 属性，并且设置 `filename`。

```js [webpack.config.js]
module: {
  rules: [
    // ...省略其他配置
    {
      test: /\.(jpg|png|gif|jpe?g|svg)$/,
      type: 'asset',
      parser: {
        dataUrlCondition: {
          maxSize: 200 * 200,
        },
      },
      generator: { // [!code ++]
        filename: 'asset/imgs/[name].[hash:6].[ext]', // [!code ++]
      }, // [!code ++]
    },
    {
      test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
      type: 'asset',
      generator: { // [!code ++]
        filename: 'asset/fonts/[name].[hash:6].[ext]', // [!code ++]
      }, // [!code ++]
    },
  ],
},
```

可以看到图片中我们打包文件成功为**字体文件**和**图片文件**分出**单独目录**进行管理。

<img src="https://picx.zhimg.com/80/v2-d0273bc23ece79471791bdc965b31266_720w.png" style="zoom:67%;" />

**常用 placeholder**

1. `[ext]` 处理文件的扩展名

2. `[name]` 处理文件的名称

3. `[hash]` 文件的内容，使用 `MD4` 的散列函数处理，生成的一个 128 位的 hash 值(32 个十六进制)

 > [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/02_css_img_js_vue_react)