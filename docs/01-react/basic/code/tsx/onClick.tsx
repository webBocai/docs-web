import React from 'react';
function App() {
  const value: string = '张三';
  const clickTap = (params: string) => console.log(params);
  return (
    <>
      <div onClick={() => clickTap(value)}>{value}</div>
    </>
  );
}

export default App;
