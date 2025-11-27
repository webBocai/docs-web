---
date: 2025-11-24 19:30:31
title: Rollup的使用
categories:
  - Rollup
coverImg: https://s1.imagehub.cc/images/2025/11/27/dd37352ccf3db5262fc971ffe3535e3f.jpeg
tags:
  - Rollup
permalink: /Rollup
---
# Rollup 完整实战教程 - 从零到生产环境

> 🎯 **适合人群**：前端开发者、想深入学习打包工具的工程师  
> ⏱️ **学习时长**：3-4 小时  
> 📦 **覆盖内容**：基础配置 → 库打包 → 商业项目 → 环境变量 → 热更新

---

## 📚 目录

1. [Rollup 基础入门](#1-rollup-基础入门)
2. [简单配置实战](#2-简单配置实战)
3. [库打包完整方案](#3-库打包完整方案)
4. [商业项目打包方案](#4-商业项目打包方案)
5. [核心插件详解](#5-核心插件详解)
6. [使用 SWC 替代 Babel](#6-使用-swc-替代-babel)
7. [环境变量管理](#7-环境变量管理)
8. [热更新与开发服务器](#8-热更新与开发服务器)

---

## 1. Rollup 基础入门

### 1.1 什么是 Rollup？

Rollup 是一个专注于 **ES Module** 的 JavaScript 打包工具，特别适合：

- ✅ **打包 JavaScript 库**（Vue、React、Day.js 都用它）
- ✅ **Tree Shaking 效果极佳**（自动删除未使用的代码）
- ✅ **配置简洁清晰**（比 Webpack 简单）
- ✅ **输出代码干净**（可读性强）

### 1.2 Rollup vs Webpack

| 特性 | Rollup | Webpack |
|------|--------|---------|
| **主要用途** | 库/组件打包 | 应用程序开发 |
| **配置复杂度** | ⭐⭐ 简洁 | ⭐⭐⭐⭐ 复杂 |
| **Tree Shaking** | ⭐⭐⭐⭐⭐ 原生支持 | ⭐⭐⭐ 需配置 |
| **打包速度** | ⭐⭐⭐⭐ 快 | ⭐⭐⭐ 中等 |
| **输出代码** | ⭐⭐⭐⭐⭐ 干净 | ⭐⭐⭐ 有运行时 |

### 1.3 安装 Rollup

```bash
# 创建项目
mkdir my-rollup-project
cd my-rollup-project
npm init -y

# 安装 Rollup（推荐局部安装）
npm install rollup -D
```

### 1.4 第一次打包

**创建源代码：**

```javascript
// src/main.js
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

console.log('加法：2 + 3 =', add(2, 3));
```

**命令行打包：**

```bash
# 打包为浏览器可用的 IIFE 格式
npx rollup src/main.js -f iife -o dist/bundle.js

# 打包为 ES Module 格式
npx rollup src/main.js -f es -o dist/bundle.esm.js

# 打包为 CommonJS 格式
npx rollup src/main.js -f cjs -o dist/bundle.cjs.js

# 打包为通用 UMD 格式（必须指定 name）
npx rollup src/main.js -f umd --name MyLib -o dist/bundle.umd.js
```

---

## 2. 简单配置实战

### 2.1 创建配置文件

在项目根目录创建 `rollup.config.js`：

```javascript
// rollup.config.js
export default {
  // 入口文件
  input: 'src/main.js',
  
  // 输出配置
  output: {
    file: 'dist/bundle.js',
    format: 'iife',        // 输出格式
    name: 'MyApp',         // UMD/IIFE 需要的全局变量名
    sourcemap: true        // 生成 source map
  }
};
```

**使用配置文件打包：**

```bash
npx rollup -c
```

### 2.2 输出格式详解

```javascript
// rollup.config.js
export default {
  input: 'src/main.js',
  output: [
    // 1. IIFE - 浏览器 <script> 标签直接使用
    {
      file: 'dist/bundle.iife.js',
      format: 'iife',
      name: 'MyApp'
    },
    
    // 2. ES Module - 现代浏览器或打包工具使用
    {
      file: 'dist/bundle.esm.js',
      format: 'es'
    },
    
    // 3. CommonJS - Node.js 使用
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs'
    },
    
    // 4. UMD - 通用格式（兼容所有环境）
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'MyApp'
    }
  ]
};
```

### 2.3 基础插件配置

```bash
# 安装基础插件
npm install @rollup/plugin-node-resolve @rollup/plugin-commonjs -D
```

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'MyApp'
  },
  plugins: [
    resolve(),    // 解析 node_modules 中的模块
    commonjs()    // 转换 CommonJS 为 ES Module
  ]
};
```

---
### 2.4 Rollup 5种输出格式全景对比
| **格式 (format)** | **核心运行环境**      | **是否必填 name** | **导入导出方式**             | **典型使用场景**                                        |
| ----------------- | --------------------- | ----------------- | ---------------------------- | ------------------------------------------------------- |
| **`iife`**        | 🌐 **浏览器**          | **✅ 必须**        | 全局变量 (`window.xxx`)      | 传统网页，通过 script 标签引入 JS                       |
| **`es`** / `esm`  | 🚀 **现代工具/浏览器** | ❌ 不需要          | `import` / `export`          | **开发库(Library)**，供 Webpack/Vite 二次打包           |
| **`cjs`**         | 🟢 **Node.js**         | ❌ 不需要          | `require` / `module.exports` | Node.js 后端服务，或老旧构建工具                        |
| **`umd`**         | 🦄 **通用 (全能)**     | **✅ 必须**        | 自动判断 (兼容所有)          | **开源库发布** (如 React, Vue, Lodash)，兼容 CDN 和 npm |
| **`amd`**         | 🍂 **浏览器 (旧)**     | ❌ 一般不需要      | `define` / `require`         | 维护使用 RequireJS 的古老项目                           |

 **注意**：看到上面这些打包格式，什么时候不需要 `name`？

1. 在以下**现代或纯后端**格式中，`name` 是**无效**（或者说没意义）的
2. **`esm` (ES Module)**: 浏览器通过 `<script type="module">` 引入，**不需要全局变量**，直接 `import`。
3. **`cjs` (CommonJS)**: `Node.js` 专用，通过 `require` 引入，**不需要全局变量**。

### 2.5 开启 Source Map（调试神器）

```javascript
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: true  // 👈 开启 Source Map
  }
};
```

**💡 Source Map 的作用：**

- 打包后的代码很难读
- `Source Map` 可以让浏览器显示原始代码
- 方便调试

#### 2.5.1 SourceMap 详细参数对比

| **值**         | **含义**                                                     | **对应 Webpack 的概念** | **适用场景**                                                 |
| -------------- | ------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------ |
| **`true`**     | **生成独立的 `.map` 文件**，并在 JS 底部添加注释指向它。     | `source-map`            | **生产环境/开发环境** (最常用)                               |
| **`'inline'`** | 不生成 `.map` 文件，而是把 map 数据通过 base64 编码 **直接写在 JS 文件底部**。 | `inline-source-map`     | **开发环境** (单文件调试方便)                                |
| **`'hidden'`** | 生成独立的 `.map` 文件，**但 JS 底部没有注释指向它**。浏览器控制台看不到源码，但你可以上传到 Sentry 等报错平台。 | `hidden-source-map`     | **生产环境** (如果你不想让别人F12看源码，但自己需要监控报错) |
| **`false`**    | 不生成 SourceMap。                                           | `false` (默认)          | 不需要调试时                                                 |



---

## 3. 库打包完整方案

### 3.1 工具库打包案例

**项目结构：**

```
my-utils-lib/
├── src/
│   ├── index.js          # 入口文件
│   ├── string.js         # 字符串工具
│   ├── array.js          # 数组工具
│   └── number.js         # 数字工具
├── package.json
├── rollup.config.js
└── README.md
```

**源代码示例：**

```javascript
// src/string.js
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function reverse(str) {
  return str.split('').reverse().join('');
}
```

```javascript
// src/array.js
export function unique(arr) {
  return [...new Set(arr)];
}

export function chunk(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}
```

```javascript
// src/index.js
export * from './string.js';
export * from './array.js';
export * from './number.js';
```

### 3.2 库打包配置

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',
  
  // 多格式输出
  output: [
    {
      file: 'dist/my-utils.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/my-utils.esm.js',
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/my-utils.umd.js',
      format: 'umd',
      name: 'MyUtils',
      sourcemap: true
    },
    {
      file: 'dist/my-utils.umd.min.js',
      format: 'umd',
      name: 'MyUtils',
      plugins: [terser()]  // 压缩版本
    }
  ],
  
  // 排除外部依赖（不打包进库）
  external: (id) => /node_modules/.test(id),
  
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env']
    })
  ]
};
```

### 3.3 package.json 配置

```json
{
  "name": "my-utils-lib",
  "version": "1.0.0",
  "description": "A simple utility library",
  "main": "dist/my-utils.cjs.js",
  "module": "dist/my-utils.esm.js",
  "browser": "dist/my-utils.umd.js",
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c -w"
  },
  "keywords": ["utils", "library"],
  "license": "MIT"
}
```

---

## 4. 商业项目打包方案

### 4.1 React 项目打包

**安装依赖：**

```bash
npm install react react-dom -S
npm install @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-babel @rollup/plugin-replace rollup-plugin-postcss -D
npm install @babel/core @babel/preset-env @babel/preset-react -D
```

**Babel 配置：**

```javascript
// babel.config.js
export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, not dead',
        modules: false  // 保持 ES Module
      }
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic'  // 自动导入 React
      }
    ]
  ]
};
```

**Rollup 配置：**

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.jsx',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'MyReactApp',
    sourcemap: !isProduction
  },
  plugins: [
    resolve({
      extensions: ['.js', '.jsx']
    }),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      preventAssignment: true
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx']
    }),
    postcss({
      extract: true,
      minimize: isProduction
    }),
    isProduction && terser()
  ]
};
```

### 4.2 Vue 项目打包

**安装依赖：**

```bash
npm install vue -S
npm install rollup-plugin-vue @vue/compiler-sfc @rollup/plugin-replace -D
```

**Rollup 配置：**

```javascript
// rollup.config.js
import vue from 'rollup-plugin-vue';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'MyVueApp'
  },
  plugins: [
    resolve(),
    commonjs(),
    vue({
      css: false  // CSS 由 postcss 处理
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    }),
    postcss({
      extract: true,
      extensions: ['.css', '.scss', '.less']
    })
  ]
};
```

### 4.3 TypeScript 项目打包

**安装依赖：**

```bash
npm install typescript @rollup/plugin-typescript tslib -D
```

**tsconfig.json：**

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "ESNext",
    "lib": ["ES2015", "DOM"],
    "jsx": "react",
    "declaration": true,
    "declarationDir": "dist/types",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Rollup 配置：**

```javascript
// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json'
    })
  ]
};
```

---

## 5. 核心插件详解

### 5.1 Babel 转换代码

**作用：** 将 ES6+ 代码转换为 ES5，支持旧浏览器。

**安装：**

```bash
npm install @rollup/plugin-babel @babel/core @babel/preset-env -D
```

**配置：**

```javascript
// rollup.config.js
import babel from '@rollup/plugin-babel';

