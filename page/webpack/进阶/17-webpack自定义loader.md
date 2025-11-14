---
date: 2025-10-11 20:15:30
title: 17-自定义loader <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/17-自定义loader
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - babel的进阶使用

---
# Webpack 自定义 Loader 完整指南

## 1. 创建自己的 Loader

### 1.1 Loader 介绍

`Loader` 是用于对模块的源代码进行转换处理的工具。在之前的开发中，我们已经使用过很多 Loader，比如 `css-loader`、`style-loader`、`babel-loader` 等。

**Loader 的本质：** Loader 本质上是一个导出为函数的 JavaScript 模块。`loader-runner` 库会调用这个函数，然后将上一个 `loader` 产生的结果或者资源文件传入进去。

### 1.2 基础使用

首先在根目录创建一个 `loaders` 文件夹，然后创建一个 `customLoader.js` 文件。

**Loader 函数参数说明：**

这个函数会接收三个参数：

- `content`：资源文件的内容
- `map`：sourcemap 相关的数据（基于前一个 loader callback 传输过来的值）
- `meta`：一些元数据（基于前一个 loader callback 传输过来的值）

```js
// customLoader.js
module.exports = (content) => {
  console.log('content', content);
  return content;
};
```

在 `src` 目录下创建 `main.js`：

```js
const message = 'hello world';
console.log(message);
```

在 `webpack.config.js` 中引入 loader：

```js
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: './loaders/customLoader.js',
          },
        ],
      },
    ],
  },
};
```

启动打包命令查看结果，可以看到 `content` 打印的内容就是 `main.js` 里面的内容，只不过是字符串形式。

