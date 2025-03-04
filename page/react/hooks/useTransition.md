# useTransition

`useTransition` 是 React 18 中引入的一个 Hook，**他不是做动画的hook，而是用于管理 UI 中的过渡状态**，特别是在处理长时间运行的状态更新时。它允许你将某些更新标记为“过渡”状态，这样 React 可以优先处理更重要的更新，比如用户输入，同时延迟处理过渡更新。

### 用法

```tsx [App.tsx]
const [isPending, startTransition] = useTransition();
```

### 参数

`useTransition` 不需要任何参数

### 返回值

- `useTransition` 返回一个数组,包含两个元素

  - `isPending`(boolean)，告诉你是否存在待处理的 transition。
  - `startTransition`(function) 函数，你可以使用此方法将状态更新标记为 transition。

### 优先级

  - (一般) 不是很重要，因为在实际工作中应用`较少`

### 例子

####  模拟大量数据的场景

-    我们需要模拟数据很多的场景，这里使用`mockjs`模拟数据, 我所用的工具，超出你的想象，我用过很多工具和插件。
-    我们需要启动一个node服务

``` bash [npm]
npm install express mockjs
```

`在index.js`文件中

```js
import mockjs from 'mockjs';
import express from 'express';

const app = express();
app.use('*', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
});
app.use(express.json());
app.get('/api/list', (req, res) => {
  const { keyWord } = req.query;
  res.setHeader('Content-Type', 'application/json');
  const data = mockjs.mock({
    'list|1000': [
      {
        'id|+1': 1,
        name: keyWord,
        address: '@county(true)',
      },
    ],
  });
  res.json(data);
});
app.listen(8030, () => {
  console.log('server is running');
});

```

- 因为我们是`crate-react-app`创建的项目需要配置跨域

  - 我们需用下载一个插件`react-app-rewired `
    ::: code-group
    ``` bash [npm]
    npm isntall react-app-rewired 

    ``` 
    ```bash [yarn]
    yarn add react-app-rewired 
    ```
    ::: 
  - 然后创建一个`config-overrides.js`
  - 创建组件 ` TransitionDemo1.tsx`

::: code-group
```js [config-overrides.js]
    module.exports = {
      webpack: function (config, env) {
        // ...保持原有webpack配置
        return config;
      },
      devServer: function (configFunction) {
        return function (proxy, allowedHost) {
          const config = configFunction(proxy, allowedHost);
    
          // 添加代理配置实现跨域
          config.proxy = {
            "/api": {
              target: "http://localhost:8030", // 替换为你的后端服务地址
              changeOrigin: true, // 支持跨域
              pathRewrite: {
                "^/api": "/api", // 重写路径,去掉/api前缀
              },
            },
          };
    
          return config;
        };
      },
    };
```
```tsx [TransitionDemo1.tsx]
import React, { useState, useTransition } from "react";
import type { ChangeEvent, FC } from "react";

interface ListType {
  id: number;
  name: string;
  address: string;
}

const TransitionDemo1: FC = () => {
  const [list, setList] = useState<ListType[]>([]);
  const [isPending, startTransition] = useTransition();
  const getData = async (keyWord: string): Promise<ListType[]> => {
    const res = await fetch("/api/list?keyWord=" + keyWord, {
      method: "GET",
    });
    const data = await res.json();
    return data.list;
  };
  const ChangeList = (e: ChangeEvent<HTMLInputElement>) => {
    const keyWord = e.target.value;
    getData(keyWord).then(res => {
      startTransition(() => {
        setList([...res]);
      });
      // setList([...res]);
    });
    // 使用正确的API路径
  };

  return (
    <div>
      <input type="text" onChange={ChangeList} placeholder="请输入搜索关键词" />
      {isPending ? (
        <div style={{ color: "red" }}>加载中....</div>
      ) : (
        list.map(item => (
          <div key={item.id}>
            <span style={{ marginRight: "10px" }}>{item.name}</span>
            <span>{item.address}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default TransitionDemo1;

```
:::
- 为了更好的测试结果可以在性能中降级cpu渲染速度

  ![](https://message163.github.io/react-docs/assets/cpu.B_H9gzVA.png)

### 注意事项
::: danger STOP
**startTransition必须是同步的**
:::
```js
startTransition(() => {
  // ❌ 在调用 startTransition 后更新状态
  setTimeout(() => { // [!code error]
    setPage('/about');
  }, 1000); // [!code error]
});
```
::: info
**正确做法**
:::

```js
setTimeout(() => { // [!code ++]
  startTransition(() => {
    // ✅ 在调用 startTransition 中更新状态
    setPage('/about');
  });
}, 1000); // [!code ++]
```
::: danger STOP
**async await 错误做法**
::: 
```js
startTransition(async () => { 
  await someAsyncFunction();  // [!code error]
  // ❌ 在调用 startTransition 后更新状态
  setPage('/about');
});
```
::: info
**正确做法**
::: 
```js
await someAsyncFunction(); // [!code ++]
startTransition(() => {
  // ✅ 在调用 startTransition 中更新状态
  setPage('/about');
});
```

### 原理剖析

useTransition 的核心原理是将一部分状态更新处理为低优先级任务，这样可以将关键的高优先级任务先执行，而低优先级的过渡更新则会稍微延迟处理。这在渲染大量数据、进行复杂运算或处理长时间任务时特别有效。React 通过调度机制来管理优先级：

1. **高优先级更新**：直接影响用户体验的任务，比如表单输入、按钮点击等。
2. **低优先级更新**：相对不影响交互的过渡性任务，比如大量数据渲染、动画等，这些任务可以延迟执行。
