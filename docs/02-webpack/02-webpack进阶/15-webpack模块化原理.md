---
date: 2025-10-09 12:21:00
title: 15-模块化原理  <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /webpack/z6s91
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - babel的进阶使用
---
# Webpack 模块化原理详解

## 一、Webpack 如何处理 CommonJS 规范

### 1. 准备工作

首先创建项目结构并编写基础代码。

在 `src` 目录下创建 `utils` 文件夹,新增 `format.js` 文件:

```js
const sum = (num1, num2) => {
  return num1 + num2;
};
const sub = (num1, num2) => {
  return num1 - num2;
};
module.exports = {
  sum,
  sub,
};
```

在 `src` 目录创建 `index.js`:

```js
const { sub, sum } = require('./utils/format');
console.log(sub(10, 3));
console.log(sum(2, 3));
```

配置 `webpack.config.js`:

```js
const path = require('node:path');
module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

### 2. 打包结果分析

执行打包后,查看生成的核心代码:

```js
var __webpack_modules__ = {
  './src/utils/format.js': (module) => {
    const sum = (num1, num2) => {
      return num1 + num2;
    };
    const sub = (num1, num2) => {
      return num1 - num2;
    };
    module.exports = {
      sum,
      sub,
    };
  },
};

// 创建缓存
var __webpack_module_cache__ = {};

// 创建 require 函数
function __webpack_require__(moduleId) {
  var cachedModule = __webpack_module_cache__[moduleId];
  // 判断缓存里面是否有值
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }
  // 没有值创建一个 exports
  var module = (__webpack_module_cache__[moduleId] = {
    exports: {},
  });
  // 去用户源码中去引入
  __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

  return module.exports;
}

const { sub, sum } = __webpack_require__('./src/utils/format.js');
console.log(sub(10, 3));
console.log(sum(2, 3));
```

### 3. 核心机制解析

#### 3.1 模块注册表 (`__webpack_modules__`)

**作用:** 存储所有模块的源码。

**特点:**

键为模块路径(如 `'./src/utils/format.js'`),值为工厂函数,接收 `module` 对象用于挂载导出内容。

```js
var __webpack_modules__ = {
  './src/utils/format.js': (module) => {
    // 原始模块代码
    const sum = (a, b) => a + b;
    const sub = (a, b) => a - b;
    module.exports = { sum, sub }; // CommonJS导出
  }
};
```

#### 3.2 模块缓存系统 (`__webpack_module_cache__`)

**目的:** 避免重复加载相同模块。

**机制:** 以模块路径为 `key` 缓存已加载的模块。

```js
var __webpack_module_cache__ = {};
```

#### 3.3 核心加载函数 (`__webpack_require__`)

**执行流程:**

1. 检查模块是否已缓存,若存在则直接返回缓存导出
2. 未缓存时创建新模块对象 `{ exports: {} }`
3. 执行注册表中的模块函数,填充 `module.exports`
4. 返回最终的 `module.exports`

```js
function __webpack_require__(moduleId) {
  // 1. 检查缓存
  if (__webpack_module_cache__[moduleId]) {
    return __webpack_module_cache__[moduleId].exports;
  }
  
  // 2. 初始化新模块
  const module = { exports: {} };
  __webpack_module_cache__[moduleId] = module;
  
  // 3. 执行模块代码
  __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
  
  // 4. 返回导出对象
  return module.exports;
}
```

#### 3.4 模块调用

通过 `__webpack_require__` 加载模块,解构导出对象中的方法,正常调用模块函数。

```js
const { sub, sum } = __webpack_require__('./src/utils/format.js');
console.log(sub(10, 3)); // 输出 7
console.log(sum(2, 3));  // 输出 5
```

### 4. 总结

| 功能                       | 作用                                       |
| :------------------------- | :----------------------------------------- |
| `__webpack_modules__`      | 存储所有模块源码的注册表 (路径 → 工厂函数) |
| `__webpack_module_cache__` | 模块缓存池 (避免重复执行)                  |
| `__webpack_require__`      | 模块加载器 (处理缓存/初始化/执行/返回导出) |
| `module.exports`           | 模块导出容器 (由工厂函数填充)              |

---

## 二、Webpack 如何处理 ESM 规范

### 1. 准备工作

将 `format.js` 文件修改为 `ESM` 规范:

```js
const sum = (num1, num2) => {
  return num1 + num2;
};
const sub = (num1, num2) => {
  return num1 - num2;
};
export default {
  sum,
  sub
}
```

修改 `index.js`:

```js
import { sub, sum } from './utils/format'
console.log(sub(10, 3));
console.log(sum(2, 3));
```

### 2. 打包结果分析

```js
// 用户自己写的js源码
var __webpack_modules__ = {
  // 路径作为key  函数作为value
  './src/utils/format.js': (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    // 添加 ESM标识
    __webpack_require__.r(__webpack_exports__);
    // 给__webpack_exports__对象添加 default函数
    __webpack_require__.d(__webpack_exports__, {
      default: () => __WEBPACK_DEFAULT_EXPORT__,
    });
    const sum = (num1, num2) => {
      return num1 + num2;
    };
    const sub = (num1, num2) => {
      return num1 - num2;
    };
    const __WEBPACK_DEFAULT_EXPORT__ = {
      sum,
      sub,
    };
  },
};