![Loader基础使用结果](https://pic1.zhimg.com/80/v2-7e9eb4c4e9df2513be77ecb5755eed13_1020w.png)

### 1.3 resolveLoader 属性优化

上面的自定义 loader 写法比较繁琐，能否像第三方 loader 那样只给 loader 名字就可以使用呢？

`resolveLoader` 配置项可以实现这个功能，它的默认值里面就包含 `node_modules`。我们可以添加自定义的 loader 路径：

```js
module.exports = {
  // ...其它配置
  resolveLoader: {
    modules: ['node_modules', './loaders']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'customLoader',  // 直接使用名称
          },
        ],
      },
    ],
  },
}
```

---

## 2. Loader 的执行顺序

### 2.1 默认执行顺序（Normal 阶段）

这个 loader 执行阶段称为 **Normal 阶段**。

在 `loaders` 目录创建多个 loader 文件：`customLoader2.js` 和 `customLoader3.js`

```js
// customLoader2.js
module.exports = (content) => {
  console.log('customLoader2', content);
  return content;
};

// customLoader3.js
module.exports = (content) => {
  console.log('customLoader3', content);
  return content;
};
```

在 `webpack.config.js` 中配置：

```js
module.exports = {
  // ...其它配置
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          { loader: 'customLoader' },
          { loader: 'customLoader2' },
          { loader: 'customLoader3' },
        ],
      },
    ],
  },
}
```

打包运行查看结果，如果有多个 loader，它的**默认执行顺序**是**从后往前执行**。

![Loader执行顺序](https://pica.zhimg.com/80/v2-c242a2a7fce23978f7972d5e155abe45_1020w.png)

### 2.2 Pitch Loader 的使用（Pitching 阶段）

这个 loader 执行阶段称为 **Pitching 阶段**，这个阶段的执行顺序是**从前往后，与 Normal 阶段相反**。

修改 loaders 文件夹中的三个 js 文件，pitch 函数有三个参数：

**参数说明：**

1. **remainingRequest（剩余请求）** - 类型：`string`

   代表在当前 loader 之后还剩下需要处理的 loader 链以及最终的资源文件。你可以把它理解为"接下来要做什么"。它由 `!` 分隔，包含了后续所有的 loader 路径和最终的资源文件路径（不包含当前）。

   例如：在 `customLoader2.js` 中打印 `remainingRequest`

   假如路径是：`D:\test\webpack\自定义loader`

   打印结果：`D:\test\webpack\自定义loader\custom\customLoader3.js!D:\test\webpack\自定义loader\src\main.js`

2. **precedingRequest（前置请求）** - 类型：`string`

   代表在当前 loader 之前已经被 pitch 函数处理过的 loader 链，你可以把它理解为"之前做过什么"。

   继续上面的例子，在 `customLoader2.js` 中打印 `precedingRequest`

   打印结果：`D:\test\webpack\自定义loader\09-自定义loader\custom\customLoader.js`

3. **data（数据对象）** - 类型：`object`

   默认是一个空对象，你可以在 pitch 函数中向这个对象里添加任何属性。这些属性可以在同一个 loader 的 normal 执行阶段通过 `this.data` 访问。

   它提供了一种在 Pitching 阶段和 Normal 阶段之间传递数据的机制。

   示例：

   ```js
   module.exports = function (content) {
     console.log(this.data.someValue); // 123
     return content;
   };
   
   module.exports.pitch = (remainingRequest, precedingRequest, data) => {
     data.someValue = 123;
   };
   ```

   注意：如果需要使用 `this`，请不要使用箭头函数。

完整代码示例：

```js
// customLoader.js
module.exports = (content) => {
  console.log('content', content);
  return content;
};
module.exports.pitch = () => {
  console.log('pitch1');
};

// customLoader2.js
module.exports = function (content) {
  console.log('customLoader2', content);
  console.log(this.data.someValue); // 123
  return content;
};
module.exports.pitch = (remainingRequest, precedingRequest, data) => {
  console.log('remainingRequest2', remainingRequest);
  console.log('precedingRequest2', precedingRequest);
  console.log('data2', data); // {}
  data.someValue = 123;
};

// customLoader3.js
module.exports = (content) => {
  console.log('customLoader3', content);
  return content;
};
module.exports.pitch = () => {
  console.log('pitch3');
};
```

打包查看运行结果，**Pitching 阶段**的执行顺序是**从前往后**：

![Pitching阶段执行顺序](https://picx.zhimg.com/80/v2-2edaf67484d1d5e29b2442e8159b68dc_1020w.png)

### 2.3 执行顺序和 enforce

**为什么 pitch-loader 和默认 loader 的执行顺序是相反的？**

`loader-runner` 先优先执行 PitchLoader，在执行 PitchLoader 时进行 `loaderIndex++`；之后会执行 NormalLoader，在执行 NormalLoader 时进行 `loaderIndex--`。

**enforce 的四种方式：**

1. 默认所有的 loader 都是 `normal`

2. 通过 `enforce` 设置 `pre` 和 `post`

3. 在行内设置的 loader 是 `inline`（`import 'loader1!loader2!./test.js'`）

   示例：在 `src` 目录下创建 `math.js`

   ```js
   const a = 10;
   ```

   在 `src` 目录中修改 `main.js`

   ```js
   import '../loaders/customLoader.js!../loaders/customLoader2.js!../loaders/customLoader3.js!./test.js'
   ```

   为了避免 `webpack.config.js` 里面自定义 loader 影响打印结果，首先注释 `module.rules` 里面的规则，然后查看输出结果：

   ![行内Loader执行](https://pic1.zhimg.com/80/v2-f122503159e16ba60942bac9e9fa3189_1020w.png)

**Pitching 和 Normal 阶段的执行顺序：**

- **Pitching 阶段**：`post` → `inline` → `normal` → `pre`
- **Normal 阶段**：`pre` → `normal` → `inline` → `post`

示例：我们首先让 rules 规则只处理 `math.js`（如果处理全部 js 文件，某个 js 里面用了 inline 会产生嵌套）

```js
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
  },
  resolveLoader: {
    modules: ['node_modules', './custom'],
  },
  module: {
    rules: [
      {
        test: /math\.js$/,
        enforce: 'pre',
        use: [{ loader: 'customLoader' }],
      },
      {
        test: /math\.js$/,
        use: [{ loader: 'customLoader2' }],
      },
      {
        test: /math\.js$/,
        enforce: 'post',
        use: [{ loader: 'customLoader3' }],
      },
    ],
  },
};
```

在 `main.js` 中：

```js
import '../custom/customLoader.js!./math.js';
const message = 'hello world';
console.log(message);
```

打包查看打印结果，与上面结论一致：

![enforce执行顺序](https://pic1.zhimg.com/80/v2-5b083544ccba082d76f2d9d25f72972c_1020w.png)

### 2.4 嵌套 Loader 执行顺序

将刚刚 `webpack.config.js` 里面 loader 配置中的 `test: /math\.js$/` 修改为 `test: /\.js$/`：

```js
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
  },
  resolveLoader: {
    modules: ['node_modules', './custom'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: [{ loader: 'customLoader' }],
      },
      {
        test: /\.js$/,
        use: [{ loader: 'customLoader2' }],
      },
      {
        test: /\.js$/,
        enforce: 'post',
        use: [{ loader: 'customLoader3' }],
      },
    ],
  },
};
```

一旦执行就会出现类似于**俄罗斯套娃**的嵌套情况。这里展示重要的嵌套执行顺序：

1. 首先执行外层 Pitching（配置文件 rules）
2. 然后执行内层 Pitching（inline loader）
3. 内层 Normal（inline loader）
4. 外层 Normal（配置文件 rules）

---

## 3. Loader 分类

准备工作：在根目录新增 `loaders` 目录，然后创建两个文件：`syncLoader1.js` 和 `syncLoader2.js`

修改 `webpack.config.js` 中的 rules：

```js
rules: [
  {
    test: /\.js$/,
    use: [
      { loader: 'syncLoader2' },
      { loader: 'syncLoader1' },
    ],
  },
]
```

### 3.1 同步 Loader

**什么是同步的 Loader？**

默认创建的 Loader 就是同步的 Loader。这个 Loader 必须通过 `return` 或者 `this.callback` 来返回结果，交给下一个 loader 来处理。通常在有错误的情况下，我们会使用 `this.callback`。

**使用 return 返回值：**

```js
// syncLoader1.js
module.exports = function (content) {
  console.log(content);
  return content + '2222';
};

// syncLoader2.js
module.exports = function (content) {
  return `${content}`;
};
```

**使用 this.callback 返回值：**

`callback` 第一个参数是错误参数，没有错误给 `null`；第二个参数是 content；后面参数依次类推。

```js
// syncLoader1.js
module.exports = function (content) {
  console.log(content);
  this.callback(null, content, { name: 'zs' }, { name: 'ls' }, { name: 'ww' });
};

// syncLoader2.js
module.exports = function (content, map, meta, test) {
  console.log(content);
  console.log(map);   // { name: 'zs' }
  console.log(meta);  // { name: 'ls' }
  console.log(test);  // { name: 'ww' }
  return `${content}`;
};
```

![同步Loader结果](https://pic1.zhimg.com/80/v2-b2b621e27bd1914db7be80da83542194_1020w.png)

### 3.2 异步 Loader

有时候我们使用 Loader 时会进行一些异步的操作：

```js
// syncLoader1.js
module.exports = function (content) {
  setTimeout(() => {
    // 执行耗时操作之后，如何给下一个loader传参？
  }, 1000);
};
```

我们希望在异步操作完成后，再返回这个 loader 处理的结果。这个时候就要使用异步的 Loader。`webpack` 里面的 `loader-runner` 已经在执行 loader 时给我们提供了方法：

```js
module.exports = function (content) {
  const callback = this.async();
  setTimeout(() => {
    callback(null, content, { name: 'zs' }, { name: 'ls' }, { name: 'ww' });
  }, 1000);
};
```

---

## 4. Loader 参数处理

### 4.1 传入和获取参数

在使用 loader 时传入参数：

```js
module: {
  rules: [
    {
      test: /\.js$/,
      use: [
        {
          loader: 'syncLoader1',
          options: {
            name: 'zs',
            age: 18,
          },
        },
      ],
    },
  ],
}
```

**获取参数的方式：**

旧版本：以前需要下载 `loader-utils` 这个库

```shell
npm i loader-utils -D
```

```js
const { getOptions } = require('loader-utils');
module.exports = (content) => {
  const options = getOptions();
  console.log('options', options);
}
```

新版本：直接通过 `this.getOptions`

```js
module.exports = (content) => {
  const options = this.getOptions();
  console.log('options', options);
}
```

### 4.2 校验参数

我们可以通过 webpack 官方提供的校验库 `schema-utils` 来校验参数。安装对应的库：

```shell
npm i schema-utils -D
```

**参数解释：**

1. **type 字段**可以是一个字符串或一个数组

   如果是字符串，表示数据类型，如：`number`、`string`、`object`、`array`、`boolean`、`null`

   ```json
   { "type": "number" }
   ```

   如果是数组，表示可以存入多个数据类型

   ```json
   { "type": ["array", "object"] }
   ```

2. **properties 关键字**定义 key-value 对

   properties 的值是一个对象，每个 key 的值作为一个 property 的名称，且每个值都用来校验该属性。任何与 properties 的属性名不匹配的属性都将被忽略。

3. **additionalProperties**

   关键字用于控制不在 properties 关键字或不在 patternProperties 正则表达式列表中的属性。默认情况下允许这类 properties。将 additionalProperties 设置为 `false` 表示不允许额外的属性。

   例如，以下表达式不允许：

   ```json
   { "number": 1600, "street_name": "Pennsylvania", "street_type": "Avenue", "direction": "NW" }
   ```

   配置：

   ```json
   "properties": {
     "number": { "type": "number" },
     "street_name": { "type": "string" },
     "street_type": { "enum": ["Street", "Avenue", "Boulevard"] }
   }
   ```

   还可以使用非 boolean 对额外的属性增加更加复杂的限制。如下表示只允许类型为字符串的额外属性：

   此时可以允许：

   ```json
   { "number": 1600, "street_name": "Pennsylvania", "street_type": "Avenue", "direction": "NW" }
   ```

   但不允许：

   ```json
   { "number": 1600, "street_name": "Pennsylvania", "street_type": "Avenue", "office_number": 201 }
   ```

   配置：

   ```json
   "properties": {
     "number": { "type": "number" },
     "street_name": { "type": "string" },
     "street_type": { "enum": ["Street", "Avenue", "Boulevard"] }
   },
   "additionalProperties": { "type": "string" }
   ```

在根目录创建一个 `schema` 文件夹，然后创建一个 `index.json`：

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "请输入姓名"
    },
    "age": {
      "type": "number",
      "description": "请填写年龄"
    }
  },
  "additionalProperties": true
}
```

修改 `webpack.config.js`：

```js
module: {
  rules: [
    {
      test: /\.js$/,
      use: [
        {
          loader: 'syncLoader1',
          options: {
            name: 'zs',
            age: '18',  // 故意传入字符串类型来测试校验
          },
        },
      ],
    },
  ],
}
```

在自定义 loader 文件中：

```js
const { validate } = require('schema-utils');
const schemaJson = require('../schema/index.json');

module.exports = function (content) {
  const options = this.getOptions();
  validate(schemaJson, options);
  return content;
};
```

打包运行结果：

![参数校验结果](https://pic1.zhimg.com/80/v2-ead6650fa6c936bf8fcffd15fc3434ac_1020w.png)

---

## 5. 自定义 Loader 案例

我们知道 `webpack` 只能处理 js 文件，需要额外处理其它文件时，需要合适的 loader 进行转换。

### 5.1 翻转 txt 文件内容

#### 准备工作

在 `src` 目录下，分别创建 `index.js` 和 `index.txt`

`index.txt` 内容：

```txt
你好我是txt文本
```

`index.js` 内容：

```js
import txt from './index.txt';
console.log('txt', txt);
```

#### 处理 txt 后缀文件

创建自定义 loader 文件夹，在根目录中创建 `loader` 文件夹，在 loader 文件夹中创建 `raw-loader.js`

`raw-loader` 的功能是将文件内容作为原始字符串导入。

`raw-loader.js` 内容：

```js
module.exports = function (sources) {
  const newSources = sources.split('').reverse().join('');
  return `
    module.exports = ${JSON.stringify(newSources)};
  `;
};
```

**疑问解答：**

1. **为什么在 return 返回的时候需要使用 `module.exports` 这个导出方式？**

   因为在 `index.js` 文件中使用了导入文件内容的操作，所以在 return 时必须返回一个模块。

2. **为什么 return 返回内容的时候，必须使用字符串包裹呢？**

   核心区别就在于"谁来执行"：

   - **错误的方式**（`return module.exports = "..."`）：是在 loader 自己的环境里执行代码，然后把执行的结果（一个值）返回给 Webpack。

   - **正确的方式**（`return 'module.exports = "...";'`）：是把一段代码包装成字符串，然后把这个字符串返回给 Webpack，让 Webpack 稍后去解析和执行这段代码，从而创建出一个新模块。

   loader 职责是返回给 js 文件必须是一个模块，而不能是最终结果。

在 `webpack.config.js` 中配置：

```js
const path = require('path');
const htmlWebpack = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolveLoader: {
    modules: ['node_modules', 'loader'],
  },
  module: {
    rules: [
      {
        test: /\.txt$/,
        loader: 'raw-loader',
      },
    ],
  },
  plugins: [new htmlWebpack()],
};
```

打包查看结果：

![翻转txt结果](https://picx.zhimg.com/80/v2-11997bb9b3b6b134d0c7aef11160bc79_1440w.png)

#### 总结执行流程

1. `index.js` 请求：`import txt from './index.txt'`
2. Webpack 找到处理 `.txt` 的 loader
3. Loader 执行：读取 `index.txt` 内容，进行处理（反转字符串）
4. Loader 返回：返回一个字符串形式的、完整的 JavaScript 模块代码，如 `module.exports = "处理后的内容";`
5. Webpack 打包：将这段代码作为一个新模块打包进最终的 bundle 文件
6. `index.js` 得到结果：`txt` 变量成功获取到 loader 生成模块所导出的值

### 5.2 移除 console 语句

#### 准备工作

在 `index.js` 中：

```js
const message = 10;
const hello = 'hello world';
const userInfo = {
  name: 'zs',
  age: 10,
  gender: '男',
};
console.log(message);
console.info(userInfo);
console.error(hello);
console.warn(userInfo);
```

#### 配置 remove-console

在 `webpack.config.js` 中修改（根据参数传参为 `true` 的会被删除）：

```js
module.exports = {
  // ...省略其它配置
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'remove-console',
            options: {
              log: true,
              info: true,
            },
          },
        ],
      },
    ],
  },
}
```

在 `remove-console.js` 文件中：

1. 如果没传入参数，所有 console 将会被删除
2. 如果传入参数，根据传参的参数为 true，将删除对应的 console

```js
module.exports = function (sources) {
  const options = this.getOptions() || {};

  let result = sources;
  // 没有传参，将清空所有console
  if (!Object.keys(options).length) {
    result = sources.replace(/console\.\w+\s*\(.*?\)\s*;?/g, '');
    return result;
  }
  
  let preStr = [];
  // 根据参数进行获取哪些需要删除
  for (const key in options) {
    if (options[key]) {
      preStr.push(key);
    }
  }
  preStr = preStr.join('|');
  // 根据参数删除对应console
  const pattern = new RegExp(`console\\.(${preStr})\\s*\\(.*?\\)\\s*;?`, 'g');
  result = sources.replace(pattern, '');

  return result;
};
```

打包查看结果，此时我们看到只保留了 `error` 和 `warn`，log 和 info 都被删除了：

![移除console结果](https://pica.zhimg.com/80/v2-e6a09fb17ed3267bdbadec4553ae481a_1420w.png)

### 5.3 转换 CSS

模拟 `css-loader` 和 `style-loader` 进行处理。

#### 准备工作

在 `src` 目录下创建 `index.css` 文件：

```css
h1 {
  color: red;
  font-size: 45px;
}
```

在 `index.js` 文件中修改：

```js
import './css/index.css';
const h1 = document.createElement('h1');
h1.textContent = 'Webpack';
document.body.appendChild(h1);
```

#### 处理 CSS

在自定义目录文件中新增 `css-loader.js` 和 `style-loader.js`

在 `css-loader.js` 中：

虽然这一步没什么大的作用，只是做了一个返回，我们这里也是在模拟 `css-loader` 传参给 `style-loader`。

```js
module.exports = function (content) {
  // 生成JS模块，该模块导出CSS字符串
  return `${content}`;
};
```

在 `style-loader.js` 中：

因为在 `index.js` 文件中我们并没有导入 css 文件，加上 `style-loader` 特性是在 html 文件中新增一个 style 标签添加 css 样式，所以不用导出值。

```js
module.exports = function (content) {
  return `
    const content = ${JSON.stringify(content)};
    const style = document.createElement('style');
    style.innerHTML = content;
    document.head.appendChild(style);
  `;
};
```

在 `webpack.config.js` 文件中：

```js
module.exports = {
  // ...省略其它配置
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}
```

打包运行查看结果：

![CSS处理结果](https://pic1.zhimg.com/80/v2-c79412ff828af2e46c08a647938efea7_1420w.png)

### 5.4 处理图片资源

#### 准备工作

在 `assets` 文件夹中放入图片文件，然后在 `index.js` 中引入：

```js
import txt from './index.txt';
import png from './assets/d.jpg';
console.log('txt', txt);

