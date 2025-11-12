---
date: 2025-09-29 14:24:00
title: 12-Polyfill的使用 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/12-Polyfill的使用
categories:
  - Webpack
coverImg: /img/webpack_babel.jpeg
tags:
  - babel的进阶使用
---
## 一、`polyfill`

###  1.`Polyfill`是什么呢？

`polyfill`翻译过来是垫片的意思，但是它具体作用是什么呢？

 举例：`ES6+`新增了很多`api` 是`ES5`没有的东西  如：`Promise` `fetch` `inculdes`,

- 当babel去转换成 `ES5` 的时候,因为 `ES5` 根本就没有这个 `api`, 
- 这个时候就需要 `Polyfill` 帮我们实现一个等同于这个的 `api`
- 我们可以使用 **`polyfill` 来填充或者说打一个补丁**，那么就会包含该特性了；

### 2.如何使用`polyfill`？

#### 安装`polyfill`

`babel 7.4.0`之前，可以使用 `@babel/polyfill` 的包，**但是该包现在已经不推荐使用了**

```bash
npm install @babel/polyfill --save
```

![](https://picx.zhimg.com/80/v2-71a5f3b9f5b113a60b7c31360a8f2c5c_720w.png)

`babel7.4.0` 之后，可以通过单独引入`core-js`和`regenerator-runtime`来完成`polyfill`的使用。

```bash
npm install core-js regenerator-runtime --save
```

 `regenerator-runtime` 来模拟实现 生成器函数 `Generator` 和 迭代器 `Iterator`的底层机制。

**它们和  `async/await`  的关系是什么？** `async/await` 实际上就是 **Generator 函数** 和 **Promise** 的**语法糖**。它让异步代码看起来像同步代码一样直观

```js
// 这是一个生成器函数，它返回一个迭代器
function* myNumberGenerator() {
  yield 1; // 暂停，返回 { value: 1, done: false }
  yield 2; // 暂停，返回 { value: 2, done: false }
  return 3; // 结束，返回 { value: 3, done: true }
}
```

#### 配置`polyfill`

`babel` 可以将 `ES6+` 的**新语法**（如箭头函数、`class`）转成 `ES5`，但**`新的 API`**（如 `Promise`、`Array.from`）无法通过语法转换实现，必须用代码模拟。

##### corejs
`core-js` 就是用来“模拟”这些新 API 的代码库。比如，在 IE11 中运行 `new Set([1, 2, 3])`，如果没有 `core-js`，就会直接报错；有了 `core-js`，它会用 `ES5` 代码实现 
`Set` 的功能。
 ::: info **与 Babel 的关系**
  1. `babel` 负责**语法转换**（如 `() => {}` → `function() {}`）。

  2. `core-js` **负责 `API` 模拟**（如 `Promise`、`Array.includes`）
 :::


 我们需要在`babel.config.js`文件中进行配置，给 `preset-env` 配置一些属性：
:::details  查看详情
  1. `useBuiltIns`：设置以什么样的方式来使用`polyfill`；

  2. `corejs`设置corejs的版本，目前使用较多的是`3.x`的版本
 
  3. 另外`corejs`可以设置是否对提议阶段的特性进行支持； 

  4. 设置`proposals`属性为 `true` 即可，将这个属性设置为 `true` `Babel` 就会引入**提议阶段 API** 的 `polyfill`

 ```js [bable.config.js]
  corejs: {
     // 指定你项目中安装的 core-js 主版本号
     version: 3, 
     proposals: true 
 }
 ```
:::

在刚刚创建的`bable.config.js`

```js [bable.config.js]
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.1%,last 2 versions,not dead',
        corejs: 3,
      },
    ],
  ],
};

```

##### useBuiltIns

这个代码在`es5`是不存在的

```js
fetch('www.baidu.com')
  .then((res) => {
    console.log(res);
    return res.json();
  })
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.error(err);
  });

```
设置`corejs`模拟API方式，是以什么方式运用到项目中的

 1. `false` → 不自动添加 `Polyfill`（需手动处理兼容性）。

 2. `'usage'` → 按需添加（只加你写的源代码中用到的 API，**推荐**）
  - 如果在 `loader` 配置中 使用了`exclude`排除了`node_modules` 需要用  `entry`  [详情](https://webbocai.github.io/docs-web/pages/25cf12.html#%E5%8F%82%E6%95%B0%E4%BB%8B%E7%BB%8D)

:::info polyfill是如何工作的

如果 `babel-loader`配置的时候没排除`node_modules` 就加上这个配置   ` modules: 'commonjs',` **不然会报错**

报错：`'import' and 'export' may appear only with 'sourceType: module'`
错误的根本原因：**责任混乱**

 1. **Babel 的工作**：`@babel/preset-env` 在你的 `index.js` 文件里检测到需要 `Promise` 的 `polyfill`，于是它插入了 `import 'core-js/...'` 这行代码。到一切正常。
 
 2. **Webpack 的工作**：Webpack 看到了 `import 'core-js/...'`，于是就去 `node_modules` 里找到了对应的 `core-js` 文件。

 3. **冲突点**：因为你的 Webpack 配置里**没有** `exclude: /node_modules/`，所以 Webpack 会把这个 `core-js` 文件也交给 `babel-loader` 去处理。问题就出里：
    - `babel-loader` 尝试去解析 `core-js` 的内部文件。但它在解析时，把这个文件当成了一个 **普通的“脚本(script)”，而不是一个“模块(module)”**。
    - 当它看到文件里的 `import` 语句时，由于“脚本”里不能有 `import`，于是它就抛出了你看到的那个错误

 4. 所以将强制将模块转换为 `CommonJS` 格式 就没问题，(**不推荐**)
    Babel 将您的代码中的 `import` 语句转换为 `require` 语句。**虽然可行** 但不如排除 `node_modules` 简单高效。
:::
:::details 查看代码和图片
  ```js [babel.config.js]
  module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: '> 0.1%,last 2 versions,not dead',
          corejs: 3,
          useBuiltIns: 'usage',
          //添加这一行，强制将模块转换为 CommonJS 格式
         // modules: 'commonjs',
        },
      ],
    ],
  };
  ```

  <img src="https://picx.zhimg.com/80/v2-a9111ee993f1908536733a9e942114f9_1020w.png"  style="zoom:50%"/>
:::

`'entry'` → 在入口文件手动导入 
如果我们依赖的某一个库用了一个**比较新的特性**，然后转换成ES5, **但是ES5并没有该API**

如果此时我们排除了`node_modules`,这个时候如果一旦运行在**低版本浏览器 直接会报错，因为没有实现对应的语法**
所以这种情况，可以使用`entry`；

在 `babel.config.js`  添加以下代码

```js [babel.config.js]
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.1%,last 2 versions,not dead',
        corejs: 3,
        useBuiltIns: 'entry',
      },
    ],
  ],
};
```
  
在入口文件中添加该代码
  
 ```js
 import 'core-js/stable'; 
 import 'regenerator-runtime/runtime'
 ```
  
  

## 二、TypeScript的编译

- 在`src` 文件目录下`main.ts`

```ts
const add = (num1: number, num2: number) => {
  return num1 + num2;
};
console.log(add(10, 20));

```

### 方法一：tsc 编译

####  安装`typescript`

可以通过`TypeScript`的`compiler`来转换成`JavaScript`

```bash
npm install typescript -D
```

另外TypeScript的编译配置信息我们通常会编写一个`tsconfig.json`文件

```bash
npx tsc --init
```

 生成配置文件如下：

<img src="https://picx.zhimg.com/80/v2-845d8a6c03be39522dab98b5c644a60d_1020w.png" />

使用命令 `npx tsc main.ts`

<img src="https://picx.zhimg.com/80/v2-31a66cd1a86cae6baabc8baab8eecda1_1020w.png"/>

输出文件 `main.js`

  ```ts
  var add = function (num1, num2) {
      return num1 + num2;
  };
  console.log(add(10, 20));
  
  ```

### 方法二：运用ts-loader

####   安装 `ts-loader`

在webpack环境中我们不可能手动用`tsc`编译，这样会非常麻烦，我们可以使用 `ts-loader`

```bash
npm install  ts-loader -D
```

在`webpack.config.js`中

```js [webpack.config.js]
const path = require('path');
module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve:{
    extensions:['.js','.ts']  
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
};

```
在 `main.ts` 中

```ts [main.ts]
export const post = (num1: number, num2: number) => {
  fetch('www.baidu.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ num1, num2 }),
  })
    .then((res) => {
      console.log(res);
      return res.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
};

```

在 `src` 创建 `index.ts`

```js [index.ts]
import { post } from './main.ts';

const num1 = 1;
const num2 = 2;
post(num1, num2);
```

执行`yarn build` 打包成功，输出文件了，成功运行

###### 缺点和优点

- **优点**：当我们类型没要按照指定的类型传参会报错

```js
import { post } from './main.ts';

const num1 = 1;
const num2 = '20';
post(num1, num2);
```

- 报错 需要接受一个`number`得到一个`string`

![](https://picx.zhimg.com/80/v2-487807241e4b0f34ce5191a333bf6b09_1020w.png)

- **缺点**：如果需要兼容低版本浏览器，没有`polyfill`,这种情况很容易在低版本浏览器出问题



### 方法三：运用babel-loader

#### 按照预设或插件

- 除了可以使用TypeScript Compiler来编译TypeScript之外，我们也可以使用Babel：
  - 我们可以使用插件：`@babel/tranform-typescript`；
  - 但是更推荐直接使用预设：`@babel/preset-typescript`

```bash
npm i @babel/preset-typescript -D
```

###### 配置文件中

- 在`webpack.config.js`文件中

```JS
const path = require('path');
module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: false,
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
};

```

- 在`babel.config.js`文件中

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.01%,last 2 versions,not dead',
        useBuiltIns: 'usage',
        corejs: 3,
        // // 添加这一行，强制将模块转换为 CommonJS 格式
        // modules: 'commonjs',
      },
    ],
    '@babel/preset-typescript',
  ],
};

```

###### 缺点和优点

**优点**：如果需要兼容低版本浏览器，`bable` 配置有`polyfill` 不用担心兼容问题

**缺点**：当我们类型没要按照指定的类型传参不会报错

##### 方法四：编译TypeScript最佳实践

- `ts-loader`和`babel`该怎么选择呢？
  - 我们应该全部都要`ts-loader`做检查
  - `babel` 做对应转换
- 我们可以这样在`package.json`中
  - 我们可以使用 `npm`执行命令的生命周期来使用，执行打包命令之前先进行校验

```json
{
  "name": "10-babel-polyfill",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "check": "tsc --noEmit",
    "prebuild": "yarn run check", // npm命令执行的生命周期
    "build": "webpack"
  },
 ....其他配置
}

```