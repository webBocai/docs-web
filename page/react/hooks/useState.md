
# useState

###    1).介绍

- `useState` 是一个 React Hook，允许函数组件在内部管理状态。

- 组件通常需要根据交互更改显示的内容，比如计数器点击某个按钮，数字就增加或相减

  并显示到屏幕上

### 2).使用方法

- `useState` 接收一个参数，即状态的初始值，然后返回一个数组，其中包含两个元素：**当前的状态值**和一个**更新该状态的函数**

```tsx [index.tsx]
const [state, setState] = useState(initialState)
```

- **注意**：在React中所有hook,**只能写在组件的顶层**,或者自己的hook调用它,不能在循环和判断语句中使用hook
- 在严格模式中，React 将 `两次调用初始化函数`，以 帮你找到意外的不纯性。这只是开发时的行为，不影响生产

######      1.基本数据类型

```tsx [index.tsx]
import React, { useState } from "react";
import type { FC } from "react";

const StateDemo1: FC = () => {
  const [count, setCount] = useState(0);
  return (
    <>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
    </>
  );
};
export default StateDemo1;

```

- 使用这里使用的是**数组解构 来命名状态变量**，例如 [index, setIndex]。

- useState 返回一个只包含两个项的数组：

  - 该状态变量 当前的 `state`，最初设置为你提供的 初始化 `state`。

  - set 函数，它允许你在响应交互时将 `state` 更改为任何其他值。

  - **修改值的时候不能直接使用当前状态值直接修改**

    ```tsx [index.tsx]
     const [count, setCount] = useState(0);
     count=count+1 // 这样是错误的，这样无法触发组件的重新渲染
     setCount(count+1) // 这样是正确的
    ```

- 要更新`屏幕上的内容`，请使用新状态调用 set 函数

  - 调用**set函数**会**更新state**,然后**重新渲染组件**
  - React 会存储新状态，使用新值重新渲染组件，并更新 UI。

###### 2.复杂数据类型

   **数组**

- 在useState返回的当前状态值是不能直接修改的，只能视为只读**数组和对象**也是一样的
- 当你操作数组的时候，数组有些方法可以更改数组本身如`push、pop、unshift splice`等