// 缓存
var __webpack_module_cache__ = {};

// 创建一个导入函数
function __webpack_require__(moduleId) {
  var cachedModule = __webpack_module_cache__[moduleId];
  // 判断缓存里面是否有值
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }
  // 没有值创建一个 exports
  var module = (__webpack_module_cache__[moduleId] = {
    exports: {},
  });
  // 去用户源码中去引入
  __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

  return module.exports;
}

__webpack_require__.d = (exports, definition) => {
  for (var key in definition) {
    // 判断definition对象在自身上是否有该属性;和 exports对象自身上是否有该属性
    if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
      // 给该对象添加属性 并使用get 方法拦截
      Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
    }
  }
};

// 判断该对象在自身上是否有该属性
__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

__webpack_require__.r = (exports) => {
  // 1. 判断环境是否支持 Symbol 和 Symbol.toStringTag
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    // 2. 给模块添加 [Symbol.toStringTag] 标识
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
  }
  // 3. 给模块添加 __esModule 标识
  Object.defineProperty(exports, '__esModule', { value: true });
};

var __webpack_exports__ = {};

__webpack_require__.r(__webpack_exports__);
var _utils_format__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__('./src/utils/format.js');

console.log((0, _utils_format__WEBPACK_IMPORTED_MODULE_0__.sub)(10, 3));
console.log((0, _utils_format__WEBPACK_IMPORTED_MODULE_0__.sum)(2, 3));
```

### 3. 核心机制解析

#### 3.1 模块注册表 (`__webpack_modules__`)

**路径作为 `key`:** 标识模块位置。

**工厂函数接收三个参数:**

- `module`: CommonJS 风格的模块对象
- `__webpack_exports__`: ESM 导出对象
- `__webpack_require__`: 导入函数

```js
var __webpack_modules__ = {
  './src/utils/format.js': (module, __webpack_exports__, __webpack_require__) => {
    // 标记为 ESM 模块
    __webpack_require__.r(__webpack_exports__);
    // 定义导出对象
    __webpack_require__.d(__webpack_exports__, {
      default: () => __WEBPACK_DEFAULT_EXPORT__,
    });
    // 模块原始代码
    const __WEBPACK_DEFAULT_EXPORT__ = { sum, sub };
  }
};
```

#### 3.2 模块缓存系统 (`__webpack_module_cache__`)

与 `CommonJS` 实现相同,避免重复加载。

#### 3.3 核心加载函数 (`__webpack_require__`)

与 `CommonJS` 实现逻辑一致。

#### 3.4 ESM 特有的辅助方法

**`__webpack_require__.r()` - 标记 ESM 模块**

**作用:** 标识该模块是 `ESM` 模块。

**添加两个标记:**

- `__esModule: true`: 表明这是 `ESM` 模块
- `Symbol.toStringTag: 'Module'`: 规范化的模块类型标识

```js
__webpack_require__.r = (exports) => {
  // 1. 添加 Symbol.toStringTag 标识
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
  }
  // 2. 添加 __esModule 标识
  Object.defineProperty(exports, '__esModule', { value: true });
};
```

**`__webpack_require__.d()` - 定义 ESM 导出**

**作用:** 安全地定义模块导出。

**特点:**

使用 `getter` 而非直接赋值(确保导出值动态更新)。避免覆盖已有属性。确保可枚举性 (`enumerable: true`)。

```js
__webpack_require__.d = (exports, definition) => {
  for (var key in definition) {
    // 判断definition对象在自身上是否有该属性;和 exports对象自身上是否有该属性
    if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
      // 给该对象添加属性 并使用get 方法拦截
      Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
    }
  }
};
```

**`__webpack_require__.o()` - 属性检查**

**作用:** 用来安全地检查一个对象自身是否拥有某个属性,避免检查到原型链上的属性。

```js
// 判断该对象在自身上是否有该属性
__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
```

### 4. 总结

| 功能                       | 作用                                       |
| :------------------------- | :----------------------------------------- |
| `__webpack_modules__`      | 存储所有模块源码的注册表 (路径 → 工厂函数) |
| `__webpack_module_cache__` | 模块缓存池 (避免重复执行)                  |
| `__webpack_require__`      | 模块加载器 (处理缓存/初始化/执行/返回导出) |
| `__webpack_require__.o`    | 属性检查                                   |
| `__webpack_require__.r`    | 标记 ESM 模块                              |
| `__webpack_require__.d`    | 定义 ESM 导出                              |

---

## 三、混合使用场景

### 场景一: ESM 导出 + CommonJS 导入

#### 1. 准备工作

修改 `format.js` 文件为 `ESM` 导出:

```js
export const sum = (num1, num2) => {
  return num1 + num2;
};
export const sub = (num1, num2) => {
  return num1 - num2;
};
```

修改 `index.js` 为 `CommonJS` 导入:

```js
const { sub, sum } = require('./utils/format');
sub(10, 3);
sum(2, 3);
```

#### 2. 打包结果分析

```js
var __webpack_modules__ = {
  './src/utils/format.js': (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, {
      sub: () => sub,
      sum: () => sum,
    });
    const sum = (num1, num2) => {
      return num1 + num2;
    };
    const sub = (num1, num2) => {
      return num1 - num2;
    };
  },
};

