

### 一、数据驱动

####   1.useState

#####    1).介绍

- `useState` 是一个 React Hook，允许函数组件在内部管理状态。

- 组件通常需要根据交互更改显示的内容，比如计数器点击某个按钮，数字就增加或相减

  并显示到屏幕上

##### 2).使用方法

- `useState` 接收一个参数，即状态的初始值，然后返回一个数组，其中包含两个元素：**当前的状态值**和一个**更新该状态的函数**

```tsx
const [state, setState] = useState(initialState)
```

- **注意：**在React中所有hook,**只能写在组件的顶层**,或者自己的hook调用它,不能在循环和判断语句中使用hook
- 在严格模式中，React 将 `两次调用初始化函数`，以 帮你找到意外的不纯性。这只是开发时的行为，不影响生产

######      1.基本数据类型

```tsx
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

    ```tsx
     const [count, setCount] = useState(0);
     count=count+1 // 这样是错误的，这样无法触发组件的重新渲染
     setCount(count+1) // 这样是正确的
    ```

- 要更新`屏幕上的内容`，请使用新状态调用 set 函数

  - 调用**set函数**会**更新state**,然后**重新渲染组件**
  - React 会存储新状态，使用新值重新渲染组件，并更新 UI。

###### 2.复杂数据类型

   **数组**

- 在useState返回的当前状态值是不能直接修改的，只能视为只读,**数组和对象**也是一样的
- 当你操作数组的时候，数组有些方法可以更改数组本身如`push、pop、unshift splice`等

| 避免使用 (会改变原始数组)          | 推荐使用 (会返回一个新数组）      |
| ---------------------------------- | --------------------------------- |
| 添加元素 push，unshift             | concat，[...arr] 展开语法（例子） |
| 删除元素 pop，shift，splice        | filter，slice（例子）             |
| 替换元素 splice，arr[i] = ... 赋值 | map（例子）                       |
| 排序 reverse，sort                 | 先将数组复制一份（例子）          |

**数组新增数据**

创建一个新数组，包含了原始数组的所有元素，然后在末尾添加新元素，如果想在头部添加新元素，返过来即可。

```tsx
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

```tsx
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

```tsx
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

  ```tsx
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

  ```tsx
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

