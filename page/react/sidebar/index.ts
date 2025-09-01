const reactSideBar = {
  '/page/react/': [
    {
      text: '入门',
      items: [
        { text: 'React基本介绍', link: '/page/react/basic/introduce' },
        {
          text: 'React开发环境搭建',
          items: [
            { text: '用create-react-app搭建', link: '/page/react/basic/create-react-app' },
            { text: '用vite搭建React', link: '/page/react/basic/vite' },
            { text: '配置React开发环境', link: '/page/react/basic/react-config.md' },
          ],
        },
        { text: 'tsx语法入门', link: '/page/react/basic/tsx.md' },
      ],
    },
    {
      text: 'hooks',
      items: [
        {
          text: '数据驱动',
          items: [
            { text: 'useState', link: '/page/react/hooks/useState.md' },
            { text: 'useReducer', link: '/page/react/hooks/useReducer.md' },
            { text: 'useSyncExternalStore', link: '/page/react/hooks/useSyncExternalStore.md' },
            { text: 'useTransition', link: '/page/react/hooks/useTransition.md' },
            { text: 'useDeferredValue', link: '/page/react/hooks/useDeferredValue.md' },
          ],
        },
        {
          text: '副作用',
          items: [
            { text: 'useEffect', link: '/page/react/hooks/useEffect.md' },
            { text: 'useLayoutEffect', link: '/page/react/hooks/useLayoutEffect.md' },
          ],
        },
        {
          text: '状态传递',
          items: [
            { text: 'useRef', link: '/page/react/hooks/useRef.md' },
            { text: 'useImperativeHandle', link: '/page/react/hooks/useImperativeHandle.md' },
            { text: 'useContext', link: '/page/react/hooks/useContext.md' },
          ],
        },
        {
          text: '状态派生',
          items: [
            { text: 'useMemo', link: '/page/react/hooks/useMemo.md' },
            { text: 'useCallback', link: '/page/react/hooks/useCallback.md' },
          ],
        },
        {
          text: '工具Hooks',
          items: [
            { text: 'useDebugValue', link: '/page/react/hooks/useDebugValue.md' },
            { text: 'useId', link: '/page/react/hooks/useId.md' },
          ],
        },
        {
          text: '其他',
          items: [{ text: '自定义hooks', link: '/page/react/hooks/customHooks.md' }],
        },
      ],
    },
  ],
};

export default reactSideBar;