var __webpack_module_cache__ = {};

function __webpack_require__(moduleId) {
  var cachedModule = __webpack_module_cache__[moduleId];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }

  var module = (__webpack_module_cache__[moduleId] = {
    exports: {},
  });

  __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

  return module.exports;
}

__webpack_require__.d = (exports, definition) => {
  for (var key in definition) {
    if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
      Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
    }
  }
};

__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

__webpack_require__.r = (exports) => {
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
  }
  Object.defineProperty(exports, '__esModule', { value: true });
};

var __webpack_exports__ = {};

const { sub, sum } = __webpack_require__('./src/utils/format.js');
sub(10, 3);
sum(2, 3);
```

#### 3. 核心机制解析

**为什么在混合使用 ESM 导出 + CommonJS 导入时,webpack 生成的代码与纯 ESM 导出导入的代码看起来完全一致?**

**核心原因: webpack 的模块系统统一化设计**

`webpack` 在处理模块时有一个根本原则: 将所有模块(无论原始是 `ESM` 还是 `CommonJS`)统一转换为自己的模块系统,这个系统本质上是 **ESM 优先的实现**。

**关键机制分析:**

**模块类型标记 (`__esModule` 标志)**

```js
// 对所有 ESM 模块添加此标记
__webpack_require__.r(exports); // 设置 __esModule: true
```

这个标记是 `webpack` 模块系统的核心枢纽:

当模块被标记为 `__esModule: true` 时,`webpack` 按 `ESM` 规则处理。即使原始导入是 `CommonJS` 风格的 `require()`,`webpack` 看到此标记后仍使用 `ESM` 逻辑。

**关键点在于:**

导出侧: 只要是 `ESM` 导出,一定被标记 `__esModule: true`。导入侧: 无论使用 `import` 还是 `require()`,只要导入的是 `ESM` 模块,都会被处理为 **getter 引用**,保持实时绑定特性。

**导出处理 (`__webpack_require__.d`)**

```js
// 统一使用 getter 导出
__webpack_require__.d(exports, {
  sub: () => sub, // 函数引用,保持实时绑定
  sum: () => sum, // 不是值拷贝!
});
```

实现了 `ESM` 的实时绑定特性,与传统 `CommonJS` 的值拷贝完全不同。**与原始写法无关**,只要被标记为 `ESM` 就采用此方式。

#### 4. 总结

在 `webpack` 中看似"混合使用" `ESM` 导出和 `CommonJS` 导入,实际运行时:

1. 所有模块都被提升为 **ESM-like 模块**
2. `CommonJS` 的 `require()` 被转换为 **ESM 兼容的加载器**
3. 导出始终使用 **getter + 实时绑定**
4. 最终呈现的是 **纯 ESM 运行时行为**

---

### 场景二: CommonJS 导出 + ESM 导入

#### 1. 准备工作

修改 `format.js` 文件为 `CommonJS` 导出:

```js
const sum = (num1, num2) => {
  return num1 + num2;
};
const sub = (num1, num2) => {
  return num1 - num2;
};
exports.sum = sum;
exports.sub = sub;
```

修改 `index.js` 为 `ESM` 导入:

```js
import { sub, sum } from './utils/format';
sub(10, 3);
sum(2, 3);
```

#### 2. 打包结果分析

```js
var __webpack_modules__ = {
  './src/utils/format.js': (__unused_webpack_module, exports) => {
    const sum = (num1, num2) => {
      return num1 + num2;
    };
    const sub = (num1, num2) => {
      return num1 - num2;
    };
    exports.sum = sum;
    exports.sub = sub;
  },
};

