---
date: 2025-09-01 15:53:48
title: 02-webpack处理CSS <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/02-处理css
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - Webpack 基础
---


# Webpack处理静态资源(一)
#### 0.前情提要
> **我们会继续使用上一章的配置，在此基础上增加配置，但是配置文件名字还是使用默认的**

 [在上一章](./01-webpack基本介绍) 我们的学习了`webpack`基本概要,这一章我们来学习`webpack`是如何出来`css`的



## 一、Webpack 打包 CSS 文件

### 1.1 打包失败的问题

首先在 `css` 文件夹中创建 `index.css`：

```css
.content {
  color: red;
  font-size: 40px;
}
```

然后在 `components` 文件夹下创建 `cps.js`：

```js
import '../css/index.css';

const divEle = document.createElement('div');
divEle.textContent = 'Hello World';
divEle.classList.add('content');
document.body.appendChild(divEle);
```

执行 `npm run build` 会报错，提示解析失败，需要合适的 `loader` 来处理这个文件类型：

![打包失败错误](https://picx.zhimg.com/80/v2-f581ad19cdf0d5a075a1bd1d9e275a01_1420w.png)

### 1.2 使用 Loader 处理

**什么是 Loader？**

错误信息告诉我们需要一个 `loader` 来加载 CSS 文件。Loader 的作用如下：

- `loader` 可以用于对模块的源代码进行转换
- 我们可以将 CSS 文件看作一个模块，通过 `import` 加载模块，将其放入 `webpack` 依赖图中
- 在加载这个模块时，`webpack` 本身并不知道如何处理，必须使用对应的 `loader` 来完成这个功能

**需要什么样的 Loader？**

对于加载 CSS 文件，我们需要一个可以读取 CSS 文件的 `loader`，最常用的是 `css-loader`。

安装 `css-loader`：

```bash
npm install css-loader -D
```

### 1.3 css-loader 的使用方案

如何使用 `loader` 来加载 CSS 文件呢？有三种方式：

**方式一：内联方式（不推荐）**

内联方式使用较少，因为不方便管理。在引入的样式前加上使用的 `loader`，并使用 `!` 分割：

```js
import 'css-loader!../css/index.css';
```

**方式二：CLI 方式（已废弃）**

在 `webpack5` 的文档中已经没有了 `--module-bind`，实际应用中也比较少使用，因为不方便管理。

**方式三：配置方式（推荐）**

这是最常用的方式，在配置文件中写明配置信息。

### 1.4 Loader 配置方式

配置方式表示在配置文件中写明配置信息。

`module.rules` 中允许我们配置多个 `loader`（我们也会继续使用其他的 `loader` 来完成其他文件的加载）。

这种方式可以更好地表示 `loader` 的配置，方便后期维护，同时也让你对各个 `loader` 有一个全局的概览。

**module.rules 配置说明：**

`rules` 属性对应的值是一个数组 `[Rule]`，数组中存放的是一个个 `Rule` 对象，对象中可以设置多个属性：

1. `test`：用于对资源（resource）进行匹配，通常设置为正则表达式
2. `use`：对应的值是一个数组 `[UseEntry]`
   - `UseEntry` 是一个对象，可以通过对象的属性设置其他属性
     1. `loader`：必须有一个 `loader` 属性，对应的值是一个字符串
     2. `options`：可选属性，值是一个字符串或对象，会被传入到 `loader` 中
     3. `query`：目前已使用 `options` 替代
3. `loader`：是 `use: [{ loader }]` 的简写
4. `include`：指定需要处理的目录
5. `exclude`：排除不需要处理的目录或文件

更多配置查看 [webpack 官网](https://webpack.js.org/configuration/module/#modulerules)。

在配置文件中添加 `css-loader` 进行解析：

```js [webpack.config.js]
module.exports = {
  // ... 省略其他配置
  module: {
    rules: [
      {
        test: /\.css$/,
        // 写法一：适合只有一个 loader 的时候使用
        // loader: 'css-loader',
        
        // 写法二：适合没有 options 属性的配置
        // use: ['css-loader'],
        
        // 写法三：最完整的配置方式
        use: [
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

此时运行 `npm run build`，虽然类名添加上去了，但 CSS 效果并没有生效：

![CSS未生效](https://pica.zhimg.com/80/v2-7456c4ab0c10ee58689568f8f5bdd09d_720w.png)

### 1.5 认识 style-loader

现在我们已经可以通过 `css-loader` 来加载 CSS 文件了，但你会发现这个 CSS 在代码中并没有生效（页面没有效果）。

**这是为什么呢？**

因为 `css-loader` 只负责对 `.css` 文件进行解析，并不会将解析后的 CSS 插入到页面中。如果我们希望完成插入 `style` 的操作，还需要另外一个 `loader`，就是 `style-loader`。

安装 `style-loader`：

```bash
npm install style-loader -D
```

### 1.6 配置 style-loader

在配置文件中添加 `style-loader`：

注意事项：`webpack` 在执行 `loader` 的时候，是从后往前执行的。所以 `style-loader` 要在 `css-loader` 前面，这样等 `css-loader` 解析完成 CSS 文件后，交给 `style-loader` 去插入到页面中，生成对应的 CSS 样式。

```js  [webpack.config.js]
module.exports = {
  // ... 省略其他配置
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',  // 再执行 style-loader 添加 style 到页面中  // [!code ++]
          'css-loader',    // 注意：先执行 css-loader 解析 CSS 文件 // [!code ++]
        ],
      },
    ],
  },
};
```

重新执行编译 `npm run build`，可以发现打包后的 CSS 已经生效了。

当前我们的 CSS 是通过页内样式的方式添加进来的。后续我们也会讲如何将 CSS 抽取到单独的文件中，并进行压缩等操作。

![CSS生效](https://picx.zhimg.com/80/v2-35415a76025e48e7bf5fb24dfdf9dd8a_720w.png)



## 二、Webpack 打包预处理器

### 2.1 介绍预处理器

在项目开发中，我们一般不会直接使用 CSS 去开发项目，而是使用 CSS 的预处理器进行快速开发。

常用的 CSS 预处理器有：`less`、`scss`、`stylus`。

在 `css` 目录创建 `index.less`、`index.scss`、`index.styl`。

**编写 Less 样式：**

```less [index.less]
@color: #0486ea;
@fontSize: 80px;