export default {
  plugins: [
    babel({
      babelHelpers: 'bundled',     // 或 'runtime'
      exclude: 'node_modules/**',   // 不转换第三方库
      presets: [
        [
          '@babel/preset-env',
          {
            targets: '> 0.25%, not dead'
          }
        ]
      ]
    })
  ]
};
```

**babelHelpers 选项：**

- `bundled`: 将 helper 打包进输出文件（适合库）
- `runtime`: 使用 `@babel/runtime`（需额外安装，适合应用）
- `external`: helper 从外部引入

### 5.2 Terser 压缩代码

**作用：** 压缩 JavaScript 代码，减小文件体积。

**安装：**

```bash
npm install @rollup/plugin-terser -D
```

**配置：**

```javascript
// rollup.config.js
import terser from '@rollup/plugin-terser';

export default {
  plugins: [
    terser({
      compress: {
        drop_console: true,      // 删除 console
        drop_debugger: true,     // 删除 debugger
        pure_funcs: ['console.log']  // 删除特定函数
      },
      format: {
        comments: false          // 删除注释
      }
    })
  ]
};
```

### 5.3 PostCSS 处理 CSS

**作用：** 处理 CSS、Less、Sass，自动添加浏览器前缀。

**安装：**

```bash
npm install rollup-plugin-postcss postcss autoprefixer -D
npm install less sass -D  # 可选
```

**postcss.config.js：**

```javascript
export default {
  plugins: [
    require('autoprefixer')
  ]
};
```

**Rollup 配置：**

```javascript
// rollup.config.js
import postcss from 'rollup-plugin-postcss';

