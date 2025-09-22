---
date: 2025-09-17 10:09:25
title: tsx 语法入门
permalink: /pages/b438d4
categories:
    - React 
titleTag: 原创
tags:
 - React基础
coverImg: /img/react_ts.jpeg
---
# tsx语法入门

## FAQ

#### tsx跟jsx有什么区别

答: 基本没有没有区别只是在jsx语法上增加了类型。


#### jsx是什么？

答：jsx是js的语法扩展，允许在js中编写html代码。

例如：`const fn = () => <div>张三是谁？没听说过</div>`

## 语法编写

- 使用tsx绑定变量`{value}`

> 绑定class需要用className
::: code-group
```tsx [index.react]
function App() {
  const num: number = 333
  const fn = () => 'test'
  return (
    <>
      {'11' /** 字符串用法 */}
      {num /** 变量用法 */}
      {fn() /** 函数用法 */}
      {new Date().getTime() /** 日期用法 */}
    </>
  )
}
```
``` bash [className.react]
// 绑定class(className) id 属性等等 都是一样的
function App() {
  const value:string = 'A'
  return (
    <>
      <div data-index={value} className={value} id={value}>{value}</div>
    </>
  )
}
// 绑定多个class(className)
function index() {
  const a:string = 'A'
  return (
    <>
      <div className={`${a} class2`}>{value}</div>
    </>
  )
}
```
```tsx [style.react]
//绑定样式style
function App() {
  const styles = { color: 'red' }
  return (
    <>
      <div style={styles}>test</div>
    </>
  )
}
```
::: 
- 使用tsx绑定事件`on[Click]{fn}`小驼峰 其他事件也是一样的

::: code-group
<<<  ./code/tsx/onClick.tsx
::: 

- tsx如何使用泛型

::: tip
正常写泛型语法会跟tsx语法冲突，他会把泛型理解成是一个元素，解决方案后面加一个,即可
:::


```tsx [App.react]
function App() {
  const value: string = '张三'
  const clickTap = <T,>(params: T) => console.log(params)
  return (
    <>
      <div onClick={() => clickTap(value)}>{value}</div>
    </>
  )
}
```

- tsx如何渲染html代码片段(dangerouslySetInnerHTML)


::: tip
`dangerouslySetInnerHTML` 的值是一个对象，该对象包含一个名为 __html 的属性，且值为你想要插入的 HTML 字符串
:::

```tsx  [App.react]
function App() {
  const value: string = '<section style="color:red">张三</section>'
  return (
    <>
        <div dangerouslySetInnerHTML={{ __html: value }}></div>
    </>
  )
}
```

- tsx如何遍历dom元素

使用map遍历返回html标签即可

```tsx [App.react]
function App() {
  const arr: string[] = ["张三","李四","王五"]
  return (
    <>
        {
            arr.map((item) => {
                return <div>{item}</div>
            })
        }
    </>
  )
}
```

- tsx如何编写条件语句

使用三元表达式就可以了

```tsx [App.react]
function App() {
  const flag:boolean = true
  return (
    <>
        {
           flag ? <div>真的</div> : <div>假的</div>
        }
    </>
  )
}
```

- tsx注意事项
::: tip
{}插值语句内不允许编写`switch` `if` `变量声明` 或者直接放入`对象本体`
:::
下面展示错误用法正确用法对比
::: code-group
```tsx [对象错误写法.react]
//错误用法
function App() {
  const obj = { name: '张三' }
  return (
    <>
      {obj}
    </>
  )
}
```
```tsx [对象正确写法.react]
//正确用法
function App() {
  const obj = { name: '张三' }
  return (
    <>
      {obj.name}
      {JSON.stringify(obj)}
    </>
  )
}
```

```tsx [判断错误写法.react]
//错误用法
function App() {
  const flag:boolean = true
  return (
    <>
       {
        if(flag){
          <p>1</p>
        }else{
          <p>2</p>
        }
       }
    </>
  )
}
```
```tsx [判断正确写法.react]
//正确用法
function App() {
  const flag:boolean = true
  return (
    <>
       {
        flag ? <div>1</div> : <div>2</div>
       }
    </>
  )
}
```
:::