.title {
  color: @color;
  font-size: @fontSize;
}
```

**编写 SCSS 样式：**

```scss [index.scss]
$fontSize: 80px;
$redColor: red;
$greenColor: green;

.context-title {
  font-size: $fontSize;
  color: $redColor;
  background-color: $greenColor;
}
```

**编写 Stylus 样式（扩展名 `.styl`）：**

```css [index.styl]
font-size = 14px
color = orange
baColor = black

.content-t
  font-size: font-size 
  color: color
  background-color: baColor
```

每个 CSS 预处理器都有自己独立的语法，浏览器不认识这些语法，需要通过 `webpack` 打包转换为浏览器认识的 CSS 语法。每个 CSS 预处理器都有对应的 `loader` 进行转换。

### 2.2 安装各自对应的 Loader

```bash
npm install less less-loader -D
npm install sass sass-loader -D
npm install stylus stylus-loader -D
```

说明：`less`、`sass`、`stylus` 是预处理器工具，可以直接用命令将预处理器语法转换为普通 CSS：

```bash
npx lessc ./src/css/index.less title.css
npx sass ./src/css/index.scss content.css
npx stylus index.styl -o content.css
```

### 2.3 配置预处理器相应的 Loader

如果我们在项目中按照上面的方式去转换成普通 CSS，非常麻烦。我们希望自动转换，就需要在配置文件中添加对应的 `loader` 处理。

在 `components` 文件夹下的 `cps.js` 中添加以下代码：

```js [cps.js]
import '../css/index.css';
import '../css/index.less';
import '../css/index.scss';
import '../css/index.styl';