const img = document.createElement('img');
img.src = png;
document.body.appendChild(img);
```

#### 处理图片

在 `loader` 目录文件中创建 `file-loader.js`

**实现思路：**

将图片资源转换成 `base64` 的方式。

**Base64 数据 URL 组成规则：**

`data:${mimeType};base64,${base64}`

- `data`：这是协议头（Scheme），它告诉浏览器，后面的内容不是一个网络地址，而是直接嵌入的数据
- `mimeType`：这是 MIME 类型，它描述了数据的类型，比如 `image/png`、`image/jpeg` 或 `text/plain`。浏览器需要这个信息来正确地解析和渲染数据
- `;base64`：这是一个编码标记，它声明了后面的数据是使用 Base64 编码的
- `,`（一个逗号）：用来分隔元数据（协议、MIME类型、编码）和真正的数据本身

```js
// 工具函数，用于从文件名猜测MIME类型
function getMimeType(resourcePath) {
  const ext = resourcePath.split('.').pop().toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream'; // 默认的二进制流类型
  }
}

module.exports = function (sources) {
  const base64 = Buffer.from(sources).toString('base64');
  const mimeType = getMimeType(this.resourcePath);
  const dataUrl = `data:${mimeType};base64,${base64}`;
  return `
    module.exports = ${JSON.stringify(dataUrl)};
  `;
};