export default {
  plugins: [
    postcss({
      extract: true,              // 提取到单独文件
      minimize: true,             // 压缩 CSS
      extensions: ['.css', '.less', '.scss'],
      use: [
        ['less', { javascriptEnabled: true }],
        ['sass']
      ]
    })
  ]
};
```

**使用示例：**

```javascript
// src/index.js
import './styles/main.css';
import './styles/theme.less';
import './styles/app.scss';
```

### 5.4 处理图片资源

**安装：**

```bash
npm install @rollup/plugin-image -D
```

**配置：**

```javascript
// rollup.config.js
import image from '@rollup/plugin-image';

export default {
  plugins: [
    image()
  ]
};
```

**使用：**

```javascript
import logo from './assets/logo.png';

console.log(logo);  // base64 或路径
```

---

## 6. 使用 SWC 替代 Babel

### 6.1 为什么用 SWC？

SWC 是用 Rust 编写的超快速 JavaScript/TypeScript 编译器：

- ⚡ **速度快 20-70 倍**（比 Babel 快）
- 🎯 **功能齐全**（支持 TypeScript、JSX、压缩）
- 🔄 **完全兼容**（可替换 Babel + Terser）

### 6.2 安装 SWC 插件

```bash
npm install rollup-plugin-swc3 @swc/core -D
```

### 6.3 创建 .swcrc 配置

```json
{
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true,
      "decorators": false
    },
    "transform": {
      "react": {
        "runtime": "automatic"
      }
    },
    "target": "es2015"
  },
  "env": {
    "targets": {
      "chrome": "79",
      "firefox": "67",
      "safari": "12",
      "edge": "79"
    },
    "mode": "usage",
    "coreJs": 3
  },
  "minify": false
}
```

### 6.4 Rollup 配置

```javascript
// rollup.config.js
import { swc, minify } from 'rollup-plugin-swc3';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.tsx',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'MyApp',
    sourcemap: true
  },
  plugins: [
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    commonjs(),
    
    // SWC 编译（替代 Babel）
    swc({
      // 会自动读取 .swcrc
      // 或者直接在这里配置
    }),
    
    // SWC 压缩（替代 Terser）
    isProduction && minify({
      compress: {
        drop_console: true
      }
    })
  ]
};
```

### 6.5 完整示例（你的配置文件解析）

```javascript
// rollup.config.js
import { defineConfig } from 'rollup';
import { swc, minify, defineRollupSwcOption } from 'rollup-plugin-swc3';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import image from '@rollup/plugin-image';
import replace from '@rollup/plugin-replace';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import htmlTemplate from 'rollup-plugin-generate-html-template';

