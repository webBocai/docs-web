---
date: 2025-10-11 20:15:30
title: 18-自定义plugin <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /webpack/4zwyf
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - babel的进阶使用
---
# Webpack 自定义插件开发指南

## 一、自定义插件规则

在之前我们完成了 `tapable` 的学习。`tapable` 是内功，现在我们就来学习招式——如何利用这身内功，在 Webpack 的世界里大展身手，**编写自定义插件（Plugins）**。

一个 Webpack 插件，本质上就是一个**能够接触到 Webpack 编译生命周期，并在特定钩子上挂载自定义功能的模块**。因为你已经懂了 `tapable`，所以你明白"钩子"和"挂载功能"意味着什么。

### 1. 插件的基本结构

所有 Webpack 插件，无论多复杂，都遵循一个基本结构：

**第一步：定义插件类或对象**

插件是一个 JavaScript **类（Class）**或者**对象**。

**第二步：实现 apply 方法**

这个**类或者对象**必须实现一个名为 `apply` 的方法。

**第三步：Webpack 自动调用**

当你把插件实例放入 `webpack.config.js` 的 `plugins` 数组时，Webpack 会在启动时调用这个 `apply` 方法，并把**核心的 `compiler` 对象**作为参数传进去。

**第四步：编写插件代码**

我们先来写一个最简单的"骨架"。在 `plugins` 文件夹中创建一个 `MyFirstPlugin.js` 文件。

**类的写法（使用最多）：**

```js
class MyFirstPlugin {
  // apply 方法是插件的入口
  // Webpack 会在初始化时调用这个方法，并注入 compiler 对象
  apply(compiler) {
    // 你的所有插件逻辑都将写在这里
    console.log('🎉 MyFirstPlugin 被加载了！');
  }
}

// 导出这个类
module.exports = MyFirstPlugin;
```

**对象写法：**

```js
const MyFirstPlugin = {
  apply(compiler) {
    // 你的所有插件逻辑都将写在这里
    console.log('🎉 MyFirstPlugin 被加载了！');
  },
};

// 导出这个对象
module.exports = MyFirstPlugin;
```

**第五步：在配置文件中使用**

然后在 `webpack.config.js` 中使用它：

```js
const path = require('node:path');
const MyFirstPlugin = require('./plugins/MyFirstPlugin.js');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  // plugins: [MyFirstPlugin]  // 对象写法
  plugins: [new MyFirstPlugin()] // 类写法  
};
```

**第六步：验证效果**

现在，当你运行 Webpack 时，就会在控制台看到 `🎉 MyFirstPlugin 被加载了！`