```tsx
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

```tsx
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

    ```tsx
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

    ```tsx
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

  ```
  npm install immer
  yarn add immer
  ```

  - 使用`immer`排序旋转 

  ```tsx
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

#### 2.useReducer

##### 1).介绍

- `useReducer` 跟 `useState` 一样的都是帮我们管理组件的`状态`的，但是呢与`useState`不同的是 `useReducer` 是`集中式`的管理状态的。
- `useReducer`可以使我们的代码具有更好的可读性，可维护性。

##### 2).用法

```tsx
const [state, dispatch] = useReducer(reducer, initialArg, init?)
```

###### 参数

- `reducer` 是一个处理函数，用于更新状态, reducer 里面包含了两个参数，第一个参数是 `state`，第二个参数是 `action`。`reducer` 会返回一个新的 `state`。
- `initialArg` 是 `state` 的初始值
- `init` 是一个可选的函数，用于初始化 `state`，如果编写了init函数，则默认值使用init函数的返回值，否则使用`initialArg`。

###### 返回值

- useReducer 返回一个由两个值组成的数组：

  - 当前的 `state`。初次渲染时，它是` init `或 `initialArg `（如果没有 init 函数） 

  - `dispatch` 函数。用于更新 state 并触发组件的重新渲染。

    - 根据旧状态进行处理 `oldState`，处理完成之后返回新状态 `newState`
    - `reducer `只有被`dispatch`的时候才会被调用 刚进入页面的时候是不会执行的
    - `oldState `任然是只读的

    ```tsx
    import { useReducer } from 'react';
    function reducer(oldState, action) {
      // ...
    }
    
    function MyComponent() {
      const [state, dispatch] = useReducer(reducer, { age: 42 });
      // ...
    ```

###### 案例:切换背景颜色

- 当我点击按钮切换对应的背景颜色

- 首先创建了一个 `initialColor`对象 作为`initialArg`的初始值

  ```tsx
   const initialColor = { color: "red" };
  ```

- 其次 创建了一个改变颜色的函数`changeColor` 作为 ``reducer` ` 处理函数

  - 在`reducer`处理函数中 `state`是旧值，`action `作为  `dispath`函数的
  - 它接收当前状态 (state) 和一个动作对象 (action)，根据 action.type 来决定如何更新 state。
  - 如果 action.type 不匹配任何已定义的情况，则抛出一个错误。

  ```tsx
    const changeColor = (state: typeof initialState, action: { type: string }) => {
      switch (action.type) {
        case "yellow":
          return { color: "yellow" };
        case "green":
          return { color: "green" };
        case "red":
          return { color: "red" };
        default:
          throw new Error();
      }
    };
  ```

- 最后使用了`init`可选函数返回值作为新的初始值

  ```tsx
  const initBule = (() => ({ color: "blue" })
  const [item, dispatch] = useReducer(changeColor, initialColor,initBule );
  ```

- 最终实现的代码

```tsx
import React, { useReducer } from "react";
import type { FC } from "react";

const ReducerDemo1: FC = () => {
  const initialColor = { color: "red" };

  const changeColor = (state: typeof initialState, action: { type: string }) => {
    switch (action.type) {
      case "yellow":
        return { color: "yellow" };
      case "green":
        return { color: "green" };
      case "red":
        return { color: "red" };
      default:
        throw new Error();
    }
  };
   const initBule = (() => ({ color: "blue" })
   const [item, dispatch] = useReducer(changeColor, initialColor, initBule);
  return (
    <>
      <div style={{ backgroundColor: item.color }}>颜色</div>
      <button onClick={() => dispatch({ type: "yellow" })}>黄色</button>
      <button onClick={() => dispatch({ type: "green" })}>绿色</button>
    </>
  );
};
export default ReducerDemo1;

```

###### 案例:计数器案例

- 首先创建了一个 `initialColor`对象 作为`initialArg`的初始值

  - 这里定义了一个初始状态对象，包含一个 count 属性，初始值为 0。

  ```tsx
  const initialState = { count: 0 };
  ```

- reducer 函数

  - 如果 action.type 是 'increment'，则 count 增加 1；如果是 'decrement'，则 count 减少 1。

```tsx
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}
```

```tsx
const App = () =>  {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}
export default App;
```

###### 案例:购物车

- 初始数据 (initValue):

  - initValue是一个数组，表示初始的商品列表。每个商品有以下属性：
    - title: 商品的名称。
    - price: 单价（例如 100）。
    - num: 数量，默认为 1。
    - id: 商品的唯一标识符。
    - isEdit: 表示该商品名称是否处于编辑状态，默认为 false。

  ```tsx
    const initValue = [
      {
        id: 1,
        title: "铅笔",
        price: 2,
        num: 1,
        isEdit: false,
      },
      {
        id: 2,
        title: "钢笔",
        price: 30,
        num: 1,
        isEdit: false,
      },
    ];
  ```

- 类型定义 (List 和 Action):

  ```tsx
  type List = typeof initValue
  interface Action { 
    type:  "add" | "sub" | "delete" | "edit" | "foucs" | "blur", 
    id: number, 
    newName?: string 
  }
  ```

  - List类型 根据 initValue进行推断
  - Action类型里面的type
    - add 表示新增数量
    - sub 表示减少数量
    - delete 删除某个商品
    - edit 编辑商品
    - foucs 表示文本聚焦修改商品名称
    - blur 失去焦点完成修改商品名称

  - Reducer 函数 (changeShopping):

  ```tsx
    const changeShopping = (
      state:List ,
      action: Action
    ) => {
      const item = state.find(item => item.id === action.id)!;
      switch (action.type) {
        case "add":
          return state.map(item => {
            if (item.id === action.id) {
              return { ...item, num: item.num + 1 };
            }
            return item;
          });
        case "sub":
          return state.map(item => {
            if (item.id === action.id) {
              return { ...item, num: item.num - 1 };
            }
            return item;
          });
        case "delete":
          return state.filter(item => item.id !== action.id);
        case "foucs":
          return state.map(item => {
            if (item.id === action.id) {
              return { ...item, input: true };
            }
            return item;
          });
        case "edit":
          return state.map(item => {
            if (item.id === action.id) {
              return { ...item, input: true, title: action.value! };
            }
            return item;
          });
  
        case "blur":
          item.input = false;
          return [...state];
        default:
          throw new Error();
      }
    };
  ```

- 组件

  ```tsx
   <table border={1} cellPadding={10} cellSpacing={0} width={500}>
          <thead>
            <tr>
              <th>商品</th>
              <th>数量</th>
              <th>单价</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              return (
                <tr key={item.id}>
                  <td>
                    {item.input ? (
                      <input
                        value={item.title}
                        onBlur={() => dispatch({ type: "blur", id: item.id })}
                        onChange={e =>dispatch({ type: "edit", 
                                               id: item.id,
                                               value:e.target.value}
                                               )}
                      />
                    ) : (
                      item.title
                    )}
                  </td>
                  <td>
                    <button onClick={() => dispatch({ type: "sub", id: item.id })}>-</button>
                    {item.num}
                    <button onClick={() => dispatch({ type: "add", id: item.id })}>+</button>
                  </td>
                  <td>{item.price}</td>
                  <td>
                    <button onClick={() => dispatch({ type: "delete", id: item.id })}>删除</button>
                    <button onClick={() => dispatch({ type: "foucs", id: item.id })}>编辑</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>总价</td>
              <td>{items.reduce((total, item) => total + item.price * item.num, 0)}</td>
            </tr>
          </tfoot>
        </table>
  ```

#### 3.useSyncExternalStore

`useSyncExternalStore `是 React 18 引入的一个 Hook，用于从外部存储（例如状态管理库、浏览器 API 等）获取状态并在组件中同步显示。这对于需要跟踪外部状态的应用非常有用。

##### 场景

- 订阅外部 store 例如(redux,Zustand`德语`)
- 订阅浏览器API 例如(online,storage,location)等
- 抽离逻辑，编写自定义hooks
- 服务端渲染支持

##### 用法

```tsx
const res = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```

- subscribe：函数用来订阅数据源的变化，接收一个回调函数，在数据源更新时调用该回调函数。
- getSnapshot：函数，返回的值作为当前状态。
- getServerSnapshot?：在服务器端渲染时用来获取数据源的快照。

```tsx
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

##### 案例:

######  1. 封装localStoreage存储

- 订阅浏览器Api 实现自定义hook(useStorage)

  - 我们实现一个useStorage Hook，用于订阅 localStorage 数据。这样做的好处是，我们可以确保组件在 localStorage 数据发生变化时，自动更新同步。

  - 在封装的 `useStore.ts`文件中:

    - 首先订阅`subscribe`函数中 订阅了浏览器的storage事件，在return 函数中也取消订阅了

    - 其次在`getSnapshot` 得到最新状态的值

    - 然后`setSnapShot`函数中 设置localStorage的值

      - 当触发了`setSnapShot`函数，我们将使用`dispathEvent`手动触发浏览器的storage事件

        然后触发里面的callback函数，当执行`callback`函数后将执行`getSnapshot`函数将最新的值返回出去，然后执行`rerender`函数 重新渲染组件

    ```tsx
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

  - 在App.tsx文件中

    ```tsx
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

###### 2.封装简易history hook

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

```tsx
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

##### 注意事项

当我们`getSnapshot`使用返回复杂数据类型的会产生一个栈溢出，如果 `getSnapshot` 返回值不同于上一次，React 会重新渲染组件。这就是为什么，如果总是返回一个不同的值，会进入到一个无限循环，并产生这个报错

`Uncaught (in promise) Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.`

- 这种写法每次返回了对象的引用，即使这个对象没有改变，React 也会重新渲染组件。

```ts
  const getSnapshot = () => {
    // 这里永远都会返回一个新对象React就会一直重新渲染，然后报错栈溢出
     const obj = {
      href: window.location.href,
    };
    return obj;
  };
```

修改成这样,只有`hash`变化之后React才会去重新渲染组件

```ts
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

#### 4.useTransition

`useTransition` 是 React 18 中引入的一个 Hook，**他不是做动画的hook，而是用于管理 UI 中的过渡状态**，特别是在处理长时间运行的状态更新时。它允许你将某些更新标记为“过渡”状态，这样 React 可以优先处理更重要的更新，比如用户输入，同时延迟处理过渡更新。

##### 用法

```tsx
const [isPending, startTransition] = useTransition();
```

##### 参数

`useTransition` 不需要任何参数

##### 返回值

- `useTransition` 返回一个数组,包含两个元素

  - `isPending`(boolean)，告诉你是否存在待处理的 transition。
  - `startTransition`(function) 函数，你可以使用此方法将状态更新标记为 transition。

- ##### 优先级

  - (一般) 不是很重要，因为在实际工作中应用`较少`

##### 例子

######  模拟大量数据的场景

-    我们需要模拟数据很多的场景，这里使用`mockjs`模拟数据, 我所用的工具，超出你的想象，我用过很多工具和插件。
-    我们需要启动一个node服务

```
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

    ```
    npm isntall react-app-rewired 
    yarn add react-app-rewired 
    ```

  - 然后创建一个`config-overrides.js`

    - 写下以下配置

    ```js
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

- 然后在App.jsx文件中使用

```tsx
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

- 为了更好的测试结果可以在性能中降级cpu渲染速度

  ![](https://message163.github.io/react-docs/assets/cpu.B_H9gzVA.png)

###### 注意事项

**startTransition必须是同步的**

```js
startTransition(() => {
  // ❌ 在调用 startTransition 后更新状态
  setTimeout(() => {
    setPage('/about');
  }, 1000);
});
```

**正确做法**

```js
setTimeout(() => {
  startTransition(() => {
    // ✅ 在调用 startTransition 中更新状态
    setPage('/about');
  });
}, 1000);
```

**async await 错误做法**

```js
startTransition(async () => {
  await someAsyncFunction();
  // ❌ 在调用 startTransition 后更新状态
  setPage('/about');
});
```

**正确做法**

```js
await someAsyncFunction();
startTransition(() => {
  // ✅ 在调用 startTransition 中更新状态
  setPage('/about');
});
```

###### 原理剖析

useTransition 的核心原理是将一部分状态更新处理为低优先级任务，这样可以将关键的高优先级任务先执行，而低优先级的过渡更新则会稍微延迟处理。这在渲染大量数据、进行复杂运算或处理长时间任务时特别有效。React 通过调度机制来管理优先级：

1. **高优先级更新**：直接影响用户体验的任务，比如表单输入、按钮点击等。
2. **低优先级更新**：相对不影响交互的过渡性任务，比如大量数据渲染、动画等，这些任务可以延迟执行。

#### 5.useDeferredValue

**useDeferredValue** 用于延迟某些状态的更新，直到主渲染任务完成。这对于高频更新的内容（如**输入框、滚动**等）非常有用，可以让 UI 更加流畅，避免由于频繁更新而导致的性能问题。

**关联问题：useTransition 和 useDeferredValue 的区别**

`useTransition` 和 `useDeferredValue` 都涉及延迟更新，但它们关注的重点和用途略有不同：

- useTransition主要关注点是`状态的过渡`。它允许开发者控制某个更新的延迟更新，还提供了过渡标识，让开发者能够添加过渡反馈。
- useDeferredValue主要关注点是`单个值`的延迟更新。它允许你把特定状态的更新标记为低优先级。

###### **用法**

```ts
const deferredValue = useDeferredValue(value)
```

###### 参数

- value: 延迟更新的值(支持任意类型)

###### 返回值

- deferredValue: 延迟更新的值,在初始渲染期间，返回的延迟值将与您提供的值相同

###### 注意事项

- 当 `useDeferredValue` 接收到与之前不同的值（使用 **Object.is** 进行比较）时，除了当前渲染（此时它仍然使用旧值），它还会安排一个后台重新渲染。这个后台重新渲染是可以被中断的，如果 value 有新的更新，React 会从头开始重新启动后台渲染。
  - 举个例子，如果用户在输入框中的输入速度比接收延迟值的图表重新渲染的速度快，那么图表只会在用户停止输入后重新渲染。

###### 案例:延迟搜索数据的更新

- 以上个案例为举例

  - 修改给node服务新增函数

    ```js
    import mockjs from 'mockjs';
    import express from 'express';
    
    const app = express();
    const getMockData = (val) => {
      const data = mockjs.mock({
        'list|1000': [
          {
            'id|+1': 1,
            name: val,
            address: '@county(true)',
          },
        ],
      });
      return data;
    };
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
      const data = getMockData(keyWord);
      res.json(data);
    });
    app.get('/api/data', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      const data = getMockData('@natural');
      res.json(data);
    });
    
    app.listen(8030, () => {
      console.log('server is running');
    });
    
    ```

```tsx
import React, { useDeferredValue, useEffect, useState, useTransition } from "react";
import type { ChangeEvent, FC } from "react";