const isProduction = process.env.NODE_ENV === 'production';
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const plugins = [
  // 1. 解析 node_modules
  nodeResolve({ extensions }),
  
  // 2. 转换 CommonJS
  commonjs(),
  
  // 3. 注入环境变量
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    preventAssignment: true
  }),
  
  // 4. SWC 编译
  swc(
    defineRollupSwcOption({
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true
        },
        target: 'es2015'
      },
      env: {
        targets: { chrome: '79' },
        mode: 'usage',
        coreJs: 3
      }
    })
  ),
  
  // 5. 处理样式
  postcss({
    extensions: ['.css', '.less', '.scss'],
    extract: true,
    minimize: isProduction
  }),
  
  // 6. 处理图片
  image(),
  
  // 7. 生成 HTML
  htmlTemplate({
    template: './index.html',
    target: 'dist/index.html'
  })
];

// 生产环境：压缩
if (isProduction) {
  plugins.push(
    minify({
      compress: { drop_console: true }
    })
  );
}

// 开发环境：服务器 + 热更新
if (!isProduction) {
  plugins.push(
    serve({
      open: true,
      contentBase: './dist',
      port: 3000
    }),
    livereload('dist')
  );
}

export default defineConfig({
  input: './src/index.tsx',
  output: {
    file: './dist/build.js',
    format: 'umd',
    name: 'myApp',
    sourcemap: true
  },
  plugins
});
```

### 6.6 Babel vs SWC 性能对比

| 项目规模 | Babel 编译时间 | SWC 编译时间 | 提升 |
|---------|---------------|-------------|------|
| 小型（< 1000 行） | 2.5s | 0.4s | **6x** |
| 中型（< 10000 行） | 18s | 1.2s | **15x** |
| 大型（< 50000 行） | 95s | 4.5s | **21x** |

---

## 7. 环境变量管理

### 7.1 方式一：package.json 脚本

```json
{
  "scripts": {
    "dev": "NODE_ENV=development rollup -c -w",
    "build": "NODE_ENV=production rollup -c"
  }
}
```

**注意：** Windows 系统不支持 `NODE_ENV=xxx`，需要使用 `cross-env`：

```bash
npm install cross-env -D
```

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development rollup -c -w",
    "build": "cross-env NODE_ENV=production rollup -c"
  }
}
```

