# useReducer

### 1).介绍

- `useReducer` 跟 `useState` 一样的都是帮我们管理组件的`状态`的，但是呢与`useState`不同的是 `useReducer` 是`集中式`的管理状态的。
- `useReducer`可以使我们的代码具有更好的可读性，可维护性。

### 2).用法

```tsx [App.tsx]
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

    ```tsx [App.tsx]
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

  ```tsx [App.tsx]
   const initialColor = { color: "red" };
  ```

- 其次 创建了一个改变颜色的函数`changeColor` 作为 ``reducer` ` 处理函数

  - 在`reducer`处理函数中 `state`是旧值，`action `作为  `dispath`函数的
  - 它接收当前状态 (state) 和一个动作对象 (action)，根据 action.type 来决定如何更新 state。
  - 如果 action.type 不匹配任何已定义的情况，则抛出一个错误。

  ```tsx [App.tsx]
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

  ```tsx [App.tsx]
  const initBule = (() => ({ color: "blue" })
  const [item, dispatch] = useReducer(changeColor, initialColor,initBule );
  ```

- 最终实现的代码

```tsx [App.tsx]
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
- reducer 函数

  - 如果 action.type 是 'increment'，则 count 增加 1；如果是 'decrement'，则count减少1。
::: code-group
```tsx [App.tsx]
import reducer from './reducer'
const App = () =>  {
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialState = { count: 0 };
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
```tsx [reducer.tsx]
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
export default reducer
```


::: 
###### 案例:购物车

- 初始数据 (initValue):

  - initValue是一个数组，表示初始的商品列表。每个商品有以下属性：
    - title: 商品的名称。
    - price: 单价（例如 100）。
    - num: 数量，默认为 1。
    - id: 商品的唯一标识符。
    - isEdit: 表示该商品名称是否处于编辑状态，默认为 false。
  - 类型定义 (List 和 Action):
  - List类型 根据 initValue进行推断
  - Action类型里面的type
    - add 表示新增数量
    - sub 表示减少数量
    - delete 删除某个商品
    - edit 编辑商品
    - foucs 表示文本聚焦修改商品名称
    - blur 失去焦点完成修改商品名称

  - Reducer 函数 (changeShopping):
::: code-group


  ```tsx [App.tsx]
  import React, { useReducer } from "react";
  import changeShopping from "./reducer";
  import initValue, { List } from "./initValue";

  function App() {
    const [items, dispatch] = useReducer(changeShopping, initValue);
    return (
      <>
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
      </>
    );

  ```

  ```ts [initValue.ts]
 export const initValue = [
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
  export type List = typeof initValue
  export interface Action { 
    type:  "add" | "sub" | "delete" | "edit" | "foucs" | "blur", 
    id: number, 
    newName?: string 
  }
  ```

  

  ```ts [changeShopping.ts]
  import { initValue } from "./initValue";
  import types { Action, List } from "./types";
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
    export default changeShopping
  ```
::: 