module.exports.raw = true;
```

**为什么需要设置 `module.exports.raw = true`？**

- **Webpack 的默认行为**：默认情况下，Webpack 认为它处理的都是文本文件。在调用 loader 之前，它会尝试将文件内容以 UTF-8 编码转换成一个 JavaScript 字符串。

- **处理资源的问题**：图片、字体、视频等文件是二进制（binary）文件，而不是纯文本。如果强行用 UTF-8 编码去解读一张图片的二进制数据，会导致数据损坏和乱码，资源就无法被正确处理了。

- **`raw = true` 的解决方案**：当你设置 `module.exports.raw = true;`，你就在告诉 Webpack："这个 loader 能够处理原始的二进制数据。" 于是，Webpack 会跳过"转换为字符串"这一步，直接将文件的原始二进制内容作为一个 Node.js 的 `Buffer` 对象传递给你的 loader 函数（即 `sources` 参数现在是一个 `Buffer`）。

在 `webpack.config.js` 中配置：

```js
const path = require('path');
const htmlWebpack = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolveLoader: {
    modules: ['node_modules', 'loader'],
  },
  module: {
    rules: [
      {
        test: /\.txt$/,
        loader: 'raw-loader',
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [new htmlWebpack()],
};
```

打包运行查看结果：

![图片处理结果](https://pic1.zhimg.com/80/v2-daea3295f766d3f50719eab338543df3_720w.png)

#### 根据文件大小选择输出方式

我们可以根据之前学的 loader 传参，然后根据文件大小，进行输出 base64 还是 http 格式的文件。

首先需要下载 `schema-utils` 这个库做校验参数：

```shell
npm i schema-utils -D
```

然后在根目录中创建 `schema` 文件夹，在文件夹中创建 `index.json`：

注意：`enum` 类似于 TypeScript 中的联合类型，如：`byte | kb | mb | gb | tb`

```json
{
  "type": "object",
  "properties": {
    "limitSize": {
      "type": "number",
      "description": "请输入文件限制大小，类型是数字"
    },
    "unit": {
      "type": "string",
      "enum": ["byte", "kb", "mb", "gb", "tb"],
      "description": "请填写单位,值只能是：byte kb mb gb tb"
    }
  },
  "additionalProperties": true
}
```

在 `webpack.config.js` 中配置：

```js
module.exports = {
  // ...省略其它配置
  module: {
    rules: [
      {
        test: /\.txt$/,
        loader: 'raw-loader',
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          limitSize: 3,
          unit: 'kb',
          fileName: 'assets/[name]-[hash:6].[ext]',
        },
      },
    ],
  },
}
```

修改 `file-loader.js`：

这里需要用到 `loader-utils` 里面的 `interpolateName` 方法。

**interpolateName 的作用是什么？**

`interpolateName` 函数的核心作用就是读取模板字符串，然后用真实的值去替换这些占位符，最终生成一个实际的文件名。

比如我们的配置里面存在 `assets/[name]-[hash:6].[ext]`：

- `[name]`：代表文件的原始名称
- `[hash:6]`：代表根据文件内容计算出的哈希值（这里取前6位）
- `[ext]`：代表文件的原始扩展名

在自定义 loader 中，当你需要支持像第三方 loader 那样灵活的文件名配置时，`interpolateName` 是一个必不可少的工具。

```js
const path = require('node:path');
const { validate } = require('schema-utils');
const schema = require('../schema/index.json');
const { interpolateName } = require('loader-utils');

// 工具函数，用于从文件名猜测MIME类型
function getMimeType(resourcePath) {
  const ext = resourcePath.split('.').pop().toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

// 转换单位
const getSourcesSize = (sourceLength, unit) => {
  if (unit.toLowerCase() === 'byte') {
    return sourceLength;
  }
  if (unit.toLowerCase() === 'kb') {
    return sourceLength / 1024;
  }
  if (unit.toLowerCase() === 'mb') {
    return Math.ceil(sourceLength / 1024 / 1024);
  }
  if (unit.toLowerCase() === 'gb') {
    return Math.ceil(sourceLength / 1024 / 1024 / 1024);
  }
  if (unit.toLowerCase() === 'tb') {
    return Math.ceil(sourceLength / 1024 / 1024 / 1024 / 1024);
  }
  return sourceLength;
};

module.exports = function (sources) {
  // 获取选项
  const options = this.getOptions();
  // 默认数字
  options.limitSize = options.limitSize || 1024;
  // 单位
  options.unit = options.unit || 'kb';

  const sourceLength = sources.length; // 获取二进制数据长度，也就是资源的大小
  // 根据单位进行转换
  const sourceSize = getSourcesSize(sourceLength, options.unit);

  // 校验用户传入的值是否符合
  validate(schema, options);

  if (sourceSize > options.limitSize) {
    const basename = path.basename(this.resourcePath);
    // 使用 interpolateName 生成文件名
    const filename = interpolateName(
      this, // loader 上下文
      options.fileName || basename, // 使用修正后的 fileName
      {
        content: sources, // 把文件内容传进去，用于计算 hash
      }
    );
    const publicPath = `__webpack_public_path__ + ${JSON.stringify(filename)}`;
    this.emitFile(filename, sources);
    return `module.exports = ${publicPath};`;
  }

  const base64 = Buffer.from(sources).toString('base64');
  const mimeType = getMimeType(this.resourcePath);
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return `
    module.exports = ${JSON.stringify(dataUrl)};
  `;
};

// 需要二进制数据
module.exports.raw = true;
```

打包查看结果：

因为我的图片大小是 `7kb`，我们限制最大为 `3kb` 就需要转成图片文件，不能用 base64，可以看到我们成功了。

![图片大小判断结果](https://pica.zhimg.com/80/v2-c16a54c373f1c72885005265cff74396_1420w.png)

### 5.5 模拟 babel-loader

模拟 `babel-loader` 的思路就是调用 `@babel/core` 这个核心库来实现 `babel-loader`。

我们需要安装以下依赖：

1. `@babel/plugin-proposal-class-properties` 插件，将 class 类转换成构造函数
2. `@babel/plugin-transform-block-scoping` 将 `let` 和 `const` 转换成 `var`
3. 或者只安装一个预设进行转换：`@babel/preset-env` 这个预设包含所有高级语法转 ES5 的插件

#### 准备工作

在 `index.js` 中写入一些 ES6+ 高级语法：

```js
const message = 'hello world';
console.log('message', message);

const userInfo = (name, age) => {
  console.log(name, age);
};

userInfo('zhangsan', 18);

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  talk() {
    console.log('你好世界！');
  }
}

const p1 = new Person('zhangsan', 18);
p1.talk();
```

#### 处理 JS

在 `webpack.config.js` 中：

我们将 `options` 传参进行注释，创建 `babel.config.js` 配置文件。

```js
module.exports = {
  // ...省略其它配置
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'custom-babel-loader',
            options: {
              // plugins: [
              //   ['@babel/plugin-proposal-class-properties', { loose: true }],
              //   '@babel/plugin-transform-block-scoping',
              // ],
            },
          },
        ],
      },
    ],
  },
}
```

创建根目录 `babel.config.js`：

```js
module.exports = {
  presets: ['@babel/preset-env'],
};
```

在自定义 loader 文件夹中，新增 `babel-loader.js` 文件：

在 `babel-loader` 中，我们需要调用 `@babel/core` 这个核心库进行转换，把 babel 的插件和预设添加进去，`@babel/core` 进行调用插件和预设进行转换。

```js
const { transform } = require('@babel/core');
const fs = require('fs');
const path = require('path');