![运行效果](https://pic1.zhimg.com/80/v2-6aeebe54dc49b34af228cda5e050c6ce_1420w.png)

### 2. 认识 compiler 对象和它的钩子

**什么是 compiler 对象？**

`apply` 方法的参数 `compiler` 是整个 Webpack 的"大脑"，是插件与 Webpack 交互的**唯一入口**。

`compiler` 对象代表了 Webpack 从**启动到退出的整个生命周期**。它上面挂载了许多钩子，允许你在**整个打包过程的不同时间点介入**。

**实战示例**

我们来写一个插件，它会在 Webpack **开始编译**和**编译完成**时，在控制台打印信息。

在 `plugins` 文件夹中创建一个 `ConsoleLogPlugin.js` 文件：

```js
class ConsoleLogPlugin {
  apply(compiler) {
    // compiler.hooks 上挂载着所有可用的钩子
    // run 钩子，在编译器开始读取记录前执行
    compiler.hooks.run.tap('ConsoleLogPlugin', (compilation) => {
      console.log('🚀 Webpack 开始编译...');
    });

    // done 钩子，在编译完成后执行
    compiler.hooks.done.tap('ConsoleLogPlugin', (stats) => {
      console.log('✅ Webpack 编译完成！');
    });
  }
}

module.exports = ConsoleLogPlugin;
```

把它配置到 `webpack.config.js` 里再运行：

```js
const path = require('node:path');
const ConsoleLogPlugin = require('./plugins/ConsoleLogPlugin.js');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new ConsoleLogPlugin()],
};
```

然后启动运行查看输出命令：

![控制台输出](https://picx.zhimg.com/80/v2-892046238e237029105526056c25b182_1420w.png)

**常用的 compiler 钩子：**

`run` 钩子：在非监听模式下，一次编译开始时执行。

`watchRun` 钩子：在监听模式下，每次文件变更触发重新编译时执行。

`emit` 钩子：在生成资源到 `output` 目录之前执行。

`done` 钩子：在一次完整的编译完成后执行。

### 3. 核心概念 compilation 对象

**compiler vs compilation**

如果说 `compiler` 代表了 Webpack 的整个生命周期，那么 `compilation` 则代表了**一次具体的构建过程**。

每次 Webpack 进行编译（在 watch 监听模式下，**每次文件变更都会触发一次新的编译**），都会创建一个新的 `compilation` 对象。

**compilation 对象包含的内容：**

这个对象包含了这次构建的所有上下文信息，比如所有被引用的模块（`Modules`）、代码块（`Chunks`）、即将生成的资源文件（`Assets`）以及依赖关系图。

几乎所有对模块和最终产出文件的操作，都需要通过 `compilation` 对象上的钩子来完成。

**如何获取 compilation 对象？**

通常是在 `compiler` 的某个钩子里，比如 `compiler.hooks.compilation`：

```js
class MyPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('MyPlugin', (compilation) => {
      // 现在你拿到了 compilation 对象，可以访问它上面的钩子了
      console.log('一个新的 compilation 正在创建！');

      // 例如，你可以在这里监听资源处理事件
      compilation.hooks.processAssets.tap('MyPlugin', (assets) => {
        console.log(`assets资源文件: ${Object.keys(assets)}`);
      });
    });
  }
}
```

## 二、自定义插件案例（compiler）

### 准备工作

**第一步：创建目录结构**

首先在根目录创建一个 `plugins` 文件目录。

**第二步：创建源文件**

在 `src` 文件目录创建 `index.js` 和 `main.js`：

```js
// index.js
console.log('我是index');

// main.js
console.log('我是main');
```

**第三步：配置 Webpack**

在 `webpack.config.js` 文件中：

```js
const path = require('node:path');

module.exports = {
  entry: {
    index: './src/index.js',
    main: './src/main.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

### 案例一：构建耗时统计插件

**插件功能说明**

我们来创建一个 `BuildNotifierPlugin`。这个插件非常实用，很多大型项目都有类似的工具。它的功能是：

在每次构建开始时，在控制台**打印一条清晰的开始信息**，使用 `compiler.hooks.run` 这个钩子。

在构建结束后，**判断是成功还是失败**，使用 `compiler.hooks.done` 钩子。

如果成功，**打印成功信息以及本次构建的总耗时**。

如果失败，打印失败信息**以及错误的数量**。

**关键 API 说明**

`compiler.hooks.run.tap` 是开始构建的钩子。

`compiler.hooks.watchRun.tap` 是监听文件变化重新开始构建的钩子。

`compiler.hooks.done.tap` 是构建结束的钩子。

`stats.hasErrors()` 用于**判断是否有构建错误**。

`stats.compilation.errors` 用于**查看错误详情**。

**代码实现**

```js
class BuildNotifierPlugin {
  apply(compiler) {
    // 用于记录构建开始的时间
    let startTime;

    // 1. 监听构建的开始（同时兼容 run 和 watchRun）
    // run 钩子用于 'webpack' 命令
    compiler.hooks.run.tap('BuildNotifierPlugin', () => {
      console.log('\n==================================');
      console.log('🚀 一次新的构建已开始...');
      startTime = Date.now();
    });

    // watchRun 钩子用于 'webpack --watch' 命令
    compiler.hooks.watchRun.tap('BuildNotifierPlugin', () => {
      console.log('\n==================================');
      console.log('👀 文件变更，重新构建已开始...');
      startTime = Date.now();
    });

    // 2. 监听构建的结束
    compiler.hooks.done.tap('BuildNotifierPlugin', (stats) => {
      const duration = Date.now() - startTime;
      
      // stats 对象包含了本次构建的所有信息，比如是否有错误和警告
      if (stats.hasErrors()) {
        // 如果有错误
        const errorCount = stats.compilation.errors.length;
        console.log(`❌ 构建失败！共发现 ${errorCount} 个错误。`);
      } else {
        // 如果没有错误
        console.log(`✅ 构建成功！总耗时: ${duration}ms`);
      }
      console.log('==================================\n');
    });
  }
}

module.exports = BuildNotifierPlugin;
```

**配置插件**

在 `webpack.config.js` 中：

```js
const path = require('node:path');
const BuildNotifierPlugin = require('./plugins/BuildNotifierPlugin.js');

module.exports = {
  // ...省略其它配置
  plugins: [new BuildNotifierPlugin()],
};
```

**运行效果**

打包查看效果：

![构建耗时统计](https://picx.zhimg.com/80/v2-c7c21e705f0f45fc20362cd0669349d4_1420w.png)

### 案例二：文件清单生成插件

**插件功能说明**

创建一个 `FileListPlugin`，它会在每次打包结束后，在输出目录（通常是 `dist`）下自动生成一个 `filelist.md` 文件，里面列出了所有**打包后的文件名和大小**。

**关键 API 说明**

`compiler.hooks.emit` 在输出资源到 `output` 目录之前执行。

`compilation.assets[filename].size()` 用于**获取文件大小**。

`compiler.webpack.version` 用于**获取 webpack 版本**。

`new sources.RawSource(content)` 用于**创建新内容**。

`compilation.emitAsset(filename, filecontent)` 用于**输出新文件和文件内容**。

**代码实现**

在 `FileListPlugin.js` 文件中：

```js
const { sources } = require('webpack');

class FileListPlugin {
  constructor(options) {
    this.options = options || { file: 'filelist' };
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
      let content = '## 本次构建生成的文件\n\n';

      for (const filename in compilation.assets) {
        // 获取文件大小
        const size = compilation.assets[filename].size();
        content += `- 文件名称: ${filename} | 文件大小: ${size} bytes\n`;
      }

      // 获取 webpack 版本
      content += `\n**Webpack 版本**: ${compiler.webpack.version}\n`;

      // 添加新内容
      const fileContent = new sources.RawSource(content);

      // 输出新文件和文件内容
      compilation.emitAsset(`${this.options.file}.md`, fileContent);

      callback();
    });
  }
}