### 7.2 方式二：使用 .env 文件

**安装 dotenv：**

```bash
npm install dotenv -D
```

**创建环境变量文件：**

```bash
# .env.development
NODE_ENV=development
API_URL=http://localhost:3000
DEBUG=true
```

```bash
# .env.production
NODE_ENV=production
API_URL=https://api.example.com
DEBUG=false
```

**rollup.config.js 读取 .env：**

```javascript
// rollup.config.js
import dotenv from 'dotenv';
import replace from '@rollup/plugin-replace';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 根据 NODE_ENV 加载对应的 .env 文件
const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;

dotenv.config({
  path: resolve(__dirname, envFile)
});

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.API_URL': JSON.stringify(process.env.API_URL),
        'process.env.DEBUG': JSON.stringify(process.env.DEBUG)
      }
    })
  ]
};
```

**代码中使用：**

```javascript
// src/index.js
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', process.env.API_URL);
console.log('Debug:', process.env.DEBUG);

if (process.env.DEBUG === 'true') {
  console.log('Debug mode enabled');
}
```

### 7.3 方式三：封装环境变量插件

**创建 rollup-plugin-env.js：**

```javascript
// plugins/rollup-plugin-env.js
import dotenv from 'dotenv';
import { resolve } from 'path';

export default function envPlugin(options = {}) {
  const { envFile = '.env' } = options;
  
  return {
    name: 'env',
    buildStart() {
      // 加载 .env 文件
      const result = dotenv.config({ path: resolve(process.cwd(), envFile) });
      
      if (result.error) {
        console.warn(`Warning: ${envFile} file not found`);
      }
    }
  };
}
```

**使用自定义插件：**

