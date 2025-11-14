---
date: 2025-10-08 07:05:00
title: 13-代码分离与性能优化 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/12-代码分离与性能优化
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - babel的进阶使用

---
# Webpack 代码分离与性能优化

## 一、Webpack 性能优化概述

`webpack` 的性能优化可以分为两大类：

1. **打包速度优化**：优化开发或构建时的打包速度，如使用 `exclude`、`cache-loader` 等。

2. **打包结果优化**：优化上线后的性能表现，如分包处理、减小包体积、使用 `CDN` 服务器等。

在大多数情况下，`webpack` 已经为我们做好了基础的性能优化。例如，当配置 `mode` 为 `production` 或 `development` 时，`webpack` 会自动应用相应的默认配置。但我们仍然可以针对具体项目进行定制化优化。

---

## 二、代码分离（处理 JS）

### 2.1 代码分离介绍

代码分离（`Code Splitting`）是 `webpack` 最重要的特性之一。

它的核心目的是将代码分割到不同的 `bundle` 文件中，然后按需加载或并行加载这些文件。`webpack` 默认会将所有 `js` 文件打包到一个文件中，在首页全部加载，这会严重影响首页加载速度。

通过代码分离，可以根据代码功能分割出多个小的 `bundle`，从而控制资源加载的优先级，提升整体性能。

### 2.2 代码分离的三种方式

`webpack` 提供了三种代码分离方式：

1. **多入口（Entry）**：使用 `entry` 配置多个入口文件进行打包
2. **插件分离**：使用 `SplitChunksPlugin` 插件进行代码分割
3. **动态导入**：使用 `import()` 动态导入的方式进行代码分割

---

### 2.3 多入口方式

#### 2.3.1 基本使用

**步骤一：创建多个入口文件**

在 `src` 目录下创建 `main.js` 和 `index.js` 两个文件。

首先安装 `dayjs`：

```bash
npm install dayjs
```

`index.js` 代码：

```js
const dayjs = require('dayjs');

const format = (date, format) => dayjs(date).format(format);

const dateTime = format(new Date(), 'YYYY-MM-DD');
console.log('time', dateTime);
```

`main.js` 代码：

```js
const dayjs = require('dayjs');
const format = (date, format) => dayjs(date).format(format);

const dateTime = format(new Date(), 'YYYY-MM-DD HH:mm:ss');
console.log('main', dateTime);
```

**步骤二：配置多入口**

在 `webpack.config.js` 中配置多入口：

```js{6-13}
const htmlPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    index: './src/index.js',
    main: './src/main.js'
  },
  output: {
    filename: '[name]-bundle.js',
    clean: true,
  },
  plugins: [
    new htmlPlugin({
      template: './index.html',
    }),
  ],
};
```

配置说明：

- `entry` 改为对象形式，`key` 为输出文件名，`value` 为文件路径
- `output.filename` 使用 `[name]` 占位符，`webpack` 会自动将 `entry` 对象的 `key` 作为文件名

打包后输出结果：

