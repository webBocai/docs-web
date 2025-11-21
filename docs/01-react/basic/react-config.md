---
date: 2025-05-15 09:43:30
title: React项目配置 <TkTitleTag type="ep-primary" text="配置" position="right" />
permalink: /react/24445d
categories:
  - React
coverImg: /img/react_ts.jpeg
tags:
 - React配置
---
# React开发环境搭建

### 一、配置 eslint 和prettier

#### 1.下载eslint
::: tip 解释插件
 `@typescript-eslint/parser` ：负责解析 TypeScript 代码，使 ESLint 能够理解 TypeScript 语法。

 `@typescript-eslint/eslint-plugin` ：提供了一组专门用于 TypeScript 的 ESLint 规则，用来帮助你在 TypeScript 项目中进行代
 码质量控制。
:::
通常，**两个包一起使用** ，以便让 ESLint 能够解析并且检查 TypeScript 代码。  



::: code-group
```bash [npm]
npm install eslint @typescript-eslint/parser  @typescript-eslint/eslint-plugin --save-dev
```
```bash [yarn]
 yarn add -D eslint @typescript-eslint/parser  @typescript-eslint/eslint-plugin 
```
:::

### 2.配置eslint


#### 1.初始化 eslint 
-  初始化eslint根据交换生成一个eslint的配置文件

```bash [npm]
npx eslint  --init 
```
#### 2.配置script命令 全局检查
::: info  全局检查
 只有是在src下的文件 `js ts tsx jsx`都应该被检查
  - 在`package.json`文件下的`script`命令中
  - **引号问题** ：
    - 在 Windows 环境下，单引号 `'` 通常会导致路径模式无法正确解析。Windows 的命令行通常使用双引号 `"` 来包裹路径模式，或者干脆不使用引号
    - **解决办法** ：将命令中的单引号替换为双引号或去掉引号。   
:::
::: tip 正则表达式的括号问题
- 在正则表达式中使用 `+` 和 `()` 可能会在某些环境中引起问题，特别是在 Windows 环境中。
- 通常，`eslint` 支持通配符 `*.{js,jsx,ts,tsx}` 的格式，但如果你需要使用 `+`，最好还是将它替换成标准的文件扩展名模式。
:::

  ```json [package.json]
    "script":{
        ....省略配置,
      // windows  mac
      "lint": "eslint \"src/**/*.{js,jsx,ts,tsx}\""
      // mac
      "lint":" eslint 'src/**/*.+(js|jsx|ts|tsx)'" 
    }

  ```
::: tip  解释 src/**/*.{js,jsx,ts,tsx} 的含义
  - **`src/`** ：表示 `src` 目录下的所有文件和子目录。
  - **`**/`** ：`**` 是一个通配符，表示**递归匹配** `src` 目录下的所有子目录和子文件。
    - 换句话说，`**/` 会匹配 `src` 目录下的任何深度的文件夹。
  - **`*.{js,jsx,ts,tsx}`** ：表示匹配所有扩展名为 `.js`、`.jsx`、`.ts`、`.tsx` 的文件。
:::
因此，`src/**/*.{js,jsx,ts,tsx}` 表示 `src` 目录下（包括所有子目录中的文件）的所有 `.js`、`.jsx`、`.ts` 和 `.tsx` 文件。
### 3.安装prettier

- `eslint-config-prettier` ：主要用于禁用与 Prettier 冲突的 ESLint 规则。它确保 ESLint 和 Prettier 不会有重复的规则，避免冲突。
- `eslint-plugin-prettier` ：将 Prettier 的格式化规则作为 ESLint 的规则运行。如果代码不符合 Prettier 格式，ESLint 会提示错误。

::: code-group
```bash [npm]
npm install prettier eslint-config-prettier eslint-plugin-prettier --save-dev
```

```bash [yarn]
yarn add -D prettier eslint-config-prettier eslint-plugin-prettier 
```
:::

#### 1.配置prettier

- 在根目录下创建`.vscode`文件夹

  - 在文件夹下创建`settings.json`文件

    ```js [settings.json]
    {
        "editor.codeActionsOnSave": {
            "source.fixAll.eslint": "explicit" //保存就进行格式化
        }
    }
    ```

- 在根目录下创建`.prettierrc.mjs`文件

  ```js [.prettierrc.mjs]
  export default {
    // 箭头函数只有一个参数的时候可以忽略括号
    arrowParens: "avoid",
    // 括号内部不要出现空格
    bracketSpacing: true,
    // 行结束符使用 Unix 格式
    endOfLine: "lf",
    // true: Put > on the last line instead of at a new line
    jsxBracketSameLine: false,
    // 行宽
    printWidth: 100,
    // 换行方式
    proseWrap: "preserve",
    // 分号
    semi: true,
    // 使用单引号
    singleQuote: false,
    // 缩进
    tabWidth: 2,
    // 使用 tab 缩进
    useTabs: false,
    // 后置逗号,多行对象、数组在最后一行增加逗号
    trailingComma: "es5",
    parser: "typescript",
  };
  
  ```

  

### 二、配置husky

####  1. 什么是husky
::: tip 什么是husky
husk是一个git hook工具，**在git commit 之前执行自定义的命令**，如执行代码风格的检查。

避免提交不规范的代码
:::

#### 2.安装husk


::: code-group
```bash [npm]
npm install --save-dev husky
```
```bash [yarn]
yarn add --dev husky
```
::: 

#### 3.初始化husk

- 会新增一个`.husk` -> `pre-commit`

```bash [npm]
npx husky init
```

- `pre-commit` 文件中

  - 在执行git commit 这个命令**之前执行的自定义命令**

  ```bash [npm]
  yarn lint
  yarn format
  npm lint 
  npm format
  git add .
  ```

  

### 三.配置commitlint

#### 1.什么是commitlint
::: tip commit 命令提交解释
- `commitlint `是用于约定规范git 存储记录的工具
  - `build`:用于构建工作的命令
  - `chore`: 用于修复平时琐事的命令
  - `docs `:修改了文档
  - `feat ` 新增了需求
  - `fix` 修复bug
  - `perf`  性能优化
  - `refactor`  重构
  - `revert`  回退
  - `style`  修改样式
  - `test`  测试
:::
#### 2.安装commitlint


::: code-group
```bash [npm]
npm install --save-dev @commitlint/{cli,config-conventional}
```

```bash [yarn]
yarn add --dev @commitlint/{cli,config-conventional}
```
:::

#### 3.配置commitlint
<div style="visibility:hidden">1</div>

#####    1.创建文件方式

- 在根目录创建`commitlint.config.js`
```js [commitlint.config.js]
  export default { extends: ["@commitlint/config-conventional"] };
```

#####    2.命令方式

```bash [npm]
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
```

### 四. 修复eslint packge.json问题
- 如果每次保存 eslint 都会报 package.json 错误，需要安装这个`eslint-config-react-app`包
::: code-group
```bash [npm]
 npm install  eslint-config-react-app --save-dev  
```
```bash [yarn]
yarn add  -D eslint-config-react-app
```
::: 