interface ListType {
  id: number;
  name: string;
  address: string;
}

const DeferredValueDemo1: FC = () => {
  const [list, setList] = useState<ListType[]>([]);
  const [val, setVal] = useState("");
  const deferredQuery = useDeferredValue(val);
  const getData = async (): Promise<ListType[]> => {
    const res = await fetch("/api/data", {
      method: "GET",
    });
    const data = await res.json();
    return data.list;
  };
  useEffect(() => {
    getData().then(res => {
      setList([...res]);
    });
  }, []);
  const show = val === deferredQuery; // 检查是否为延迟状态
  const ChangeList = (e: ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
    //过滤列表，仅在 deferredQuery 更新时触发
    const clist = list.filter(item => item.name.toString().includes(deferredQuery));
    console.log(clist, deferredQuery);
    setList([...clist]);
  };

  return (
    <div>
      <input type="text" onChange={ChangeList} placeholder="请输入搜索关键词" />
      <div style={{ opacity: show ? "1" : "0.1", transition: "all 1s" }}>
        {list.map(item => (
          <div key={item.id}>
            <span style={{ marginRight: "10px" }}>{item.name}</span>
            <span>{item.address}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeferredValueDemo1;

```

- 使用 useDeferredValue 后，输入框中的搜索内容不会立即触发列表过滤，避免频繁的渲染。输入停止片刻后(看起来像节流)，列表会自动更新为符合条件的数据，确保了较流畅的交互体验。

###### 陷阱

- useDeferredValue 有可能像防抖，但他并不是防抖，防抖是需要一个固定的延迟时间，譬如1秒后再处理某些行为，但是useDeferredValue并不是一个固定的延迟，它会根据用户设备的情况进行延迟，当设备情况好，那么延迟几乎是无感知的

### 二、副作用

#### useEffect

`useEffect` 是 React 中用于处理`副作用`的钩子。并且`useEffect` 还在这里充当生命周期函数，在之前你可能会在类组件中使用 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount` 来处理这些生命周期事件。

**什么是副作用函数，什么是纯函数？**

###### 纯函数

- 输入决定输出：相同的输入永远会得到相同的输出。这意味着函数的行为是可预测的。
- 无副作用：纯函数`不会修改外部状态`，也不会依赖外部可变状态。因此，纯函数内部的操作不会影响外部的变量、文件、数据库等。

```js
const add = (x: number, y: number) => x + y
add(1,2) //3
```

###### 副作用函数

1. 副作用函数 指的是那些在执行时会**改变外部状态**或**依赖外部可变状态**的函数。
2. 可预测性降低但是副作用不一定是坏事有时候副作用带来的效果才是我们所期待的
3. 高耦合度函数非常依赖外部的变量状态紧密
   - 操作引用类型
   - 操作本地存储例如`localStorage`
   - 调用外部API，例如`fetch` `ajax`
   - 操作`DOM`
   - 计时器

###### 例子1(副作用函数)

```js
let globalVariable = 0;

function calculateDouble(number){  
  globalVariable += 1; //修改函数外部环境变量

  localStorage.setItem('globalVariable', globalVariable); //修改 localStorage

  fetch(/*…*/).then((res)=>{ //网络请求
   //…  
  }); 

  document.querySelector('.app').style.color = 'red'; //修改 DOM element

  return number *2
}
```

###### 例子2(副作用函数)

```js
//------------副作用函数--------------
let obj = {name:'张三'}
const changeObj = (obj) => {
    obj.name = '李四'
    return obj
}
//张三
changeObj(obj) //修改了外部变量属于副作用函数
//李四
//------------修改成纯函数--------------
//也就是不会改变外部传入的变量
let obj = {name:'张三'}
const changeObj = (obj) => {
   const newObj = window.structuredClone(obj) //深拷贝
   newObj.name = '李四'
   return newObj
}
console.log(obj,'before') //obj 李四
let newobj = changeObj(obj)
console.log(obj,'after',newobj) //obj 张三 newobj 李四
```

了解了副作用函数之后我们可以正式开始了解`useEffect`

##### useEffect用法

```tsx
useEffect(setup, dependencies?)
```

##### 参数

- **setup**：Effect处理函数,可以返回一个清理函数。组件挂载时执行setup,依赖项更新时先执行cleanup再执行setup,组件卸载时执行cleanup。
- **dependencies(可选)**：setup中使用到的响应式值列表(props、state等)。必须以数组形式编写如[dep1, dep2]。不传则每次重渲染都执行Effect。

##### 返回值

useEffect 返回 `undefined`

```ts
let a = useEffect(() => {})
console.log('a', a) //undefined
```

##### 基本使用

- 副作用函数能做的事情`useEffect`都能做，例如操作`DOM`、网络请求、计时器等等。

###### 操作DOM

```tsx
import { useEffect } from 'react'

function App() {
  const dom = document.getElementById('data')
  console.log(dom) //null
  useEffect(() => {
    const data = document.getElementById('data')
    console.log(data) //<div id='data'>张三</div>
  }, [])
  return <div id='data'>张三</div>
}
```

###### 网络请求

```tsx
useEffect(() => {
  fetch('http://localhost:5174/?name=zs')
}, [])
```

##### 执行时机

###### 组件挂载时执行

- 根据我们下面的例子可以观察到，组件在挂载的时候就执行了`useEffect`的副作用函数。

  类似于`componentDidMount`

```tsx
useEffect(() => {
  console.log('组件挂载时执行')
},[])//只会执行一次
```

###### 组件更新时执行

- 无依赖项更新
  - 根据我们下面的例子可以观察到，当有响应式值发生改变时，`useEffect`的副作用函数就会执行。类似于`componentDidUpdate` + `componentDidMount`

```tsx
import { useEffect, useState } from "react"

const App = () => {
   const [count, setCount] = useState(0)
   const [name, setName] = useState('')
   useEffect(() => {
      console.log('执行了', count, name)
   })
   return (
      <div id='data'>
         <div>
            <h3>count:{count}</h3>
            <button onClick={() => setCount(count + 1)}>+</button>
         </div>
         <div>
            <h3>name:{name}</h3>
            <input value={name} onChange={e => setName(e.target.value)} />
         </div>
      </div>
   )
}
export default App
```

- 有依赖项更新
  - 根据我们下面的例子可以观察到，当依赖项数组中的`count`值发生改变时，`useEffect`的副作用函数就会执行。而当`name`值改变时,由于它不在依赖项数组中,所以不会触发副作用函数的执行。

```tsx
import { useEffect, useState } from "react"

const App = () => {
   const [count, setCount] = useState(0)
   const [name, setName] = useState('')
   useEffect(() => {
      console.log('执行了', count, name)
   }, [count]) //组件刚开始的时候会执行一次，当count发生改变时执行
   return (
      <div id='data'>
         <div>
            <h3>count:{count}</h3>
            <button onClick={() => setCount(count + 1)}>+</button>
         </div>
         <div>
            <h3>name:{name}</h3>
            <input value={name} onChange={e => setName(e.target.value)} />
         </div>
      </div>
   )
}
export default App
```

###### 组件卸载时执行

- `useEffect`的副作用函数可以返回一个清理函数，
- 当组件卸载时，`useEffect`的副作用函数就会执行清理函数。
- 确切说清理函数就是副作用函数运行之前，会清楚上一次的副作用函数。
  - 根据我们下面的例子可以观察到，当组件卸载时，`useEffect`的副作用函数就会执行。类似于`componentWillUnmount`

```tsx
import { useEffect, useState } from "react"
// 子组件
const Child = (props: { name: string }) => {
   useEffect(() => {
      console.log('render', props.name)
       let timer = setTimeout(() => {
         fetch(`http://localhost:5174/?name=${props.name}`)
      }, 1000)
      //组件卸载时 会执行该函数
      return () => {
         console.log('unmount', props.name)
          clearTimeout(timer)
      }
   }, [props.name])
   return <div>Child:{props.name}</div>
}
const App = () => {
   const [show, setShow] = useState(true)
   const [name, setName] = useState('')
   return (
      <div id='data'>
         <div>
            <h3>父组件</h3>
            <input value={name} onChange={e => setName(e.target.value)} />
            <button onClick={() => setShow(!show)}>显示/隐藏</button>
         </div>
         <hr />
         <h3>子组件</h3>
         {show && <Child name={name} />}
      </div>
   )
}