module.exports = FileListPlugin;
```

**配置插件**

在 `webpack.config.js` 中：

```js
const path = require('node:path');
const FileListPlugin = require('./plugins/FileListPlugin.js');

module.exports = {
  // 自定义插件 FileListPlugin
  plugins: [
    new FileListPlugin({
      file: 'fileContent',
    }),
  ],
};
```

**运行效果**

打包查看效果：

![文件清单](https://picx.zhimg.com/80/v2-f059d46d48001891299472cca0b27669_1420w.png)

### 案例三：Node 版本检查插件

**插件功能说明**

创建 `RunPlugin.js`，判断 Node 版本需要在 webpack 打包**刚开始就判断**，然后使用 Node 本身支持的 `child_process` 来实现。

使用 `child_process` 导出 `exec` 执行 `shell` 命令。

**关键技术点**

因为执行 shell 命令是异步的，所以 `run` 这个钩子调用 `tapAsync`，判断是否符合传入的版本。

如果不符合我们传入的版本，直接把错误给 callback：

```js
const err = new Error(`Node.js 版本不满足要求。需要: ${this.version}, 当前: ${data}`);
callback(err);
```

如果符合我们传入的版本就返回 `callback` 回调。

`compiler.hooks.run` 是开始构建的钩子。

**代码实现**

```js
const { exec } = require('node:child_process');

class RunPlugin {
  constructor(config) {
    this.version = config.version;
  }

  apply(compiler) {
    compiler.hooks.run.tapAsync('RunPlugin', (data, callback) => {
      exec('node -v', { encoding: 'utf-8' }, (error, stdout) => {
        if (error) {
          callback(error);
          return;
        }

        // 系统 node 版本号，假如系统版本是 v20.19.0
        const nodeVersions = stdout.replace('v', '').replace(/\r?\n/g, '').split('.');
        // 用户传入的版本号
        const requiredVersions = this.version.split('.');

        for (let i = 0; i < requiredVersions.length; i++) {
          const currentVer = parseInt(nodeVersions[i], 10);
          const requiredVer = parseInt(requiredVersions[i], 10);

          // 大于等于传入的版本就直接返回
          if (currentVer > requiredVer) {
            callback();
            return;
          }

          // 如果小于传入的版本，就报错
          if (currentVer < requiredVer) {
            const err = new Error(
              `Node.js 版本不满足要求。需要: ${this.version}, 当前: ${stdout.trim()}`
            );
            callback(err);
            return;
          }
        }

        callback();
      });
    });
  }
}

module.exports = RunPlugin;
```

**配置插件**

在 `webpack.config.js` 中：

```js
const path = require('node:path');
const RunPlugin = require('./plugins/RunPlugin.js');

module.exports = {
  // ...省略其它配置
  plugins: [
    new RunPlugin({
      version: '25.14.0',  // 随意传入的版本
    }),
  ],
};
```

**运行效果**

打包查看效果：

![Node版本检查](https://picx.zhimg.com/80/v2-d6403716c097e03e0cf2bb83ecb0b861_1420w.png)

### 案例四：模拟部署插件

**插件功能说明**

在构建完成后，模拟一个"部署"过程，比如将 `dist` 目录下的所有文件复制到另一个指定的目录。

**关键 API 说明**

`compiler.hooks.done` 在 `compilation` 完整的编译完成后执行。

`stats.toJson()` 用于**将 stats 转换成 JavaScript 对象**。

`outputPath` 用于**得到打包的输出路径**。

**代码实现**

首先创建 `DeployPlugin.js` 文件：

```js
const fs = require('node:fs');
const path = require('node:path');