```javascript
// rollup.config.js
import envPlugin from './plugins/rollup-plugin-env.js';
import replace from '@rollup/plugin-replace';

const env = process.env.NODE_ENV || 'development';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [
    envPlugin({ envFile: `.env.${env}` }),
    replace({
      preventAssignment: true,
      values: Object.entries(process.env).reduce((acc, [key, value]) => {
        if (key.startsWith('VITE_') || key === 'NODE_ENV') {
          acc[`process.env.${key}`] = JSON.stringify(value);
        }
        return acc;
      }, {})
    })
  ]
};
```

### 7.4 完整的多环境配置方案

**项目结构：**

```
project/
├── config/
│   ├── rollup.config.base.js    # 基础配置
│   ├── rollup.config.dev.js     # 开发配置
│   └── rollup.config.prod.js    # 生产配置
├── .env.development
├── .env.production
└── package.json
```

**config/rollup.config.base.js：**

```javascript
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { swc } from 'rollup-plugin-swc3';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.js',
  plugins: [
    resolve(),
    commonjs(),
    swc(),
    postcss({ extract: true })
  ]
};
```

**config/rollup.config.dev.js：**

```javascript
import baseConfig from './rollup.config.base.js';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import dotenv from 'dotenv';
import replace from '@rollup/plugin-replace';

dotenv.config({ path: '.env.development' });

export default {
  ...baseConfig,
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    ...baseConfig.plugins,
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    serve({ contentBase: 'dist', port: 3000 }),
    livereload('dist')
  ]
};
```

**config/rollup.config.prod.js：**

```javascript
import baseConfig from './rollup.config.base.js';
import { minify } from 'rollup-plugin-swc3';
import dotenv from 'dotenv';
import replace from '@rollup/plugin-replace';

dotenv.config({ path: '.env.production' });

export default {
  ...baseConfig,
  output: {
    file: 'dist/bundle.min.js',
    format: 'iife',
    sourcemap: false
  },
  plugins: [
    ...baseConfig.plugins,
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    minify({
      compress: { drop_console: true }
    })
  ]
};
```

**package.json：**

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development rollup -c config/rollup.config.dev.js -w",
    "build": "cross-env NODE_ENV=production rollup -c config/rollup.config.prod.js"
  }
}
```

---

## 8. 热更新与开发服务器

### 8.1 热更新实现原理

Rollup 的热更新通过两个插件实现：

1. **rollup-plugin-serve**：启动开发服务器
2. **rollup-plugin-livereload**：监听文件变化，自动刷新浏览器

**工作流程：**

```
文件变化 → Rollup 重新打包 → Livereload 通知浏览器 → 浏览器刷新
```

### 8.2 基础配置

**安装插件：**

```bash
npm install rollup-plugin-serve rollup-plugin-livereload -D
```

**rollup.config.dev.js：**

```javascript
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    // 开发服务器
    serve({
      open: true,              // 自动打开浏览器
      contentBase: ['dist'],   // 服务器根目录
      host: 'localhost',
      port: 3000,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }),
    
    // 热更新
    livereload({
      watch: 'dist',           // 监听目录
      verbose: true            // 显示详细日志
    })
  ],
  
  // 监听模式配置
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  }
};
```

**启动开发服务器：**

```bash
npx rollup -c rollup.config.dev.js -w
```

### 8.3 高级配置

**支持 HMR（热模块替换）：**

```javascript
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    serve({
      open: true,
      contentBase: ['dist', 'public'],
      port: 3000,
      
      // 代理配置
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      
      // 自定义中间件
      middleware: (req, res, next) => {
        console.log(`[${req.method}] ${req.url}`);
        next();
      }
    }),
    
    livereload({
      watch: ['dist', 'public'],
      delay: 300,              // 延迟刷新
      verbose: false
    })
  ],
  
  watch: {
    include: 'src/**',
    clearScreen: false         // 不清空控制台
  }
};
```

### 8.4 监听模式详解

**watch 配置选项：**

```javascript
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  
  watch: {
    // 包含的文件
    include: 'src/**/*.{js,jsx,ts,tsx,vue}',
    
    // 排除的文件
    exclude: 'node_modules/**',
    
    // 清空控制台
    clearScreen: false,
    
    // 跳过写入磁盘（用于测试）
    skipWrite: false,
    
    // 不显示构建时间
    buildDelay: 0,
    
    // 监听配置文件变化
    chokidar: {
      usePolling: false,       // 使用轮询（性能较差）
      interval: 100,           // 轮询间隔
      binaryInterval: 300,     // 二进制文件轮询间隔
      ignoreInitial: true,     // 忽略初始添加事件
      persistent: true         // 持续监听
    }
  }
};
```

### 8.5 实现自定义热更新插件

```javascript
// plugins/rollup-plugin-hmr.js
export default function hmr() {
  return {
    name: 'hmr',
    
    // 生成代码时注入 HMR 代码
    generateBundle(options, bundle) {
      const hmrCode = `
        if (module.hot) {
          module.hot.accept((newModule) => {
            console.log('Module updated:', newModule);
            location.reload();
          });
        }
      `;
      
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk') {
          chunk.code += hmrCode;
        }
      }
    },
    
    // 监听文件变化
    watchChange(id) {
      console.log(`File changed: ${id}`);
    }
  };
}
```

**使用自定义插件：**

```javascript
import hmr from './plugins/rollup-plugin-hmr.js';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [
    hmr()
  ]
};
```

### 8.6 完整的开发环境配置

```javascript
// rollup.config.dev.js
import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { swc } from 'rollup-plugin-swc3';
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import replace from '@rollup/plugin-replace';
import htmlTemplate from 'rollup-plugin-generate-html-template';
import dotenv from 'dotenv';