export default App
```

##### 真实案例

- 下面是一个真实的用户信息获取案例，通过`id`获取用户信息，并且当`id`发生改变时，会获取新的用户信息。

```tsx
import React, { useState, useEffect } from 'react';
interface UserData {
   name: string;
   email: string;
   username: string;
   phone: string;
   website: string;
}
function App() {
   const [userId, setUserId] = useState(1); // 假设初始用户ID为1
   const [userData, setUserData] = useState<UserData | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchUserData = async () => {
         setLoading(true);
         try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`); //免费api接口 可以直接使用
            if (!response.ok) {
               throw new Error('网络响应不正常');
            }
            const data = await response.json();
            setUserData(data);
         } catch (err: any) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };
      fetchUserData();
   }, [userId]);

   const handleUserChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setUserId(parseInt(event.target.value));
   };

   return (
      <div>
         <h1>用户信息应用</h1>
         <label>
            输入用户ID:
            <input type="number" value={userId} onChange={handleUserChange} min="1" max="10" />
         </label>
         {loading && <p>加载中...</p>}
         {error && <p>错误: {error}</p>}
         {userData && (
            <div>
               <h2>用户信息</h2>
               <p>姓名: {userData.name}</p>
               <p>邮箱: {userData.email}</p>
               <p>用户名: {userData.username}</p>
               <p>电话: {userData.phone}</p>
               <p>网站: {userData.website}</p>
            </div>
         )}
      </div>
   );
}

export default App;
```

<img src="https://message163.github.io/react-docs/assets/user.6Rkr3scy.png" style="zoom: 45%; float: left;" />

#### useLayoutEffect

`useLayoutEffect` 是 React 中的一个 Hook，用于在浏览器重新绘制屏幕之前触发。与 useEffect 类似。

##### 用法

```tsx
useLayoutEffect(() => {
  // 副作用代码
  return () => {
    // 清理代码
  }
}, [dependencies]);
```

##### 参数

- setup：Effect处理函数,可以返回一个清理函数。组件挂载时执行setup,依赖项更新时先执行cleanup再执行setup,组件卸载时执行cleanup。
- dependencies(可选)：setup中使用到的响应式值列表(props、state等)。必须以数组形式编写如[dep1, dep2]。不传则每次重渲染都执行Effect。

##### 返回值

useLayoutEffect 返回 `undefined`

##### 区别(useLayoutEffect/useEffect)

| 区别     | useLayoutEffect                      | useEffect                            |
| -------- | ------------------------------------ | ------------------------------------ |
| 执行时机 | 浏览器完成布局和绘制`之前`执行副作用 | 浏览器完成布局和绘制`之后`执行副作用 |
| 执行方式 | 同步执行                             | 异步执行                             |
| DOM渲染  | 阻塞DOM渲染                          | 不阻塞DOM渲染                        |

##### 测试案例

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

##### 应用场景

- 需要同步读取或更改DOM：例如，你需要读取元素的大小或位置并在渲染前进行调整。
- 防止闪烁：在某些情况下，异步的useEffect可能会导致可见的布局跳动或闪烁。例如，动画的启动或某些可见的快速DOM更改。
- 模拟生命周期方法：如果你正在将旧的类组件迁移到功能组件，并需要模拟 componentDidMount、componentDidUpdate和componentWillUnmount的同步行为

###### 案例

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

### 三、状态传递

#### useRef

- 当你在React中需要处理DOM元素或需要在组件渲染之间保持持久性数据时，便可以使用
- Vue的`ref是.value`，其次就是vue的**ref是响应式的**，而react的**ref不是响应式的**

```tsx
import { useRef } from 'react';
const refValue = useRef(initialValue)
refValue.current // 访问ref的值 类似于vue的ref,
```

##### 通过Ref操作DOM元素

###### 参数

- nitialValue：ref 对象的 current 属性的初始值。可以是任意类型的值。这个参数在首次渲染后被忽略。

###### 返回值

- useRef返回一个对象，对象的current属性指向传入的初始值。 `{current:xxxx}`

###### 注意

- 改变 ref.current 属性时，React 不会重新渲染组件。React 不知道它何时会发生改变，因为 ref 是一个普通的 JavaScript 对象。
- 除了 初始化 外不要在渲染期间写入或者读取 ref.current，否则会使组件行为变得不可预测。

```tsx
import { useRef } from "react"
function App() {
  //首先，声明一个 初始值 为 null 的 ref 对象
  let div = useRef(null)
  const heandleClick = () => {
    //当 React 创建 DOM 节点并将其渲染到屏幕时，React 将会把 DOM 节点设置为 ref 对象的 current 属性
    console.log(div.current)
  }
  return (
    <>
      {/*然后将 ref 对象作为 ref 属性传递给想要操作的 DOM 节点的 JSX*/}
      <div ref={div}>dom元素</div>
      <button onClick={heandleClick}>获取dom元素</button>
    </>
  )
}
export default App
```

##### 数据存储

- 我们实现一个保存count的新值和旧值的例子，但是在过程中我们发现一个问题，
- 就是num的值一直为0，这是为什么呢？
  - 因为等`useState`的 `SetCount`执行之后，组件会重新rerender,num的值又被初始化为了0，所以num的值一直为0。

```tsx
import React, { useLayoutEffect, useRef, useState } from 'react';

function App() {
   let num = 0
   let [count, setCount] = useState(0)
   const handleClick = () => {
      setCount(count + 1)
      num = count;
   };
   return (
      <div>
         <button onClick={handleClick}>增加</button>
         <div>{count}:{num}</div>
      </div>
   );
}

export default App;
```

<img src="https://message163.github.io/react-docs/assets/useRef-1.11CTWAIZ.png" style="zoom:20%;float:left" />

###### 如何修改？

- 我们可以使用useRef来解决这个问题，因为useRef只会在初始化的时候执行一次，当组件reRender的时候，useRef的值不会被重新初始化。

```tsx
import React, { useLayoutEffect, useRef, useState } from 'react';

function App() {
   let num = useRef(0)
   let [count, setCount] = useState(0)
   const handleClick = () => {
      setCount(count + 1)
      num.current = count;
   };
   return (
      <div>
         <button onClick={handleClick}>增加</button>
         <div>{count}:{num.current}</div>
      </div>
   );
}

export default App;
```

<img src="https://message163.github.io/react-docs/assets/useRef-2.DI8GZ-S7.png" style="zoom:20%;float:left" />

##### 实际应用

我们实现一个计时器的例子，在点击开始计数的时候，计时器会每300ms执行一次，在点击结束计数的时候，计时器会被清除。

###### 问题

我们发现，点击end的时候，计时器并没有被清除，这是为什么呢？

###### 原因

这是因为组件一直在重新ReRender,所以timer的值一直在被重新赋值为null，导致无法清除计时器。

```tsx
import React, { useLayoutEffect, useRef, useState } from 'react';

function App() {
   console.log('render')
   let timer: NodeJS.Timeout | null = null
   let [count, setCount] = useState(0)
   const handleClick = () => {
      timer = setInterval(() => {
         setCount(count => count + 1)
      }, 300)
   };
   const handleEnd = () => {
      console.log(timer);
      if (timer) {
         clearInterval(timer)
         timer = null
      }
   };
   return (
      <div>
         <button onClick={handleClick}>开始计数</button>
         <button onClick={handleEnd}>结束计数</button>
         <div>{count}</div>
      </div>
   );
}

export default App;
```

###### 如何修改

我们可以使用useRef来解决这个问题，因为useRef的值不会因为组件的重新渲染而改变。

```tsx
import React, { useLayoutEffect, useRef, useState } from 'react';

function App() {
   console.log('render')
   let timer = useRef<null | NodeJS.Timeout>(null)
   let [count, setCount] = useState(0)
   const handleClick = () => {
      timer.current = setInterval(() => {
         setCount(count => count + 1)
      }, 300)
   };
   const handleEnd = () => {
      if (timer.current) {
         clearInterval(timer.current)
         timer.current = null
      }
   };
   return (
      <div>
         <button onClick={handleClick}>开始计数</button>
         <button onClick={handleEnd}>结束计数</button>
         <div>{count}</div>
      </div>
   );
}

export default App;
```

##### 注意事项

1. 组件在重新渲染的时候，useRef的值不会被重新初始化。
2. 改变 ref.current 属性时，React 不会重新渲染组件。React 不知道它何时会发生改变，因为 ref 是一个普通的 JavaScript 对象。
3. useRef的值不能作为useEffect等其他hooks的依赖项，因为它并不是一个响应式状态。
4. useRef不能直接获取子组件的实例，需要使用forwardRef。



#### useImperativeHandle

可以在子组件内部暴露给父组件`句柄`，那么说人话就是，父组件可以调用子组件的方法，或者访问子组件的属性。 如果你学过Vue，就类似于Vue的`defineExpose`。

##### 用法

```tsx
useImperativeHandle(ref, ()=>{
    return {
        // 暴露给父组件的方法或属性
    }
}, [deps])
```

##### 参数

- ref: 父组件传递的ref对象
- createHandle: 返回值，返回一个对象，对象的属性就是子组件暴露给父组件的方法或属性
- deps?:[可选] 依赖项，当依赖项发生变化时，会重新调用createHandle函数，类似于`useEffect`的依赖项

##### 入门案例

###### 18版本

18版本需要配合`forwardRef`一起使用

**forwardRef**包装之后，会有两个参数，第一个参数是props，第二个参数是ref

我们使用的时候只需要将ref传递给`useImperativeHandle`即可，然后`useImperativeHandle` 就可以暴露子组件的方法或属性给父组件， 然后父组件就可以通过ref调用子组件的方法或访问子组件的属性

```tsx
interface ChildRef {
   name: string
   count: number
   addCount: () => void
   subCount: () => void
}

//React18.2
const Child = forwardRef<ChildRef>((_, ref) => {
   const [count, setCount] = useState(0)
   //重点
   useImperativeHandle(ref, () => {
      return {
         name: 'child',
         count,
         addCount: () => setCount(count + 1),
         subCount: () => setCount(count - 1)
      }
   })
   return <div>
      <h3>我是子组件</h3>
      <div>count:{count}</div>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
   </div>
})

function App() {
   const childRef = useRef<ChildRef>(null)
   const showRefInfo = () => {
      console.log(childRef.current)
   }
   return (
      <div>
         <h2>我是父组件</h2>
         <button onClick={showRefInfo}>获取子组件信息</button>
         <button onClick={() => childRef.current?.addCount()}>操作子组件+1</button>
         <button onClick={() => childRef.current?.subCount()}>操作子组件-1</button>
         <hr />
         <Child ref={childRef}></Child>
      </div>
   );
}

export default App;
```

###### 19版本

1. 19版本不需要配合`forwardRef`一起使用，直接使用即可，他会把Ref跟props放到一起，你会发现变得更加简单了
2. 19版本useRef的参数改为必须传入一个参数例如`useRef<ChildRef>(null)`

```tsx
interface ChildRef {
   name: string
   count: number
   addCount: () => void
   subCount: () => void
}

//React19

const Child = ({ ref }: { ref: React.Ref<ChildRef> }) => { 
   const [count, setCount] = useState(0)
   useImperativeHandle(ref, () => {
      return {
         name: 'child',
         count,
         addCount: () => setCount(count + 1),
         subCount: () => setCount(count - 1)
      }
   })
   return <div>
      <h3>我是子组件</h3>
      <div>count:{count}</div>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
   </div>
}

function App() {
   const childRef = useRef<ChildRef>(null)
   const showRefInfo = () => {
      console.log(childRef.current)
   }
   return (
      <div>
         <h2>我是父组件</h2>
         <button onClick={showRefInfo}>获取子组件信息</button>
         <button onClick={() => childRef.current?.addCount()}>操作子组件+1</button>
         <button onClick={() => childRef.current?.subCount()}>操作子组件-1</button>
         <hr />
         <Child ref={childRef}></Child>
      </div>
   );
}

export default App;
```

##### 执行时机[第三个参数]

- 如果不传入第三个参数，那么`useImperativeHandle`会在组件挂载时执行一次，然后状态更新时，都会执行一次

```tsx
useImperativeHandle(ref, () => {
     return {
        // 暴露给父组件的方法或属性
    }
})
```

- 如果传入第三个参数，并且是一个空数组，那么`useImperativeHandle`会在组件挂载时执行一次，然后状态更新时，不会执行
  - 此时抛出去的方法都是初始化好的值 ，如果抛出去值已经在子组件发生改变，抛出去的值还是一样的

```tsx
const [count, setCount] = useState(0)
useImperativeHandle(ref, () => {
     return {
         count // 永远是0
    }
}, [])
```

- 如果传入第三个参数，并且有值，那么`useImperativeHandle`会在组件挂载时执行一次，然后会根据依赖项的变化，决定是否重新执行

```tsx
const [count, setCount] = useState(0)
useImperativeHandle(ref, () => {
     return {
        // 暴露给父组件的方法或属性
    }
}, [count])
```

- 注意一般用的最多的是第三种有依赖项的，第二种方式一般用于比较旧值的

##### 实际案例

例如，我们封装了一个表单组件，提供了两个方法：校验和重置。使用`useImperativeHandle`可以将这些方法暴露给父组件，父组件便可以通过`ref`调用子组件的方法。

```tsx
interface ChildRef {
   name: string
   validate: () => string | true
   reset: () => void
}

const Child = ({ ref }: { ref: React.Ref<ChildRef> }) => {
   const [form, setForm] = useState({
      username: '',
      password: '',
      email: ''
   })
   const validate = () => {
      if (!form.username) {
         return '用户名不能为空'
      }
      if (!form.password) {
         return '密码不能为空'
      }
      if (!form.email) {
         return '邮箱不能为空'
      }
      return true
   }
   const reset = () => {
      setForm({
         username: '',
         password: '',
         email: ''
      })
   }
   useImperativeHandle(ref, () => {
      return {
         name: 'child',
         validate: validate,
         reset: reset
      }
   })
   return <div style={{ marginTop: '20px' }}>
      <h3>我是表单组件</h3>
      <input value={form.username} onChange={(e) => setForm({ ...form, username:        e.target.value })} placeholder='请输入用户名' type="text" />
      <input value={form.password} onChange={(e) => setForm({ ...form, password:    e.target.value })} placeholder='请输入密码' type="text" />
      <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder='请输入邮箱' type="text" />
   </div>
}

function App() {
   const childRef = useRef<ChildRef>(null)
   const showRefInfo = () => {
      console.log(childRef.current)
   }
   const submit = () => {
      const res = childRef.current?.validate()
      console.log(res)
   }
   return (
      <div>
         <h2>我是父组件</h2>
         <button onClick={showRefInfo}>获取子组件信息</button>
         <button onClick={() => submit()}>校验子组件</button>
         <button onClick={() => childRef.current?.reset()}>重置</button>
         <hr />
         <Child ref={childRef}></Child>
      </div>
   );
}

export default App;
```

#### useContext

useContext 提供了一个无需为每层组件手动添加 props，就能在组件树间进行数据传递的方法。设计的目的就是解决组件树间数据传递的问题。

<img src="https://message163.github.io/react-docs/assets/useContext.DUgSm-JN.png" style="zoom:50%;" />

##### 用法

```tsx
const MyThemeContext = React.createContext({theme: 'light'}); // 创建一个上下文
function App () {
   return (
    -  <MyThemeContext.Provider value={{theme: 'light'}}> // 18的写法 
     + <MyThemeContext  value={{theme: 'light'}}>  // 19的写法 不需要Provider
         <MyComponent />
      +  </MyThemeContext>
     - </MyThemeContext.Provider>
   )
}
function MyComponent() {
    const themeContext = useContext(MyThemeContext); // 使用上下文
    return (<div>{themeContext.theme}</div>);
}
```

##### 参数

###### 入参

- context：是 createContext 创建出来的对象，他不保持信息，他是信息的载体。声明了可以从组件获取或者给组件提供信息。

###### 返回值

- 返回传递的Context的值，并且是只读的。如果 context 发生变化，React 会自动重新渲染读取 context 的组件

##### 基本用法

######   18版本

- 首先我们先通过createContext创建一个上下文，然后通过createContext创建的组件包裹组件，传递值。
  - 被包裹的组件，在任何一个层级都是可以获取上下文的值，那么如何使用呢？
  - 使用的方式就是通过useContext这个hook，然后传入上下文，就可以获取到上下文的值。

```tsx
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

###### 19版本演示

TIP
**其实19版本和18版本是差不多的，只是19版本更加简单了，不需要再使用Provider包裹，直接使用即可**

```tsx
import React, { useContext, useState } from 'react';
const ThemeContext = React.createContext<ThemeContextType>({} as ThemeContextType);
interface ThemeContextType {
   theme: string;
   setTheme: (theme: string) => void;
}

const Child = () => {
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

         <ThemeContext value={{ theme, setTheme }}>
            <Parent />

         <ThemeContext>
      </div >
   );
}

export default App;
```

##### 注意事项

- 使用 ThemeContext 时，传递的key必须为`value`

```tsx
// 🚩 不起作用：prop 应该是“value”
<ThemeContext theme={theme}>
   <Button />
</ThemeContext>
// ✅ 传递 value 作为 prop
<ThemeContext value={theme}>
   <Button />
</ThemeContext>
```

- 可以使用多个Context
  - 如果使用多个Context，那么需要注意，如果使用的值是相同的，那么会覆盖。

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

### 四、状态派生

#### useMemo

`useMemo` 是 React 提供的一个性能优化 Hook。它的主要功能是避免在每次渲染时执行复杂的计算和对象重建。通过记忆上一次的计算结果，仅当依赖项变化时才会重新计算，提高了性能，有点类似于Vue的`computed`。

------

##### React.memo

`React.memo` 是一个 React API，用于优化性能。它通过记忆上一次的渲染结果，仅当 props 发生变化时才会重新渲染, 避免重新渲染。

###### 用法

使用 `React.memo` 包裹组件`[一般用于子组件]`，可以避免组件重新渲染。

```tsx
import React, { memo } from 'react';
const MyComponent = React.memo(({ prop1, prop2 }) => {
  // 组件逻辑
});
const App = () => {
  return <MyComponent prop1="value1" prop2="value2" />;
};
```

###### React.memo 案例

首先明确 React 组件的渲染条件：

1. 组件的 props 发生变化
2. 组件的 state 发生变化
3. useContext 发生变化

- 注意：我们来看下面这个例子，这个例子没有使用 `memo` 进行缓存，所以每次父组件的 state 发生变化，子组件都会重新渲染。
  - 而我们的子组件只用到了 user 的信息，但是父组件每次 search 发生变化，子组件也会重新渲染, 这样就就造成了没必要的渲染所以我们使用 `memo` 缓存。

```tsx
import React, { useMemo, useState } from 'react';
interface User {
   name: string;
   age: number;
   email: string;
}
interface CardProps {
   user: User;
}

const Card = React.memo(function ({ user }: CardProps) { 
   console.log('Card render'); // 每次父组件的 user 发生变化，子组件才会重新渲染
   const styles = {
      backgroundColor: 'lightblue',
      padding: '20px',
      borderRadius: '10px',
      margin: '10px'
   }
   return <div style={styles}>
      <h1>{user.name}</h1>
      <p>{user.age}</p>
      <p>{user.email}</p>
   </div>

}) 
function App() {
   const [users, setUsers] = useState<User>({
      name: '张三',
      age: 18,
      email: 'zhangsan@example.com'
   });
   const [search, setSearch] = useState('');
   return (
      <div>
         <h1>父组件</h1>
         <input value={search} onChange={(e) => setSearch(e.target.value)} />
          <div>
            <button onClick={() => setUsers({
               name: '李四',
               age: Math.random() * 100,
               email: 'lisi@example.com'
            })}>更新user</button>
         </div>
         <Card user={users} />
      </div>
   );
}

export default App;
```

###### React.memo 总结

1. **使用场景**：
   - 当子组件接收的 props 不经常变化时
   - 当组件重新渲染的开销较大时
   - 当需要避免不必要的渲染时
2. **优点**：
   - 通过记忆化避免不必要的重新渲染
   - 提高应用性能
   - 减少资源消耗
3. **注意事项**：
   - 不要过度使用，只在确实需要优化的组件上使用
   - 对于简单的组件，使用 `memo` 的开销可能比重新渲染还大
   - 如果 props 经常变化， `memo` 的效果会大打折扣

##### useMemo 用法

```tsx
import React, { useMemo, useState } from 'react';
const App = () => {
   const [count, setCount] = useState(0);
   const memoizedValue = useMemo(() => count, [count]);
   return <div>{memoizedValue}</div>;
}
```

##### 参数

###### 入参

- 回调函数:Function：返回需要缓存的值
- 依赖项:Array：依赖项发生变化时，回调函数会重新执行`(执行时机跟useEffect类似)`

###### 返回值

- 返回值：返回需要缓存的值`(返回之后就不是函数了)`

###### useMemo 执行时机(依赖项)

1. 如果依赖项是个空数组，那么 `useMemo` 的回调函数会执行一次
2. 指定依赖项，当依赖项发生变化时， `useMemo` 的回调函数会执行
3. 不指定依赖项，不推荐这么用，因为每次渲染和更新都会执行

##### useMemo 案例

######   没有用useMemo 

- 我们来看下面这个例子，这个例子没有使用 `useMemo` 进行缓存，所以每次 search 发生变化， `total` 都会重新计算，这样就造成了没必要的计算所以我们可以使用 `useMemo` 缓存，因为我们的 `total` 跟 `search` 没有关系，那么如果计算的逻辑比较复杂，就造成了性能问题。

```tsx
import React, { useMemo, useState } from 'react';

function App() {
   const [search, setSearch] = useState('');
   const [goods, setGoods] = useState([
      { id: 1, name: '苹果', price: 10, count: 1 },
      { id: 2, name: '香蕉', price: 20, count: 1 },
      { id: 3, name: '橘子', price: 30, count: 1 },
   ]);
   const handleAdd = (id: number) => {
      setGoods(goods.map(item => item.id === id ? { ...item, count: item.count + 1 } : item));
   }
   const handleSub = (id: number) => {
      setGoods(goods.map(item => item.id === id ? { ...item, count: item.count - 1 } : item));
   }
   const total = () => {
      console.log('total');
      //例如很复杂的计算逻辑
      return goods.reduce((total, item) => total + item.price * item.count, 0)
   }
   return (
      <div>
         <h1>父组件</h1>
         <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
         <table border={1} cellPadding={5} cellSpacing={0}>
            <thead>
               <tr>
                  <th>商品名称</th>
                  <th>商品价格</th>
                  <th>商品数量</th>
               </tr>
            </thead>
            <tbody>
               {goods.map(item => <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.price * item.count}</td>
                  <td>
                     <button onClick={() => handleAdd(item.id)}>+</button>
                     <span>{item.count}</span>
                     <button onClick={() => handleSub(item.id)}>-</button>
                  </td>
               </tr>)}
            </tbody>
         </table>
         <h2>总价：{total()}</h2>
      </div>
   );
}