class DeployPlugin {
  apply(compiler) {
    compiler.hooks.done.tapAsync('DeployPlugin', (stats, callback) => {
      // 将 stats 转换成 js 对象
      const statsJson = stats.toJson();
      // 得到打包的输出路径
      const outputPath = statsJson.outputPath;

      // 复制文件: 需要复制的文件夹、复制到哪个位置、深度递归的复制
      fs.cp(
        outputPath,
        path.resolve(__dirname, '../copydist'),
        { recursive: true },
        (err) => {
          callback(err);
        }
      );
    });
  }
}

module.exports = DeployPlugin;
```

### 案例五：清除打包目录插件

**插件功能说明**

在我们每一次打包的过程中，我们需要把之前打包**目录里面的文件全部删除**。

**代码实现**

使用 `compiler.hooks.run` 打包开始的钩子。

使用 Node 中 `fs.rmSync` 进行**删除文件夹里面的文件内容**，`recursive: true` 深度删除文件夹里面的文件内容。

```js
const fs = require('node:fs');

class ClearPlugin {
  apply(compiler) {
    compiler.hooks.run.tap('ClearPlugin', (compiler) => {
      const outputPath = compiler.options.output.path;
      // 深度删除
      fs.rmSync(outputPath, { recursive: true, force: true });
    });
  }
}

module.exports = ClearPlugin;
```

## 三、自定义插件案例（compilation）

### 准备工作

**第一步：创建目录**

首先在根目录创建一个 `loaders` 文件目录。

在 `src` 目录文件创建 `utils` 文件目录。

其余跟上面一致。

### 案例一：特殊注释添加 Loader

**插件功能说明**

在 `buildModule` 钩子拿到 `module` 对象。

读取这个文件的内容 `fs.readFile`。

判断文件内容里是否包含 `//addCountLoader` 这个字符串。

如果包含，就把我们的 `addCountLoader.js` 的路径添加到 `module.loaders` 数组的最前面，让它第一个执行。

**第一步：创建 Loader**

在 `loaders` 文件目录中创建 `addCountLoader.js`。

这个 loader 主要作用就是给添加 `//addCountLoader` 注释的文件添加一个**全局变量** `globalThis.c = 10`。

```js
module.exports = (sources) => {
  const exec = `\nglobalThis.c = 10;\n`;

  let newSources = sources.split('\n');
  let index = newSources.findLastIndex((item) => item.includes('import'));

  if (index > -1) {
    newSources.splice(index + 1, 0, exec);
  } else {
    newSources.splice(0, 0, exec);
  }

  newSources = newSources.join('\n');
  return newSources;
};
```

**第二步：创建测试文件**

在 `src\utils` 文件目录创建 `index.js`：

```js
// addCountLoader
export const a = 10;
console.log('c', c);
```

在 `src/index.js` 文件中：

```js
import { a } from './utils/index';
console.log('测试index.js', a);
```

**第三步：创建插件**

在 `plugins` 文件目录中添加 `BuildPlugin.js`。

`buildModule` 这个钩子会根据模块内容依次加载，比如 `src/index.js` 会执行一次，`src/utils/index.js` 也会执行一次。

```js
const fs = require('fs');
const path = require('path');

class BuildPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('BuildPlugin', (compilation) => {
      compilation.hooks.buildModule.tap('buildModule', (module) => {
        // 模块的绝对路径 如: D://buildPlugin/src/index.js  
        if (module.resource) {
          // 读取文件内容
          const content = fs.readFileSync(module.resource, 'utf-8');

          // 判断文件内容
          if (content.includes('// addCountLoader')) {
            // 添加 loader
            module.loaders.unshift({
              loader: path.resolve(__dirname, '../loaders/addCountLoader.js'), // 使用绝对路径
            });
          }
        }
      });
    });
  }
}

module.exports = BuildPlugin;
```

**第四步：配置 Webpack**

在 `webpack.config.js` 文件中：

```js
const path = require('node:path');
const BuildPlugin = require('./plugins/BuildPlugin');

module.exports = {
  mode: 'none',
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new BuildPlugin()],
};
```

**第五步：验证效果**

执行打包，查看结果：