var __webpack_module_cache__ = {};

function __webpack_require__(moduleId) {
  var cachedModule = __webpack_module_cache__[moduleId];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }

  var module = (__webpack_module_cache__[moduleId] = {
    exports: {},
  });

  __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

  return module.exports;
}

__webpack_require__.r = (exports) => {
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
  }
  Object.defineProperty(exports, '__esModule', { value: true });
};

var __webpack_exports__ = {};

__webpack_require__.r(__webpack_exports__);
var _utils_format__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__('./src/utils/format.js');

(0, _utils_format__WEBPACK_IMPORTED_MODULE_0__.sub)(10, 3);
(0, _utils_format__WEBPACK_IMPORTED_MODULE_0__.sum)(2, 3);
```

#### 3. 核心机制解析

这个跟之前纯 `CommonJS` 导入导出差不多,只是多了一个检测是否是 `ESM` 模块的标识 `__webpack_require__.r`。

还有就是既然我是 `import` 导入为啥不是按照 `ESM` 导入规范而是按照 `CommonJS` 规范呢?

**关键差异分析**

在提供的代码中:

```js
// CommonJS 导出模块 (format.js)
exports.sum = sum; // 直接赋值
exports.sub = sub; // 不是通过 __webpack_require__.d
```

与之前 `ESM` 导出的核心区别:

在导出的时候没有调用 `__webpack_require__.r` (无 `__esModule` 标记)。在导出的时候没有调用 `__webpack_require__.d` (无 `getter` 定义)。而是直接使用 `exports` 对象赋值。

**为什么没有实时绑定?**

**入口的 ESM 标记只影响自身,不影响它导入的其他模块**

```js
// 入口模块 (ESM)
__webpack_require__.r(__webpack_exports__); // 标记自身为 ESM
```

**被导入模块决定处理方式**

`format.js` 没有 `__esModule` 标记。使用 `CommonJS` 风格导出 (`exports.xxx =`)。因此被当作 **纯 CommonJS 模块** 处理。

**导入侧适配**

没有使用解构,保留完整导出对象。避免破坏 `CommonJS` 的导出特性。

```js
// 原始 ESM 导入语句:
import { sub, sum } from './format.js';