export default App;
```

###### 使用useMemo

- 当我们使用 `useMemo` 缓存后，只有 goods 发生变化时， `total` 才会重新计算, 而 search 发生变化时， `total` 不会重新计算。

```tsx
import React, { useMemo, useState } from 'react';

function App() {
   const [search, setSearch] = useState('');
   const [goods, setGoods] = useState([
      { id: 1, name: '苹果', price: 10, count: 1 },
      { id: 2, name: '香蕉', price: 20, count: 1 },
      { id: 3, name: '橘子', price: 30, count: 1 },
   ]);
   const handleAdd = (id: number) => {
      setGoods(goods.map(item => item.id === id ? { ...item, count: item.count + 1 } : item));
   }
   const handleSub = (id: number) => {
      setGoods(goods.map(item => item.id === id ? { ...item, count: item.count - 1 } : item));
   }
   const total = useMemo(() => {
      console.log('total');
      return  goods.reduce((total, item) => total + item.price * item.count, 0)
   }, [goods]);
   return (
      <div>
         <h1>父组件</h1>
         <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
         <table border={1} cellPadding={5} cellSpacing={0}>
            <thead>
               <tr>
                  <th>商品名称</th>
                  <th>商品价格</th>
                  <th>商品数量</th>
               </tr>
            </thead>
            <tbody>
               {goods.map(item => <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.price * item.count}</td>
                  <td>
                     <button onClick={() => handleAdd(item.id)}>+</button>
                     <span>{item.count}</span>
                     <button onClick={() => handleSub(item.id)}>-</button>
                  </td>
               </tr>)}
            </tbody>
         </table>
         <h2>总价：{total}</h2>
      </div>
   );
}