![特殊注释Loader效果](https://pic1.zhimg.com/80/v2-347ccaa922c238c33d574cb30caf33c9_1420w.png)

### 案例二：为所有 JS 文件添加注释

**插件功能说明**

首先在 `processAssets` 得到 `assets` 静态资源，使用 `compilation.hooks.processAssets` 钩子。

得到静态资源之后判断是否为 `js` 文件。

然后添加内容。

**Stage 阶段说明**

最常用的 `stage` 有以下几种：

`PROCESS_ASSETS_STAGE_ADDITIONS`（新增/修改）：用于**添加**内容或新的资源。比如我们给文件加注释的例子，就非常适合用这个。时机：比较早的阶段。

`PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE`（优化）：用于优化资源**体积**。大名鼎鼎的代码压缩插件 `TerserWebpackPlugin`（Webpack 自带的 JS 压缩工具）就是在这个阶段运行的。时机：中间阶段。

`PROCESS_ASSETS_STAGE_SUMMARIZE`（总结）：用于**分析和总结**资源。比如，有些插件会在这里分析最终产物的大小、依赖关系等，并生成一份报告。时机：较晚阶段。

`PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER`（压缩）：优化已有 asset 的转换操作，例如对 asset 进行压缩，并作为独立的 asset。时机：较晚阶段。

`PROCESS_ASSETS_STAGE_REPORT`（报告）：生成最终的构建**报告**。Webpack 内置的打印构建信息的插件就是在这个阶段工作的。时机：最后阶段。

**关键 API 说明**

`new sources.ConcatSource(内容1, 内容2)` 用于添加内容。

`compilation.updateAsset(fileName, content)` 用于更新文件内容。

**代码实现**

```js
const { sources, Compilation } = require('webpack');

class AddCommentPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('AddCommentPlugin', (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: 'AddCommentPlugin',
          // 新增
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets, callback) => {
          // 遍历得到 js 文件并且将 js 文件添加注释，返回 Promise 状态
          const promiseAssets = Object.keys(assets)
            // 过滤出 js 文件
            .filter((fileName) => /\.js$/.test(fileName))
            .map((fileName) => {
              return new Promise((resolve) => {
                // 往文件内容前面添加注释
                const content = new sources.ConcatSource(
                  '/**你好呀张三！！！**/\n\n',
                  assets[fileName]
                );

                // 更新文件内容
                compilation.updateAsset(fileName, content);
                resolve();
              });
            });

          // Promise.all 来实现
          Promise.all(promiseAssets).then(() => {
            callback();
          });
        }
      );
    });
  }
}

module.exports = AddCommentPlugin;
```

**配置插件**

在 `webpack.config.js` 文件中：

```js
const path = require('node:path');
const AddCommentPlugin = require('./plugins/AddCommentPlugin');

module.exports = {
  mode: 'none',
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new AddCommentPlugin()],
};
```

**运行效果**

打包然后查看结果：

![添加注释效果](https://picx.zhimg.com/80/v2-638f4d29a641ef9c65d315b32091efaa_1420w.png)

### 案例三：Gzip 压缩插件

**插件功能说明**

首先在 `processAssets` 得到 `assets` 静态资源，使用 `compilation.hooks.processAssets` 钩子。

Stage 选择：`PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER`。

得到静态资源之后，使用 Node 模块的 `zlib` 模块进行压缩。

**关键 API 说明**

`assets[fileName].source()` 得到该 assets 文件里面的原始内容。

`zlib.gzip(source, (err, compressedBuffer) => {})` 根据文件原始内容进行 `gzip` 压缩。

`new sources.RawSource(compressedBuffer)` 将压缩的文件内容进行转换。

新增文件内容有两种方式：

- 方式一：`assets[新文件名称] = 文件内容`
- 方式二：`compilation.emitAsset(文件名称, 文件内容)`

**代码实现**

```js
const zlib = require('node:zlib');
const { Compilation, sources } = require('webpack');

class GzipPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('GzipPlugin', (compilation) => {
      // 步骤1：监听 processAssets 钩子
      compilation.hooks.processAssets.tapAsync(
        {
          name: 'GzipPlugin',
          // 选择一个合适的阶段，在 Gzip 压缩等优化阶段
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
        },
        (assets, callback) => {
          const assetsToCompress = Object.keys(assets).filter((fileName) => {
            return /\.(js|css)$/i.test(fileName);
          });

          const compressionPromises = assetsToCompress.map((fileName) => {
            return new Promise((resolve, reject) => {
              const source = assets[fileName].source(); // 获取文件原始内容

              // 进行 gzip 压缩
              zlib.gzip(source, (err, compressedBuffer) => {
                if (err) {
                  return reject(err);
                }

                // 设置扩展名
                const newFileName = `${fileName}.gz`;
                const rawFileContent = new sources.RawSource(compressedBuffer);

                // 方式一: 将新的内容赋值给 newFileName
                // assets[newFileName] = rawFileContent;

                // 方式二：emitAsset 新增文件内容 
                compilation.emitAsset(newFileName, rawFileContent);
                resolve();
              });
            });
          });

          // 3. 等待所有压缩任务完成
          Promise.all(compressionPromises)
            .then(() => callback()) // 成功后，告诉 Webpack 继续
            .catch((error) => callback(error)); // 失败后，把错误信息告诉 Webpack
        }
      );
    });
  }
}

module.exports = GzipPlugin;
```

**重要概念：assets[filename].source() 和 assets[filename] 的区别**

`assets[fileName].source()`：就像是一个**纯文本文件**，即**文件原始内容**。

`assets[fileName]`：则像是一个 **Word 文档（.docx）**。它不仅包含了最终的文字内容，还包含了大量"元数据"，比如字体、颜色、格式、修订记录、批注等等。

这个 "Word 文档"（`assets[fileName]`）就是 Webpack 内部使用的 "Source 对象"。

Webpack 之所以要用这么一个复杂的"容器"而不是简单的文本，主要是为了实现几个核心功能：

**性能与缓存（Performance & Caching）**

Webpack 非常智能，在重新构建时，如果它发现某个模块的代码没有变化，就不会重新处理它，而是直接使用上次缓存的结果。这个"缓存"就保存在 Source 对象里，极大地提升了二次构建的速度。

**源码映射（Source Maps）**

Source 对象包含了生成 Source Map 所需的所有信息，这样开发者就能在浏览器中调试压缩后的代码时，看到原始的源代码位置。

**灵活的操作**

Webpack 和它的插件需要对代码进行各种操作，比如在文件头部添加注释（`PrefixSource` 就是添加前缀的意思）。使用 Source 对象，可以非常高效和安全地完成这些操作，而不需要去粗暴地拼接巨大的字符串。

### 案例四：模拟 mini-css-extract-plugin

#### 准备工作

**第一步：创建 CSS 文件**

在 `src` 目录下创建 `assets` 文件目录，然后创建 `home.css` 和 `index.css`：

```css
/* 在 home.css 文件中 */ 
.content {
  margin: 0;
  height: 0;
  font-size: 28px;
  color: blue;
}

/* 在 index.css 文件中 */ 
.index {
  font-size: 60px;
  color: red;
}
```

**第二步：创建 JS 文件**

在 `src` 文件目录下的 `utils` 目录中创建 `home.js` 文件：

```js
import '../assets/css/home.css';

const div = document.createElement('div');
div.textContent = 'home主页';
div.classList.add('content');
document.body.appendChild(div);

export const message = 'home主页';
```

在 `src` 文件目录下的 `index.js` 文件：

```js
import { message } from './utils/home';
import './assets/css/index.css';

const div = document.createElement('div');
div.textContent = 'index主页';
div.classList.add('index');
document.body.appendChild(div);
console.log(message);
```

**第三步：安装依赖**

下载 `css-loader`：

```shell
npm i css-loader -D
```

**第四步：配置 Webpack**

在 `webpack.config.js` 中：

```js
const path = require('node:path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolveLoader: {
    modules: ['node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: 'css-loader' }],
      },
    ],
  },
};
```

#### 实现步骤

**插件核心使命**

`mini-css-extract-plugin` 的核心使命，就是将 JS 文件中引用的 CSS 模块"抽"出来，生成一个独立的 `.css` 文件，而不是像 `style-loader` 那样把样式注入到 `<style>` 标签里。

**实现思路**

我们需要一个合适的钩子，也就是 `processAssets` 这个钩子，方便我们在打包过程中输出**新的 css 文件**。

然后我们需要创建一个 `loader`，方便我们把 `css-loader` 处理过的内容，顺便再传递给 `compilation`。

**第一步：创建 Loader**

首先我们先创建一个 loader，它的作用就是给 `compilation` 传递参数。

在 `plugins` 目录中创建 `loaders` 目录，然后再创建 `minicssLoader.js`：

```js
module.exports = function (content) {
  // 通过 this._compilation 获取到 compilation
  // 同理: this._compiler 获取到 compiler
  const compilation = this._compilation;

  // 一个自定义属性 _MY_CSS_PLUGIN_MODULES，如果有就把内容和路径新增给这个属性
  if (compilation._MY_CSS_PLUGIN_MODULES) {
    compilation._MY_CSS_PLUGIN_MODULES.push({
      identifier: this.resourcePath,
      content: content,
    });
  }

  // 参数需要返回，可以是任意字符串
  return `//`;
};
```

**第二步：创建插件基础结构**

在 `plugins` 创建 `MiniCssExtractPlugin.js`。

首先在获取 `compilation` 的时候我们就创建 `_MY_CSS_PLUGIN_MODULES` 并设置为空数组。

创建 `loader` 为**静态属性**，通过 `path.resolve` 得到 `loader` 的**绝对路径**。

```js
const path = require('node:path');
const { sources, Compilation } = require('webpack');

class MiniCssExtractPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('MiniCssExtractPlugin', (compilation) => {
      // _MY_CSS_PLUGIN_MODULES 设置为空数组
      compilation._MY_CSS_PLUGIN_MODULES = [];
    });
  }

  static get loader() {
    return path.resolve(__dirname, './loaders/minicssLoader.js');
  }
}