| 避免使用 (会改变原始数组)          | 推荐使用 (会返回一个新数组）      |
| ---------------------------------- | --------------------------------- |
| 添加元素 push，unshift             | concat，[...arr] 展开语法（例子） |
| 删除元素 pop，shift，splice        | filter，slice（例子）             |
| 替换元素 splice，arr[i] = ... 赋值 | map（例子）                       |
| 排序 reverse，sort                 | 先将数组复制一份（例子）          |

**数组新增数据**

创建一个新数组，包含了原始数组的所有元素，然后在末尾添加新元素，如果想在头部添加新元素，返过来即可。

```tsx [add.tsx]
import { useState } from "react"
function App() {
  let [arr, setArr] = useState([1, 2, 3])
  const heandleClick = () => {
    setArr([...arr,4]) //末尾新增 扩展运算符
    //setArr([0,...arr]) 头部新增 扩展运算符
  }
  return (
    <>
      <button onClick={heandleClick}>更改值</button>
      <div id="aaa">{arr}</div>
    </>
  )
}
export default App
```

**数组删除数据**

- 使用filter过滤掉不需要的元素即可。

```tsx [remove.tsx]
import { useState } from "react"
function App() {
  let [arr, setArr] = useState([1, 2, 3])
  const heandleClick = () => {
    setArr(arr.filter((item) => item !== 1)) //删除指定元素
  }
  return (
    <>
      <button onClick={heandleClick}>更改值</button>
      <div id="aaa">{arr}</div>
    </>
  )
}
export default App
```

**修改数组**

- 使用map筛选出需要替换的元素，然后替换为新的元素，其他元素保持不变。

```tsx [update.tsx]
import { useState } from "react"
function App() {
  let [arr, setArr] = useState([1, 2, 3])
  const heandleClick = () => {
    setArr(arr.map(item => {
      return item == 2 ? 666 : item
    }))
  }
  return (
    <>
      <button onClick={heandleClick}>更改值</button>
      <div id="aaa">{arr}</div>
    </>
  )
}
export default App
```

**插入数据到数组中**

- 案例在2后面插入2.5，**通过slice，截取前面的元素**，**因为slice返回一个新的数组**，然后在中间插入我们需要插入的元素，然后把末尾的元素也通过slice截取出来，拼接到后面。

- [slice文档]( https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)

  ```tsx [slice.tsx]
  import { useState } from "react"
  function App() {
    let [arr, setArr] = useState([1, 2, 3])
    const heandleClick = () => {
      let startIndex = 0
      let endIndex = 2;
      setArr(
        [
          ...arr.slice(startIndex, endIndex),
          2.5,
          ...arr.slice(endIndex)
        ]
      )
    }
    return (
      <>
        <button onClick={heandleClick}>更改值</button>
        <div id="aaa">{arr}</div>
      </>
    )
  }
  export default App
  ```

- 也可以先深拷贝一个一个数组出来在使用`splice`进行插入

  ```tsx [deep.tsx]
  import { useState } from "react"
  function App() {
    let [arr, setArr] = useState([1, 2, 3])
    const heandleClick = () => {
      const deepArr = Json.parse(JSON.stringfy(arr))
      deepArr.splice(2,0,'2.5')
      setArr(setArr)
    }
    return (
      <>
        <button onClick={heandleClick}>更改值</button>
        <div id="aaa">{arr}</div>
      </>
    )
  }
  export default App
  ```

 **排序旋转等**

- 案例，创建一个新数组，然后通过sort排序。

```tsx [sort.tsx]
import { useState } from "react"
function App() {
  let [arr, setArr] = useState([1, 2, 3])
  const heandleClick = () => {
    let newList = [...arr].map(v => v + 1) //拷贝到新数组
    newList.sort((a, b) => b - a)
    //newList.reverse()旋转
    setArr(newList)
  }
  return (
    <>
      <button onClick={heandleClick}>更改值</button>
      <div id="aaa">{arr}</div>
    </>
  )
}
export default App
```

**对象**

`useState`**可以接受一个函数，可以在函数里面编写逻辑**，初始化值，注意这个只会执行一次，更新的时候就不会执行了。

```tsx [index.tsx]
import { useState } from "react"
function App() {
  let [obj, setObject] = useState(() => {
    const date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
    return {
      date,
      name: '张三',
      age: 25
    }
  })
  const heandleClick = () => {
    setObject({
      ...obj,
      name: '李四'
    })
    //setObject(Object.assign({}, obj, { age: 26 })) 第二种写法
  }
  return (
    <>
      <button onClick={heandleClick}>更改值</button>
      <div>日期：{obj.date}</div>
      <div>姓名：{obj.name}</div>
      <div>年龄：{obj.age}</div>
    </>
  )
}
export default App
```

###### 3.useState更新机制

- 更新机制是什么?:**异步更新**

  - 为什么是异步更新？

    - 如果 React 的 `useState` 是同步更新的，那么每次更新都会触发一次渲染，可能会导致性能问题和渲染过程中的不一致性。通过异步更新，React 可以更高效地处理复杂的状态更新和渲染操作。

    - 性能优化，他会将多个状态更新合并为一个批量更新来减少渲染次数
    - 当你调用useState更新函数，React不会立即渲染，而是会将更新操作推到一个队列中。然后，React 会在下一个事件循环中，批量处理这些更新。

- 内部机制

  - 当我们多次以相同的操作更新状态时，React 会进行比较，如果值相同，则会屏蔽后续的更新行为。自带`防抖`的功能，防止频繁的更新。

    ```tsx  [index.tsx]
    import { useState } from "react"
    function App() {
      let [index, setIndex] = useState(0)
      const heandleClick = () => {
        setIndex(index + 1) //1
        setIndex(index + 1) //1
        setIndex(index + 1) //1
        console.log(index,'index') // 0
      }
      return (
        <>
           <h1>Index:{index}</h1>
          <button onClick={heandleClick}>更改值</button>
          
        </>
      )
    }
    export default App
    ```

    结果是1并不是3，因为`setIndex(index + 1)`的值是一样的，后续操作被屏蔽掉了，阻止了更新。

    为了解决这个问题，你可以向`setIndex` 传递一个更新函数，而不是一个状态。

    ```tsx [index.tsx]
    import { useState } from "react"
    function App() {
      let [index, setIndex] = useState(0)
      const heandleClick = () => {
        setIndex(index => index + 1) //1
        setIndex(index => index + 1) //2
        setIndex(index => index + 1) //3
      }
      return (
        <>
          <h1>Index:{index}</h1>
          <button onClick={heandleClick}>更改值</button>
    
        </>
      )
    }
    export default App
    ```

    这里，`index => index + 1` 是更新函数。它获取 待定状态 并从中计算 下一个状态。

    React 将更新函数放入 [队列](https://zh-hans.react.dev/learn/queueing-a-series-of-state-updates) 中。然后，在下一次渲染期间，它将按照相同的顺序调用它们：

    1. index => index + 1 将接收 0 作为待定状态，并返回 1 作为下一个状态。
    2. index => index + 1 将接收 1 作为待定状态，并返回 2 作为下一个状态。
    3. index => index + 1 将接收 2 作为待定状态，并返回 3 作为下一个状态。

    现在没有其他排队的更新，因此 React 最终将存储 3 作为当前状态。

  - 按照惯例，通常将待定状态参数命名为状态变量名称的第一个字母，如 `index  为 `i`。然而，你也可以把它命名为 `prevIndex` 或者其他你觉得更清楚的名称。

###### 4.使用immer

- useState的当前状态是不可变，当我们操作复杂数据类型，不能像操作原生js那样去操作复杂数据类型，

- 当然我们也有其它方式，

  - 比如 使用`filter map slice `等
  - 深拷贝

- 这次我们使用第三方库`immer`来与useState配合使用

  - 安装`immer`
  ::: code-group

  ```bash [npm]
  npm install immer
 
  ```
  ```bash [yarn]
   yarn add immer
  ```
  ::: 

  - 使用`immer`排序旋转 

  ```tsx [index.tsx]
  import { useState } from "react"
  import {produce} from 'immer'
  function App() {
    let [arr, setArr] = useState([1, 2, 3])
    const heandleClick = () => {
      let newList = [...arr].map(v => v + 1) //拷贝到新数组
      setArr(
       produce((draft)=>{
           draft.sort((a, b) => b - a)
           // draft.reverse()旋转
       })
      )
    }
    return (
      <>
        <button onClick={heandleClick}>更改值</button>
        <div id="aaa">{arr}</div>
      </>
    )
  }
  export default App
  ```