export default App;
```

##### useMemo 总结

1. **使用场景**：
   - 当需要缓存复杂计算结果时
   - 当需要避免不必要的重新计算时
   - 当计算逻辑复杂且耗时时
2. **优点**：
   - 通过记忆化避免不必要的重新计算
   - 提高应用性能
   - 减少资源消耗
3. **注意事项**：
   - 不要过度使用，只在确实需要优化的组件上使用
   - 如果依赖项经常变化，useMemo 的效果会大打折扣
   - 如果计算逻辑简单，使用 useMemo 的开销可能比重新计算还大

#### useCallback

useCallback 用于优化性能，返回一个记忆化的回调函数，可以减少不必要的重新渲染，也就是说它是用于缓存组件内的函数，避免函数的重复创建。

##### 为什么需要useCallback

在React中，函数组件的重新渲染会导致组件内的函数被重新创建，这可能会导致性能问题。useCallback 通过缓存函数，可以减少不必要的重新渲染，提高性能。

##### 用法

```tsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

##### 参数

###### 入参

- callback：回调函数
- deps：依赖项数组，当依赖项发生变化时，回调函数会被重新创建，跟useEffect一样。

###### 返回值

- 返回一个记忆化的回调函数，可以减少函数的创建次数，提高性能。

##### 案例1