// 加载开发环境变量
dotenv.config({ path: '.env.development' });

export default defineConfig({
  input: 'src/index.js',
  
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'App',
    sourcemap: true
  },
  
  plugins: [
    // 解析模块
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    
    // 转换 CommonJS
    commonjs(),
    
    // 环境变量注入
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify('development'),
        'process.env.API_URL': JSON.stringify(process.env.API_URL)
      }
    }),
    
    // SWC 编译
    swc({
      jsc: {
        parser: { syntax: 'typescript', tsx: true }
      }
    }),
    
    // 处理样式
    postcss({
      extract: true,
      sourceMap: true
    }),
    
    // 生成 HTML
    htmlTemplate({
      template: 'public/index.html',
      target: 'dist/index.html'
    }),
    
    // 开发服务器
    serve({
      open: true,
      contentBase: ['dist', 'public'],
      host: 'localhost',
      port: 3000,
      proxy: {
        '/api': 'http://localhost:8080'
      }
    }),
    
    // 热更新
    livereload({
      watch: 'dist',
      verbose: true
    })
  ],
  
  // 监听配置
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**',
    clearScreen: false
  }
});
```

### 8.7 开发服务器 vs Vite

| 特性 | Rollup + Serve | Vite |
|------|---------------|------|
| **启动速度** | ⭐⭐⭐ 较快 | ⭐⭐⭐⭐⭐ 极快 |
| **HMR 速度** | ⭐⭐⭐ 完整重构 | ⭐⭐⭐⭐⭐ 模块级 |
| **配置复杂度** | ⭐⭐⭐ 需要配置 | ⭐⭐⭐⭐ 零配置 |
| **适用场景** | 库/组件开发 | 现代应用开发 |

---

## 9. 实战案例汇总

### 9.1 打包 React + TypeScript 库

```javascript
// rollup.config.js
import { defineConfig } from 'rollup';
import { swc } from 'rollup-plugin-swc3';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  input: 'src/index.ts',
  
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
  
  external: ['react', 'react-dom'],
  
  plugins: [
    resolve({ extensions: ['.ts', '.tsx'] }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    swc({
      jsc: {
        parser: { syntax: 'typescript', tsx: true },
        transform: {
          react: { runtime: 'automatic' }
        }
      }
    }),
    postcss({ extract: 'styles.css' })
  ]
});
```

### 9.2 打包 Vue 3 组件库

```javascript
// rollup.config.js
import { defineConfig } from 'rollup';
import vue from 'rollup-plugin-vue';
import { swc } from 'rollup-plugin-swc3';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';

