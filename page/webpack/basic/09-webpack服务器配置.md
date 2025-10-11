---
date: 2025-09-27 05:53:48
title: 08-开发环境服务器配置 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/09-webpack服务器配置
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - Webpack 基础
---
## 一、`Webpack`搭建本地服务器

### 1.为什么要搭建本地服务器？

::: tip  目前我们开发的代码，为了运行需要有两个操作：
  1. 操作一：`npm run build`，编译相关的代码；
  2. 操作二：通过 `live server` 或者直接通过浏览器，打开 `index.html` 代码，查看效果。
:::
这个过程经常操作会影响我们的开发效率，我们希望可以做到，当文件发生变化时，可以自动的完成 **编译和展示**；
:::details 为了完成自动编译，webpack提供了几种可选的方式：
  1.  `webpack watch mode`； 简单项目
  2.  `webpack-dev-server`（常用）：适合大多数前端项目，简单快捷
  3. `webpack-dev-middleware`: 适合需要高度自定义和全栈开发(`SSR`)的高级场景 
:::

### 2. `webpack watch mode`
- `webpack` 的 `watch` 模式可以**监听文件变化**，当文件修改后自动重新构建。

#### 方式一： 命令行使用
```bash
 # 使用 npx
 npx webpack --watch
 # 或者使用缩写
 npx webpack -w
```
#### 方式二： 在 package.json 中配置

``` json [package.json]
 {
   "scripts": {
     "watch": "webpack --watch", 
     "dev": "webpack --watch --mode=development"
   }
 }
```
然后运行：
```bash
 npm run watch
```
#### 方式三： 配置文件方式
在 webpack.config.js 中配置：
```js [webpack.config.js]
module.exports = {
  // ... 其他配置
  watch: true,
  watchOptions: {
    // 监听配置选项
  }
};
```
:::details 详细的 watchOptions 配置
```js [webpack.config.js]
  module.exports = {
  // ... 其他配置
  watch: true,
  watchOptions: {
    // 忽略监听的文件或文件夹
    ignored: /node_modules/,
    
    // 轮询间隔时间（单位：毫秒）
    poll: 1000,
    
    // 聚合时间（将多个更改聚合到一次重构建）
    aggregateTimeout: 300,
    
    // 设置轮询的系统文件数量限制
    followSymlinks: false
  }
};
```
:::


### 3. `webpack-dev-server` (推荐)


#### 前置
::: info   前置
- 上面的方式可以监听到文件的变化，但是事实上它 **本身是没有自动刷新浏览器的功能的**：
- 当然，目前我们可以在`VSCode`中使用 `live-server` 来完成这样的功能；
- 但是，我们希望在不使用 `live-server`的情况下，可以具备`live reloading`（实时重新加载）的功能
:::   

#### 安装并配置

安装 `webpack-dev-server` 

```bash
npm install webpack-dev-server-D
```
在 `webpack.config.js` 中

```js [webpack.config.js]
  devServer: {},
```

在 `package.json` 中,修改配置文件，启动时加上 `serve` 参数：

```json [package.json]
 "scripts": {
    "dev": "webpack server --config ./webpack.config.js"
  },
```

#### `devServer` 不会生成打包代码

-  `webpack-dev-server `在编译之后**不会输出任何文件**，而是将 `bundle` 文件 **保留在内存中**
-  `webpack-dev-server` 使用了一个库叫 `memfs`（`memory-fs webpack`自己写的）



### 4.认识模块热替换（`HMR`）

#### 什么是`HMR`呢？

`HMR`的全称是 `Hot Module Replacement`，翻译为 **模块热替换**；

**模块热替换**是指在应用程序运行过程中，**替换、添加、删除模块**，而无需 **重新刷新整个页面, 只更新变更内容，以节省宝贵的开发时间**

:::details `HMR`通过如下几种方式，来提高开发的速度：
  1.  **不重新加载整个页面，这样可以保留某些应用程序的状态不丢失**
  2.  **只更新需要变化的内容，节省开发的时间**
  3.  **修改了`css`、`js`源代码，会立即在浏览器更新**，相当于直接在浏览器的`devtools`中直接修改样式
:::

