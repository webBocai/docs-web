---
date: 2025-05-15 09:43:30
title: useContext <TkTitleTag type="vp-important" text="Hooks" position="right" />
permalink: /react/4341ce
categories:
  - React
coverImg: /img/react_hooks.png
tags:
  - React Hooks
---
# useContext

`useContext` 提供了一个无需为每层组件手动添加 props，就能在组件树间进行数据传递的方法。设计的目的就是解决组件树间数据传递的问题。

<img src="https://message163.github.io/react-docs/assets/useContext.DUgSm-JN.png" style="zoom:50%;" />

### 用法

```tsx [index.tsx]
const MyThemeContext = React.createContext({theme: 'light'}); // 创建一个上下文
function App () {
   return (
      //  [!code --]
    <MyThemeContext.Provider value={{theme: 'light'}}> 
     //  [!code ++]
      <MyThemeContext  value={{theme: 'light'}}>
         <MyComponent />
           //  [!code ++]
        </MyThemeContext>
         //  [!code --]
      </MyThemeContext.Provider>
   )
}
function MyComponent() {
    const themeContext = useContext(MyThemeContext); // 使用上下文
    return (<div>{themeContext.theme}</div>);
}
```
### 参数

#### 入参
::: tip  入参

- **context**：是 `createContext` 创建出来的对象，他不保持信息，他是信息的载体。声明了可以从组件获取或者给组件提供信息。
:::
#### 返回值
::: tip 返回值
- 返回传递的Context的值，并且是只读的。如果 context 发生变化，React 会自动重新渲染读取 context 的组件
:::
### 基本用法
#### 18版本
::: tip 18版本
1. 首先我们先通过 `createContext` 创建一个上下文，然后通过 `createContext` 创建的组件包裹组件，传递值。
2. 被包裹的组件，在任何一个层级都是可以获取上下文的值，那么如何使用呢？
3. 使用的方式就是通过useContext这个hook，然后传入上下文，就可以获取到上下文的值。
:::
#### 19版本
::: tip 19版本
其实19版本和18版本是差不多的，只是19版本更加简单了，**不需要再使用Provider包裹，直接使用即可**
:::
::: code-group
```tsx [18版本 react]
import React, { useContext, useState } from 'react';
// 创建上下文
const ThemeContext = React.createContext<ThemeContextType>({} as ThemeContextType);
// 定义上下文类型
interface ThemeContextType {
   theme: string;
   setTheme: (theme: string) => void;
}
const Child = () => {
    // 获取上下文
   const themeContext = useContext(ThemeContext);
   const styles = {
      backgroundColor: themeContext.theme === 'light' ? 'white' : 'black',
      border: '1px solid red',
      width: 100 + 'px',
      height: 100 + 'px',
      color: themeContext.theme === 'light' ? 'black' : 'white'
   }
   return <div>
      <div style={styles}>
         child
      </div>
   </div>
}

const Parent = () => {
    // 获取上下文
   const themeContext = useContext(ThemeContext);
   const styles = {
      backgroundColor: themeContext.theme === 'light' ? 'white' : 'black',
      border: '1px solid red',
      width: 100 + 'px',
      height: 100 + 'px',
      color: themeContext.theme === 'light' ? 'black' : 'white'
   }
   return <div>
      <div style={styles}>
         Parent
      </div>
      <Child />
   </div>
}

function App() {
   const [theme, setTheme] = useState('light');
   return (
      <div>
         <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换主题</button>
         <ThemeContext.Provider value={{ theme, setTheme }}>
            <Parent />
         </ThemeContext.Provider>
      </div >
   );
}

export default App;
```


```tsx [19版本 react]
....这里跟react18版本代码一样
function App() {
   const [theme, setTheme] = useState('light');
   return (
      <div>
         <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换主题</button>
         // [!code --]
         <ThemeContext.Provider value={{ theme, setTheme }}>
         // [!code ++]
         <ThemeContext value={{ theme, setTheme }}>
            <Parent />
         // [!code ++]
         <ThemeContext>
         // [!code --]
         </ThemeContext.Provider>
      </div >
   );
}

export default App;
```
::: 
### 注意事项
::: tip 注意事项
- 使用 `ThemeContext` 时，传递的key必须为`value`
正常写泛型语法会跟tsx语法冲突，他会把泛型理解成是一个元素，解决方案后面加一个,即可
:::
```tsx
// 🚩 不起作用：prop 应该是“value”
// [!code error]
<ThemeContext theme={theme}>
   <Button />
</ThemeContext>

// ✅ 传递 value 作为 prop
// [!code ++]
<ThemeContext value={theme}>
   <Button />
</ThemeContext>
```
::: tip
如果使用多个Context，那么需要注意，如果使用的值是相同的，那么会覆盖。
:::
```tsx
const ThemeContext = React.createContext({theme: 'light'});

function App() {
   return (
      <ThemeContext value={{theme: 'light'}}>
         <ThemeContext value={{theme: 'dark'}}> {/* 覆盖了上面的值 */}
            <Parent />
         </ThemeContext>
      </ThemeContext>
   )
}
```

