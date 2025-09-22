---
date: 2025-05-15 09:43:30
title: useCallback 的使用<TkTitleTag type="vp-important" text="Hooks" position="right" />
permalink: /pages/0c908d
categories:
  - React
 
coverImg: /img/react_hooks.png
tags:
  - React Hooks
---
# useCallback
::: danger useCallback
`useCallback` 用于优化性能，返回一个记忆化的回调函数，可以减少不必要的重新渲染，也就是说它是用于缓存组件内的函数，避免函数的重复创建。
:::


### 为什么需要useCallback
::: tip  
在React中，函数组件的重新渲染会导致组件内的函数被重新创建，这可能会导致性能问题。useCallback 通过缓存函数，可以减少不必要的重新渲染，提高性能。
::: 
##### 用法

```ts [index.ts]
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### 参数

#### 入参
::: tip  入参
callback：回调函数

deps：**必填**依赖项数组，当依赖项发生变化时，回调函数会被重新创建，跟useEffect一样。
::: 
#### 返回值
::: tip  返回值
 返回一个记忆化的回调函数，可以减少函数的创建次数，提高性能。
::: 
### 案例1

- 我们创建了一个`WeakMap(用Map也行)`，用于存储回调函数，并记录回调函数的创建次数。
- 在组件重新渲染时，`changeSearch` 函数会被重新创建，我们这边会进行验证，如果函数被重新创建了数量会+1，如果没有重新创建，数量默认是1。
- 只需要在changeSearch函数上使用useCallback，就可以优化性能。
::: code-group
<<< ./code/noCallback.tsx [没有用useCallback.react]
<<< ./code/useCallback.tsx [用useCallback.react]
::: 
<img src="./img/img.png"  />
我们可以看到函数Id没有增加，说明函数没有被重新创建。

<img src="./img/img1.png" style="zoom:50%;" />

### 案例2

应用于子组件：
::: tip
1. 我们创建了一个`Child子`组件，并使用`React.memo`进行优化，`memo`在上一章讲过了，他会检测`props`是否发生变化，如果发生变化，就会重新渲染子组件。
2. 我们创建了一个`childCallback`函数，传递给子组件，然后我们输入框更改值，发现子组件居然重新渲染了，但是我们并没有更改`props`，这是为什么呢？
3. 这是因为输入框的值发生变化，App就会重新渲染，然后childCallback函数就会被重新创建，然后传递给子组件，子组件会判断这个函数是否发生变化，但是每次创建的函数内存地址都不一样，所以子组件会重新渲染。
::: 
::: code-group
```tsx [Child.tsx]
import React, { useCallback, useState } from 'react'
// 父组件重新 渲染callback 每次传过来的内存地址不一样 所以React.memo就参生没效果了
const Child = React.memo(({ user, callback }: { user: { name: string; age: number }, callback: () => void }) => {
   console.log('Render Child')
   const styles = {
      color: 'red',
      fontSize: '20px',
   }
   return <div style={styles}>
      <div>{user.name}</div>
      <div>{user.age}</div>
      <button onClick={callback}>callback</button>
   </div>
})
```
```tsx [App.tsx]
const App: React.FC = () => {
   const [search, setSearch] = useState('')
   const [user, setUser] = useState({
      name: 'John',
      age: 20
   })
   // 因为每次组件重新渲染 函数内存地址就不一样 
  const childCallback = () => {  // [!code --]
     // 会缓存useCallback包裹的函数
     const  childCallback = useCallback(()=>{ // [!code ++]
      console.log('callback 执行了')
     },[])    // [!code ++]
   } // [!code --]
   return <>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} />
      <Child callback={childCallback} user={user} />
   </>;
};

export default App;
```
:::

::: danger
因为父组件重新渲染了，所以childCallback函数会被重新创建，然后传递给子组件，子组件会判断这个函数是否发生变化，但是每次创建的函数内存地址都不一样，所以子组件会重新渲染。
:::


<img src="https://message163.github.io/react-docs/assets/useCallback-3.Bd3ynv-p.png" style="zoom:50%;" />


### 执行时机(依赖项) 

1. 如果依赖项是个空数组，那么 `useCallback ` 的回调函数会执行一次
2. 指定依赖项，当依赖项发生变化时， `useCallback ` 的回调函数会执行

### 总结
::: tip 总结
1. `useCallback`的使用需要有所节制，不要盲目地对每个方法应用`useCallback`，这样做可能会导致不必要的性能损失。`useCallback`本身也需要一定的性能开销。
2. `useCallback`并不是为了阻止函数的重新创建，而是**通过依赖项来决定是否返回新的函数或旧的函数**，从而在依赖项不变的情况下确保函数的地址不变。
:::

