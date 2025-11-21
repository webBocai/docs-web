import React, { useCallback, useState } from "react";
const map = new Map();
let count = 0;
export default function CallbackView() {
const [value, setValue] = useState("");
    const handelChange = (e: React.ChangeEvent<HTMLInputElement>) => { // [!code --]
        const handelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {  // [!code ++]
            setValue(e.target.value);
        }, []);  // [!code ++]
    }  // [!code --]
  if (!map.has(handelChange)) {
    count++;
    map.set(handelChange, count);
  }

  console.log("函数Id", map.get(handelChange));

  return (
    <>
      <input type="text" value={value} onChange={handelChange} />
    </>
  );
}