const divEle = document.createElement('div');
divEle.textContent = 'Hello World';
divEle.classList.add('content');
document.body.appendChild(divEle);

const title = document.createElement('h1');
title.textContent = '你好我是标题';
title.classList.add('title');
document.body.appendChild(title);

const contextTitle = document.createElement('h2');
contextTitle.textContent = '你好我是标题2';
contextTitle.classList.add('context-title');
document.body.appendChild(contextTitle);

const stylusTitle = document.createElement('h3');
stylusTitle.textContent = '你好我是 Stylus';
stylusTitle.classList.add('content-t');
document.body.appendChild(stylusTitle);
```

**配置文件说明：**

我们先让各自对应的 `loader`（`less-loader`、`sass-loader`、`stylus-loader`）将对应代码转换成普通 CSS 代码，然后通过 `css-loader` 再次解析，交给 `style-loader` 将样式添加到页面中。

```js{3-35} [webpack.config.js]
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'less-loader' },
        ],
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.styl$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'stylus-loader' },
        ],
      },
    ],
  },
};
```

执行 `npm run build`，然后运行 `index.html`：

![预处理器效果](https://pica.zhimg.com/80/v2-f8b8aaa6b4a166f376522880a0b65766_720w.png)


## 三、Webpack 后处理器

### 3.1 认识 PostCSS 工具

**什么是 PostCSS？**

`PostCSS` 是一个通过 JavaScript 来转换样式的工具。这个工具可以帮助我们进行一些 CSS 的转换和适配，比如自动添加浏览器前缀、CSS 样式的重置。

在 `index.css` 中添加以下样式：

```css
.content {
  color: red;
  font-size: 40px;
  user-select: all; /* 选择时选择全部内容 */
}
```

但是实现这些功能，我们需要借助于 PostCSS 对应的插件。

**如何使用 PostCSS？**

主要有两个步骤：

1. 第一步：查找 PostCSS 在构建工具中的扩展，比如 `webpack` 中的 `postcss-loader`
2. 第二步：选择可以添加你需要的 PostCSS 相关插件

### 3.2 安装 PostCSS 及使用

安装 `postcss-loader`：

```bash
npm install postcss-loader -D
```

修改加载 CSS 的 `loader` 配置：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'postcss-loader' },
        ],
      },
    ],
  },
};
```

然后执行 `npm run build`，发现 PostCSS 并没有给我们加上浏览器前缀：