![多入口打包结果](https://pic1.zhimg.com/80/v2-f8c385a6f5246e58845b423d74eb0548_1020w.png)

#### 2.3.2 使用 shared 提取公共依赖

目前存在一个问题：`dayjs` 被 `index.js` 和 `main.js` 都打包了一次，造成了代码重复。

如果项目规模较大，文件数量增多，不仅会降低打包效率，也会影响运行性能。

**解决方案：使用 shared**

修改 `webpack.config.js`，添加 `shared` 配置：

```js{9}
const htmlPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    index: './src/index.js',
    main: './src/main.js',
    shared: ['dayjs'],
  },
  output: {
    filename: '[name]-bundle.js',
    clean: true,
  },
  plugins: [
    new htmlPlugin({
      template: './index.html',
    }),
  ],
};
```

`shared` 属性是一个数组，将公共依赖库放入其中，`webpack` 会将其单独分离出来。注意：`shared` 这个名称可以自定义。

打包后会生成 `shared-bundle.js` 文件：

![shared打包结果](https://pic1.zhimg.com/80/v2-4ab1d8a0a15be2d86294354e6d071a50_1020w.png)

#### 2.3.3 复杂场景下的 shared 配置

假设我们新增一个 `test.js` 入口文件，它依赖 `axios` 和 `dayjs`，同时 `index.js` 也依赖 `axios`，但 `main.js` 不依赖 `axios`。此时无法简单地将所有依赖放入同一个 `shared` 中。

`test.js` 代码：

```js
import axios from 'axios';
import dayjs from 'dayjs';

const format = (date, format) => dayjs(date).format(format);
const dateTime = format(new Date(), 'YYYY-MM-DD HH:mm:ss');
console.log('test', dateTime);

axios.get('http://localhost:3000/test').then((res) => console.log(res));
```

**高级配置方式：**

```js{7-23}
const htmlPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    index: {
      import: './src/index.js',
      dependOn: ['axiosShared', 'times'],
      filename: 'js/index.js',
    },
    main: {
      import: './src/main.js',
      dependOn: 'times',
      filename: 'js/main.js',
    },
    test: {
      import: './src/test.js',
      dependOn: ['axiosShared', 'times'],
      filename: 'js/test.js',
    },
    times: ['dayjs'],
    axiosShared: ['axios'],
  },
  output: {
    filename: '[name]-bundle.js',
    clean: true,
  },
  plugins: [
    new htmlPlugin({
      template: './index.html',
    }),
  ],
};
```

配置项说明：

- `import`：指定加载的文件路径
- `dependOn`：设置依赖的第三方包，这些包会被单独提取
- `filename`：可单独设置文件名（必须包含扩展名），会覆盖 `output.filename` 的配置

打包后的结果，业务代码会被放入 `js` 目录：

![image](https://s1.imagehub.cc/images/2025/11/13/8e7610dfe77fdaa53109b0f989210be6.png)

#### 2.3.4 Runtime 配置

**什么是 Runtime？**

`Runtime` 是 `webpack` 生成的 JavaScript 代码，负责执行一些底层操作：

- **模块连接与加载**：当代码被打包成多个文件（chunks）后，`runtime` 负责通过 `import` 或 `require` 加载和连接这些模块
- **异步加载**：处理动态导入 `import()` 的异步模块
- **模块解析**：维护已加载模块的缓存和索引，确保模块正确执行

**为什么要分离 Runtime？**

默认情况下，`webpack` 会将 `runtime` 代码放入入口文件，这会严重影响应用的长期缓存。分离 `runtime` 后，用户每次更新只需下载几 KB 的业务代码，而不是包含 `runtime` 的整个大文件。

**分离 Runtime 的两种方式：**

方式一：在 `entry` 中配置 `runtime`

```js{22-31}
const htmlPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    index: {
      import: './src/index.js',
      dependOn: ['axiosShared', 'times'],
      filename: 'js/index.js',
    },
    main: {
      import: './src/main.js',
      dependOn: 'times',
      filename: 'js/main.js',
    },
    test: {
      import: './src/test.js',
      dependOn: ['axiosShared', 'times'],
      filename: 'js/test.js',
    },
    times: {
      import: ['dayjs'],
      runtime: 'runtime',
      filename: 'js/dayjs.js',
    },
    axiosShared: {
      import: 'axios',
      runtime: 'runtime',
      filename: 'js/axiosShared.js',
    },
  },
  output: {
    filename: '[name]-bundle.js',
    clean: true,
  },
  plugins: [
    new htmlPlugin({
      template: './index.html',
    }),
  ],
};
```

打包后会生成 `runtime-bundle.js`：

![image](https://s1.imagehub.cc/images/2025/11/13/04d2a0de6eb6102eae836a7198e6d3d4.png)

方式二：使用 `optimization.runtimeChunk`（推荐）

现代 `webpack` 推荐使用 `optimization.runtimeChunk` 配置：

```js{33-35}
const htmlPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    index: {
      import: './src/index.js',
      dependOn: ['axiosShared', 'times'],
      filename: 'js/index.js',
    },
    main: {
      import: './src/main.js',
      dependOn: 'times',
      filename: 'js/main.js',
    },
    test: {
      import: './src/test.js',
      dependOn: ['axiosShared', 'times'],
      filename: 'js/test.js',
    },
    dayjs: {
      import: ['dayjs'],
      runtime: 'runtime', // [!code --]
      filename: 'js/dayjs.js',
    },
    axiosShared: {
      import: 'axios',
      runtime: 'runtime', // [!code --]
      filename: 'js/axiosShared.js',
    },
  },
  optimization: {
    runtimeChunk: 'single' // 将所有入口的 runtime 抽离成一个 runtime.js
  },
  output: {
    filename: '[name]-bundle.js',
    clean: true,
  },
  plugins: [
    new htmlPlugin({
      template: './index.html',
    }),
  ],
};
```

打包结果与方式一相同。
> [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/05-webpack%E5%A4%9A%E5%85%A5%E5%8F%A3)  

---

### 2.4 动态导入（懒加载）

#### 2.4.1 使用 import() 动态导入

代码分离的另一种方式是动态导入（懒加载）。`webpack` 提供了两种实现方式：

- 使用 ECMAScript 的 `import()` 语法（推荐）
- 使用 `webpack` 遗留的 `require.ensure`（已不推荐）

无论是 `Vue` 还是 `React`，它们的路由懒加载都是使用 `import()` 这种动态导入方式实现的。

**示例代码：**

创建 `routes` 文件夹，新建 `about.js` 和 `home.js`：

`about.js`：

```js
const h1 = document.createElement('h1');
h1.textContent = 'About';
document.body.appendChild(h1);
```

`home.js`：

```js
const h1 = document.createElement('h1');
h1.textContent = 'Home';
document.body.appendChild(h1);
```

在 `src/index.js` 中使用 `import()` 动态导入：

```js
const btn1 = document.createElement('button');
const btn2 = document.createElement('button');

btn1.textContent = 'Home';
btn2.textContent = 'About';
document.body.appendChild(btn1);
document.body.appendChild(btn2);

btn1.addEventListener('click', () => {
  import('./routes/home');
});

btn2.addEventListener('click', () => {
  import('./routes/about');
});
```

`webpack.config.js` 配置：

```js
const htmlPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new htmlPlugin({
      template: './index.html',
    }),
  ],
};
```

打包后的输出结果：

![动态导入打包结果](https://picx.zhimg.com/80/v2-24a6c3add100b6e8e75a84d3364cbb7b_720w.png)

运行效果：

![动态导入运行效果](https://picx.zhimg.com/80/v2-91704a9f6ed9cce96d227eca59eb20b0_720w.gif)

**自定义动态导入文件名：**

可以在 `output` 中配置 `chunkFilename` 来修改动态导入文件的名称：

```js
output: {
  filename: 'bundle.js',
  clean: true,
  chunkFilename: '[name]-[hash:6]-chunk.js', // [!code ++]
}
```

但此时你会发现 `[name]` 占位符没有生效，文件名不够直观。

#### 2.4.2 魔法注释 webpackChunkName

为了让动态导入的文件名更清晰，可以使用 `webpack` 的魔法注释 `webpackChunkName`：

```js
const btn1 = document.createElement('button');
const btn2 = document.createElement('button');

btn1.textContent = 'Home';
btn2.textContent = 'About';
document.body.appendChild(btn1);
document.body.appendChild(btn2);

btn1.addEventListener('click', () => {
  import(/* webpackChunkName: "home" */ './routes/home');  // [!code ++]
});

btn2.addEventListener('click', () => {
  import(/* webpackChunkName: "about" */ './routes/about'); // [!code ++]
});
```

打包后的文件名：

![魔法注释打包结果](https://pica.zhimg.com/80/v2-8cc2858442893ea092551462e60fdb80_1420w.png)

#### 2.4.3 获取动态导入的导出值

有时需要在动态导入完成后获取模块的导出值。

修改 `about.js`，添加导出：

```js{7-11}
const h1 = document.createElement('h1');
h1.textContent = 'About';
document.body.appendChild(h1);

export const a = 10; // [!code ++]

export default { 
  hello() {
    console.log('say hello');
  },
};
```

在 `index.js` 中获取导出值：

- 按需导出的值：通过 `res.属性名` 访问
- 默认导出的值：通过 `res.default` 访问

```js
btn2.addEventListener('click', () => {
  import(/* webpackChunkName: "about" */ './routes/about').then((res) => { // [!code ++]
    console.log('a', res.a);              // 10 // [!code ++] 
    console.log('hello', res.default.hello()); // say hello  // [!code ++]
  });
});
```

#### 2.4.4 Prefetch 和 Preload

`webpack v4.6.0+` 增加了预获取和预加载的支持：

- `prefetch`（预获取）：用于未来某个时刻可能需要的资源
- `preload`（预加载）：用于当前导航下可能需要的资源

使用方式：

```js
btn1.addEventListener('click', () => {
  import(
    /* webpackChunkName: "home" */
    /* webpackPrefetch: true */ // [!code ++]
    './routes/home'
  );
});
```

运行效果：`home` 模块会被预获取，点击按钮时才真正渲染：

![prefetch效果](https://pic1.zhimg.com/80/v2-892c28888ac6f530ccc6d9abec9e6fa9_1420w.gif)

**Prefetch 和 Preload 的区别：**

- `prefetch`：等到主包（父 Chunk）下载并解析完成后，在浏览器空闲时间才会下载文件
- `preload`：与主包（父 Chunk）并行下载



---

### 2.5 自定义分包（SplitChunksPlugin）

#### 2.5.1 SplitChunks 介绍

还有一种分包模式是 `splitChunks`，它底层使用 `SplitChunksPlugin` 实现。因为该插件在 `webpack4` 中已默认安装和集成，所以无需单独安装。

#### 2.5.2 chunks 配置

`webpack` 提供了 `SplitChunksPlugin` 的默认配置，我们也可以手动修改。

例如，默认配置中 `chunks` 仅针对异步（`async`）请求，我们可以设置为 `initial` 或 `all`：

```js{2-4} [webpack.config.js]
optimization: {
  splitChunks: {
    chunks: 'async', 
  }
}
```

这也是为什么 `import()` 动态导入能默认进行分包的原因。

**测试场景：**

在 `src/index.js` 中使用 `axios` 和 `dayjs`：

```js [index.js]
// ... 省略之前代码
import axios from 'axios';
import dayjs from 'dayjs';

console.log(dayjs(new Date()).format('YYYY-MM-DD'));
axios.get('http://www.baidu.com').then(res => res);
```

打包后，第三方包会被放入主包中：

![默认打包结果](https://picx.zhimg.com/80/v2-d27cdfc62bf03d470dc78eb796735841_1020w.png)

修改 `webpack.config.js`，将 `chunks` 设置为 `all`：

```js [webpack.config.js]
const htmlPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all', // [!code ++]
    },
  },
  plugins: [
    new htmlPlugin({
      template: './index.html',
    }),
  ],
};
```

打包后，所有第三方包会被提取到 `vendors-xxxx...` 文件中（文件名较长，稍后会自定义）：

![chunks:all打包结果](https://picx.zhimg.com/80/v2-55d6f89f4253aa528179716001618469_1020w.png)

#### 2.5.3 minSize 和 maxSize

这两个配置项用于控制文件分割的大小：

- `minSize`：文件最小被分割的大小，默认值为 `20000` 字节（20KB）
- `maxSize`：文件超过多大时进行分割，默认值虽然是 `0`，但实际上功能是关闭的，默认只进行基于 `cacheGroups` 的一次分割

配置示例：

```js
splitChunks: {
  chunks: 'all',
  maxSize: 20000,  // [!code ++]
  minSize: 10000, // [!code ++]
}
```

打包后，代码会根据 `maxSize` 和 `minSize` 被分割成多个文件：

![minSize和maxSize效果](https://picx.zhimg.com/80/v2-1d06d0f81fd214b4a745b9ec31d04594_1020w.png)

#### 2.5.4 cacheGroups（核心配置）

`cacheGroups` 允许你定义自己的分割规则，将符合条件的模块分到同一个组里。

首先，在 `src` 目录下创建 `utils/foo.js`：

```js
export default function foo() {
  console.log('foo');
}
```

**cacheGroups 配置项说明：**

- `test`：正则表达式或函数，用于匹配模块路径，决定模块属于哪个组
- `filename`：指定该缓存组打包出的 chunk 文件名
- `priority`：优先级，当模块同时满足多个 `cacheGroups` 规则时，优先级高的组会优先处理
  - 例如，`dayjs` 既属于 `node_modules`，又希望单独分出来，那么单独分组的优先级应该设置更高
- `reuseExistingChunk`：如果当前模块已经被打包分离，是否直接复用已分离的 chunk，默认为 `true`（建议保持）

配置示例：

```js{6-22}
optimization: {
  splitChunks: {
    chunks: 'all',
    maxSize: 20000,
    minSize: 10000,
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        filename: '[id]-vendors.js',
        priority: -10,
      },
      utils: {
        test: /[\\/]utils[\\/]/,
        filename: '[id]-utils.js',
        priority: 2,
      },
      common_vendors: {
        test: /[\\/]node_modules[\\/](axios|dayjs)[\\/]/,
        filename: '[id]-axios-dayjs.js',
        priority: 5,
      },
    },
  },
}
```

打包结果：`axios` 和 `dayjs` 成功从 `node_modules` 中单独分离出来。

注意：如果没有看到 `utils` 包，是因为 `utils` 中的文件还未达到 `minSize` 的最小分割大小。

![cacheGroups打包结果](https://pic1.zhimg.com/80/v2-896650715e6fed99b5a997346b99dd15_1020w.png)

---

### 2.6 chunkIds 配置

#### 2.6.1 基本使用

`optimization.chunkIds` 用于配置模块 ID 的生成算法。

可选值及说明：

| 选项值          | 描述                                                         |
| --------------- | ------------------------------------------------------------ |
| `natural`       | 按使用顺序的数字 ID                                          |
| `named`         | 对调试友好的可读 ID（默认：开发环境）                        |
| `deterministic` | 确定性的、在不同编译中不变的短数字 ID，有益于长期缓存（默认：生产环境） |
| `size`          | 专注于让初始下载包大小更小的数字 ID                          |
| `total-size`    | 专注于让总下载包大小更小的数字 ID                            |

#### 2.6.2 deterministic vs natural

使用 `deterministic`（推荐）：

```js
optimization: {
  chunkIds: 'deterministic',  // [!code ++]
  splitChunks: {
    // ... 省略
  },
}
```

打包输出的文件使用确定性 ID，不会随其他文件变化而变化：

![deterministic效果](https://pica.zhimg.com/80/v2-c5f57d61e14aeb318aefc6b73212a17e_1020w.png)

使用 `natural`（不推荐）：

```js
optimization: {
  chunkIds: 'natural',  // [!code ++]
  splitChunks: {
    // ... 省略
  },
}
```

打包输出的文件使用顺序 ID：

![natural效果](https://pic1.zhimg.com/80/v2-605857202cb4f1d41487b154583681df_720w.png)

**natural 的问题：**

如果注释掉 `index.js` 中的 `btn2` 相关代码：

```js
import foo from './utils/foo';

const btn1 = document.createElement('button');
const btn2 = document.createElement('button');

btn1.textContent = 'Home';
btn2.textContent = 'About';
document.body.appendChild(btn1);
document.body.appendChild(btn2);

btn1.addEventListener('click', () => {
  import(/* webpackChunkName: "home" */ './routes/home');
});

// btn2.addEventListener('click', () => {
//   import(/* webpackChunkName: "about" */ './routes/about').then((res) => {
//     console.log('a', res.a);
//     console.log('hello', res.default.hello());
//   });
// });

foo();
axios.get('http://www.baidu.com').then((res) => {
  console.log(res);
});
console.log(dayjs(new Date()).format('YYYY-MM-DD'));
```

再次打包后，你会发现其他文件的 ID 也跟着改变了：

![natural问题](https://pic1.zhimg.com/80/v2-2a0ebbb3d1f4a234c97b5238b00958e5_720w.png)

这是因为 `about.js` 在新的打包中被注释，没有被打包，导致后续文件的顺序 ID 发生变化。

**结论：** 在 `webpack5` 中，尽量使用 `deterministic` 而不是 `natural`。

---

### 2.7 小技巧

所有包含 `filename` 的字段属性都可以添加路径前缀，例如 `js/文件名称.扩展名`。

完整配置示例，将所有 `js` 文件放入 `js` 目录：

```js{7-11,21-43}
const htmlPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  output: {
    filename: 'js/[name]-bundle.js',
    clean: true,
    chunkFilename: 'js/[name]-chunk.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  optimization: {
    runtimeChunk: {
      name: 'js/runtimeChunk.js',
    },
    chunkIds: 'deterministic',
    splitChunks: {
      chunks: 'all',
      maxSize: 20000,
      minSize: 10000,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          filename: 'js/[id]-vendors.js',
          priority: -10,
        },
        common_vendors: {
          test: /[\\/]node_modules[\\/](axios|dayjs)[\\/]/,
          filename: 'js/[id]-axios-dayjs.js',
          priority: 5,
        },
      },
    },
  },
  plugins: [
    new htmlPlugin({
      template: './index.html',
    }),
  ],
};
```

打包后，所有打包的 `js` 文件都放在 `js` 目录中：

![目录结构优化](https://pica.zhimg.com/80/v2-71cd2e7c5a045131d5b2f61e57765811_1020w.png)

> [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/06-webpack%E6%96%87%E4%BB%B6%E6%87%92%E5%8A%A0%E8%BD%BD)  
---

## 三、CDN 配置

### 3.1 CDN 介绍

`CDN`（`Content Delivery Network`，**内容分发网络**）的主要功能是：当用户请求某个静态资源时，CDN 能根据用户的地理位置，找到离用户最近的服务器，将对应的静态资源（如图片、视频、音乐）提供给用户。

注意：接下来的示例都会使用 `webpack-dev-server` 来查看页面效果。

### 3.2 方式一：所有静态资源使用 CDN

在开发中，使用 `CDN `主要有两种方式。

第一种方式是将打包后的所有静态资源放到 `CDN `服务器，用户的所有资源都通过 `CDN` 服务器加载。这种方式价格昂贵，但服务体验最好。

在 `webpack.config.js` 中，通过 `output.publicPath` 进行配置：

```js{13-24}
const path = require('node:path');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'https://cdn.example.com/assets', // [!code ++]
    clean: true,
  },
  devServer: {
    proxy: [
      {
        context: ['/api'],
        target: 'https://www.baidu.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
```

`output.publicPath` 的作用是为所有资源添加根路径。

打包生成的 `index.html` 会自动添加 `publicPath` 设置的根路径：

![image](https://s1.imagehub.cc/images/2025/11/13/843b42e2974c37087f2a399cb8e8e0c7.png)

### 3.3 方式二：第三方资源使用 CDN

第二种方式是将一些第三方资源放到 CDN 服务器上，这种方式通常是免费的。

通常一些知名的开源框架都会将打包后的源码放到免费的 CDN 服务器上：

- 国际上常用的：`unpkg`、`JSDelivr`、`cdnjs`
- 国内常用的：`bootcdn`

**如何在项目中引入这些 CDN？**

第一步：在打包时排除某些库，不对其进行打包。

创建 `foo.js`

 ```js [foo.js]
 console.log('axios.default', axios.default);

 axios.default.get('/api').then((res) => {
   console.log(res);
 });

 ```

 在 `src/index.js`

 ```js [index.js]
 import './foo.js';
 console.log(dayjs().format('YYYY-MM-DD'));
 ```

在 `webpack.config.js` 中配置 `externals`：

```js
const path = require('node:path');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  externals: {
    dayjs: 'dayjs', // [!code ++]
    axios: 'axios', // [!code ++]
  },
  devServer: {
    proxy: [
      {
        context: ['/api'],
        target: 'https://www.baidu.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
```

`externals` 配置说明：

- `key`（属性名）：**要排除的库的名称**
- `value`（属性值）：从 CDN 库请求下来后，该库在全局的变量名
  - `dayjs` 在 CDN 中请求下来后的全局变量是 `dayjs`
  - `lodash` 在 CDN 中请求下来后的全局变量是 `_`
  - `axios` 在 CDN 中请求下来后的全局变量是 `axios`

第二步：在 HTML 模板中，手动添加对应的 CDN 服务器地址。

在 `public/index.html` 中添加：

```html [index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script defer="defer" src="https://cdn.bootcdn.net/ajax/libs/dayjs/1.11.13/dayjs.min.js"></script>
    <script defer="defer" src="https://cdn.bootcdn.net/ajax/libs/axios/1.9.0/axios.min.js"></script>
  </head>
  <body></body>
</html>
```


启动`yarn dev`运行

![image](https://s1.imagehub.cc/images/2025/11/13/e290f2db6adf736ab588a7c065bda58c.png)

可以看到 `dayjs` 和 `axios` 都通过 CDN 加载了：

![CDN加载效果](https://picx.zhimg.com/80/v2-b841e2c2aa60ba2c31e9e91b37885509_1020w.png)

---

## 四、Shimming 垫片

### 4.1 Shimming 介绍
在使用 `Shimming` 前面我们把 `public/index.html`文件里面 `axios` 引入的 `CDN`文件先注释

```html [index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
     <script defer="defer" src="https://cdn.bootcdn.net/ajax/libs/dayjs/1.11.13/dayjs.min.js"></script>
     <!--  <script defer="defer" src="https://cdn.bootcdn.net/ajax/libs/axios/1.9.0/axios.min.js"></script>  !-->
  </head>
  <body></body>
</html>
```

`Shimming` 翻译为"垫片"，相当于给代码填充一些垫片来处理某些问题。

`Shimming` 是一类功能的统称，与 `Polyfill` 有些类似，但本质上有所区别：

- **Polyfill**：**补充环境能力的缺失**（浏览器没有某个函数或功能时），Polyfill 会自己实现一个相同的函数或功能
- **Shimming**：代码依赖没有进行引入时，`Shimming` **会自动帮你引入**

### 4.2 Polyfill 与 Shimming 的区别

举例说明：

假设我们依赖一个第三方库，这个库本身依赖 `lodash`，但默认没有导入 `lodash`（认为全局存在 `lodash`），那么我们就可以通过 `ProvidePlugin` 来实现 Shimming 效果。

### 4.3 使用 ProvidePlugin

目前我们的 `axios` 和 `dayjs` 都使用了 CDN 引入，相当于在全局可以使用它们。

假设一个文件中使用了 `axios`，但没有进行 CDN 引入，代码会报错。

在 `foo.js`：

```js
console.log(axios);
axios.get('/api').then((res) => {
  console.log(res);
});
```


启动`yarn dev`运行，因为没有引入 `axios` 模块，直接使用会报错：

![Shimming错误](https://pic1.zhimg.com/80/v2-5ad4f0d1ec64438da07e29fb4b092a06_1020w.png)

这时可以使用 `webpack` 自带的 `ProvidePlugin` 插件来实现 Shimming 效果。

在 `webpack.config.js` 中配置：

```js{14-16} [webpack.config.js]
const { ProvidePlugin } = require('webpack'); // [!code ++]

// ... 省略其他配置

externals: {
  dayjs: 'dayjs',
  // axios: 'axios', // 注释掉，让 webpack 打包 axios
},

plugins: [
  new htmlWebpackPlugin({
    template: './public/index.html',
  }),
  new ProvidePlugin({
    axios: 'axios',
  }),
],
```

配置说明：

- `key`（属性名）：包导出的全局变量
- `value`（属性值）：包的名称

注意：`ProvidePlugin` 的 `key` 和 `value` 与 `externals` 是相反的。同时，在 `externals` 中要注释掉 `axios`，让 `webpack` 将其打包进去。

再次打包并启动，查看 `axios` 打印结果。你会发现它是一个对象，真正的方法在 `default` 中（ES6 的默认导出）：

![ProvidePlugin效果](https://picx.zhimg.com/80/v2-a22583735b040c9d0ffb7d1b4837899c_720w.png)

可以在代码中进行解构，但不建议这样做，因为每次都要访问 `default`：

在 `foo.js` 中：

```js
const newAxios = axios.default;
newAxios.get('/api').then((res) => {
  console.log(res);
});
```

访问成功：

![解构访问成功](https://pic1.zhimg.com/80/v2-71184e6088414d44d65dbfb291eb24ec_1020w.png)

更好的方式是在 `webpack.config.js` 中修改 `ProvidePlugin` 插件配置（推荐）：

```js [webpack.config.js]
new ProvidePlugin({
  axios: ['axios', 'default'], // [!code ++]
}),
```

在 `foo.js` 中直接使用：

```js
axios.get('/api').then((res) => {
  console.log(res);
});
```

这种方式也能成功访问：

![推荐方式效果](https://pic1.zhimg.com/80/v2-71184e6088414d44d65dbfb291eb24ec_1020w.png)

注意：`webpack` 并不推荐随意使用 Shimming。Webpack 背后的整个理念是使前端开发更加模块化。

---

## 五、代码分离（处理 CSS）

### 5.1 准备工作

首先下载 `css-loader`：

```bash
npm install css-loader -D
```

配置 `webpack.config.js`，添加 CSS 规则：

```js
module: {
  rules: [
    {
      test: /\.css$/,
      use: ['css-loader'],
    },
  ],
},
```

在 `src` 目录中创建 `assets/css` 目录。

创建 `test.css`：

```css
.title {
  color: red;
  font-size: 40px;
}
```

创建 `content.css`：

```css
.content {
  color: #ff00aa;
  font-size: 80px;
}
```

在 `index.js` 中引入 `test.css`：

```js
import './assets/css/test.css';

const div = document.createElement('div');
const span = document.createElement('span');
span.textContent = 'hello world';
div.appendChild(span);
document.body.appendChild(div);
```

### 5.2 使用 MiniCssExtractPlugin

#### 5.2.1 静态导入

`MiniCssExtractPlugin` 可以帮助我们将 CSS 提取到独立的 CSS 文件中，该插件需要在 `webpack4+` 才可以使用。

首先安装插件：

```bash
npm install mini-css-extract-plugin -D
```

配置 `webpack.config.js`：

```js{5-12,20-22} [webpack.config.js] 
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  // ... 其他配置
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: './public/index.html',
    }),
    new ProvidePlugin({
      axios: ['axios', 'default'],
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-[hash:6].css',
    }),
  ],
};
```

打包运行，查看网络加载时，CSS 已被加载：

![CSS静态导入效果](https://pic1.zhimg.com/80/v2-1006c36b24c36a1aeed2f46bc61c15f1_720w.png)

#### 5.2.2 动态导入

有时需要通过动态方式导入 CSS。例如，点击按钮后才导入 CSS。

在 `index.js` 中：

```js
const button = document.createElement('button');
button.textContent = 'click';
button.addEventListener('click', () => {
  import(/* webpackChunkName: 'content' */ './assets/css/content.css'); // [!code ++]
});
document.body.appendChild(button);
```

在 `webpack.config.js` 中，为 `MiniCssExtractPlugin` 添加 `chunkFilename` 参数：

```js
new MiniCssExtractPlugin({
  filename: 'css/[name]-[hash:6].css',
  chunkFilename: 'css/[name]-[hash:6].chunk.css',  // [!code ++]
}),
```

配置说明：

- `filename`：静态导入文件使用的名称
- `chunkFilename`：动态导入文件使用的名称

启动项目并运行：

![CSS动态导入效果](https://pic1.zhimg.com/80/v2-ffeaa715854b0507d0186767a61be28c_1020w.gif)

---

## 六、Hash 的区别

### 6.1 三种 Hash 的对比

`webpack` 中有三种 Hash：`hash`、`contentHash`、`chunkHash`，它们之间的区别如下：

1. `hash`：**最不精确**。项目中任何一个地方改动，所有产出文件的 hash 都会变化。只要有任意文件发生变化，打包文件的 hash 都会改变。

2. `chunkhash`： **精确到"代码块"**。同一个代码块（比如一个入口和它的所有 JS 依赖）共享一个 hash。但它的问题是，从这个代码块里抽离出来的 CSS 文件会和 JS 文件联动，JS 变了 CSS 的 hash 也跟着变。

   例如：`index.js` 和 `index.css` 相互依赖，当 `index.js` 内容发生变化，`index.css` 的 `hash` 也会跟着变化；反之亦然。

3. `contenthash`：**最精确** 每个产出文件只根据自己的实际内容计算 `hash`，互不干扰，是缓存优化的最佳选择。

### 6.2 实际场景分析

假设 `index.js` 的 `filename` 设置为 `contenthash`，`index.css` 的 `filename` 设置为 `chunkhash`，两者相互依赖：

```js
const path = require('node:path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'bundle[contenthash:6].js', //[!code ++]
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'], 
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name]-[chunkhash:6].css', //[!code ++]
    }),
  ],
};
```

1. 问题一：当 `index.js` 内容发生改变，`index.css` 的 hash 会发生改变吗？

 - 答案：不会。因为 `index.js` 使用的是 `contenthash`，只有它自己的 hash 会变。

2. 问题二：当 `index.css` 内容发生改变，`index.js` 的 hash 会发生改变吗？

 - 答案：不会。因为 `index.css` 虽然使用的是 `chunkhash`，但 `index.js` 使用的是 `contenthash`，只有 `index.css` 的 hash 会变。

---

## 总结

本文详细介绍了 `webpack` 的代码分离和性能优化技术：

1. **多入口方式**：通过 `entry` 配置多个入口，使用 `shared` 和 `dependOn` 提取公共依赖，使用 `runtime` 分离运行时代码

2. **动态导入**：使用 `import()` 实现懒加载，配合魔法注释 `webpackChunkName`、`webpackPrefetch`、`webpackPreload` 优化加载策略

3. **SplitChunksPlugin**：通过 `chunks`、`minSize`、`maxSize`、`cacheGroups` 等配置实现精细化的代码分割

4. **CDN 优化**：介绍了两种 CDN 使用方式，以及如何通过 `externals` 和 `publicPath` 进行配置

5. **Shimming**：使用 `ProvidePlugin` 自动注入全局依赖

6. **CSS 分离**：使用 `MiniCssExtractPlugin` 提取 CSS 文件，支持静态和动态导入

7. **Hash 策略**：对比了 `hash`、`chunkhash`、`contenthash` 的区别，推荐使用 `contenthash` 实现最佳缓存策略

通过合理使用这些技术，可以显著提升应用的加载性能和用户体验。