- 我们创建了一个WeakMap(用Map也行)，用于存储回调函数，并记录回调函数的创建次数。
- 在组件重新渲染时，changeSearch 函数会被重新创建，我们这边会进行验证，如果函数被重新创建了数量会+1，如果没有重新创建，数量默认是1。

```tsx
import { useCallback, useState } from 'react'
const functionMap = new WeakMap()
let counter = 1
const App: React.FC = () => {
   console.log('Render App')
   const [search, setSearch] = useState('')
   const changeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value)
   }
   // 如果组件重新渲染了 函数内存地址就不一样
   if(!functionMap.has(changeSearch)) {
      functionMap.set(changeSearch, counter++)
   }
   console.log('函数Id', functionMap.get(changeSearch))
   return <>
      <input type="text" value={search} onChange={changeSearch} />
   </>;
};
export default App;
```

<img src="https://message163.github.io/react-docs/assets/useCallback-1.BFbfZsfH.png" style="zoom:50%;" />

为什么是4呢，因为默认是1，然后输入框更改了3次，所以是4，那么这样好吗？我们使用useCallback来优化一下。

- 只需要在changeSearch函数上使用useCallback，就可以优化性能。

```tsx
const changeSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
}, [])
```

我们可以看到函数Id没有增加，说明函数没有被重新创建。

