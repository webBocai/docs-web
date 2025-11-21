---
date: 2025-05-15 09:43:30
title: useSyncExternalStore <TkTitleTag type="vp-important" text="Hooks" position="right" />
permalink: /react/30b35d
categories:
  - React
coverImg: /img/react_hooks.png
tags:
  - React Hooks
---
# useSyncExternalStore

`useSyncExternalStore `是 React 18 引入的一个 Hook，用于从外部存储（例如状态管理库、浏览器 API 等）获取状态并在组件中同步显示。这对于需要跟踪外部状态的应用非常有用。

### 场景

- 订阅外部 store 例如(redux,Zustand`德语`)
- 订阅浏览器API 例如(online,storage,location)等
- 抽离逻辑，编写自定义hooks
- 服务端渲染支持

### 用法

```tsx [App.react]
const res = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```

- subscribe：函数用来订阅数据源的变化，接收一个回调函数，在数据源更新时调用该回调函数。
- getSnapshot：函数，返回的值作为当前状态。
- getServerSnapshot?：在服务器端渲染时用来获取数据源的快照。

```tsx [App.react]
const subscribe = (callback: () => void) => {
    // 订阅
    callback() 
    return () => { 
        // 取消订阅
    }
}

const getSnapshot = () => {
    return data // 返回数据作为当前状态
}

const res = useSyncExternalStore(subscribe, getSnapshot)
```

### 案例:

####  1. 封装localStoreage存储

- 订阅浏览器Api 实现自定义hook(useStorage)

  - 我们实现一个useStorage Hook，用于订阅 localStorage 数据。这样做的好处是，我们可以确保组件在 localStorage 数据发生变化时，自动更新同步。

  - 在封装的 `useStore.ts`文件中:

    - 首先订阅`subscribe`函数中 订阅了浏览器的storage事件，在return 函数中也取消订阅了

    - 其次在`getSnapshot` 得到最新状态的值

    - 然后`setSnapShot`函数中 设置localStorage的值

      - 当触发了`setSnapShot`函数，我们将使用`dispathEvent`手动触发浏览器的storage事件

        然后触发里面的callback函数，当执行`callback`函数后将执行`getSnapshot`函数将最新的值返回出去，然后执行`rerender`函数 重新渲染组件



    ::: code-group

     ```tsx [App.react]
    import React from "react";
    import type { FC } from "react";
    import useStore from "./useStore";
    const App: FC = () => {
      const [value, setValue] = useStore();
      return (
        <>
          <div>{value}</div>
          <button onClick={() => setValue(1)}>修改值</button>
          <hr />
         
        </>
      );
    };
    export default App;
    
    ```
 
    ```ts [useStore.ts]
    import { useSyncExternalStore } from "react";
    
    const useStore = () => {
      const subscribe = (callback: () => void) => {
        window.addEventListener("storage", callback);
        return () => {
          window.removeEventListener("storage", callback);
        };
      };
      const getSnapshot = () => {
        const key = localStorage.getItem("key");
        return key ? JSON.parse(JSON.stringify(key)) : "1";
      };
      const setSnapShot = (num: number) => {
        const value = Number(getSnapshot());
        localStorage.setItem("key", JSON.stringify(num + value));
        window.dispatchEvent(new StorageEvent("storage"));
      };
      const res = useSyncExternalStore(subscribe, getSnapshot);
      return [res, setSnapShot] as const;
    };
    
    export default useStore;
    ```
    ::: 

#### 2.封装简易history hook

- 订阅浏览器Api 实现自定义hook(useHistory )
- 封装两个方法:
  - pushState方法**添加** 一个新的历史记录条目。
    - `state`：一个 JavaScript 对象，表示当前历史记录条目的状态。这可以是任意对象，可以在后续的 `popstate` 事件中使用（`event.state`）。
    - `title`：通常传入一个空字符串 `""`，大多数浏览器并没有实现这个参数的功能。
    - `url`：新 URL 地址（可以是相对或绝对的）。这是更新浏览器地址栏的部分，**不会导致页面重新加载** 。
  - replace方法替 **替换** 当前的历史记录条目。
    - 与pushState参数一致
- 使用`popstate`监听路径改变,这个事件只能监听到浏览器的前进或后退,我们需用`dispathEvent`来手动触发
- 使用`hashChage`监听hash 路由的变化

```ts [useHistory.ts]
import { useSyncExternalStore } from "react";

const useHistory = () => {
  const subscribe = (callback: () => void) => {
    window.addEventListener("popstate", callback);
    window.addEventListener("hashchange", callback);
    return () => {
      window.removeEventListener("popstate", callback);
      window.removeEventListener("hashchange", callback);
    };
  };
  const getSnapshot = () => {
    return window.location.href;
  };
  const pushPath = (path: string) => {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("popstate"));
  };
  const replacePath = (path: string) => {
    window.history.replaceState(null, "", path);
    window.dispatchEvent(new Event("popstate"));
  };
  const res = useSyncExternalStore(subscribe, getSnapshot);
  return [res, pushPath, replacePath] as const;
};
export default useHistory;

```

### 注意事项

当我们`getSnapshot`使用返回复杂数据类型的会产生一个栈溢出，如果 `getSnapshot` 返回值不同于上一次，React 会重新渲染组件。这就是为什么，如果总是返回一个不同的值，会进入到一个无限循环，并产生这个报错

`Uncaught (in promise) Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.`

- 这种写法每次返回了对象的引用，即使这个对象没有改变，React 也会重新渲染组件。

```ts [报错.ts]
  const getSnapshot = () => {
    // 这里永远都会返回一个新对象React就会一直重新渲染，然后报错栈溢出
     const obj = {
      href: window.location.href,
    };
    return obj;
  };
```

修改成这样,只有`hash`变化之后React才会去重新渲染组件

```ts [正确.ts]
  let href: any;
  let lastObj: any;
  const getSnapshot = () => {
     const obj = {
      href: window.location.href,
    };
    if (obj.href !== href) {
      // 只有在 href 真的发生变化时，才更新快照
      lastObj = { ...obj };
      href = obj.href;
    }
    return lastObj;
  };
```