module.exports = MiniCssExtractPlugin;
```

**第三步：处理 CSS 内容**

通过上面的步骤我们已经得到了 `compilation`，我们需要使用到 `processAssets` 这个钩子。

`stage` 我们使用 `PROCESS_ASSETS_STAGE_ADDITIONS`（新增和修改）。

得到通过 `css-loader` 转换的内容。

在 `processAssets` 得到 `css` 文件内容进行转换，然后创建新的文件内容，返回出去：

```js
compilation.hooks.processAssets.tap(
  {
    name: 'MiniCssExtractPlugin',
    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
  },
  () => {
    // 得到通过 css-loader 转换的内容
    const cssSources = compilation._MY_CSS_PLUGIN_MODULES.map((item) => {
      // item.content 是 css-loader 处理后的内容，需要提取出真正的 CSS
      const matchResult = item.content.match(/`(.*?)`/s);
      let content = matchResult ? matchResult[1] : '';
      return content;
    });

    // 得到 assets 文件夹的绝对路径
    const resourcePath = compilation._MY_CSS_PLUGIN_MODULES[0].identifier;
    const dirname = path.dirname(resourcePath.split('src')[1]);

    // 将这两个 css 文件内容拼接
    let cssContent = cssSources.join('\n');

    // 创建内容
    const RawSource = new sources.RawSource(cssContent);
    const filename = `${dirname}/main.css`;
    compilation.emitAsset(filename, RawSource);
  }
);
```

**第四步：配置插件和 Loader**

然后在 `webpack.config.js` 中新增这个插件和 `loader`：

```js
const MiniCssExtractPlugin = require('./plugins/MiniCssExtractPlugin');

