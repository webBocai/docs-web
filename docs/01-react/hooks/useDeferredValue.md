---
date: 2025-05-15 09:43:30
title: useDeferredValue <TkTitleTag type="vp-important" text="Hooks" position="right" />
permalink: /react/238f57
categories:
  - React
coverImg: /img/react_hooks.png
tags:
  - React Hooks
---
#  useDeferredValue

**useDeferredValue** 用于延迟某些状态的更新，直到主渲染任务完成。这对于高频更新的内容（如**输入框、滚动**等）非常有用，可以让 UI 更加流畅，避免由于频繁更新而导致的性能问题。

**关联问题：useTransition 和 useDeferredValue 的区别**

`useTransition` 和 `useDeferredValue` 都涉及延迟更新，但它们关注的重点和用途略有不同：

- useTransition主要关注点是`状态的过渡`。它允许开发者控制某个更新的延迟更新，还提供了过渡标识，让开发者能够添加过渡反馈。
- useDeferredValue主要关注点是`单个值`的延迟更新。它允许你把特定状态的更新标记为低优先级。

###### **用法**

```ts [App.react]
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

```js [server.js]
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
- 修改`DeferredValueDemo1`页面
```tsx [DeferredValueDemo1.react]
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

- 使用 `useDeferredValue` 后，输入框中的搜索内容不会立即触发列表过滤，避免频繁的渲染。输入停止片刻后(看起来像节流)，列表会自动更新为符合条件的数据，确保了较流畅的交互体验。

###### 陷阱

- `useDeferredValue` 有可能像防抖，但他并不是防抖，防抖是需要一个固定的延迟时间，譬如1秒后再处理某些行为，但是`useDeferredValue`并不是一个固定的延迟，它会根据用户设备的情况进行延迟，当设备情况好，那么延迟几乎是无感知的