module.exports = function (content) {
  // 因为 @babel/core 的转换是回调返回的参数，需要用到异步返回的方法
  const callback = this.async();
  // 模拟 babel.config.js 文件
  const filePath = path.resolve(__dirname, '../babel.config.js');
  // 获取用户参数
  let options = this.getOptions();
  
  // 如果用户没有传入参数，根据配置文件进行传入
  if (!options || Object.keys(options).length === 0) {
    // 判断是否有该文件
    const existFile = fs.existsSync(filePath);
    // 如果没有就报错
    if (!existFile) {
      callback('babel.config.js不存在');
      return;
    }
    // 存在就引入
    options = require(filePath);
  }
  
  // 根据传入参数，进行转换
  transform(content, options || {}, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result.code);
    }
  });
};
```

参考：[查看 @babel/core 文档](https://babeljs.io/docs/babel-core)

### 5.6 实现 markdown-loader

将 Markdown 语法转换成 HTML 方式。

#### 准备工作

首先我们写一些 Markdown 的语法。

在根目录中创建一个 `markdown` 文件夹，在文件夹中创建 `index.md`：

````markdown
# 前端

## HTML

块元素、行内元素、行内块元素

```html
<div>我是块元素</div>
<span>行内元素</span>
<img src='xxx' alt="行内块元素"/>
```

## CSS

float、flex、grid

```css
div {
  display: flex;
  width: 10px;
  justify-content: center;
}
```

## JavaScript

var const let 关键字的区别

```js
const a = 10;
console.log(a);
```
````

在 `index.js` 中引入 Markdown：

```js
import code from '../markdown/index.md';
document.body.innerHTML = code;
```

#### 处理 Markdown

首先需要下载 `marked` 库：

```shell
npm install marked -D
```

在自定义 loader 文件目录中创建 `markdown-loader.js` 进行处理：

```js
const { Marked } = require('marked');
const markedInstance = new Marked();