module.exports = {
  // ...隐藏其余配置
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, // 新增 loader
          },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
  // 使用自定义插件
  plugins: [new MiniCssExtractPlugin()],
};
```

**第五步：验证效果**

然后打包查看结果：

![CSS提取效果](https://pic1.zhimg.com/80/v2-12ab36d2eb6cfb35a066ba7e59a2492c_1420w.png)

**第六步：集成 HTML 插件**

此时这个插件功能我们完善了 90%，还需要手动创建 `html` 文件然后引入这些文件，我们可以使用 `html-webpack-plugin`。

安装 `html-webpack-plugin`：

```shell
npm i html-webpack-plugin -D
```

在 `webpack.config.js` 引入：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // ...其他配置
  plugins: [new HtmlWebpackPlugin(), new MiniCssExtractPlugin()],
};
```

**第七步：处理子编译问题**

在 `MiniCssExtractPlugin.js` 中，我们需要在里面也使用这个插件，引入 css 文件内容。`HtmlWebpackPlugin` 提供了专门的钩子来做到这一点。

我们可以通过 `HtmlWebpackPlugin.getHooks(compilation)` 来获取它自己的一系列内部钩子：

`beforeAssetTagGeneration`：在 `HtmlWebpackPlugin` **即将生成** `<link>` 和 `<script>` 标签**之前**运行。这是我们把自己的 CSS 文件添加进去的绝佳时机。

`alterAssetTags`：在 `HtmlWebpackPlugin` **已经生成**了所有标签之后运行，允许我们对这些标签进行最后的修改、添加或删除。

```js
// 还是在 processAssets 这个 hook 里面
const HtmlWebpackPlugin = require('html-webpack-plugin');
const hooks = HtmlWebpackPlugin.getHooks(compilation);

hooks.beforeAssetTagGeneration.tapAsync(
  'MiniCssExtractPlugin', // 插件名，用于调试
  (data, cb) => {
    // 在这里添加我们自己的 CSS 文件
    data.assets.css.push(path.join('./', filename));
    // 完成后调用回调函数
    cb(null, data);
  }
);
```

**第八步：解决子编译问题**

然后启动运行打包，此时我们会发现控制台报错：**compilation._MY_CSS_PLUGIN_MODULES 是 undefined**。