export default defineConfig({
  input: 'src/index.js',
  
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'es'
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'MyVueComponents',
      globals: { vue: 'Vue' }
    }
  ],
  
  external: ['vue'],
  
  plugins: [
    resolve(),
    commonjs(),
    vue({ css: false }),
    swc(),
    postcss({
      extract: 'styles.css',
      extensions: ['.css', '.scss', '.less']
    })
  ]
});
```

### 9.3 多入口打包

```javascript
// rollup.config.js
import { defineConfig } from 'rollup';

export default defineConfig({
  input: {
    main: 'src/main.js',
    utils: 'src/utils.js',
    components: 'src/components/index.js'
  },
  
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: '[name].js',
    chunkFileNames: 'chunks/[name]-[hash].js'
  },
  
  plugins: [
    // ... 插件配置
  ]
});
```

---

## 10. 常见问题与解决方案

### 10.1 `process is not defined`

**问题：** 代码中使用了 Node.js 的 `process` 对象。

**解决方案：**

```javascript
import replace from '@rollup/plugin-replace';

export default {
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    })
  ]
};
```

### 10.2 CSS 未正确打包

**问题：** CSS 没有被提取或打包。

**解决方案：**

```javascript
import postcss from 'rollup-plugin-postcss';

export default {
  plugins: [
    postcss({
      extract: true,           // 必须设置
      minimize: true,
      extensions: ['.css', '.less', '.scss']
    })
  ]
};
```

### 10.3 第三方库打包体积过大

**问题：** 第三方库被完整打包进输出文件。

**解决方案：**

```javascript
export default {
  external: (id) => /node_modules/.test(id)  // 排除所有第三方库
};
```

### 10.4 TypeScript 类型声明未生成

**问题：** 打包后没有 `.d.ts` 文件。

**解决方案：**

```javascript
import typescript from '@rollup/plugin-typescript';

export default {
  plugins: [
    typescript({
      declaration: true,
      declarationDir: 'dist/types'
    })
  ]
};
```

---

## 11. 最佳实践总结

### 11.1 库开发建议

1. **多格式输出**：同时生成 CJS、ESM、UMD 格式
2. **排除依赖**：使用 `external` 排除第三方库
3. **生成类型声明**：TypeScript 项目必须生成 `.d.ts`
4. **配置 package.json**：正确配置 `main`、`module`、`types` 字段

### 11.2 应用开发建议

1. **使用 SWC**：替代 Babel 提升编译速度
2. **配置环境变量**：使用 `.env` 文件管理配置
3. **开启 Source Map**：方便调试
4. **代码分割**：多入口打包减小单文件体积

### 11.3 性能优化

1. **使用 ES Module 版本的库**：如 `lodash-es` 代替 `lodash`
2. **开启 Tree Shaking**：自动删除未使用代码
3. **压缩代码**：生产环境使用 `minify`
4. **缓存优化**：合理配置 `watch` 选项

---

## 12. 学习资源

### 官方文档
- [Rollup 官方文档](https://rollupjs.org/)
- [Rollup 插件列表](https://github.com/rollup/awesome)

### 推荐阅读
- [Vue 3 源码构建配置](https://github.com/vuejs/core/blob/main/rollup.config.js)
- [React 构建配置](https://github.com/facebook/react)
- [Vite 源码](https://github.com/vitejs/vite)

### 实战项目
- 开发一个工具库并发布到 npm
- 打包一个 React/Vue 组件库
- 搭建自己的脚手架工具

---