module.exports = function (content) {
  const htmlString = markedInstance.parse(content);
  const moduleCode = `module.exports = ${JSON.stringify(htmlString)};`;
  return moduleCode;
};
```

在 `webpack.config.js` 中使用：

```js
module.exports = {
  // ...省略其它代码
  module: {
    rules: [
      {
        test: /\.md$/,
        loader: 'markdown-loader',
      },
    ],
  },
}
```

打包查看结果：

但是我们看到代码似乎没有高亮并且没有样式，这个时候我们需要添加代码高亮。

![Markdown处理结果](https://picx.zhimg.com/80/v2-33cb83d54b3e8855d6c94e95da6e73a3_1420w.png)

#### 给代码添加高亮

安装 `marked-highlight` 和 `highlight.js` 插件：

```shell
npm i marked-highlight highlight.js -D
```

在 `markdown-loader.js` 中修改：

```js
const { Marked } = require('marked');
const { markedHighlight } = require('marked-highlight');
const hljs = require('highlight.js');

const markedInstance = new Marked(
  // 添加高亮代码
  markedHighlight({
    highlight: function (code, lang) {
      // 根据代码语言添加高亮效果，如果没有就用默认的 plaintext
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);

module.exports = function (content) {
  const htmlString = markedInstance.parse(content);
  const moduleCode = `module.exports = ${JSON.stringify(htmlString)};`;
  return moduleCode;
};
```

在 `index.js` 中引入 Markdown 的样式风格：

```js
import code from '../markdown/index.md';
import 'highlight.js/styles/github.css';
document.body.innerHTML = code;
```

在 `webpack.config.js` 中使用我们刚刚的 `css-loader` 和 `style-loader`：

```js
module.exports = {
  // ...省略其它代码
  module: {
    rules: [
      {
        test: /\.md$/,
        loader: 'markdown-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}
```

打包查看结果，这个时候我们看到代码就有对应的样式了。既然有了样式，我们是否可以添加自己的样式呢？

![代码高亮结果](https://pic1.zhimg.com/80/v2-0e918762c34a782a27543b680c0713b8_1420w.png)

#### 自己添加样式

在根目录中的 `css` 文件夹创建 `markdown.css` 文件：

```css
pre {
  background-color: #333434;
  padding: 10px;
  border-radius: 10px;
  color: #fff;
}

.hljs-tag .hljs-name,
.hljs-string {
  color: #fff !important;
}
```

然后在 `index.js` 中引入：

```js
import code from '../markdown/index.md';
import 'highlight.js/styles/github.css';
import '../css/markdown.css';

document.body.innerHTML = code;
```

然后打包查看结果，现在我们代码中的自定义样式就生效了：

![自定义样式结果](https://picx.zhimg.com/80/v2-eb2539475c3fec788046512490bd9b23_1420w.png)

---

## 总结

通过本文，我们深入学习了 Webpack 自定义 Loader 的各个方面：

1. **Loader 基础**：了解了 Loader 的本质是一个导出函数的 JavaScript 模块
2. **执行顺序**：掌握了 Normal 阶段和 Pitching 阶段的执行顺序规则
3. **Loader 分类**：学习了同步 Loader 和异步 Loader 的实现方式
4. **参数处理**：掌握了如何传递、获取和校验 Loader 参数
5. **实战案例**：通过多个实际案例（txt 翻转、console 移除、CSS 处理、图片处理、Babel 转换、Markdown 渲染）深入理解了 Loader 的开发流程

理解和掌握自定义 Loader 的开发，能够帮助我们更好地理解 Webpack 的工作原理，也为我们定制项目构建流程提供了强大的工具。
> [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/%E8%87%AA%E5%AE%9A%E4%B9%89loader)  