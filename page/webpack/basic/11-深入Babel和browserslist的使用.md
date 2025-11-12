---
date: 2025-09-29 14:24:00
title: 11-深入Babel和browserslist的使用 <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/11-深入Babel和browserslist的使用
categories:
  - Webpack
coverImg: /img/webpack_babel.jpeg
tags:
  - babel的进阶使用
---
## 一、Babel基本使用

- 在之前我们已经讲过这个 [可以查看](https://webbocai.github.io/docs-web/pages/25cf12.html)

## 二、Babel底层原理

```js
const add = (a, b) => a + b;
```

### 解析阶段(parsing)

`babel`会进行 **词法分析** 将每行代码都分割为一个个 **`Token`** 然后放到数组中

然后`babel`会进行**语法分析**, 如果遇到**语法错误的代码**，语法分析会**直接报错**，通常会告诉你错误类型、错误位置

举例：然后生成一个`AST`的语法树如下：

:::details 查看AST伪代码

```yaml [AST语法树.yaml]
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
:::
### 转换阶段(`Transfromation`)

`babel`会从上到下、深度优先遍历`AST`语法树,他会根据你设置 **插件和预设** 去转换成新的语法，然后生成一个新的`AST`语法树
  
如果没有任何插件需要处理这行代码，所以 Babel 会原封不动地保留这个 `AST` 节点

假如你设置了一个`@babel/plugin-transfrom-arrow-functon` 这个时候会把 **箭头函数转换成普通的函数**
 ::: tip 当遍历器找到 `ArrowFunctionExpression` 节点时，这个插件就会：
 1. 根据旧语法的规则，**创建**一个新的 `FunctionExpression` (普通函数) 节点。
 2. 把原来箭头函数节点里的参数 (`params`) 和函数体 (`body`) **复制**到新的普通函数节点里。
 3. 用创建好的新节点**替换**掉 `AST` 中原来的旧节点。
 :::

  :::details 查看AST伪代码
  ```yaml [AST语法树.yaml]
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
  ::: 
  

#### 生成阶段(`Code Generation`)

babel会用生成器去遍历你的刚刚转换的`AST`语法树 他会把每个节点 按照语法规则打印成字符串

比如看到`VariableDeclaration` 就会打印 `var`, 看到 `FunctionExpression ` 箭头函数就打印 `function(...) { ... }`  看到  `ReturnStatement` 就打印出 `return ...;`
  
 最终他会根据`AST`语法树转换成目标字符串,同时生成 `source-map` 文件 方便调试

![](https://pica.zhimg.com/80/v2-1d99595acdb1b23735604567ec0e3c9e_1420w.png)

## 三、babel的配置文件

::: info babel的配置文件有两种
 1. `babel.config.json`（或者`.js`，`.cjs`，`.mjs`）文件； 可以直接作用于`Monorepos`项目的子包，**更加推荐**

 2. `.babelrc.json`（或者`.babelrc`，`.js`，`.cjs`，`.mjs`）文件；早期这种配置居多，但是对于配置`Monorepos`(第三方框架)项目是比较麻烦的；
  `Monorepos` 项目是一个项目包含多个子包的项目 `babel.config.json` 配置，能共享到子包项目里面去，而早期的`.babelrc.json` 这个需要每个子项目都要单独配置
:::
 

  

## 四、浏览器兼容性

### 1. 问题

 1.  在现代开发中，有些浏览器不支持新的特性如 `ES2025`新语法，`css3`的新语法，怎么办呢？

 2.  在之前我们讲过 `js` 用 `babel`去转换 `css` 用`postcss`去兼容，但是他们怎么知道**哪些浏览器支持，哪些浏览器不支持**？

 3.  这个时候我们就需要引出一个新的东西   [browserslist](https://github.com/browserslist/browserslist)

### 2.browserslist是什么？

#### 安装

```bash
npm i -D browserslist
```

#### 介绍

我们知道市面上有大量的浏览器有 `Chrome`、`Safari`、`IE`、`Edge`、`Chrome for Android`、`UC Browser`、`QQ Browser`等

它们的**市场占率是多少**？我们要不要兼容它们呢？ 这个好用的网站，也是我们工具通常会查询的一个网站就是 `caniuse`； [查询浏览器市场占有率](https://caniuse.com/usage-table)

`browserslist`的作用是告诉各大工具，你们需要**兼容哪些浏览器，哪些浏览器支持哪些语法**，你们根据这个规则去转换就行

 但是有一个问题，我们如何可以在**css兼容性和js兼容性**下共享我们配置的兼容性条件呢？

::: info 我们可以编写类似于这样的配置：
  - `> 1% `：大于市场百分之1的浏览器都兼容
  - ` last 2 versions` : 每个浏览器的最后2个版本
  - `not dead`：24个月内官方支持或更新的浏览器

 ```json [.browserslistrc]
  > 1% 
   last 2 versions
   not dead
 ```
:::
使用了条件查询使用的是 `caniuse-lite` 的**工具**，这个工具的数据来自于`caniuse`的网站上；

### 3.browserslist配置规则

####   1.参数
::: details 在开发中哪些配置是我们使用的最多的呢？
   1.  **defaults**：`Browserslist`的默认规则配置兼容的浏览器（`> 0.5%, last 2 versions, Firefox ESR, not dead`）
       - ` Firefox ESR`：火狐浏览器的教育版或特别版
     
   2. **5%**：通过全局使用情况统计信息选择的浏览器版本。**`>=`**，`<`和`<=`
       -  `5% in US`：使用美国使用情况统计信息。它接受两个字母的国家/地区代码
       - `> 5% in alt-AS`：使用亚洲地区使用情况统计信息。有关所有区域代码的列表，[请参见caniuse-lite](caniuse-lite/data/regions)
       - `> 5% in my stats`：使用自定义用法数据
       -  `cover 99.5%`：提供覆盖率的最受欢迎的浏览器。
       -  `cover 99.5% in US`：提供美国覆盖率的最受欢迎的浏览器。

   3.  **`dead`**：24个月内没有官方支持或更新的浏览器

   4.  **`last 2 versions`**：每个浏览器的最后2个版本。
       -  `last 2 Chrome versions`：最近2个版本的Chrome浏览器
       -   `last 2 major versions`或`last 2 iOS major versions`：最近2个主要版本的所有次要/补丁版本。

   5.  `node 版本`：选择最新的node版本
       -  `node20` : **具体的node版本**
       -  `current node`：`Browserslist`现在使用的`Node.js`版本。
       -  `maintained node versions`：所有Node.js版本，仍由`Node.js` `Foundation`维护

   6.  `iOS 7`：直接使用iOS浏览器版本7
       -  `Firefox > 20`：Firefox的版本高于20 `>=`，<并且<=也可以使用。它也可以与`Node.js` 一起使用
       -  `ie6-8`：选择一个包含范围的版本。
       - `Firefox ESR`：最新的[Firefox ESR]版本。
       -  `PhantomJS 2.1`和`PhantomJS 1.9`：选择类似于PhantomJS运行时的Safari版本。

7. `supports es6-module`：支持特定功能的浏览器。

8. `since 2025` 或 `last 2 years`: 自2025年以来发布的所有版本 或 最近两年内发布的所有浏览器版本

9. `unreleased versions`或`unreleased Chrome versions`：**Alpha和Beta版本。**

10. `not ie <= 8`：**排除先前查询选择的浏览器。**
:::
#### 2.命令


在命令行打印以下命令

```bash
 npx browserslist "> 0.1%, last 2 version, not dead"
```

输出适配的**浏览器和浏览器版本号**

![](https://picx.zhimg.com/80/v2-f8f0b755157c8747043231f82f7f87ec_1020w.png)

#### 4.配置browserslist

 我们如何可以配置 `browserslist` 呢？两种方案：

方案一：在 `package.json` 中配置；
  ::: info 修改 `package.json`里面的代码
  ```json [package.json]
  "browserslist": [
       ">0.1%",
      "last 2 versions",
      "not dead"
    ]
  ```
  :::

方案二：`.browserslistrc` 文件

 ::: info 在项目根目录创建一个`.browserslistrc` 文件
   ```.browserslistrc [.browserslistrc]
    > 0.1% 
    not dead
    last 2 versions
   ```
 :::







### 5.条件关系

`browserslist` 也有条件 **与 或 非**

:::details 如图所示

  1. **not组合器 这个不能放在首位，只能放在中间或末尾**
  2.  **not组合器会与 前面的条件组合成and**

![](https://picx.zhimg.com/80/v2-7fa366164e76d303ce7a1a8c2e548836_1020w.png)
:::


下面配置会产生不同结果，**为什么？**

  ```js [index.js]
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

  **第一个规则：**(市场率  `> 0.1%` 或是 **最新2个版本**) 并且 (**不是已停止维护**) 的浏览器。
:::details 查看详情
  1. 先处理 `> 0.1% , last 2 versions` 这一组，得到一个结果 (A)。
  2. 再处理 ` not dead`，得到另一个结果 (B)。
  3. 最终的列表是 A 和 B 的**并集（也就是你说的“相加”）**。
  4. 这个规则会排除 `ie11`
  ```js
  > 0.1% 
   last 2 versions
   not dead
  ```

  ![](https://pic1.zhimg.com/80/v2-71b0e6302ba2bcae1387b61736c43c58_1020w.png)
:::

 **第二个规则：** (**最新2个版本** 或是 **不是已停止维护**) 并且（市场率 `> 0.1%` ）的浏览器。
:::details 查看详情
  1. 先处理 `last 2 versions, not dead` 这一组，得到一个结果 (A)。
  2. 再处理 `> 0.1%`，得到另一个结果 (B)。
  3. 最终的列表是 A 和 B 的**并集（也就是你说的“相加”）**。
  4. 这个不会排除 `ie11`

  ```js
   last 2 versions
   not dead
   > 0.1% 
  ```

![](https://picx.zhimg.com/80/v2-d8a1015087ae9ff2a226ba6e7048c2ee_1020w.png)
:::
### 6.bebal单独配置兼容

在根目录创建一个`bable.config.js`

```js [webpack.config.js]
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


