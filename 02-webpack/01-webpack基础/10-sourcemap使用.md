---
date: 2025-09-27 12:42:48
title: 10-source-map的使用<TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/10-sourcemap使用
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - Webpack 基础
---
## 零、问题引入

### 问题场景

在 `src/index.js` 中代码存在一定问题：

```js
const message = 'hello world';

console.log(message);

console.log(count);  // 明显这里会报错

const hello = '你好';
console.log(hello);
```

在 `webpack.config.js` 中配置：

```js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
  },
};
```

在 `index.html` 引入 `bundle.js` 启动运行：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script src="./dist/bundle.js"></script>
  </body>
</html>
```

### 错误展示

**错误信息 1：**

![错误信息1](https://picx.zhimg.com/80/v2-950def2049c4b9188973974b36081080_1420w.png)

**错误信息 2：**

![错误信息2](https://pica.zhimg.com/80/v2-82bdb13b53a2c324bec069a8dff8cd5b_1420w.png)

### 问题分析

这时候我们会发现跟我们源码显示是不一样的。如果代码量一旦上来，这个地方非常难调试。这个时候我们就需要 `Source Map`。

---

## 一、认识 Source Map

### 什么是 Source Map

`Source Map`（源映射）是一个信息文件，它详细记录了转换、压缩和打包后的代码与原始源代码之间的映射关系。

它的作用是：将在浏览器真实执行（压缩、混淆、编译）的代码与我们在开发时写（结构清晰、易读、易改）的代码建立一个联系。

### Source Map 的本质

`Source Map` 本质上是一个包含映射信息的 JSON 文件，通常以 `.map` 为扩展名。这个文件建立了编译后代码与源代码之间的对应关系。

---

## 二、为什么需要 Source Map

### 现代前端开发的挑战

在现代前端开发中，我们编写的代码（例如：`TypeScript`、`React`、`Vue`、`ES6+`、`SCSS`、`Less`）通常不会直接在浏览器运行。我们写的这些代码需要通过 `Webpack` 进行一系列处理。

### 处理流程

**编译/转译：** 将 `TypeScript` 和 `ES6` 代码转化为浏览器兼容的 `ES5` 代码

**压缩/混淆：** 为了减小文件体积，代码会被压缩（删除空格、换行）和混淆（变量名替换为 `a`、`b`、`c` 等）

**打包：** `Webpack` 会将多个模块文件打包成一个或少数几个文件，以减少 HTTP 请求

### Source Map 的作用

当开启 `Source Map` 后，如果打包后的代码在浏览器中运行出错，浏览器会通过加载和解析对应的 `.map` 文件，将错误位置精确定位到你的原始源代码中。

**错误定位：** 当线上代码报错时，可以准确地告诉你错误发生在哪个源文件的哪一行、哪一列

**断点调试（Debugging）：** 你可以直接在你的原始源代码上设置断点，进行单步调试，查看变量值，就像直接在浏览器中运行源代码一样

**源码查看：** 在浏览器的开发者工具（如 Chrome `DevTools`）的 "Sources"（源代码）面板中，你可以直接浏览和阅读打包前的项目源文件结构和代码

---

## 三、如何使用 Source Map

### 第一步：配置 devtool

在 `webpack.config.js` 文件中设置 `devtool` 的值为 `source-map`：

```js
module.exports = {
  devtool: 'source-map', // 添加该配置
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
  },
};
```

### 第二步：自动生成注释

在 `bundle.js` 转换后打包的代码中，最后会自动添加一个注释，它指向 `sourcemap` 源文件（这是 `Webpack` 自动帮我们生成的）：

```js
console.log("hello world"),console.log(count),console.log("你好");
//# sourceMappingURL=bundle.js.map
```

**生成的文件结构：**

![生成的文件](https://pica.zhimg.com/80/v2-d2cf2c900e6d63349219c1f4ee384b22_1020w.png)

### 第三步：浏览器设置

打开浏览器设置，这里以 Chrome 浏览器举例。

**打开开发者工具：**

用 `F12` 打开开发者工具，点击右上角的齿轮设置按钮：

![设置按钮](https://pic1.zhimg.com/80/v2-4a543e10b879ee9bdf574c904a14c89e_1020w.png)

**勾选源代码映射：**

![勾选源代码映射](https://picx.zhimg.com/80/v2-ae3f309a1ed57b765b6603c2a739c54a_1020w.png)

### 第四步：查看效果

启动运行 `index.html`，我们会发现报错不仅告诉你报错的文件，还告诉了你几行几列，并且源文件里面跟映射出我们写的源码。

**效果展示：**

![效果1](https://pic1.zhimg.com/80/v2-66295f099f417f7f7f2a0f0e3aad91a7_1020w.png)

![效果2](https://pica.zhimg.com/80/v2-ba25057f296827d94759396d8b99651c_720w.png)

---

## 四、分析 Source Map

### Source Map 文件大小

最初 `Source Map` 生成的文件大小是原始文件的 10 倍，第二版减少了约 50%，第三版又减少了 50%。所以目前一个 133KB 的文件，最终的 `Source Map` 的大小大概在 300KB。

**为什么 Source Map 文件会这么大？**

- 因为它需要存储：

   1. 所有原始文件名

   2. 所有原始代码中的变量名、函数名等

   3. 从压缩后代码的每一个位置到原始代码位置的详细映射信息

   4. 一个经过压缩混淆后的 JS 文件，其对应的 `Source Map` 文件大小是它本身的 2 到 3 倍是很常见的情况。

### Source Map 文件结构

目前的 `Source Map` 文件长什么样子呢？里面的属性又代表什么意思呢？

```json
{
  // version：当前使用的版本，也就是最新的第三版
  "version": 3,
  
  // 打包后的文件（浏览器加载的文件）
  "file": "bundle.js",
  
  // source-map 用来和源文件映射的信息（比如位置信息等）
  // 一串 base64 VLQ（variable-length quantity 可变长度值）编码
  "mappings": "AAEAA,QAAQC,IAFQ,eAIhBD,QAAQC,IAAIC,OAGZF,QAAQC,IADM",
  
  // 从哪些文件转换过来的 source-map 和打包的代码（最初始的文件）
  "sources": [ 
    "webpack://04.source-map/./src/index.js" 
  ],
  
  // 转换前的具体代码信息（和 sources 是对应的关系）
  "sourcesContent": [ 
    "const message = 'hello world';\r\n\r\nconsole.log(message);\r\n\r\nconsole.log(count);\r\n\r\nconst hello = '你好';\r\nconsole.log(hello);\r\n" 
  ],
  
  // 转换前的变量和属性名称
  // 如果 mode 设置为 "development" 即开发环境，不需要保留转换前的名称
  "names": [
    "console",
    "log",
    "count"
  ],
  
  // 所有的 sources 相对的根目录
  "sourceRoot": ""
}
```

---

## 五、devtool 的值

### 概述

目前 `Webpack` 为我们提供了非常多的 `Source Map` 选项（目前是 26 个）来处理打包后映射的文件。[Webpack 的 Source Map 官网](https://webpack.docschina.org/configuration/devtool/)

选择不同的值，生成的 `Source Map` 会稍微有差异，打包的过程也会有性能的差异，可以根据不同的情况进行选择。

---

### 1. 不生成 Source Map 文件的值

下面几个值不会生成 `Source Map` 文件：

**false：** 不使用 `Source Map`，也就是没有任何和 `Source Map` 相关的内容

**none：** `production` 模式下的默认值（什么值都不写），`none` 和 `false` 在最终效果上是完全一样的，不生成 `Source Map` 文件

**eval：** `development` 模式下的默认值，不生成 `Source Map` 文件

`eval` 的特点是它会在 `eval` 执行的代码中添加 `//# sourceURL=` 代表源代码文件路径。它会被浏览器在执行时解析，并且在调试面板中生成对应的一些文件目录，方便我们调试代码。

