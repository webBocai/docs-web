---
date: 2025-09-29 14:24:00
title: 11-深入Babel的polyfill <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/11-深入Babel的polyfill
categories:
  - Webpack
coverImg: /img/webpack_babel.jpeg
tags:
  - babel的进阶使用
---
### 一、babel基本使用

- 在之前我们已经讲过这个 [可以查看](https://webbocai.github.io/docs-web/pages/25cf12.html)

### 二、babel底层原理

```js
const add = (a, b) => a + b;
```

#### 解析阶段(parsing)

- `babel`会进行 **词法分析** 将每行代码都分割为一个个 **Token**然后放到数组中
- 然后babel会进行**语法分析**, 如果遇到**语法错误的代码**，语法分析会**直接报错**，通常会告诉你错误类型、错误位置
- 举例：然后生成一个`AST`的语法树如下：

```cmd
- VariableDeclaration  // (整个是一个变量声明)
  - kind: "const"  // (声明类型是 const)
  - declarations:
    - VariableDeclarator  // (声明的具体内容)
      - id:
        - Identifier  // (标识符，即变量名)
          - name: "add"
      - init:
        - ArrowFunctionExpression //  (一个箭头函数表达式)
          - params: [ (函数的参数)
            - Identifier (name: "a")
            - Identifier (name: "b")
          ]
          - body: (函数体)
            - BinaryExpression (一个二元表达式)
              - operator: "+"
              - left: Identifier (name: "a")
              - right: Identifier (name: "b")
```

#### 转换阶段(`Transfromation`)

- `babel`会从上到下、深度优先遍历`AST`语法树,他会根据你设置**插件和预设**去转换成新的语法，然后生成一个新的`AST`语法树
  
  - 如果没有任何插件需要处理这行代码，所以 Babel 会原封不动地保留这个 `AST` 节点
  - 假如你设置了一个`@babel/plugin-transfrom-arrow-functon` 这个时候会把**箭头函数转换成普通的函数**
    - 当遍历器找到 `ArrowFunctionExpression` 节点时，这个插件就会：
      1. 根据旧语法的规则，**创建**一个新的 `FunctionExpression` (普通函数) 节点。
      2. 把原来箭头函数节点里的参数 (`params`) 和函数体 (`body`) **复制**到新的普通函数节点里。
      3. 用创建好的新节点**替换**掉 `AST` 中原来的旧节点。
  
  ```cmd
  - VariableDeclaration
    - kind: "var"  //  (插件可能还会顺便把 const 变成 var)
    - declarations:
      - VariableDeclarator
        - id:
          - Identifier (name: "add")
        - init:
          - FunctionExpression  // (✨看，这里被替换了!)
            - params: [
              - Identifier (name: "a")
              - Identifier (name: "b")
            ]
            - body:
              - BlockStatement  // (普通函数需要一个代码块)
                - body: [
                  - ReturnStatement  //(并且需要一个 return 关键字)
                    - argument:
                      - BinaryExpression
                        - operator: "+"
                        - left: Identifier (name: "a")
                        - right: Identifier (name: "b")
                ]
  ```
  
  

#### 生成阶段(Code Generation)

- babel会用生成器去遍历你的刚刚转换的`AST`语法树，他会把每个节点，按照语法规则打印成字符串

  - 比如看到`VariableDeclaration` 就会打印 `var`,看到`FunctionExpression ` 箭头函数就打印 `function(...) { ... }`

  看到 `ReturnStatement` 就打印出 `return ...;`
  
- 最终他会根据`AST`语法树转换成目标字符串,同时生成source-map 文件 方便调试

![](https://pica.zhimg.com/80/v2-1d99595acdb1b23735604567ec0e3c9e_1020w.png)

### 三、babel的配置文件

- babel的配置文件有两种：

  - `babel.config.json`（或者`.js`，`.cjs`，`.mjs`）文件；
    - 可以直接作用于`Monorepos`项目的子包，更加推荐
  - `.babelrc.json`（或者`.babelrc`，`.js`，`.cjs`，`.mjs`）文件；
    - 早期这种配置居多，，但是对于配置`Monorepos`(第三方框架)项目是比较麻烦的；
  - `Monorepos`项目是一个项目包含多个子包的项目 `babel.config.json`配置，能共享到子包项目里面去，而早期的`.babelrc.json` 这个需要每个子项目都要单独配置

  

### 四、浏览器兼容性

#### 1.问题

- 在现代开发中，有些浏览器不支持新的特性如 `ES2025`新语法，`css3`的新语法，怎么办呢？

  - 在之前我们讲过 js用 `babel`去转换 `css` 用`postcss`去兼容，但是他们怎么知道哪些浏览器支持，哪些浏览器不支持？

  - 这个时候我们就需要引出一个新的东西 **`browserslist`**

#### 2.browserslist是什么？

##### 安装

```cmd
npm i -D browserslist
```

##### 介绍

[browserslist-github](https://github.com/browserslist/browserslist)


- 我们知道市面上有大量的浏览器
  - 有Chrome、Safari、IE、Edge、Chrome for Android、UC Browser、QQ Browser等等；
  - 它们的**市场占率是多少**？我们要不要兼容它们呢？
    - 这个最好用的网站，也是我们工具通常会查询的一个网站就是`caniuse`；
    - [查询浏览器市场占有率](https://caniuse.com/usage-table)

-  `browserslist`的作用是告诉各大工具，你们需要**兼容哪些浏览器，哪些浏览器支持哪些语法**，你们根据这个规则去转换就行

  - 但是有一个问题，我们如何可以在**css兼容性和js兼容性**下共享我们配置的兼容性条件呢？

  - 我们可以编写类似于这样的配置：
    - `> 1% `：大于市场百分之1的浏览器都兼容
    - ` last 2 versions` : 每个浏览器的最后2个版本
    - `not dead`：24个月内官方支持或更新的浏览器

  ```json
  > 1% 
   last 2 versions
   not dead
  ```

  - 使用了条件查询使用的是`caniuse-lite`的**工具**，这个工具的数据来自于`caniuse`的网站上；

#### 3.browserslist配置规则

#####   1.参数

- 在开发中哪些配置是我们使用的最多的呢？
  -  **defaults**：`Browserslist`的默认规则配置兼容的浏览器（`> 0.5%, last 2 versions, Firefox ESR, not dead`）
    - ` Firefox ESR`：火狐浏览器的教育版或特别版
  - **5%**：通过全局使用情况统计信息选择的浏览器版本。**`>=`**，`<`和`<=`
    -  5% in US：使用美国使用情况统计信息。它接受两个字母的国家/地区代码
    - \> 5% in alt-AS：使用亚洲地区使用情况统计信息。有关所有区域代码的列表，[请参见caniuse-lite](caniuse-lite/data/regions)
    - \> 5% in my stats：使用自定义用法数据
    -  cover 99.5%：提供覆盖率的最受欢迎的浏览器。
    -  cover 99.5% in US：提供美国覆盖率的最受欢迎的浏览器。
  -  **dead**：24个月内没有官方支持或更新的浏览器
  - **last 2 versions**：每个浏览器的最后2个版本。
    -  last 2 Chrome versions：最近2个版本的Chrome浏览器
    -   last 2 major versions或last 2 iOS major versions：最近2个主要版本的所有次要/补丁版本。
  - **node 18和node 18.4**：选择最新的Node.js18.x.x 或10.8.4版本。
    -  **current node**：Browserslist现在使用的Node.js版本。
    -  **maintained node versions**：所有Node.js版本，仍由Node.js Foundation维护
  -  iOS 7：直接使用iOS浏览器版本7。
    - Firefox > 20：Firefox的版本高于20 >=，<并且<=也可以使用。它也可以与Node.js一起使用
    -  ie6-8：选择一个包含范围的版本。
    -  Firefox ESR：最新的[Firefox ESR]版本。
    - PhantomJS 2.1和PhantomJS 1.9：选择类似于PhantomJS运行时的Safari版本。
- **supports es6-module**：支持特定功能的浏览器。
- **since 2025或last 2 years**: 自2025年以来发布的所有版本（since 2015-03以及since 2015-03-10）
- unreleased versions或unreleased Chrome versions：**Alpha和Beta版本。**
- not ie <= 8：**排除先前查询选择的浏览器。**

##### 2.命令

- `npx browserslist "> 0.1%, last 2 version, not dead"`
- 输出适配的**浏览器和浏览器版本号**

![](https://picx.zhimg.com/80/v2-f8f0b755157c8747043231f82f7f87ec_1020w.png)

#### 4.配置browserslist

- 我们如何可以配置browserslist呢？两种方案：

  - 方案一：在`package.json`中配置；

  ```js
  "browserslist": [
       ">0.1%",
      "last 2 versions",
      "not dead"
    ]
  ```

  - 方案二：`.browserslistrc`文件

    - 在项目根目录创建一个`.browserslistrc`文件

    ```txt
     > 0.1% 
     not dead
     last 2 versions
    ```

#### 5.条件关系

- browserslist也有条件 **与或非**

- 如图所示：

  - **not组合器 这个不能放在首位，只能放在中间或末尾**
  - **not组合器会与 前面的条件组合成and**

![](https://picx.zhimg.com/80/v2-7fa366164e76d303ce7a1a8c2e548836_1020w.png)



- 下面配置会产生不同结果，**为什么？**

  ```js
   // 源码
  const a = Math.random() * 100;
  const b = Math.random() * 20 + a;
  const c = Math.random() * 20 + b;
  let d;
  if (b > a) {
    c++;
    d = 20;
  }
  console.log(a + b + c + d);
  ```

  - **第一个规则：**(市场率 > 0.1% 或是 最新2个版本）并且 （不是已停止维护）的浏览器。

  ```js
  // 这个会排除 ie11
  > 0.1% 
   last 2 versions
   not dead
  ```

  ![](https://pic1.zhimg.com/80/v2-71b0e6302ba2bcae1387b61736c43c58_1020w.png)

  - **第二个规则：** (最新2个版本 并且 不是已停止维护）或是 （市场率 > 0.1% ）的浏览器。
    - 先处理 `last 2 versions, not dead` 这一组，得到一个结果 (A)。
    - 再处理 `> 0.1%`，得到另一个结果 (B)。
    - 最终的列表是 A 和 B 的**并集（也就是你说的“相加”）**。

  ```js
  
  // 这个不会排除 ie11
   last 2 versions
   not dead
   > 0.1% 
  ```

![](https://picx.zhimg.com/80/v2-d8a1015087ae9ff2a226ba6e7048c2ee_1020w.png)

#### 6.bebal单独配置兼容

- 在根目录创建一个`bable.config.js`

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.1%,last 2 versions,not dead',
      },
    ],
  ],
};

```

![](https://pic1.zhimg.com/80/v2-71b0e6302ba2bcae1387b61736c43c58_1020w.png)



### 五、`polyfill`

####  1.`Polyfill`是什么呢？

- `polyfill`翻译过来是垫片的意思，但是它具体作用是什么呢？
- 举例：`ES6+`新增了很多`api` 是`ES5`没有的东西  如：`Promise` `fetch` `inculdes`, 
  - 当babel去转换成`ES5`的时候,因为`ES5`根本就没有这个`api`, 
  - 这个时候就需要`Polyfill`帮我们实现一个等同于这个的`api`
  - 我们可以使用**`polyfill`来填充或者说打一个补丁**，那么就会包含该特性了；

#### 2.如何使用`polyfill`？

##### 安装`polyfill`

- `babel7.4.0`之前，可以使用 @babel/polyfill的包，但是该包现在已经不推荐使用了

```cmd
npm install @babel/polyfill --save
```

![](https://picx.zhimg.com/80/v2-71a5f3b9f5b113a60b7c31360a8f2c5c_720w.png)

- babel7.4.0之后，可以通过单独引入core-js和regenerator-runtime来完成polyfill的使用：

```cmd
npm install core-js regenerator-runtime --save
```

- `regenerator-runtime` 来模拟实现 生成器函数 `Generator` 和 迭代器 `Iterator`的底层机制。
  - **和 `async/await` 的关系是什么？** `async/await` 实际上就是 **Generator 函数** 和 **Promise** 的“语法糖”。它让异步代码看起来像同步代码一样直观。

```js
// 这是一个生成器函数，它返回一个迭代器
function* myNumberGenerator() {
  yield 1; // 暂停，返回 { value: 1, done: false }
  yield 2; // 暂停，返回 { value: 2, done: false }
  return 3; // 结束，返回 { value: 3, done: true }
}
```

##### 配置`polyfill`

###### corejs

- babel 可以将 `ES6+` 的**新语法**（如箭头函数、`class`）转成 `ES5`，但**`新的 API`**（如 `Promise`、`Array.from`）无法通过语法转换实现，必须用代码模拟。
- `core-js` 就是用来“模拟”这些新 API 的代码库。比如，在 IE11 中运行 `new Set([1, 2, 3])`，如果没有 `core-js`，就会直接报错；有了 `core-js`，它会用 `ES5` 代码实现 `Set` 的功能。

- **与 Babel 的关系**
  - babel 负责**语法转换**（如 `() => {}` → `function() {}`）。
  - `core-js` 负责**`API` 模拟**（如 `Promise`、`Array.includes`）

- 我们需要在babel.config.js文件中进行配置，给preset-env配置一些属性：

  - useBuiltIns：设置以什么样的方式来使用polyfill；

  - corejs：设置corejs的版本，目前使用较多的是3.x的版本

    - 另外corejs可以设置是否对提议阶段的特性进行支持；
    - 设置proposals属性为true即可

    ```js
     corejs: {
              // 指定你项目中安装的 core-js 主版本号
              version: 3, 
              // 将这个属性设置为 true，Babel 就会引入提议阶段 API 的 polyfill。
              proposals: true 
    }
    ```

- 在刚刚创建的`bable.config.js`

```js
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

###### useBuiltIns

- 这个代码在`es5`是不存在的

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

- 设置`corejs`模拟API方式，是以什么方式运用到项目中的

  - `false` → 不自动添加 `Polyfill`（需手动处理兼容性）。

  - `'usage'` → 按需添加（只加你写的源代码中用到的 API，**推荐**）

    - 如果在loader配置中 使用了`exclude`排除了`node_modules` 需要用 `entry`

    - 如果 `babel-loader`配置的时候没排除`node_modules` 就加上这个配置   ` modules: 'commonjs',` **不然会报错 **

      - 报错：``'import' and 'export' may appear only with 'sourceType: module'`。`

      - 错误的根本原因：**“责任混乱”**
        1. **Babel 的工作**：`@babel/preset-env` 在你的 `index.js` 文件里检测到需要 `Promise` 的 polyfill，于是它插入了 `import 'core-js/...'` 这行代码。到这里一切正常。
        2. **Webpack 的工作**：Webpack 看到了 `import 'core-js/...'`，于是就去 `node_modules` 里找到了对应的 `core-js` 文件。
        3. **冲突点**：因为你的 Webpack 配置里**没有** `exclude: /node_modules/`，所以 Webpack 会把这个 `core-js` 文件也交给 `babel-loader` 去处理。问题就出在这里：
           - `babel-loader` 尝试去解析 `core-js` 的内部文件。但它在解析时，把这个文件当成了一个**普通的“脚本(script)”，而不是一个“模块(module)”**。
           - 当它看到文件里的 `import` 语句时，由于“脚本”里不能有 `import`，于是它就抛出了你看到的那个错误
        4. 所以将强制将模块转换为 `CommonJS` 格式 就没问题，(**不推荐**)
           - Babel 将您的代码中的 `import` 语句转换为 `require` 语句。**虽然可行，**但不如排除 `node_modules` 简单高效。

  ```js
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

  <img src="https://picx.zhimg.com/80/v2-a9111ee993f1908536733a9e942114f9_1020w.png" style="zoom:50%;float:left" />

  - `'entry'` → 在入口文件手动导入 

    - 如果我们依赖的某一个库用了一个**比较新的特性**，然后转换成ES5,**但是ES5并没有该API**,
      - 如果此时我们排除了`node_modules`,这个时候如果一旦运行在**低版本浏览器 直接会报错，因为没有实现对应的语法**
      - 所以这种情况，可以使用`entry`；
    - 在`src/index.js`  添加以下代码

    ```js
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
  
  - 在入口文件中添加该代码
  
  ```js
  import 'core-js/stable'; 
  import 'regenerator-runtime/runtime'
  ```
  
  

#### 六、TypeScript的编译

- 在`src` 文件目录下`main.ts`

```ts
const add = (num1: number, num2: number) => {
  return num1 + num2;
};
console.log(add(10, 20));

```

##### 方法一：tsc 编译

######  安装`typescript`

- 可以通过TypeScript的compiler来转换成JavaScript

```cmd
npm install typescript -D
```

- 另外TypeScript的编译配置信息我们通常会编写一个`tsconfig.json`文件

```cmd
npx tsc --init
```

- 生成配置文件如下：

<img src="https://picx.zhimg.com/80/v2-845d8a6c03be39522dab98b5c644a60d_720w.png" style="float:left" />

- 使用命令 `npx tsc main.ts`

  <img src="https://picx.zhimg.com/80/v2-31a66cd1a86cae6baabc8baab8eecda1_720w.png" style="float:left"/>

  - 输出文件 `main.js`

  ```ts
  var add = function (num1, num2) {
      return num1 + num2;
  };
  console.log(add(10, 20));
  
  ```

##### 方法二：运用ts-loader

######   安装 `ts-loader`

- 在webpack环境中我们不可能手动用`tsc`编译，这样会非常麻烦，我们可以使用 `ts-loader`

```cmd
npm install  ts-loader -D
```

- 在webpack.config.js中

```js
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

- 在`main.ts`中

```js
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

- 在`src` 创建`index.ts`

```js
import { post } from './main.ts';

const num1 = 1;
const num2 = 2;
post(num1, num2);
```

- 执行`yarn build` 打包成功，输出文件了，成功运行

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



##### 方法三：运用babel-loader

###### 按照预设或插件

- 除了可以使用TypeScript Compiler来编译TypeScript之外，我们也可以使用Babel：
  - 我们可以使用插件：`@babel/tranform-typescript`；
  - 但是更推荐直接使用预设：`@babel/preset-typescript`

```
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

**缺点：**当我们类型没要按照指定的类型传参不会报错

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