![子编译错误](https://pica.zhimg.com/80/v2-a497fb25227ccd5163eacff26d8a7a3b_1420w.png)

**问题根源：**

Webpack 启动，开始**"主编译"**。此时，你的插件被激活，创建了 `compilation#1` 对象，并初始化了 `compilation#1._MY_CSS_PLUGIN_MODULES = []`。

在主编译过程中，你的 loader 正常运行，把所有 CSS 内容都添加到了 `compilation#1._MY_CSS_PLUGIN_MODULES` 数组里。

接着，`HtmlWebpackPlugin` 开始工作，它启动了一个**"子编译"**来处理 HTML 模板。

这个子编译创建了一个全新的 `compilation#2` 对象。你的插件代码也为它初始化了一个 `compilation#2._MY_CSS_PLUGIN_MODULES = []`。

**关键在于**：这个子编译过程**不会**去处理你项目里的 JS 和 CSS 模块，所以你的 loader **根本没有机会**向 `compilation#2` 的数组里添加任何东西。

最后，当子编译结束，运行到 `processAssets` 钩子时，你的代码读取的是 `compilation#2._MY_CSS_PLUGIN_MODULES`，它自然是空的，**所以报错**。

当你使用 `HtmlWebpackPlugin` 这类复杂的插件时，它为了处理自己的模板（比如把 JS 和 CSS 路径注入到 HTML 中），可能会在内部创建一个独立的、小型的 **"子编译"** 过程。

**解决办法：**

在 `compilation` 对象上我们使用 `compilation.compiler.isChild()` 这个方法来判断。

如果当前是子编译，`isChild()` 会返回 `true`。

如果当前是主编译，`isChild()` 会返回 `false`。

我们在获取 `compilation` 这个钩子去判断：

```js
compiler.hooks.compilation.tap('MiniCssExtractPlugin', (compilation) => {
  if (compilation.compiler.isChild()) {
    // 如果是子编译，就直接返回，不做任何事情
    return;
  }
  // ...其余逻辑
});
```

**第九步：最终验证**

然后我们再次打包就成功了，而且可以看见 HTML 文件正确引入了 CSS：

![最终效果](https://picx.zhimg.com/80/v2-542bc67dd15a596f29500c32c36fa4ef_1420w.png)

#### 完整代码

在 `MiniCssExtractPlugin.js` 中：

```js
const path = require('node:path');
const { sources, Compilation } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

class MiniCssExtractPlugin {
  apply(compiler) {
    // 获取 compilation
    compiler.hooks.compilation.tap('MiniCssExtractPlugin', (compilation) => {
      if (compilation.compiler.isChild()) {
        // 如果是子编译，就直接返回，不做任何事情
        return;
      }

      compilation._MY_CSS_PLUGIN_MODULES = [];

      // processAssets 执行逻辑
      compilation.hooks.processAssets.tap(
        {
          name: 'MiniCssExtractPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          // 得到通过 css-loader 转换的内容
          const cssSources = compilation._MY_CSS_PLUGIN_MODULES.map((item) => {
            const matchResult = item.content.match(/`(.*?)`/s);
            let content = matchResult ? matchResult[1] : '';
            return content;
          });

          // 得到 assets 文件夹的绝对路径
          const resourcePath = compilation._MY_CSS_PLUGIN_MODULES[0].identifier;
          const dirname = path.dirname(resourcePath.split('src')[1]);

          // 将这两个 css 文件内容拼接
          let cssContent = cssSources.join('\n');

          // 创建内容
          const RawSource = new sources.RawSource(cssContent);
          const filename = `${dirname}/main.css`;
          compilation.emitAsset(filename, RawSource);

          // 集成 HtmlWebpackPlugin
          const hooks = HtmlWebpackPlugin.getHooks(compilation);

          hooks.beforeAssetTagGeneration.tapAsync(
            'MiniCssExtractPlugin', // 插件名，用于调试
            (data, cb) => {
              // data 对象里包含了即将被处理的资源信息
              // 比如 data.assets.css 是一个包含所有 CSS 文件路径的数组

              // 在这里添加我们自己的 CSS 文件
              data.assets.css.push(path.join('./', filename)); 

              // 完成后调用回调函数
              cb(null, data);
            }
          );
        }
      );
    });
  }

  // 设置静态方法
  static get loader() {
    return path.resolve(__dirname, './loaders/minicssLoader.js');
  }
}

module.exports = MiniCssExtractPlugin;
```

## 总结

通过本文的学习，我们掌握了 Webpack 自定义插件的开发方法：

理解了插件的基本结构：插件是一个包含 `apply` 方法的类或对象。

掌握了 `compiler` 和 `compilation` 两个核心对象的区别和使用场景。

学会了如何使用各种钩子在 Webpack 编译的不同阶段介入。

通过多个实战案例，从简单到复杂，逐步深入理解了插件的开发流程。

理解了 `processAssets` 钩子的不同 stage 阶段及其应用场景。

学会了如何处理复杂场景，如子编译问题和与其他插件的集成。

掌握这些知识后，你就可以根据项目需求，开发出满足特定场景的自定义 Webpack 插件了。


> [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/%E8%87%AA%E5%AE%9A%E4%B9%89plguin)  