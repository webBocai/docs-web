# useLayoutEffect

`useLayoutEffect` 是 React 中的一个 Hook，用于在浏览器重新绘制屏幕之前触发。与 useEffect 类似。

### 用法

```tsx
useLayoutEffect(() => {
  // 副作用代码
  return () => {
    // 清理代码
  }
}, [dependencies]);
```

### 参数

- setup：Effect处理函数,可以返回一个清理函数。组件挂载时执行setup,依赖项更新时先执行cleanup再执行setup,组件卸载时执行cleanup。
- dependencies(可选)：setup中使用到的响应式值列表(props、state等)。必须以数组形式编写如[dep1, dep2]。不传则每次重渲染都执行Effect。

### 返回值

useLayoutEffect 返回 `undefined`

### 区别(useLayoutEffect/useEffect)

| 区别     | useLayoutEffect                      | useEffect                            |
| -------- | ------------------------------------ | ------------------------------------ |
| 执行时机 | 浏览器完成布局和绘制`之前`执行副作用 | 浏览器完成布局和绘制`之后`执行副作用 |
| 执行方式 | 同步执行                             | 异步执行                             |
| DOM渲染  | 阻塞DOM渲染                          | 不阻塞DOM渲染                        |

### 测试案例

在下面的动画示例代码中:

1. useEffect 实现的动画效果:
   - 初始渲染时 opacity: 0
   - 浏览器完成绘制
   - useEffect 异步执行,设置 opacity: 1
   - 用户可以看到完整的淡入动画过渡效果
2. useLayoutEffect 实现的动画效果:
   - 初始渲染时 opacity: 0
   - DOM 更新后立即同步执行 useLayoutEffect
   - 设置 opacity: 1
   - 浏览器绘制时已经是最终状态
   - 用户看不到过渡动画效果

```css
#app1 {
    width: 200px;
    height: 200px;
    background: red;
}

#app2 {
    width: 200px;
    height: 200px;
    background: blue;
    margin-top: 20px;
    position: absolute;
    top: 230px;
}
```

```tsx
import React, { useLayoutEffect, useEffect, useRef } from 'react';

function App() {


   // 使用 useEffect 实现动画效果
   useEffect(() => {
      const app1 = document.getElementById('app1') as HTMLDivElement;
      app1.style.transition = 'opacity 3s';
      app1.style.opacity = '1';
   }, []);

   // 使用 useLayoutEffect 实现动画效果
   useLayoutEffect(() => {
      const app2 = document.getElementById('app2') as HTMLDivElement;
      app2.style.transition = 'opacity 3s';
      app2.style.opacity = '1';

   }, []);

   return (
      <div>
         <div id="app1"  style={{ opacity: 0 }}>app1</div>
         <div id="app2"  style={{ opacity: 0 }}>app2</div>
      </div>
   );
}

export default App;
```

### 应用场景

- 需要同步读取或更改DOM：例如，你需要读取元素的大小或位置并在渲染前进行调整。
- 防止闪烁：在某些情况下，异步的useEffect可能会导致可见的布局跳动或闪烁。例如，动画的启动或某些可见的快速DOM更改。
- 模拟生命周期方法：如果你正在将旧的类组件迁移到功能组件，并需要模拟 componentDidMount、componentDidUpdate和componentWillUnmount的同步行为

### 案例

- 可以记录滚动条位置，等用户返回这个页面时，滚动到之前记录的位置。增强用户体验。

```tsx
import React, { useEffect, useLayoutEffect, useState } from "react";
import type { FC } from "react";

const EffectLayoutDemo2: FC = () => {
  const [list, setList] = useState<number[]>([]);

  useLayoutEffect(() => {
    const deepList = [];
    for (let i = 0; i < 500; i++) {
      deepList.push(i);
    }
    setList(deepList);
    setTimeout(() => {
      window.scroll(0, 5000);
    }, 0);
  }, []);
  return (
    <>
      <div id="dlist">
        {list.map(item => {
          return <div key={item}>{item}</div>;
        })}
      </div>
    </>
  );
};
export default EffectLayoutDemo2;

```