// 被转换为:
var _utils_format = __webpack_require__('./format.js');
_utils_format.sub(...);
```

**何时会有实时绑定?**

只有同时满足:

1. 模块使用 `ESM` 语法 (`export` 关键字)
2. 或被标记为 `__esModule: true`
3. 且通过 `__webpack_require__.d` 的 `getter` 导出

#### 4. 总结

在我们的场景中:

```js
// CommonJS 导出
exports.sum = sum; // 直接赋值 → 静态绑定

// ESM 导入
import { sum } from './format'; // 被转换为对象属性访问
```

没有实时绑定的原因:

1. 导出模块缺少 `__esModule` 标记
2. 导出方式不是通过 `__webpack_require__.d`
3. `Webpack` 严格遵循模块原始类型处理
4. 导入侧适配为对象属性访问而非绑定解构

---

### 场景三: 两种规范同时混合

#### 1. 准备工作

修改 `format.js` 文件为 `CommonJS` 默认导出:

```js
const sum = (num1, num2) => {
  return num1 + num2;
};
const sub = (num1, num2) => {
  return num1 - num2;
};
module.exports = {
  sum,
  sub,
};
```

在 `utils` 文件夹下创建 `test.js`:

```js
const mul = (num1, num2) => {
  return num1 * num2;
};
const division = (num1, num2) => {
  return num1 / num2;
};
export default {
  mul,
  division,
};
```

修改 `index.js`:

```js
import format from './utils/format';
const test = require('./utils/test.js');

format.sub(10, 3);
format.sum(2, 3);

test.mul(10, 3);
test.division(2, 3);
```

#### 2. 打包结果分析

```js
// 1. 定义所有模块的集合(模块注册表)
var __webpack_modules__ = {
  // 模块1: CommonJS 导出风格的模块
  './src/utils/format.js': (module) => {
    // 模块内部代码
    const sum = (num1, num2) => num1 + num2;
    const sub = (num1, num2) => num1 - num2;
    
    // CommonJS 导出方式(直接赋值给 module.exports)
    module.exports = {
      sum,
      sub,
    };
  },

  // 模块2: ESM 导出风格的模块
  './src/utils/test.js': (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    // 标记为 ESM 模块(添加 __esModule 标志)
    __webpack_require__.r(__webpack_exports__);
    
    // 定义导出项(使用 getter 实现实时绑定)
    __webpack_require__.d(__webpack_exports__, {
      default: () => __WEBPACK_DEFAULT_EXPORT__, // 默认导出
    });
    
    // 模块内部代码
    const mul = (num1, num2) => num1 * num2;
    const division = (num1, num2) => num1 / num2;
    
    // 默认导出对象
    const __WEBPACK_DEFAULT_EXPORT__ = {
      mul,
      division,
    };
  },
};

// 2. 模块缓存(避免重复执行模块)
var __webpack_module_cache__ = {};

// 3. 核心模块加载函数(模拟 Node.js 的 require 系统)
function __webpack_require__(moduleId) {
  // 检查缓存
  var cachedModule = __webpack_module_cache__[moduleId];
  if (cachedModule !== undefined) {
    return cachedModule.exports; // 返回缓存结果
  }
  
  // 创建新模块对象(初始化 exports)
  var module = (__webpack_module_cache__[moduleId] = {
    exports: {},
  });
  
  // 执行模块函数(填充 exports)
  __webpack_modules__[moduleId](
    module, 
    module.exports, 
    __webpack_require__ // 传入 require 函数以实现递归加载
  );
  
  return module.exports; // 返回模块的 exports
}

// 4. 默认导入适配器(用于 ESM 导入 CommonJS 模块)
__webpack_require__.n = (module) => {
  // 根据模块类型决定获取默认导出的方式:
  // - ESM 模块: 获取 default 属性
  // - CommonJS 模块: 返回整个 exports 对象
  var getter = module && module.__esModule 
    ? () => module['default'] 
    : () => module;
  
  // 添加辅助属性 'a' 指向 getter 自身(兼容性处理)
  __webpack_require__.d(getter, { a: getter });
  
  return getter; // 返回可调用函数
};