<img src="https://message163.github.io/react-docs/assets/useCallback-2.Cx2UWwdd.png" style="zoom:50%;" />

##### 案例2

应用于子组件：

- 我们创建了一个Child子组件，并使用React.memo进行优化，memo在上一章讲过了，他会检测props是否发生变化，如果发生变化，就会重新渲染子组件。
- 我们创建了一个childCallback函数，传递给子组件，然后我们输入框更改值，发现子组件居然重新渲染了，但是我们并没有更改props，这是为什么呢？
- 这是因为输入框的值发生变化，App就会重新渲染，然后childCallback函数就会被重新创建，然后传递给子组件，子组件会判断这个函数是否发生变化，但是每次创建的函数内存地址都不一样，所以子组件会重新渲染。

```tsx
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

const App: React.FC = () => {
   const [search, setSearch] = useState('')
   const [user, setUser] = useState({
      name: 'John',
      age: 20
   })
   // 因为每次组件重新渲染 函数内存地址就不一样 
 -  const childCallback = () => {
     // 会缓存useCallback包裹的函数
     +const  childCallback = useCallback(()=>{
      console.log('callback 执行了')
     +},[])    
  - }
   return <>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} />
      <Child callback={childCallback} user={user} />
   </>;
};

export default App;
```

因为父组件重新渲染了，所以childCallback函数会被重新创建，然后传递给子组件，子组件会判断这个函数是否发生变化，但是每次创建的函数内存地址都不一样，所以子组件会重新渲染。

<img src="https://message163.github.io/react-docs/assets/useCallback-3.Bd3ynv-p.png" style="zoom:50%;" />

只需要在childCallback函数上使用useCallback，就可以优化性能。

```tsx
const childCallback = useCallback(() => {
    console.log('callback 执行了')
}, [])
```

##### useCallback 执行时机(依赖项)

1. 如果依赖项是个空数组，那么 `useCallback ` 的回调函数会执行一次
2. 指定依赖项，当依赖项发生变化时， `useCallback ` 的回调函数会执行
3. 不指定依赖项，不推荐这么用，因为每次渲染和更新都会执行

##### 总结

useCallback的使用需要有所节制，不要盲目地对每个方法应用useCallback，这样做可能会导致不必要的性能损失。useCallback本身也需要一定的性能开销。

useCallback并不是为了阻止函数的重新创建，而是通过依赖项来决定是否返回新的函数或旧的函数，从而在依赖项不变的情况下确保函数的地址不变。

### 五、工具hook