![PostCSS未生效](https://picx.zhimg.com/80/v2-f1ed311527fe9ecd36d31e08d982ea20_720w.png)

### 3.3 PostCSS 插件的使用

#### 3.3.1 autoprefixer 插件

我们刚刚发现使用 `postcss-loader` 并没有给我们添加浏览器前缀，这是为什么？

因为 PostCSS 需要有对应的插件才会起效果，所以我们需要配置它的 `plugin`。

现在我们使用一个插件 `autoprefixer`，这个 PostCSS 插件专门用于自动添加浏览器前缀。

安装 `autoprefixer`：

```bash
npm install autoprefixer -D
```

**如何使用？有两种配置方式：**

方式一：在对应的 `loader` 中的 `options` 中配置

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['autoprefixer'], // 添加插件配置
              },
            },
          },
        ],
      },
    ],
  },
};
```

方式二：创建 `postcss.config.js` 文件（推荐）

将 `options` 里面的配置全部放到这个文件里面，这样能减少 `webpack` 配置文件的内容，也更方便查找配置项。

在 `postcss.config.js` 中，可以减少 `postcssOptions` 这一层对象嵌套：

```js
module.exports = {
  plugins: ['autoprefixer'],
};
```

执行 `npm run build`，最终发现浏览器前缀已经添加上了：

![autoprefixer效果](https://picx.zhimg.com/80/v2-1897c9aed7740c25685a12b77d61b2f0_720w.png)

#### 3.3.2 postcss-preset-env 插件

**postcss-preset-env 是什么？**

它是一个 PostCSS 功能强大的插件工具，能够将现代 CSS 语法转换为兼容性更强的代码，并自动处理浏览器适配问题。

**它的功能有哪些？**

1. **自动添加浏览器前缀**

   它内部已经集成了 `autoprefixer`，所以我们不用单独下载配置。

2. **支持未来 CSS 语法转换**

   将尚未被广泛支持的 CSS 新特性（如嵌套、变量、颜色函数等）转换为兼容性代码。

   ```css
   /* 输入 */
   body { 
     color: oklch(61% 0.2 29); 
   }
   
   /* 输出 */
   body { 
     color: rgb(225, 65, 52); 
   }
   ```

3. **自定义属性和变量**

   为自定义属性（CSS 变量）生成兼容性回退值，确保在不支持变量的浏览器中仍能显示有效样式。

   ```css
   /* 输入 */
   :root { 
     --main-color: #06c; 
   }
   body { 
     color: var(--main-color); 
   }
   
   /* 输出 */
   body { 
     color: #06c;  /* 回退值 */
     color: var(--main-color); 
   }
   ```

4. **嵌套语法转换**

   将 CSS 嵌套语法（类似 Sass/Less）转换为标准 CSS。

   ```css
   /* 输入 */
   .parent {
     &:hover { 
       color: red; 
     }
     .child { 
       font-size: 14px; 
     }
   }
   
   /* 输出 */
   .parent:hover { 
     color: red; 
   }
   .parent .child { 
     font-size: 14px; 
   }
   ```

5. **颜色函数兼容处理**

   转换现代颜色函数（如 `hwb()`、`lch()`、8 位 HEX 16 进制）为 RGB 格式。

   ```css
   /* 输入 */
   div { 
     color: hwb(120 20% 30%); 
   }
   
   /* 输出 */
   div { 
     color: rgb(51, 204, 51); 
   }
   
   /* 输入 */
   div { 
     background-color: #66666666; 
   }
   
   /* 输出 */
   div { 
     background-color: rgba(102, 102, 102, 0.4); 
   }
   ```

6. **数学计算支持**

   转换 `calc`、`min()`、`max()` 等现代函数：

   ```css
   /* 输入 */
   .container {
     width: min(100% - 2rem, 960px);
   }
   
   /* 输出 - 低版本浏览器兼容 */
   .container {
     width: 960px;
     width: min(100% - 2rem, 960px);
   }
   ```

**总结：**

`postcss-preset-env` 本质上是通过整合多个 PostCSS 插件，让开发者能够使用最新的 CSS 特性，而不必担心浏览器兼容性问题。

更多配置和插件集成可参考 [官方文档](https://github.com/csstools/postcss-preset-env)。

**安装及使用：**

```bash
npm install postcss-preset-env -D
```

在 `postcss.config.js` 文件中修改：

```js
module.exports = {
  // plugins: ['autoprefixer'],
  plugins: ['postcss-preset-env'],
};
```

执行 `npm run build`，查看效果：

- 浏览器前缀
- 颜色函数兼容处理

这两个功能都已实现：

![postcss-preset-env效果](https://pic1.zhimg.com/80/v2-0832be0cf731bf01120b4993dcb9e3d4_720w.png)



## 总结

本文详细介绍了 `webpack` 中处理样式文件的完整流程：

1. **基础 CSS 处理**：使用 `css-loader` 解析 CSS 文件，使用 `style-loader` 将样式注入到页面中

2. **预处理器支持**：配置 `less-loader`、`sass-loader`、`stylus-loader` 来处理 Less、SCSS、Stylus 等预处理器语法

3. **PostCSS 后处理**：使用 `postcss-loader` 配合 `autoprefixer` 或 `postcss-preset-env` 插件，实现浏览器前缀自动添加、现代 CSS 语法转换等功能

通过合理配置这些 `loader` 和插件，可以让我们在开发中使用最新的 CSS 特性，同时保证良好的浏览器兼容性。
 > [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/02_css_img_js_vue_react)