// 5. 定义导出属性(实现 ESM 的实时绑定)
__webpack_require__.d = (exports, definition) => {
  for (var key in definition) {
    // 只处理自身属性且未被定义过的属性
    if (__webpack_require__.o(definition, key) && 
        !__webpack_require__.o(exports, key)) {
      // 使用 getter 定义属性(实现实时绑定)
      Object.defineProperty(exports, key, {
        enumerable: true, // 可枚举
        get: definition[key] // 动态获取值
      });
    }
  }
};

// 6. 对象属性检查(安全版 hasOwnProperty)
__webpack_require__.o = (obj, prop) => 
  Object.prototype.hasOwnProperty.call(obj, prop);

// 7. 标记模块为 ESM(添加 __esModule 标志)
__webpack_require__.r = (exports) => {
  // 添加 Symbol.toStringTag 标记(高级标识)
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { 
      value: 'Module' 
    });
  }
  // 核心标识:表明这是 ESM 模块
  Object.defineProperty(exports, '__esModule', { 
    value: true 
  });
};

// 8. 入口模块
var __webpack_exports__ = {};

// 标记入口为 ESM 模块
__webpack_require__.r(__webpack_exports__);

// 9. 导入 CommonJS 模块(format.js)
var _utils_format__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__('./src/utils/format.js');
// 创建默认导入适配器(因为使用了 ESM 默认导入语法)
var _utils_format__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(
  _utils_format__WEBPACK_IMPORTED_MODULE_0__
);

// 10. 导入 ESM 模块(test.js)
const test = __webpack_require__('./src/utils/test.js');

// 11. 使用导入的模块
// 通过适配器调用 CommonJS 模块(需要函数调用)
_utils_format__WEBPACK_IMPORTED_MODULE_0___default().sub(10, 3);
_utils_format__WEBPACK_IMPORTED_MODULE_0___default().sum(2, 3);

// 直接调用 ESM 模块(命名空间方式)
test.mul(10, 3);
test.division(2, 3);
```

#### 3. 核心机制解析

可以看到跟刚刚我们混合使用方式差不多。

如果是 `ESM` 导出 + `CommonJS` 导入,则优先使用 `ESM` 规范,因为在导出的时候调用 `__webpack_require__.r` 标记自身为 `ESM`,则 `CommonJS` 导入的时候,**值是实时绑定而不是拷贝**。

如果是 `CommonJS` 导出 + `ESM` 导入,因为导出的时候是 `CommonJS` 规范不是 `ESM` 导出,则 `ESM` 导入的时候,**值没有实时绑定,只是单纯的拷贝**。

此时我们看到一个新函数 `__webpack_require__.n` (默认导入适配器)。

**设计目的**

这个函数专门处理 **ESM 的默认导入**与 `CommonJS` 导出的**兼容性**。

```js
// 4. 默认导入适配器(用于 ESM 导入 CommonJS 模块)
__webpack_require__.n = (module) => {
  // 根据模块类型决定获取默认导出的方式:
  // - ESM 模块: 获取 default 属性
  // - CommonJS 模块: 返回整个 exports 对象
  var getter = module && module.__esModule 
    ? () => module['default'] 
    : () => module;
  
  // 添加辅助属性 'a' 指向 getter 自身(兼容性处理)
  __webpack_require__.d(getter, { a: getter });
  
  return getter; // 返回可调用函数
};
```

**使用场景**

只能是 **ESM 导入 ➡️ CommonJS 导出** 并且 `ESM` 导入必须是(**默认导入**)。

`__webpack_require__.n` 这个函数才会出现处理兼容性问题。

```js
import format from './utils/format';
```

**为什么按需导入和命名导入则不需要?**

因为 `ESM` 和 `CommonJS` 对默认导出的概念不同:

| 规范     | 默认导出           | 命名导出        |
| :------- | :----------------- | :-------------- |
| ESM      | `export default`   | `export const`  |
| CommonJS | `module.exports =` | `exports.xxx =` |

在 `CommonJS` 中:

整个 `module.exports` 就是默认导出。**没有单独的 `default` 属性**。

而在 `ESM` 中:

默认导出存储在 `default` 属性。**命名导出是普通属性**。

`__webpack_require__.n` 就是解决这个差异的桥梁:

```js
// 模拟转换过程
const commonJSModule = { 
  sub: () => {...}, 
  sum: () => {...} 
};

