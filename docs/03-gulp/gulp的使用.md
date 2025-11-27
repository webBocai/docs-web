---
date: 2025-11-22 15:10:31
title: Gulp的使用
categories:
  - Gulp
coverImg: https://s3.bmp.ovh/imgs/2025/11/25/39beab07b1d89887.gif
tags:
  - Gulp
permalink: /Gulp
---
# Gulp 自动化构建工具完整指南

## 目录

1. [Gulp 基础概念](#一gulp-基础概念)
2. [Gulp 安装与配置](#二gulp-安装与配置)
3. [编写 Gulp 任务](#三编写-gulp-任务)
4. [任务组合](#四任务组合)
5. [文件操作](#五文件操作)
6. [Gulp 插件系统](#六gulp-插件系统)
7. [完整案例演练](#七完整案例演练)
8. [开发与构建任务](#八开发与构建任务)
9. [Gulp 5 新特性](#九gulp-5-新特性)

---

## 一、Gulp 基础概念

### 1.1 什么是 Gulp？

Gulp 是一个工具包（A toolkit to automate & enhance your workflow），可以帮助你：
- 自动化重复性任务
- 增强开发工作流
- 基于 Node.js 流（Stream）进行文件处理

### 1.2 核心理念

**Gulp 的核心：Task Runner（任务执行器）**
- 定义一系列任务
- 等待任务被执行
- 基于文件 Stream 的构建流
- 使用插件体系完成各种任务

### 1.3 Gulp vs Webpack

| 特性 | Gulp | Webpack |
|------|------|---------|
| 核心理念 | Task Runner（任务执行器） | Module Bundler（模块打包器） |
| 主要用途 | 自动化任务 | 模块化打包 |
| 学习曲线 | 简单、易用 | 相对复杂 |
| 适用场景 | 自动化任务、小型项目 | 大型项目（Vue/React/Angular） |
| 模块化支持 | 默认不支持 | 原生支持 |

**何时使用 Gulp？**
- 编写自动化任务（压缩、编译、测试等）
- 简单的构建流程
- 需要灵活控制构建过程

**何时使用 Webpack？**
- 大型单页应用
- 需要模块化管理
- 复杂的依赖关系

---

## 二、Gulp 安装与配置

### 2.1 安装 Gulp

```bash
# 全局安装（可选，用于命令行）
npm install gulp-cli -g

# 项目中局部安装（必需）
npm install gulp --save-dev
```

### 2.2 项目结构

```
my-project/
├── src/                    # 源代码目录
│   ├── js/                # JavaScript 文件
│   ├── css/               # 样式文件
│   ├── less/              # Less 文件
│   └── index.html         # HTML 文件
├── dist/                   # 构建输出目录
├── gulpfile.js            # Gulp 配置文件
└── package.json           # 项目配置
```

### 2.3 创建 gulpfile.js

```javascript
// gulpfile.js
const gulp = require('gulp');

// 导出任务
exports.default = function(cb) {
  console.log('Hello Gulp!');
  cb();
};
```

### 2.4 执行任务

```bash
# 执行默认任务
npx gulp

# 或者使用全局安装的 gulp
gulp

# 执行指定任务
npx gulp taskName
```

---

## 三、编写 Gulp 任务

### 3.1 任务的基本结构

每个 Gulp 任务都是一个**异步 JavaScript 函数**，有以下几种方式表示任务完成：

#### 方式 1：使用 callback

```javascript
function task1(cb) {
  console.log('任务1执行');
  cb(); // 调用 callback 表示任务完成
}

exports.task1 = task1;
```

#### 方式 2：返回 Stream

```javascript
function task2() {
  return gulp.src('src/*.js')
    .pipe(gulp.dest('dist/'));
}

exports.task2 = task2;
```

#### 方式 3：返回 Promise

```javascript
function task3() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('任务3执行');
      resolve();
    }, 1000);
  });
}

exports.task3 = task3;
```

#### 方式 4：使用 async/await

```javascript
async function task4() {
  const result = await someAsyncOperation();
  console.log('任务4执行', result);
}

exports.task4 = task4;
```

### 3.2 公开任务 vs 私有任务

**公开任务（Public Tasks）**
- 从 gulpfile 中被导出（export）
- 可以通过 gulp 命令直接调用

```javascript
function publicTask(cb) {
  console.log('这是公开任务');
  cb();
}

// 导出为公开任务
exports.publicTask = publicTask;
```

**私有任务（Private Tasks）**
- 不导出的任务
- 通常作为 series() 或 parallel() 的组成部分

```javascript
// 私有任务（不导出）
function privateTask(cb) {
  console.log('这是私有任务');
  cb();
}

// 在组合中使用
exports.build = gulp.series(privateTask, publicTask);
```

### 3.3 默认任务

```javascript
// 方式1：使用 default 导出
exports.default = function(cb) {
  console.log('执行默认任务');
  cb();
};

// 方式2：定义后导出
function defaultTask(cb) {
  console.log('默认任务');
  cb();
}

exports.default = defaultTask;
```

执行：
```bash
npx gulp  # 不需要指定任务名
```

### 3.4 Gulp 3.x vs Gulp 4.x 任务注册

**Gulp 3.x（已废弃）：**
```javascript
// 旧版本使用 gulp.task()
gulp.task('taskName', function() {
  // 任务代码
});
```

**Gulp 4.x（推荐）：**
```javascript
// 新版本使用导出
function taskName(cb) {
  // 任务代码
  cb();
}

exports.taskName = taskName;
```

---

## 四、任务组合

### 4.1 series() - 串行执行

任务按顺序依次执行，前一个任务完成后才执行下一个。

```javascript
const { series } = require('gulp');

function clean(cb) {
  console.log('1. 清理目录');
  cb();
}

function compile(cb) {
  console.log('2. 编译代码');
  cb();
}

function build(cb) {
  console.log('3. 构建项目');
  cb();
}

// 串行执行：clean -> compile -> build
exports.build = series(clean, compile, build);
```

执行结果：
```
1. 清理目录
2. 编译代码
3. 构建项目
```

### 4.2 parallel() - 并行执行

多个任务同时执行，提高效率。

```javascript
const { parallel } = require('gulp');

function css(cb) {
  console.log('处理 CSS');
  setTimeout(cb, 1000);
}

function js(cb) {
  console.log('处理 JavaScript');
  setTimeout(cb, 1000);
}

function images(cb) {
  console.log('处理图片');
  setTimeout(cb, 1000);
}

// 并行执行：css、js、images 同时运行
exports.assets = parallel(css, js, images);
```

### 4.3 嵌套组合

可以组合 series 和 parallel 创建复杂的任务流。

```javascript
const { series, parallel } = require('gulp');

function clean(cb) {
  console.log('清理');
  cb();
}

function cssTask(cb) {
  console.log('处理 CSS');
  cb();
}

function jsTask(cb) {
  console.log('处理 JS');
  cb();
}

function htmlTask(cb) {
  console.log('处理 HTML');
  cb();
}

function deploy(cb) {
  console.log('部署');
  cb();
}

// 复杂的任务组合
// 1. 先清理
// 2. 并行处理 CSS、JS、HTML
// 3. 最后部署
exports.build = series(
  clean,
  parallel(cssTask, jsTask, htmlTask),
  deploy
);
```

执行流程：
```
清理
↓
(并行)
├─ 处理 CSS
├─ 处理 JS
└─ 处理 HTML
↓
部署
```

### 4.4 实际案例：完整构建流程

```javascript
const { series, parallel } = require('gulp');

// 清理构建目录
function cleanDist(cb) {
  // 删除 dist 目录
  cb();
}

// 编译 Less
function compileLess(cb) {
  // Less -> CSS
  cb();
}

// 转译 JavaScript
function transpileJS(cb) {
  // ES6+ -> ES5
  cb();
}

// 压缩图片
function optimizeImages(cb) {
  // 图片优化
  cb();
}

// 复制 HTML
function copyHTML(cb) {
  // 复制 HTML 文件
  cb();
}

// 启动开发服务器
function serve(cb) {
  // 启动 browser-sync
  cb();
}

// 监听文件变化
function watchFiles() {
  // 监听文件
}

// 开发任务：清理 -> 编译 -> 启动服务器 + 监听
exports.dev = series(
  cleanDist,
  parallel(compileLess, transpileJS, copyHTML),
  parallel(serve, watchFiles)
);

// 构建任务：清理 -> 编译 + 优化
exports.build = series(
  cleanDist,
  parallel(compileLess, transpileJS, optimizeImages, copyHTML)
);
```

---

## 五、文件操作

### 5.1 核心 API

Gulp 暴露了两个核心方法处理文件：

- **gulp.src()** - 读取文件
- **gulp.dest()** - 写入文件

### 5.2 gulp.src() - 读取文件

`src()` 方法从文件系统读取文件，生成 Node.js 流（Stream）。

```javascript
const gulp = require('gulp');

function copyFiles() {
  // 读取 src 目录下的所有 js 文件
  return gulp.src('src/*.js')
    .pipe(gulp.dest('dist/'));
}

exports.copy = copyFiles;
```

**工作原理：**
1. 接受 glob 模式作为参数
2. 匹配文件系统中的文件
3. 将文件读取到内存
4. 生成 Node.js Stream
5. 通过流进行处理

### 5.3 gulp.dest() - 写入文件

`dest()` 方法接受输出目录，将流中的内容写入文件。

```javascript
function buildJS() {
  return gulp.src('src/js/**/*.js')
    .pipe(gulp.dest('dist/js/'));  // 输出到 dist/js
}
```

### 5.4 .pipe() 方法

`pipe()` 是流的核心方法，用于连接处理步骤。

```javascript
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const rename = require('gulp-rename');

function processJS() {
  return gulp.src('src/js/*.js')
    .pipe(babel())              // 1. ES6 转 ES5
    .pipe(terser())             // 2. 压缩代码
    .pipe(rename({ suffix: '.min' }))  // 3. 重命名
    .pipe(gulp.dest('dist/js'));       // 4. 输出
}
```

**pipe() 工作原理：**
```
读取文件
  ↓
[转换流1] → [转换流2] → [转换流3] → 写入文件
```

### 5.5 Glob 文件匹配模式

#### 基本语法

| 模式 | 说明 | 示例 |
|------|------|------|
| `*` | 匹配任意字符（不包括 `/`） | `src/*.js` - src 下所有 js 文件 |
| `**` | 匹配任意目录 | `src/**/*.js` - src 下所有子目录的 js 文件 |
| `!` | 排除文件 | `['src/**/*.js', '!src/lib/**']` |
| `?` | 匹配单个字符 | `src/app?.js` |
| `[...]` | 匹配字符范围 | `src/app[0-9].js` |
| `{...}` | 匹配多个模式 | `src/**/*.{js,css}` |

#### 详细示例

```javascript
// 示例 1：匹配单个目录下的文件
gulp.src('src/*.js')
// 匹配：src/app.js, src/main.js
// 不匹配：src/utils/helper.js

// 示例 2：匹配所有子目录
gulp.src('src/**/*.js')
// 匹配：src/app.js, src/utils/helper.js, src/components/Header.js

// 示例 3：排除文件
gulp.src(['src/**/*.js', '!src/**/*.test.js'])
// 匹配所有 js，但排除测试文件

// 示例 4：匹配多种文件类型
gulp.src('src/**/*.{js,css,html}')
// 匹配所有 js、css、html 文件

// 示例 5：复杂组合
gulp.src([
  'src/**/*.js',           // 包含所有 js
  '!src/vendor/**',        // 排除 vendor 目录
  '!src/**/*.test.js',     // 排除测试文件
  'src/vendor/jquery.js'   // 但包含 jquery
])
```

#### 注意事项

1. **取反 glob 必须跟在非取反 glob 后面**
```javascript
// ✅ 正确
gulp.src(['src/**/*.js', '!src/vendor/**'])

// ❌ 错误
gulp.src(['!src/vendor/**', 'src/**/*.js'])
```

2. **至少匹配一个文件**
```javascript
// 如果没有匹配到文件，会报错
gulp.src('src/nonexistent/*.js')  // Error!
```

3. **路径分隔符**
```javascript
// 始终使用正斜杠 /，即使在 Windows 上
gulp.src('src/js/**/*.js')  // ✅
gulp.src('src\\js\\**\\*.js')  // ❌
```

### 5.6 文件操作完整案例

```javascript
const gulp = require('gulp');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

// 案例1：简单复制
function copyHTML() {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist/'));
}

// 案例2：处理 JavaScript
function buildJS() {
  return gulp.src('src/js/**/*.js')
    .pipe(sourcemaps.init())           // 初始化 sourcemap
    .pipe(babel({                      // ES6 -> ES5
      presets: ['@babel/preset-env']
    }))
    .pipe(terser())                    // 压缩
    .pipe(rename({ suffix: '.min' }))  // 重命名
    .pipe(sourcemaps.write('.'))       // 写入 sourcemap
    .pipe(gulp.dest('dist/js/'));
}

// 案例3：处理多种文件
function buildAssets() {
  return gulp.src([
    'src/**/*.{js,css,html}',
    '!src/**/*.test.js'
  ])
  .pipe(gulp.dest('dist/'));
}

// 案例4：保持目录结构
function preserveStructure() {
  return gulp.src('src/**/*.js', { base: 'src' })
    .pipe(gulp.dest('dist/'));
}
// 如果 src/components/Header.js
// 输出为 dist/components/Header.js

exports.copy = copyHTML;
exports.js = buildJS;
exports.assets = buildAssets;
exports.preserve = preserveStructure;
```

### 5.7 文件监听 - watch()

`watch()` 方法监听文件变化，自动执行任务。

```javascript
const { watch, series } = require('gulp');

// 任务定义
function buildJS(cb) {
  console.log('构建 JS');
  cb();
}

function buildCSS(cb) {
  console.log('构建 CSS');
  cb();
}

// 监听文件变化
function watchFiles() {
  // 监听 JS 文件
  watch('src/js/**/*.js', buildJS);
  
  // 监听 CSS 文件
  watch('src/css/**/*.css', buildCSS);
  
  // 监听多种文件
  watch(['src/**/*.js', 'src/**/*.css'], 
    series(buildJS, buildCSS)
  );
}

exports.watch = watchFiles;
```

**高级监听配置：**

```javascript
function advancedWatch() {
  // 配置选项
  watch('src/**/*.js', {
    ignored: ['src/**/*.test.js'],  // 忽略文件
    delay: 500,                      // 延迟执行（防抖）
    ignoreInitial: false             // 是否执行初始任务
  }, buildJS);
  
  // 监听事件
  const watcher = watch('src/**/*.js');
  
  watcher.on('change', function(path) {
    console.log(`文件 ${path} 已修改`);
  });
  
  watcher.on('add', function(path) {
    console.log(`文件 ${path} 已添加`);
  });
  
  watcher.on('unlink', function(path) {
    console.log(`文件 ${path} 已删除`);
  });
}

exports.advancedWatch = advancedWatch;
```

---

## 六、Gulp 插件系统

### 6.1 常用插件分类

#### HTML 处理
- `gulp-htmlmin` - HTML 压缩
- `gulp-inject` - 注入资源引用

#### CSS/样式处理
- `gulp-less` - 编译 Less
- `gulp-sass` - 编译 Sass
- `gulp-postcss` - PostCSS 处理
- `gulp-autoprefixer` - 自动添加浏览器前缀
- `gulp-clean-css` - CSS 压缩

#### JavaScript 处理
- `gulp-babel` - ES6+ 转译
- `gulp-uglify` - JS 压缩（ES5 **已弃用**）
- `gulp-terser` - JS 压缩（ES6+）
- `gulp-concat` - 文件合并

#### 图片处理
- `gulp-imagemin` - 图片压缩优化

#### 工具类
- `gulp-rename` - 文件重命名
- `gulp-sourcemaps` - 生成 sourcemap
- `del` - 删除文件
- `browser-sync` - 开发服务器 + 热更新

### 6.2 插件使用详解

#### 6.2.1 gulp-htmlmin - HTML 压缩

```javascript
const htmlmin = require('gulp-htmlmin');

function buildHTML() {
  return gulp.src('src/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,        // 压缩空格
      removeComments: true,             // 删除注释
      minifyJS: true,                   // 压缩HTML中的JS
      minifyCSS: true,                  // 压缩HTML中的CSS
      removeEmptyAttributes: true,      // 删除空属性
      removeAttributeQuotes: true       // 删除属性引号
    }))
    .pipe(gulp.dest('dist/'));
}
```

#### 6.2.2 gulp-babel - ES6+ 转译

```javascript
const babel = require('gulp-babel');

function transpileJS() {
  return gulp.src('src/js/**/*.js')
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(gulp.dest('dist/js/'));
}
```

#### 6.2.3 gulp-terser - 现代 JS 压缩

```javascript
const terser = require('gulp-terser');

function compressJS() {
  return gulp.src('src/js/**/*.js')
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(terser({
      compress: {
        drop_console: true,    // 删除 console
        drop_debugger: true    // 删除 debugger
      }
    }))
    .pipe(gulp.dest('dist/js/'));
}
```

#### 6.2.4 gulp-less - Less 编译

```javascript
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

function compileLess() {
  return gulp.src('src/less/**/*.less')
    .pipe(less())                    // Less -> CSS
    .pipe(autoprefixer({            // 添加浏览器前缀
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS())               // 压缩 CSS
    .pipe(gulp.dest('dist/css/'));
}
```

#### 6.2.5 gulp-inject - 资源注入

```javascript
const inject = require('gulp-inject');

function injectAssets() {
  // 定义要注入的文件
  const sources = gulp.src([
    'dist/js/**/*.js',
    'dist/css/**/*.css'
  ], { read: false });

  return gulp.src('src/index.html')
    .pipe(inject(sources, {
      relative: true,              // 使用相对路径
      ignorePath: 'dist',          // 忽略路径前缀
      addRootSlash: false
    }))
    .pipe(gulp.dest('dist/'));
}
```

HTML 模板：
```html
<!DOCTYPE html>
<html>
<head>
  <!-- inject:css -->
  <!-- endinject -->
</head>
<body>
  <!-- inject:js -->
  <!-- endinject -->
</body>
</html>
```

生成结果：
```html
<!DOCTYPE html>
<html>
<head>
  <!-- inject:css -->
  <link rel="stylesheet" href="css/style.css">
  <!-- endinject -->
</head>
<body>
  <!-- inject:js -->
  <script src="js/app.js"></script>
  <!-- endinject -->
</body>
</html>
```

#### 6.2.6 del - 删除文件

```javascript
const { deleteAsync,deleteSync } = require('del');

function clean() {
  return deleteSync(['dist/**', '!dist']);  // 删除 dist 目录内容，保留目录
}
// 异步方法
// function async clean() {
  // return await deleteAsync(['dist/**', '!dist']);  // 删除 dist 目录内容，保留目录
// }

// 或者使用回调
function cleanWithCallback(cb) {
  deleteAsync(['dist/**']).then(() => {
    cb();
  });
}
```

#### 6.2.7 browser-sync - 开发服务器

```javascript
const browserSync = require('browser-sync').create();

function serve(cb) {
  browserSync.init({
    server: {
      baseDir: './dist'      // 服务器根目录
    },
    port: 3000,              // 端口
    open: true,              // 自动打开浏览器
    notify: false            // 不显示通知
  });
  cb();
}

function reload(cb) {
  browserSync.reload();      // 刷新浏览器
  cb();
}
```
#### 6.2.8 gulp-if - 判断是否执行该流

```js
var gulpif = require('gulp-if');
var terser = require('gulp-terser');
 
var isTerser = true; // TODO: add business logic
 
gulp.task('task', function() {
  gulp.src('./src/*.js')
    .pipe(gulpif(isTerser, terser()))
    .pipe(gulp.dest('./dist/'));
});
```

##### 6.2.9 gulp-sourcemaps-源码映射

- gulp里面的`soucemap ` 没有 `webpack`功能那么全
- `sourcemaps.write()` 里面方法有值的话是两种情况
  1. 没有值：生成内联 `Source Map`（减少 `HTTP `请求，但文件体积大）。
  2. **传 `'.'`**：生成外部 `.map` 文件，map文件与源文件放在一起（减小 `JS` 体积，浏览器只有在开发者工具打开时**才会去加载 map 文件**）。
  3. **传 `'./maps'`**：放在一个单独的`maps`文件夹中

````js
var gulp = require('gulp');
// 插件1
var plugin1 = require('gulp-plugin1');
// 插件2
var plugin2 = require('gulp-plugin2');
var sourcemaps = require('gulp-sourcemaps');
 
function javascript() {
  gulp.src('src/**/*.js')
     // —— 按下“录制”键
    .pipe(sourcemaps.init())
      .pipe(plugin1())
      .pipe(plugin2())
    // 按下“停止并保存”键
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
};
 
exports.javascript = javascript;
````



**注意**：[更多插件可以查看官网](https://gulpjs.com/plugins/)


---



## 七、完整案例演练

### 7.1 项目结构

```
gulp-project/
├── src/
│   ├── index.html
│   ├── js/
│   │   ├── app.js
│   │   └── utils.js
│   ├── less/
│   │   ├── style.less
│   │   └── variables.less
│   └── images/
│       └── logo.png
├── dist/                   # 构建输出
├── gulpfile.js
└── package.json
```

### 7.2 安装依赖

```bash
npm install --save-dev gulp \
  gulp-htmlmin \
  gulp-babel @babel/core @babel/preset-env \
  gulp-terser \
  gulp-less \
  gulp-autoprefixer \
  gulp-clean-css \
  gulp-inject \
  gulp-rename \
  gulp-sourcemaps \
  gulp-imagemin \
  browser-sync \
  del
```

### 7.3 完整 gulpfile.js

```javascript
const { src, dest, watch, series, parallel } = require('gulp');
const htmlmin = require('gulp-htmlmin');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const inject = require('gulp-inject');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const del = require('del');

// ========== 路径配置 ==========
const paths = {
  html: {
    src: 'src/**/*.html',
    dest: 'dist/'
  },
  js: {
    src: 'src/js/**/*.js',
    dest: 'dist/js/'
  },
  less: {
    src: 'src/less/**/*.less',
    dest: 'dist/css/'
  },
  images: {
    src: 'src/images/**/*',
    dest: 'dist/images/'
  }
};

// ========== 清理任务 ==========
function clean() {
  return del(['dist/**', '!dist']);
}

// ========== JavaScript 处理 ==========
function buildJS() {
  return src(paths.js.src)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(terser({
      compress: {
        drop_console: true
      }
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.js.dest));
}

// ========== Less 处理 ==========
function buildLess() {
  return src(paths.less.src)
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.less.dest));
}

// ========== 图片处理 ==========
function buildImages() {
  return src(paths.images.src)
    .pipe(imagemin())
    .pipe(dest(paths.images.dest));
}

// ========== HTML 资源注入 ==========
function injectHTML() {
  const sources = src([
    'dist/js/**/*.js',
    'dist/css/**/*.css'
  ], { read: false });

  return src('dist/index.html')
    .pipe(inject(sources, {
      relative: true,
      ignorePath: 'dist',
      addRootSlash: false
    })).pipe(
      htmlmin({
        removeComments: true, // 这里可以开启删除注释了，因为注入已经结束
        collapseWhitespace: true, // 压缩空格
        minifyJS: true, // 顺便压缩一下内联 JS (如果有)
        minifyCSS: true, // 顺便压缩一下内联 CSS (如果有)
      })
    )
    .pipe(dest('dist/'));
}

// ========== 开发服务器 ==========
function serve(cb) {
  browserSync.init({
    server: {
      baseDir: './dist'
    },
    port: 3000,
    open: true,
    notify: false
  });
  cb();
}

// 刷新浏览器
function reload(cb) {
  browserSync.reload();
  cb();
}

// ========== 监听文件变化 ==========
function watchFiles() {
  watch(paths.html.src, series(injectHTML, reload));
  watch(paths.js.src, series(buildJS, injectHTML, reload));
  watch(paths.less.src, series(buildLess, injectHTML, reload));
  watch(paths.images.src, series(buildImages, reload));
}

// ========== 任务组合 ==========
// 构建任务（生产环境）
const build = series(
  clean,
  parallel(buildJS, buildLess, buildImages),
  injectHTML
);

// 开发任务（开发环境）
const dev = series(
  clean,
  parallel(buildJS, buildLess, buildImages),
  injectHTML,
  serve,
  watchFiles
);

// ========== 导出任务 ==========
exports.clean = clean;
exports.js = buildJS;
exports.css = buildLess;
exports.images = buildImages;
exports.inject = injectHTML;
exports.serve = serve;
exports.watch = watchFiles;

// 主要任务
exports.build = build;  // 生产构建
exports.dev = dev;      // 开发模式
exports.default = dev;  // 默认任务
```

### 7.4 package.json 配置

```json
{
  "name": "gulp-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "gulp dev",
    "build": "gulp build",
    "clean": "gulp clean"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "browser-sync": "^2.29.0",
    "del": "^6.1.1",
    "gulp": "^4.0.2",
    "gulp-autoprefixer": "^8.0.0",
    "gulp-babel": "^8.0.0",
    "gulp-clean-css": "^4.3.0",
    "gulp-htmlmin": "^5.0.1",
    "gulp-imagemin": "^7.1.0",
    "gulp-inject": "^5.0.5",
    "gulp-less": "^5.0.0",
    "gulp-rename": "^2.0.0",
    "gulp-sourcemaps": "^3.0.0",
    "gulp-terser": "^2.1.0"
  }
}
```

### 7.5 使用方式

```bash
# 开发模式（监听文件变化 + 热更新）
npm run dev

# 生产构建
npm run build

# 清理构建目录
npm run clean

# 或者直接使用 gulp 命令
npx gulp dev
npx gulp build
```

### 7.6 执行流程详解

#### 开发模式执行流程：

```
1. clean() 
   └─ 清理 dist 目录

2. parallel() 并行执行
   ├─ buildJS()      → 编译 JS
   ├─ buildLess()    → 编译 Less
   └─ buildImages()  → 优化图片

3. injectHTML()
   └─ 处理 HTML 文件
   └─ 注入 JS/CSS 引用

4. serve()
   └─ 启动开发服务器 (http://localhost:3000)

5. watchFiles()
   └─ 监听文件变化
      ├─ HTML 变化 →  injectHTML → reload
      ├─ JS 变化   → buildJS → injectHTML → reload
      ├─ Less 变化 → buildLess → injectHTML → reload
      └─ 图片变化  → buildImages → reload
```

#### 生产构建执行流程：

```
1. clean()
2. parallel(buildJS, buildLess, buildImages)
3. injectHTML()
完成！
```

---

## 八、开发与构建任务

### 8.1 区分开发和生产环境

```javascript
const isProduction = process.env.NODE_ENV === 'production';

// 条件性使用插件
function buildJS() {
  return src(paths.js.src)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(isProduction ? terser() : through2.obj())  // 仅生产环境压缩
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.js.dest));
}
```

### 8.2 环境变量配置

**package.json:**
```json
{
  "scripts": {
    "dev": "gulp dev",
    "build": "cross-env NODE_ENV=production gulp build"
  }
}
```

安装 cross-env：
```bash
npm install --save-dev cross-env
```

### 8.3 开发环境特性

```javascript
// 开发环境配置
const devConfig = {
  sourcemaps: true,        // 生成 sourcemaps
  minify: false,           // 不压缩
  browserSync: true,       // 启用热更新
  watch: true              // 监听文件
};

// 生产环境配置
const prodConfig = {
  sourcemaps: false,       // 不生成 sourcemaps
  minify: true,            // 压缩代码
  browserSync: false,      // 不需要热更新
  watch: false             // 不监听
};
```

### 8.4 完整的环境区分示例

```javascript
const { src, dest, watch, series, parallel } = require('gulp');
const gulpif = require('gulp-if');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps');
const less = require('gulp-less');
const cleanCSS = require('gulp-clean-css');

// 判断是否为生产环境
const isProd = process.env.NODE_ENV === 'production';

// JavaScript 任务
function buildJS() {
  return src('src/js/**/*.js')
    .pipe(gulpif(!isProd, sourcemaps.init()))      // 开发环境：sourcemaps
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(gulpif(isProd, terser()))                // 生产环境：压缩
    .pipe(gulpif(!isProd, sourcemaps.write('.')))
    .pipe(dest('dist/js/'));
}

// CSS 任务
function buildCSS() {
  return src('src/less/**/*.less')
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(less())
    .pipe(gulpif(isProd, cleanCSS()))              // 生产环境：压缩
    .pipe(gulpif(!isProd, sourcemaps.write('.')))
    .pipe(dest('dist/css/'));
}

// 开发服务器（仅开发环境）
function serve(cb) {
  if (!isProd) {
    browserSync.init({
      server: './dist',
      port: 3000
    });
  }
  cb();
}

// 监听（仅开发环境）
function watchFiles() {
  if (!isProd) {
    watch('src/js/**/*.js', buildJS);
    watch('src/less/**/*.less', buildCSS);
  }
}

// 根据环境导出不同任务
exports.default = isProd 
  ? series(parallel(buildJS, buildCSS))           // 生产：仅构建
  : series(parallel(buildJS, buildCSS), serve, watchFiles);  // 开发：构建+服务+监听
```

### 8.5 性能优化

#### 8.5.1 增量构建

```javascript
const newer = require('gulp-newer');

function optimizeImages() {
  return src('src/images/**/*')
    .pipe(newer('dist/images/'))  // 仅处理更新的文件
    .pipe(imagemin())
    .pipe(dest('dist/images/'));
}
```

#### 8.5.2 缓存

```javascript
const cache = require('gulp-cached');
const remember = require('gulp-remember');

function buildJS() {
  return src('src/js/**/*.js')
    .pipe(cache('js'))            // 缓存文件
    .pipe(babel())
    .pipe(remember('js'))         // 记住所有文件
    .pipe(concat('all.js'))
    .pipe(dest('dist/js/'));
}
```

#### 8.5.3 并行处理

```javascript
// 使用 parallel 加速构建
const build = series(
  clean,
  parallel(          // 并行执行，节省时间
    buildJS,
    buildCSS,
    optimizeImages
  ),
  injectAssets
);
```

---

## 九、Gulp 5 新特性

### 9.1 版本对比

| 特性 | Gulp 4.x | Gulp 5.x |
|------|----------|----------|
| Node.js 版本 | >= 10.13 | >= 14.19 |
| ES Modules 支持 | 部分 | 完全支持 |
| TypeScript 支持 | 需要配置 | 原生支持 |
| 性能 | 良好 | 更优 |
| API | 稳定 | 向后兼容 + 新增 |

### 9.2 主要更新

#### 9.2.1 ES Modules 原生支持

**Gulp 4.x (CommonJS):**
```javascript
const { src, dest, series } = require('gulp');
const babel = require('gulp-babel');

function build() {
  return src('src/**/*.js')
    .pipe(babel())
    .pipe(dest('dist/'));
}

exports.build = build;
```

**Gulp 5.x (ES Modules):**
```javascript
// gulpfile.mjs 或在 package.json 中设置 "type": "module"
import { src, dest, series } from 'gulp';
import babel from 'gulp-babel';

export function build() {
  return src('src/**/*.js')
    .pipe(babel())
    .pipe(dest('dist/'));
}

export default build;
```

**package.json 配置：**
```json
{
  "type": "module",
  "scripts": {
    "build": "gulp"
  }
}
```

#### 9.2.2 TypeScript 原生支持

**gulpfile.ts:**
```typescript
import { src, dest, series, parallel, TaskFunction } from 'gulp';
import babel from 'gulp-babel';
import terser from 'gulp-terser';

interface Paths {
  js: {
    src: string;
    dest: string;
  };
}

const paths: Paths = {
  js: {
    src: 'src/**/*.js',
    dest: 'dist/'
  }
};

export const buildJS: TaskFunction = () => {
  return src(paths.js.src)
    .pipe(babel())
    .pipe(terser())
    .pipe(dest(paths.js.dest));
};

export const build = series(buildJS);
export default build;
```

**配置 tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true
  },
  "include": ["gulpfile.ts"]
}
```

#### 9.2.3 改进的错误处理

```javascript
import { src, dest } from 'gulp';
import babel from 'gulp-babel';

export function buildJS() {
  return src('src/**/*.js')
    .pipe(babel())
    .on('error', function(err) {
      // Gulp 5 提供更详细的错误信息
      console.error('Babel Error:', err.message);
      console.error('File:', err.fileName);
      console.error('Line:', err.lineNumber);
      this.emit('end'); // 继续执行
    })
    .pipe(dest('dist/'));
}
```

#### 9.2.4 更好的性能

Gulp 5 在以下方面进行了优化：

1. **更快的文件系统操作**
2. **改进的流处理性能**
3. **更智能的缓存机制**
4. **减少内存占用**

```javascript
// Gulp 5 自动优化文件读取
import { src, dest } from 'gulp';

export function copyFiles() {
  return src('src/**/*', {
    // Gulp 5 新增选项
    since: lastRun(copyFiles),  // 仅处理修改的文件
    buffer: false,               // 使用流模式，减少内存
    encoding: false              // 二进制模式
  })
  .pipe(dest('dist/'));
}
```

#### 9.2.5 改进的 watch API

```javascript
import { watch, series } from 'gulp';

// Gulp 5 watch 新特性
export function watchFiles() {
  const watcher = watch('src/**/*.js', {
    // 新增配置选项
    events: ['add', 'change', 'unlink'],
    ignoreInitial: false,
    awaitWriteFinish: {        // 等待文件写入完成
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  }, buildJS);

  // 更丰富的事件
  watcher.on('change', (path, stats) => {
    console.log(`File ${path} was changed`);
    console.log(`Size: ${stats.size} bytes`);
  });

  watcher.on('add', (path) => {
    console.log(`File ${path} was added`);
  });

  return watcher;
}
```

#### 9.2.6 异步迭代器支持

```javascript
// Gulp 5 支持异步迭代器
import { src, dest } from 'gulp';

export async function* processFiles() {
  const files = src('src/**/*.js');
  
  for await (const file of files) {
    // 处理每个文件
    console.log(`Processing: ${file.path}`);
    yield file;
  }
}
```

#### 9.2.7 更好的 CLI 输出

Gulp 5 提供了更清晰的命令行输出：

```bash
# Gulp 4.x 输出
[12:00:00] Using gulpfile ~/project/gulpfile.js
[12:00:00] Starting 'build'...
[12:00:01] Finished 'build' after 1.2 s

# Gulp 5.x 输出（更详细）
[12:00:00] Using gulpfile ~/project/gulpfile.js
[12:00:00] Starting 'build'...
[12:00:00]   Starting 'clean'...
[12:00:00]   Finished 'clean' after 50 ms
[12:00:00]   Starting 'parallel'...
[12:00:00]     Starting 'buildJS'...
[12:00:00]     Starting 'buildCSS'...
[12:00:01]     Finished 'buildJS' after 800 ms
[12:00:01]     Finished 'buildCSS' after 900 ms
[12:00:01]   Finished 'parallel' after 900 ms
[12:00:01] Finished 'build' after 1.2 s
```

### 9.3 迁移指南（Gulp 4 → Gulp 5）

#### 步骤 1：更新 Node.js

```bash
# 确保 Node.js 版本 >= 14.19
node --version
```

#### 步骤 2：更新 Gulp

```bash
# 卸载旧版本
npm uninstall gulp gulp-cli -g
npm uninstall gulp

# 安装 Gulp 5
npm install --save-dev gulp@5
npm install --global gulp-cli
```

#### 步骤 3：更新 gulpfile

**CommonJS (gulpfile.js) - 无需修改**
```javascript
const gulp = require('gulp');
// 现有代码保持不变
```

**或迁移到 ES Modules (gulpfile.mjs)**
```javascript
import gulp from 'gulp';
import babel from 'gulp-babel';

export function build() {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/'));
}

export default build;
```

#### 步骤 4：更新插件

```bash
# 检查插件兼容性
npm outdated

# 更新所有插件
npm update

# 或逐个更新
npm install gulp-babel@latest --save-dev
```

#### 步骤 5：测试

```bash
# 运行现有任务
gulp build

# 检查是否有错误或警告
```

### 9.4 Gulp 5 完整示例

```javascript
// gulpfile.mjs (ES Modules)
import { src, dest, watch, series, parallel } from 'gulp';
import babel from 'gulp-babel';
import terser from 'gulp-terser';
import less from 'gulp-less';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import imagemin from 'gulp-imagemin';
import browserSync from 'browser-sync';
import { deleteAsync } from 'del';

const bs = browserSync.create();

// 清理
export async function clean() {
  await deleteAsync(['dist/**']);
}

// JavaScript
export function js() {
  return src('src/js/**/*.js', { sourcemaps: true })
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(terser())
    .pipe(dest('dist/js/', { sourcemaps: '.' }));
}

// CSS
export function css() {
  return src('src/less/**/*.less', { sourcemaps: true })
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(dest('dist/css/', { sourcemaps: '.' }));
}

// HTML
export function html() {
  return src('src/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('dist/'));
}

// 图片
export function images() {
  return src('src/images/**/*', { encoding: false })
    .pipe(imagemin())
    .pipe(dest('dist/images/'));
}

// 开发服务器
export function serve(cb) {
  bs.init({
    server: './dist',
    port: 3000
  });
  cb();
}

// 监听
export function watchFiles() {
  watch('src/js/**/*.js', series(js, reload));
  watch('src/less/**/*.less', series(css, reload));
  watch('src/**/*.html', series(html, reload));
  watch('src/images/**/*', series(images, reload));
}

// 刷新浏览器
function reload(cb) {
  bs.reload();
  cb();
}

// 任务组合
export const build = series(
  clean,
  parallel(js, css, html, images)
);

export const dev = series(
  build,
  serve,
  watchFiles
);

export default dev;
```

---

## 十、最佳实践

### 10.1 项目结构建议

```
project/
├── gulp/                    # Gulp 任务模块化
│   ├── tasks/
│   │   ├── clean.js
│   │   ├── html.js
│   │   ├── scripts.js
│   │   ├── styles.js
│   │   └── images.js
│   └── config.js            # 配置文件
├── src/
│   ├── assets/
│   ├── js/
│   ├── less/
│   └── index.html
├── dist/
├── gulpfile.js              # 主文件
└── package.json
```

### 10.2 模块化任务

**gulp/config.js:**
```javascript
export const paths = {
  html: {
    src: 'src/**/*.html',
    dest: 'dist/'
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/js/'
  },
  styles: {
    src: 'src/less/**/*.less',
    dest: 'dist/css/'
  }
};

export const isProd = process.env.NODE_ENV === 'production';
```

**gulp/tasks/scripts.js:**
```javascript
import { src, dest } from 'gulp';
import babel from 'gulp-babel';
import terser from 'gulp-terser';
import { paths, isProd } from '../config.js';

export function scripts() {
  return src(paths.scripts.src)
    .pipe(babel())
    .pipe(isProd ? terser() : through())
    .pipe(dest(paths.scripts.dest));
}
```

**gulpfile.js:**
```javascript
import { series, parallel } from 'gulp';
import { clean } from './gulp/tasks/clean.js';
import { scripts } from './gulp/tasks/scripts.js';
import { styles } from './gulp/tasks/styles.js';

export const build = series(
  clean,
  parallel(scripts, styles)
);

export default build;
```

### 10.3 错误处理

```javascript
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';

export function scripts() {
  return src('src/js/**/*.js')
    .pipe(plumber({
      errorHandler: notify.onError({
        title: 'JS Error',
        message: '<%= error.message %>'
      })
    }))
    .pipe(babel())
    .pipe(dest('dist/js/'));
}
```

### 10.4 性能优化技巧

1. **使用 `gulp-newer` 处理增量文件**
2. **并行任务尽可能使用 `parallel()`**
3. **避免不必要的文件读写**
4. **合理使用缓存插件**
5. **生产环境禁用 sourcemaps**

---

## 十一、常见问题

### Q1: Gulp 4 和 Gulp 5 可以共存吗？

可以，但不推荐。建议在不同项目中使用不同版本，通过局部安装管理。

### Q2: 如何调试 Gulp 任务？

```javascript
// 使用 gulp-debug
import debug from 'gulp-debug';

export function debugTask() {
  return src('src/**/*.js')
    .pipe(debug({ title: '处理文件:' }))
    .pipe(babel())
    .pipe(dest('dist/'));
}
```

### Q3: 任务执行顺序如何确保？

使用 `series()` 确保顺序执行，`parallel()` 并行执行。

### Q4: 如何处理大量文件？

使用流式处理和增量构建：
```javascript
import newer from 'gulp-newer';

export function images() {
  return src('src/images/**/*')
    .pipe(newer('dist/images/'))  // 仅处理新文件
    .pipe(imagemin())
    .pipe(dest('dist/images/'));
}
```

---

## 十二、总结

### Gulp 的优势

✅ 简单易学，配置灵活  
✅ 基于流，性能优秀  
✅ 插件丰富，生态完善  
✅ 适合自动化任务  

### Gulp 的不足

❌ 不适合大型 SPA 项目  
❌ 不原生支持模块化（需要插件）  
❌ 配置可能变得复杂  

### 选择建议

- **小型项目、多页应用** → Gulp
- **大型 SPA（Vue/React）** → Webpack/Vite
- **自动化任务** → Gulp
- **现代前端工程** → Vite + Gulp 混合使用

---

## 相关资源

- [Gulp 官方文档](https://gulpjs.com/)
- [Gulp 插件库](https://gulpjs.com/plugins/)
- [Gulp 5 发布说明](https://github.com/gulpjs/gulp/releases)
- [从 Gulp 4 迁移到 Gulp 5](https://gulpjs.com/docs/en/getting-started/upgrading-to-gulp-5)