**示例图片：**

![eval示例1](https://picx.zhimg.com/80/v2-f4ed1143c84beb07712e5223894197b0_1020w.png)

![eval示例2](https://pic1.zhimg.com/80/v2-c43d8de886f7b5a8b0308dec1dc65c3b_1020w.png)

![eval示例3](https://picx.zhimg.com/80/v2-961827a7014efb1dfbd710975deb5cf6_1020w.png)

---

### 2. source-map

**优点：** 信息最全，包含行和列的映射，质量最高

**缺点：** 构建速度最慢，会生成一个独立的 `.map` 文件

**适用场景：** 生产环境（`production`）。生产调试完成需要立马设置 `false` 防止源代码泄露

**效果展示：**

![source-map效果1](https://pic1.zhimg.com/80/v2-66295f099f417f7f7f2a0f0e3aad91a7_1020w.png)

![source-map效果2](https://pica.zhimg.com/80/v2-ba25057f296827d94759396d8b99651c_1020w.png)

---

### 3. eval-source-map

**优点：** 重新构建速度最快，`Source Map` 也以内联方式存在

**缺点：** 无法精确定位到行。对于复杂的代码，可能映射不准确

**适用场景：** 开发环境（`development`）

**效果展示：**

![eval-source-map效果1](https://picx.zhimg.com/80/v2-d46e18d6dd80020a94e9f60110312131_1020w.png)

![eval-source-map效果2](https://s1.imagehub.cc/images/2025/10/10/6d85053211ab1fe04a9877a9e7d7de4b.png)

可以看到无法精确定位到行，只能精确到列：

![无法精确定位](https://picx.zhimg.com/80/v2-4afb9a70b66a05542f3d52b2e404fbdf_720w.png)

---

### 4. inline-source-map

**优点：** 跟 `source-map` 一样，以 `DataURL` 添加到 `bundle.js` 文件的后面

**缺点：** 构建速度最慢，`Source Map` 以 `DataURL` 的形式内联到打包后的文件中，文件体积会变得非常大

**适用场景：** 单文件调试可以，不建议用到任何环境

**效果展示：**

![inline-source-map效果1](https://pica.zhimg.com/80/v2-494edb7802d953e969e5e6f9e412d3ab_1020w.png)

![inline-source-map效果2](https://pic1.zhimg.com/80/v2-66295f099f417f7f7f2a0f0e3aad91a7_1020w.png)

![inline-source-map效果3](https://pica.zhimg.com/80/v2-ba25057f296827d94759396d8b99651c_720w.png)

---

### 5. cheap-source-map

**优点：** 构建速度较快，比 `source-map` 更加高效一些，会生成对应的 `Source Map` 文件

**缺点：** 丢失了列信息

**适用场景：** 开发环境（Development）。在生产环境如果使用列可能提示不准确

**效果展示：**

![cheap-source-map效果1](https://picx.zhimg.com/80/v2-1d48b5e1b8dc4c7eae9d2d5039607092_1020w.png)

![cheap-source-map效果2](https://pic1.zhimg.com/80/v2-508fc7a9ec5f596f1caa2fa55870930a_720w.png)

---

### 6. cheap-module-source-map

它的优缺点跟 `cheap-source-map` 是一样的，那它们的区别是什么？

### 区别详解

**使用场景：** 当你使用了 `babel-loader`、`ts-loader`、`sass-loader` 等工具转换你的代码时

**需求：** 如果你想在浏览器的调试器里看到你亲手写的、最原始的代码（而不是被 Babel 转换后的 `ES5` 代码）

**解决方案：** 你就需要在 `cheap-source-map` 的基础上加上 `module`，变成 `cheap-module-source-map`

### 简单对比

如果你使用了 `loader` 来转换你的代码：

**cheap-source-map：** 错误会指向被 `babel-loader` 转换后的代码。你可能看到的是 `ES5` 语法

![cheap-source-map转换后](https://picx.zhimg.com/80/v2-ca229a35f4fbc0299062a2a89a99642b_1020w.png)

**cheap-module-source-map：** 错误会指向你写的原始 `ES6/TypeScript` 代码。这通常是我们想要的调试体验

![cheap-module-source-map原始](https://picx.zhimg.com/80/v2-173e27925beaa9d28725c7fb78f6df06_720w.png)

---

### 7. hidden-source-map

跟 `source-map` 一样，但有区别。

### 区别详解

**不同点：** 会生成 `Source Map`，但是不会对 `Source Map` 文件进行引用

**实际效果：** 相当于删除了打包文件中对 `Source Map` 的引用注释

![hidden-source-map效果](https://pica.zhimg.com/80/v2-3562299bf9d673e2115d44cbadfa10d9_1020w.png)

**特点：** 不会因为开发环境，无法精确到行

**注意：** 如果经过 `loader` 转换过的代码，调试的时候就不再是我们原本写的代码，而是 `loader` 转换后的代码

![loader转换后](https://picx.zhimg.com/80/v2-ca229a35f4fbc0299062a2a89a99642b_1020w.png)

如果我们手动添加进来，那就变成了 `source-map` 就会生效了。

---

### 8. nosources-source-map

会生成 `Source Map` 文件，但是生成的 `Source Map` 只有错误信息的提示，不会生成源代码文件。

**效果展示：**

![nosources-source-map效果](https://picx.zhimg.com/80/v2-c7ae35a958b50188516d24148eb0312e_1020w.png)

点击错误提示，无法查看源码：

![无法查看源码](https://s1.imagehub.cc/images/2025/10/10/4ec2b9070a70b680367fb012f9d44f6a.png)

---

### 9. 多个值的组合

组合的规则如下：

1. `inline-`|`hidden-`|`eval-`：三个值时三选一（可选）
2. `nosources`：（可选）
3. `cheap` 可选值，并且可以跟随 `module` 的值
4. 完整格式：`[inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map`

### 最佳实践

**开发阶段和测试阶段：** 推荐使用 `source-map` 或者 `cheap-module-source-map`，方便调试

**发布阶段：** `false`、`none`、缺省值（不写）

---

### 10. 额外知识的补充

### Loader 的 Source Map 配置

在我们日常开发中，使用框架开发或者 `ES6+` 语法时，我们都不可避免会使用到 `babel-loader` 和 `swc-loader`，进行将我们代码进行转换。

```js
{
  test: /\.js$/,
  use: {
    loader: 'babel-loader',
    // 或者
    loader: 'swc-loader',
    options: {
      sourceMaps: true // 默认就是 true
    }
  }
}
```

### TerserPlugin 的 Source Map 配置

还有我们平时为了优化代码，会通过 `TerserPlugin` 压缩代码。这个时候我们需要调试代码设置 `Source Map` 可能会影响行号精确度。

### 注意：TerserPlugin 4.x 和 5.x 的不同

**TerserPlugin 4.x：**

在 `TerserPlugin 4.x` 的版本中设置 `sourceMap` 能影响到 `devtool` 里面设置的值。比如我们设置 `source-map`，但是 `sourceMap` 为 `false`，然后会让 `devtool` 无法生效。

```js
{
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        sourceMap: true
      })
    ]
  }
}
```

**TerserPlugin 5.x：**

在 `TerserPlugin 5.x` 的版本里面设置值 `sourceMap` 不会影响到 `devtool` 里面值，内部部分弃用和自动化，跟随 `devtool` 值进行变化。

```js
{
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {  // 4 和 5 的写法也不太一样
          sourceMap: true
        }  
      })
    ]
  }
}
```

---

## 完整案例代码

[→ Source Map 完整案例代码](https://github.com/webBocai/webpack-/tree/main/04.source-map)

[→ Terser Source Map 完整案例代码](https://github.com/webBocai/webpack-/tree/main/terser-source-map)