// 当使用 import module from '...' 时
const getter = __webpack_require__.n(commonJSModule);

// 实际访问:
getter() === commonJSModule // true
getter().sub() // 正确工作
```

#### 4. 关键差异总结

**模块标记决定处理方式:**

`__esModule: true` → `ESM` 规则(**实时绑定**)。无标记 → `CommonJS` 规则(**单纯的拷贝**)。

**导入语法决定包装方式:**

默认导入 (`import x from`) → 需要 `.n` 适配器。命名导入 (`import {x}`) → 直接使用。

| 特性             | CommonJS 导出模块            | ESM 导出模块            |
| :--------------- | :--------------------------- | :---------------------- |
| **导出方式**     | `module.exports = {...}`     | `__webpack_require__.d` |
| **导出性质**     | 静态值拷贝                   | Getter 实现实时绑定     |
| **导入方式**     | 需要 `__webpack_require__.n` | 直接使用                |
| **模块标记**     | 无 `__esModule` 标记         | 有 `__esModule: true`   |
| **Tree-shaking** | 不支持                       | 支持                    |

---

## 四、完整流程总结

### 1. Webpack 模块系统核心原则

`Webpack` 将所有模块(无论 `CommonJS` 还是 `ESM`)统一转换为自己的模块系统。通过 `__esModule` 标记区分模块类型。优先采用 `ESM` 风格实现(使用 `getter` 实现实时绑定)。

### 2. 关键函数职责

| 函数                       | 职责                        | 适用场景              |
| :------------------------- | :-------------------------- | :-------------------- |
| `__webpack_modules__`      | 模块注册表,存储所有模块源码 | 所有模块              |
| `__webpack_module_cache__` | 模块缓存,避免重复执行       | 所有模块              |
| `__webpack_require__`      | 核心加载函数                | 所有模块              |
| `__webpack_require__.r`    | 标记为 ESM 模块             | ESM 模块              |
| `__webpack_require__.d`    | 定义 ESM 导出(使用 getter)  | ESM 模块              |
| `__webpack_require__.o`    | 安全的属性检查              | 所有场景              |
| `__webpack_require__.n`    | 默认导入适配器              | ESM 默认导入 CommonJS |

### 3. 混合使用规则

**ESM 导出 + CommonJS 导入:**

导出侧标记为 `__esModule: true`。使用 `getter` 实现实时绑定。导入侧按 `ESM` 规则处理。

**CommonJS 导出 + ESM 导入:**

导出侧无 `__esModule` 标记。使用直接赋值(值拷贝)。导入侧需要适配器处理默认导入。

**判断依据:**

模块的处理方式由**导出侧**决定,而非导入侧。标记 `__esModule: true` 的模块始终按 `ESM` 规则处理。未标记的模块按 `CommonJS` 规则处理。

### 4. 实时绑定 vs 值拷贝

**实时绑定(ESM):**

使用 `Object.defineProperty` + `getter`。导入的是引用,值的变化会同步。支持 `Tree-shaking`。

**值拷贝(CommonJS):**

直接赋值 `exports.xxx = value`。导入的是快照,值的变化不同步。不支持 `Tree-shaking`。

### 5. 最佳实践建议

1. 优先使用 `ESM` 语法(`import/export`),享受实时绑定和 `Tree-shaking` 优化
2. 避免混用默认导出和命名导出,保持代码风格一致
3. 理解 `__esModule` 标记的作用,有助于排查模块加载问题
4. 在编写库时,考虑同时支持两种规范的使用场景

> [➡️完整案列代码](https://github.com/webBocai/webpack-/tree/main/11-webpack%E6%A8%A1%E5%9D%97%E5%8C%96%E5%8E%9F%E7%90%86)  