如何使用`HMR`呢？
 1. 默认情况下，`webpack-dev-server` 已经支持`HMR`，从 `webpack-dev-server v4 `开始，**HMR 是默认启用的。它会自动应用**

 2. 在不开启`HMR`的情况下，当我们修改了源代码之后，**整个页面会自动刷新**，使用的是 `live reloading`；

#### 开启`HMR`

- 修改`webpack`的配置：

```js [webpack.config.js]
  devServer: {
    hot:true
  }
```

- 浏览器可以看到如下效果：

![](https://picx.zhimg.com/80/v2-b945bd287ad002297a62aed31589c652_1020w.png)

- 但是你会发现，当我们修改了某一个模块的代码时，依然是刷新的整个页面：
- 这是因为我们需要去指定哪些模块发生更新时，进行`HMR`
- 首先我们先创建 `utils/index.js`

  ```js [index.js]
  console.log('测试')
  ```

- 在 `src/index.js` 文件里面，引用 `import './utils/index';` 一定不要依赖里面的东西 
- 如： `import {a} from './utils/index'` **否则会全局刷新**

  ```js
  import './utils/index';
  if (module.hot) {
    module.hot.accept('./utils/index.js', () => {
      console.log('热更新');
    });
  }
  ```

#### 构建失败不刷新页面
`liveReload` 默认情况下，当监听到文件变化时 `dev-server` **将会重新加载或刷新页面**
:::details 设置 `liveReload: false` 之后会发生什么？
  1. 当您在开发时，代码有语法错误，`webpack` 构建失败。此时浏览器不会有任何变化，控制台会显示错误。
  2. 您修复代码中的错误并保存。
  3. `webpack` 重新构建并**成功**。
  4. 由于 `liveReload` 是 `false`，`dev-server` **不会再命令浏览器刷新**。
  5. 您需要**手动刷新浏览器**才能看到修复后的最新效果。
:::
```js [webpack.config.js]
module.exports = {
  devServer: {
    hot: 'only',
    liveReload: false,
  },
};
```
`hot`: `true` `false` `'only'`值的区别
 :::details 查看区别
 -  `hot: true` :
    - 先尝试原地修改，失败进行全部刷新
    - 修改了东西，热更新失败后自动整页刷新
  - `hot: 'only'` : 
    - 开启 `HMR`
    - 修改了东西只进行热更新，失败也不刷新
  - `hot: false` : 
    - 完全关闭` HMR`
    - 修改了东西总是整页刷新

 - 🔧 关联配置`liveReload`：**用于控制是否在文件变更时刷新页面**。即使 `hot` 设置为 `'only'` 或 `true`，**通常也无需手动关闭 `liveReload`**，因为 `hot` 开启时，`liveReload` **会自动失效**
:::


### 4.`host`配置

- host 设置主机地址： **默认值** 是 `localhost`；
- 如果希望其他地方也可以访问，可以设置为： `0.0.0.0`；
```js [webpack.config.js]
  devServer: {
    hot:true,
    host:'0.0.0.0'
  }
```
 :::details `localhost `和 0.0.0.0 的区别
  1. `localhost`：**本质上是一个域名**，通常情况下会被解析成`127.0.0.1`;
  2. `127.0.0.1`：**回环地址**(Loop Back Address)，表达的意思其实是我们主机自己发出去的包，**直接被自己接收**;
     - 假如我在浏览器输入`localhost:8080`,最终会被解析成`127.0.0.1:8080`  然后最终会被我们自己设置的`8080`端口捕获到
  3. `0.0.0.0`：监听 `IPV4` 上所有的地址，**再根据端口找到不同的应用程序**; ✓ 比如我们监听`0.0.0.0`时，在同一个网段下的主机中，通过 `ip` 地址是可以访问的;
:::




### 5.`port`、`open`、`compress`

- `port`设置监听的端口，默认情:`8080`
- `open` 是否打开浏览器，默认值是: `false`，
  - 设置为 `true` 会打开浏览器
  - 也可以设置为类似于`Google Chrome`等值；
- `compress`是否为静态文件开启 `gzip` 默认值：`false`

```js [webpack.config.js]
  devServer: {
    hot:true,
    host:'0.0.0.0',
    port:9999,
    open:true
    compress:true
  }
```

![](https://pic1.zhimg.com/80/v2-4fc2890d2ba2bf352c3628ce399bc1d0_1020w.png)

### 6.`static`

1. **一些静态资源不想让`webpack` 打包处理** (图片 字体 或者 `index.html` 本身)**提供一个访问路径**。

2. 在 `webpack-dev-server4.x`版本中,开始使用 `static`选项来替换掉旧的 `contentBase` 选项
3. 首先先下载 `html-webpack-plugin`，这样的话在`devserver`服务器插件就能找到 `index.html`文件

```bash
npm  i html-webpack-plugin -D
```

4. 在项目根目录创建一个`index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <h1>Hello</h1>
  </body>
</html>

```

5.  在 `webpack.cofig.js`中

```js
const htmlplugin = reqire('html-webpack-plguin')
module.exports = {
 // ...省略其他配置
  plugins: [
    new htmlWebpackPlugin({
      template: './index.html',
    }),
  ],
};
```
6. static值的区别
:::details 字符串 (`String`)：指定单个目录
1. 这是最简单的形式，只指定一个静态资源目录
2.  **默认不写static的值就是`public`文件夹** 

   ```js
   devServer: {
     // 只从 'public' 目录提供静态文件
     static: 'public' // 默认不写
   }
   ```

3. 在 `public`文件夹下 创建两个`js`文件 `aaa.js`, `bbb.js`

   
4. 在 `index.html`中添加 `script`标签,
     - **注意：** 放在`public` 文件下的静态资源，在进行引入的时候 直接访问根路径就行,不用加`public`,
     - 所以在`html`用**绝对和相对路径最终指向根路径**，并且能找到静态资源都可以

   ```html [index.html]
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Document</title>
     </head>
     <body>
       <h1>Hello</h1>
       <script src="./aaa.js"></script> 
       <script src="/bbb.js"></script>
     </body>
   </html>
   ```
5. 执行 `npm run dev`

![](https://picx.zhimg.com/80/v2-d172937900372b39a7ab8b09b23f3adb_1020w.png)

   
  
:::
:::details 数组 (Array) - 指定多个目录


   - 当需要从多个地方提供静态文件时使用。
   - 创建`content`文件，把`public`文件中 `bbb.js` 移动过去


   ```js
   devServer: {
     // 同时从 'public' 和 'assets' 目录提供静态文件
     static: ['public', 'content']
   }
  ```
 
  ```html [index.html]
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Document</title>
     </head>
     <body>
       <h1>Hello</h1>
       <script src="./aaa.js"></script> 
       <script src="/bbb.js"></script>
     </body>
   </html>
   
   ```
- 执行 `npm run dev`

 ![](https://pic1.zhimg.com/80/v2-08205c4f203af8d21d4c39b6fc7ad9fa_1020w.png)

:::

 :::details 对象 (Object) - 对单个目录进行高级配置

   - `publicPath` :代表一个虚拟路径，在访问资源过程中会加上一个 `/js`的路径

   ```js
   devServer: {
     static: {
       // 静态资源目录
       directory: path.join(__dirname, 'public'),
       // 对应的浏览器访问路径，默认为 '/js'
       publicPath: '/js', 
       // 监听文件变化，变化时会刷新页面
       watch: true, 
     }
   }
   ```
  - 执行`npm run dev` 查看结果

   ![](https://pica.zhimg.com/80/v2-d2be56fb694bef45c1b5d09b25fa1059_1020w.png)

   - 然后修改在`html`文件 在访问资源过程中会加上一个 `/js`的路径

     ```html{10} [index.html]
     <!DOCTYPE html>
     <html lang="en">
       <head>
         <meta charset="UTF-8" />
         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
         <title>Document</title>
       </head>
       <body>
         <h1>Hello</h1>
         <script src="./js/aaa.js"></script>    
       </body>
     </html>
     
     ```
   
   - 上面的操作类似于下面这些操作
   - 在`public`下创建`js`文件夹，然后将`aaa.js`放进去
   - 然后将 `publicPath` 设置成 根路径 `/`, `index.html` 文件`js` 路径还是 `src="./js/aaa.js"`

   ```js [webpack.config.js]
   devServer: {
     static: {
       // 静态资源目录
       directory: path.join(__dirname, 'public'),
       // 对应的浏览器访问路径，默认为 '/'
       publicPath: '/', 
       // 监听文件变化，变化时会刷新页面
       watch: true, 
     }
   }
   ```
  - 执行`npm run dev` 查看结果

   ![](https://picx.zhimg.com/80/v2-c6e9df7314c1d8f4e940312020485b3a_1020w.png)
   :::

 :::details 对象数组 (Array of Objects) - 对多个目录分别进行高级配置

   - 这是最灵活的配置，可以为多个不同的静态目录应用不同的规则。

   ```js
   devServer: {
     static: [
       {
         directory: path.join(__dirname, 'public'),
         publicPath: '/',
         watch: true,  
       },
       {
         directory: path.join(__dirname, 'content'),
         publicPath: '/js',
         watch: true, 
       }
     ]
   }
   ```

   - 在 `index.html`中

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Document</title>
     </head>
     <body>
       <h1>Hello</h1>
       <script src="./js/aaa.js"></script>
       <script src="./js/bbb.js"></script>
     </body>
   </html>
   
   ```

   ![](https://picx.zhimg.com/80/v2-b0cc9e367b31146842aa0e217d7f0b7f_1020w.png)

   :::

### 7.`Proxy`代理

- 在 `index.js`入口文件假如我要请求 `www.baidu.com`

```js
const post = () => {
  fetch('http://www.baidu.com')
    .then((res) => {
      console.log(res);
      return res.text();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
};

```

- 访问过程中之间**报跨域**，之前我们讲过 **Node跨域**  可以点击查看更详细资料
:::details  报错信息
![](https://pic1.zhimg.com/80/v2-0eaab4dfc889bd4d2fcc16e5d9ef25f7_1020w.png)
:::



- 如何解决呢？我们可以采用`devserver`中的proxy代理服务器，其实它底层还是用的 `http-proxy-middleware`这个库
- 在`webpack-dev-server 4.0` 开始用这个新的方式，不再兼容以前 [**旧版本方式**](https://webpack.js.org/configuration/dev-server/#devserverproxy)

  ```js
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
  ```

 -  `index.js` **进行修改**

    ```js [index.js]
    const post = () => {
      fetch('/api')
        .then((res) => {
          console.log(res);
          return res.text();
        })
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.error(err);
        });
    };
    ```

- 然后运行代码 成功显示 百度的`html` 结构

  ![](https://pic1.zhimg.com/80/v2-0f3f0aff1617eae34418a496ac308b39_1020w.png)

:::details **`v3.x `及更早版本的写法 (旧)**
在旧版本中，你通常会为每一个需要代理的路径前缀创建一个键值对。

**场景**：假设 `/api` 和 `/auth` 两个路径都需要被代理到同一个后端服务 `https://www.baidu.com`。

**痛点**：如果多个路径的代理规则（如 `target`, `changeOrigin` 等）完全相同，**就会产生很多重复的配置代码，不易维护。**

```js
// v3 写法
// webpack.config.js
devServer: {
  proxy: {
    '/api': {
      target: 'https://www.baidu.com',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
    // 如果 /auth 的配置几乎一样，就需要复制一份
    '/auth': {
      target: 'https://www.baidu.com',
      changeOrigin: true,
      pathRewrite: { '^/auth': '' },
    },
  },
}
```
:::
### 8. `historyApiFallback`

- `historyApiFallback`是 **开发中常见的属性**，`boolean` 值：**默认是false**, 它主要的作用是**解决SPA页面在路由跳转之后，进行页面刷新时，返回404 的错误。**
:::details 查看图片
  <img src="https://picx.zhimg.com/80/v2-423ffc2672a47195f772da21b2b847f0_1020w.png" />
:::
- 如果设置为 `true` ，那么在刷新时，返回404错误时，会自动返回`index.html `的内容；

:::details 查看图片
  <img src="https://pic1.zhimg.com/80/v2-78a345bc8ba6a807db72d9da2296b4ab_1020w.png"  />
:::

```js  [webpack.config.js]
  devServer: {
    historyApiFallback: true,
  },
```
- **object类型的值**
:::details 配置`rewrites`属性,可以配置`from`来匹配路径，决定要跳转到哪一个页面
```js [webpack.config.js]
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/about/, to: '/views/index.html' },
        { from: /./, to: '/views/404.html' },
      ],
    },
  },
```

:::
[更多详细配置查看官网](https://webpack.docschina.org/configuration/dev-server/)

> [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/03_pulgin)  