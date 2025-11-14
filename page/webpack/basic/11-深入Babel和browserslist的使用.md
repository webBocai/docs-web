---
date: 2025-09-29 14:24:00
title: 深入 Babel 和 Browserslist 的使用
permalink: /pages/11-深入Babel和browserslist的使用
categories:
  - Webpack
coverImg: /img/webpack_babel.jpeg
tags:
  - babel的进阶使用

---

## 一、Babel 基本使用

在之前的章节中我们已经讲解过 Babel 的基础用法，如果需要回顾可以[查看之前的文档](https://webbocai.github.io/docs-web/pages/25cf12.html)。

本章节将深入探讨 Babel 的底层原理和高级配置。

---

## 二、Babel 底层原理剖析

让我们通过一个简单的例子来理解 Babel 的工作原理：

```js
const add = (a, b) => a + b;
```

Babel 将这行代码转换为兼容性更好的代码，需要经过三个核心阶段。

### 1. 解析阶段（Parsing）

解析阶段分为两个步骤：**词法分析**和**语法分析**。

#### 词法分析（Lexical Analysis）

Babel 会将代码分割为一个个 `Token`（词法单元），然后放到数组中。

```js
// 原始代码
const add = (a, b) => a + b;

// Token 数组（简化示例）
[
  { type: 'Keyword', value: 'const' },
  { type: 'Identifier', value: 'add' },
  { type: 'Punctuator', value: '=' },
  { type: 'Punctuator', value: '(' },
  { type: 'Identifier', value: 'a' },
  // ... 更多 token
]
```

#### 语法分析（Syntactic Analysis）

Babel 会根据 Token 数组生成抽象语法树（AST）。如果遇到语法错误，会直接报错并告知错误类型和位置。

生成的 AST 语法树结构如下：

```yaml
- VariableDeclaration                # 整个是一个变量声明
  - kind: "const"                    # 声明类型是 const
  - declarations:
    - VariableDeclarator             # 声明的具体内容
      - id:
        - Identifier                 # 标识符，即变量名
          - name: "add"
      - init:
        - ArrowFunctionExpression    # 一个箭头函数表达式
          - params: [                # 函数的参数
            - Identifier (name: "a")
            - Identifier (name: "b")
          ]
          - body:                    # 函数体
            - BinaryExpression       # 一个二元表达式
              - operator: "+"
              - left: Identifier (name: "a")
              - right: Identifier (name: "b")
```

### 2. 转换阶段（Transformation）

Babel 会从上到下、深度优先遍历 AST 语法树，根据配置的**插件和预设**转换代码语法，生成新的 AST。

如果没有任何插件需要处理某个节点，Babel 会原封不动地保留该节点。

#### 插件转换示例

假设配置了 `@babel/plugin-transform-arrow-functions` 插件，它会将箭头函数转换成普通函数。

当遍历器找到 `ArrowFunctionExpression` 节点时，插件会执行以下操作：

1. 根据旧语法规则，**创建**一个新的 `FunctionExpression`（普通函数）节点
2. 将原箭头函数的参数（`params`）和函数体（`body`）**复制**到新节点
3. 用新节点**替换**掉 AST 中原来的旧节点

转换后的 AST 结构：

```yaml
- VariableDeclaration
  - kind: "var"                      # 插件可能还会把 const 变成 var
  - declarations:
    - VariableDeclarator
      - id:
        - Identifier (name: "add")
      - init:
        - FunctionExpression         # ✨ 看，这里被替换了！
          - params: [
            - Identifier (name: "a")
            - Identifier (name: "b")
          ]
          - body:
            - BlockStatement         # 普通函数需要一个代码块
              - body: [
                - ReturnStatement    # 并且需要一个 return 关键字
                  - argument:
                    - BinaryExpression
                      - operator: "+"
                      - left: Identifier (name: "a")
                      - right: Identifier (name: "b")
```

### 3. 生成阶段（Code Generation）

Babel 使用生成器遍历转换后的 AST，将每个节点按照语法规则打印成字符串。

生成规则示例：

**看到 `VariableDeclaration`** - 打印 `var`

**看到 `FunctionExpression`** - 打印 `function(...) { ... }`

**看到 `ReturnStatement`** - 打印 `return ...;`

最终根据 AST 语法树生成目标代码字符串，同时生成 `source-map` 文件方便调试。

完整流程示意图：

![Babel 转换流程](https://pica.zhimg.com/80/v2-1d99595acdb1b23735604567ec0e3c9e_1420w.png)

---

## 三、Babel 配置文件

Babel 支持两种配置文件格式，它们有不同的适用场景。

### 1. babel.config.* 配置文件（推荐）

**支持的文件名**：`babel.config.json`、`babel.config.js`、`babel.config.cjs`、`babel.config.mjs`

**推荐理由**：这种配置文件可以直接作用于 `Monorepos` 项目的子包，配置可以在整个项目中共享。

**什么是 Monorepos**：一个项目包含多个子包的项目结构。`babel.config.json` 配置能共享到所有子包项目中，避免重复配置。

### 2. .babelrc.* 配置文件

**支持的文件名**：`.babelrc.json`、`.babelrc`、`.babelrc.js`、`.babelrc.cjs`、`.babelrc.mjs`

**历史背景**：早期 Babel 主要使用这种配置方式，但对于配置 `Monorepos` 项目比较麻烦，每个子项目都需要单独配置。

::: tip 配置建议
对于新项目，推荐使用 `babel.config.json` 配置文件格式。
:::

---

## 四、浏览器兼容性解决方案

### 1. 为什么需要浏览器兼容性配置

在现代前端开发中，我们面临以下挑战：

**新语法支持问题** - 有些浏览器不支持 ES2025 等新语法特性

**CSS 新特性兼容** - 部分浏览器不支持 CSS3 的新语法

**工具如何判断** - Babel 转换 JS、PostCSS 处理 CSS 时，如何知道哪些浏览器需要兼容？

这时我们需要一个统一的工具来描述目标浏览器，这就是 `browserslist` 的作用。

### 2. Browserslist 是什么

#### 安装 Browserslist

```bash
npm install -D browserslist
```

#### 核心功能

市面上有大量浏览器：`Chrome`、`Safari`、`IE`、`Edge`、`Chrome for Android`、`UC Browser`、`QQ Browser` 等。

我们需要知道：

**市场占有率** - 各个浏览器的市场份额是多少？

**是否需要兼容** - 我们要不要为某些浏览器做兼容？

**功能支持情况** - 哪些浏览器支持哪些新特性？

可以通过 [Can I Use](https://caniuse.com/usage-table) 网站查询浏览器市场占有率和特性支持情况。

#### Browserslist 的作用

Browserslist 的核心作用是**告诉各大工具（Babel、PostCSS 等）需要兼容哪些浏览器**，工具会根据这个规则进行代码转换。

这样可以在 **CSS 兼容性**和 **JS 兼容性**下共享同一套配置。

#### 基础配置示例

在项目中创建 `.browserslistrc` 文件：

```text
> 1%
last 2 versions
not dead
```

配置说明：

**`> 1%`** - 兼容市场占有率大于 1% 的浏览器

**`last 2 versions`** - 兼容每个浏览器的最后 2 个版本

**`not dead`** - 排除 24 个月内没有官方支持或更新的浏览器

Browserslist 使用 `caniuse-lite` 工具进行条件查询，数据来自 Can I Use 网站。

### 3. Browserslist 配置规则详解

#### 常用配置参数

**1. defaults** - Browserslist 的默认配置

等同于 `> 0.5%, last 2 versions, Firefox ESR, not dead`

其中 `Firefox ESR` 是指 Firefox 的扩展支持版本（Extended Support Release）

**2. 市场份额配置**

```text
5%                    # 全球市场份额大于 5% 的浏览器
>= 5%                 # 大于等于 5%
< 5%                  # 小于 5%
5% in US              # 美国市场份额大于 5% 的浏览器
> 5% in alt-AS        # 亚洲地区市场份额大于 5% 的浏览器
> 5% in my stats      # 使用自定义统计数据
cover 99.5%           # 覆盖全球 99.5% 用户的最受欢迎浏览器
cover 99.5% in US     # 覆盖美国 99.5% 用户的最受欢迎浏览器
```

关于地区代码的完整列表，请参考 [caniuse-lite regions](https://github.com/browserslist/caniuse-lite/tree/main/data/regions)。

**3. dead** - 排除已停止维护的浏览器

24 个月内没有官方支持或更新的浏览器将被视为 `dead`。

**4. 版本配置**

```text
last 2 versions                # 每个浏览器的最后 2 个版本
last 2 Chrome versions         # Chrome 浏览器的最后 2 个版本
last 2 major versions          # 最近 2 个主要版本的所有次要/补丁版本
last 2 iOS major versions      # iOS 的最近 2 个主要版本
```

**5. Node.js 版本配置**

```text
node 20                        # 特定的 Node.js 版本
current node                   # 当前使用的 Node.js 版本
maintained node versions       # 所有仍由 Node.js 基金会维护的版本
```

**6. 特定浏览器版本**

```text
iOS 7                          # iOS 浏览器版本 7
Firefox > 20                   # Firefox 版本高于 20（支持 >=、<、<=）
Firefox >= 20                  # Firefox 版本大于等于 20
ie 6-8                         # IE 6 到 IE 8 的所有版本
Firefox ESR                    # 最新的 Firefox ESR 版本
PhantomJS 2.1                  # PhantomJS 2.1 对应的 Safari 版本
```

**7. 特性支持配置**

```text
supports es6-module            # 支持 ES6 模块的浏览器
supports grid                  # 支持 CSS Grid 的浏览器
```

**8. 时间范围配置**

```text
since 2025                     # 自 2025 年以来发布的所有版本
last 2 years                   # 最近两年内发布的所有浏览器版本
```

**9. 未发布版本**

```text
unreleased versions            # 所有浏览器的 Alpha 和 Beta 版本
unreleased Chrome versions     # Chrome 的 Alpha 和 Beta 版本
```

**10. 排除特定浏览器**

```text
not ie <= 8                    # 排除 IE 8 及以下版本
not dead                       # 排除已停止维护的浏览器
```

#### 命令行测试

可以在命令行中测试配置规则：

```bash
npx browserslist "> 0.1%, last 2 versions, not dead"
```

这个命令会输出符合条件的浏览器和版本号：

![Browserslist 命令行输出](https://picx.zhimg.com/80/v2-f8f0b755157c8747043231f82f7f87ec_1020w.png)

### 4. 配置 Browserslist 的两种方式

#### 方式一：在 package.json 中配置

在 `package.json` 文件中添加 `browserslist` 字段：

```json
{
  "browserslist": [
    "> 0.1%",
    "last 2 versions",
    "not dead"
  ]
}
```

#### 方式二：创建 .browserslistrc 文件（推荐）

在项目根目录创建 `.browserslistrc` 文件：

```text
> 0.1%
last 2 versions
not dead
```

::: tip 推荐建议
使用独立的 `.browserslistrc` 文件更清晰，便于维护和版本控制。
:::

### 5. Browserslist 条件关系

Browserslist 支持逻辑运算符来组合多个条件。

#### 条件组合规则

![Browserslist 条件关系](https://picx.zhimg.com/80/v2-7fa366164e76d303ce7a1a8c2e548836_1020w.png)

**OR（或）关系** - 不同行的配置之间是 OR 关系，浏览器列表会合并

**AND（与）关系** - `not` 组合器会与前面的条件形成 AND 关系

**NOT（非）关系** - `not` 关键字用于排除浏览器

::: warning 重要提示
`not` 组合器不能放在首位，只能放在中间或末尾。
:::

#### 实际案例对比

让我们用一个实际的代码示例来理解不同配置的影响：

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

**配置一：规则顺序影响**

```text
> 0.1%
last 2 versions
not dead
```

执行逻辑：

1. 先处理 `> 0.1%` 和 `last 2 versions`，得到结果 A（OR 关系）
2. 再处理 `not dead`，得到结果 B
3. 最终列表是 A 和 B 的**并集**
4. **这个规则会排除 IE 11**

转换结果：

![配置一转换结果](https://pic1.zhimg.com/80/v2-71b0e6302ba2bcae1387b61736c43c58_1020w.png)

**配置二：规则顺序影响**

```text
last 2 versions
not dead
> 0.1%
```

执行逻辑：

1. 先处理 `last 2 versions` 和 `not dead`，得到结果 A（OR 关系）
2. 再处理 `> 0.1%`，得到结果 B
3. 最终列表是 A 和 B 的**并集**
4. **这个规则不会排除 IE 11**

转换结果：

![配置二转换结果](https://pic1.zhimg.com/80/v2-d8a1015087ae9ff2a226ba6e7048c2ee_1020w.png)

::: danger 关键区别
配置的**顺序会影响最终的浏览器列表**。特别是 `not` 组合器的位置，会决定哪些浏览器被排除。在实际项目中，需要根据业务需求仔细调整配置顺序。
:::

### 6. Babel 单独配置兼容性

如果不想使用全局的 Browserslist 配置，可以在 Babel 配置文件中单独指定目标浏览器。

在项目根目录创建 `babel.config.js`：

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.1%, last 2 versions, not dead'
      }
    ]
  ]
};
```

配置 `targets` 字段后，Babel 会使用这里的配置，而不是读取 `.browserslistrc` 文件。

转换效果：

![Babel 单独配置效果](https://pic1.zhimg.com/80/v2-71b0e6302ba2bcae1387b61736c43c58_1020w.png)

::: tip 配置优先级
Babel 配置文件中的 `targets` 优先级**高于** `.browserslistrc` 文件。如果两者都存在，Babel 会优先使用自己配置中的 `targets`。
:::

---

## 总结

**Babel 工作原理**：解析（Parsing）→ 转换（Transformation）→ 生成（Code Generation）三个阶段

**配置文件选择**：推荐使用 `babel.config.json` 格式，支持 Monorepos 项目

**Browserslist 作用**：统一管理浏览器兼容性配置，在 Babel、PostCSS 等工具间共享

**配置规则**：灵活使用市场份额、版本号、特性支持等条件组合

**配置顺序**：注意 `not` 组合器的位置，会影响最终的浏览器列表

**独立配置**：Babel 可以通过 `targets` 字段单独配置，优先级高于全局配置