---
date: 2025-09-01 15:53:48
title: 02-webpack处理CSS <TkTitleTag type="vp-primary" text="优质" position="right" />
permalink: /pages/25cf12
categories:
  - Webpack
coverImg: /img/webpack.jpeg
tags:
  - Webpack 基础
---


# Webpack处理静态资源(一)
#### webpack 处理css
#### 0.前情提要
- [在上一章](./01-webpack基本介绍) 我们的学习了`webpack`基本概要,这一章我们来学习`webpack`是如何出来`css`的
####    1.打包失败的问题
- :gear: 首先在css文件中创建 `index.css`

  ```css [index.css]
    .content {
        color: red;
        font-size: 40px;
    }
  ```
- :gear:  然后我们创建在`components`文件夹下创建`cps.js`

  ```js [cps.js]
    import '../css/index.css';
    const divEle = document.createElement('div');
    divEle.textContent = 'Hello World';
    divEle.classList.add('content');
    document.body.appendChild(divEle);
  ```
- :no_entry_sign: 最后我们执行 `npm run build` 会报错
  ::: list-danger 报错原因
    - :no_entry_sign: 报错信息: `You may need an appropriate loader to handle thiss file type, currently no loaders`
    - :no_entry_sign: 解释：解析失败, 你需要合适**loader来处理这个文件类型**
  :::

  ![](https://picx.zhimg.com/80/v2-f581ad19cdf0d5a075a1bd1d9e275a01_1420w.png)

#### 2.使用loader来处理
-  :gear: 为什么报这个错误？如何解决呢？
   ::: list-info 如何解决错误信息
   -  :card_index_dividers: 上面的错误信息告诉我们需要一个`loader`来加载这个 `css文件`，但是 `loader` 是什么呢？
      - :white_check_mark: `loader` 可以用于对模块的源代码进行转换
      - :white_check_mark:  我们可以将`css文件`也看成是一个模块,我们是通过`import`来**加载模块**将他**放入`webpack`依赖图中** 
      - :white_check_mark: 在加载这个模块时,`webpack`其实并**不知道如何对其进行加载**,我们必须使用`对应的loader`来处理相应的静态资源；
   :::
- :gear:  使用相应的loader，在这个应用场景我们就需要`css-loader`
  ::: list-tip css-loader是什么?
     - :card_index_dividers: 对于加载 `css文件` 来说，我们需要一个可以读取 `css文件` 的 `loader`；
     - :card_index_dividers: 这个loader最常用的是`css-loader` 
       - :page_facing_up: 安装loader `npm install css-loader -D`
  :::


#### 3.css-loader的使用方案

1. 如何使用这个`loader`来**加载css文件**呢？有三种方式：
  - **内联方式**：内联方式使用较少，因为不方便管理，在引入的样式前加上使用的`loader`，并且使用 `!` 分割

    ```js [cps.js]
    // import '../css/index.css'; // [!code --]
    import 'css-loader!../css/index.css'; // [!code ++]  [!code focus]
    const divEle = document.createElement('div');
    divEle.textContent = 'Hello World';
    divEle.classList.add('content');
    document.body.appendChild(divEle);
    ```
2.  `CLI方式`（**webpack5中不再使用**） 
   ::: list-danger 不在使用的原因
   - :no_entry_sign: 在webpack5的文档中已经没有了`--module-bind` 
   - :no_entry_sign: 实际应用中也比较少使用，因为不方便管理；
   :::

3.   **配置文件方式(最常用)** 后续讲解这个


#### 4.loader配置方式
:::list-default 为什么用配置文件方式?
  - :open_file_folder: 在配置文件中我们可以使用 `module.rules`中允许**我们配置多个loader**  
  - :open_file_folder: 我们也可以继续使用其他的`loader`，**来完成其他文件的加载**
  - :open_file_folder: 配置的方式能更好的展示loader的配置也,方便维护同时,也让你对各个`Loader`有一个全局的概览；
:::
#### 5.rules 配置属性
 ::: item-info module.rules的配置如下：

-   :card_index_dividers:  `rules` 属性对应的值是一个数组：**`[Rule]`** 数组中存放的是一个个的`Rule`
-  :card_index_dividers: `Rule` 是一个对象，对象中可以**设置多个属性**
    - :page_with_curl: **`test` 属性**：用于对`resource`(资源)进行匹配的，通常会设置成正则表达式；
    - :page_with_curl: **`use` 属性**：对应的值时一个数组：`[UseEntry]`
      ::: list-default UseEntry是什么
       - :file_folder: `UseEntry`是一个对象，可以通过对象的属性来设置一些其他属性
         - :page_with_curl:`loader`：必须有一个loader属性，**对应的值是一个字符串；** 
         - :page_with_curl: `options`：可选的属性，**值是一个字符串或者对象**，值会被传入到loader中；
         - :page_with_curl: `query`：**目前已经使用options来替代** 
      :::
    - :page_with_curl: **loader属性**：是`use`:` [ { loader } ] `的简写。
    - :page_with_curl: **include** 指定 **需要处理的目录**
    - :page_with_curl: **exclude** 排除 **不需要处理的目录或文件**
    - :page_with_curl: [更多配置查看webpack官网](https://webpack.js.org/configuration/module/#modulerules)
 :::

1.  在配置文件中，添加`css-loader`进行解析css

   ```js{9-14} [webpack.config.js] 
   module.exports = {
    // ... 省略其他配置
     module: {
       rules: [
         {
           test: /\.css$/,
          // loader: 'css-loader', // 写法一 适合只有一个loader的时候用
          // use:['css-loader'] // 写法二 适合没有 options属性或query属性的配置使用，没有单独配置文件使用的方式
           use: [
             { 
               loader: 'css-loader', 
               options:{} // 传入参数
             },
           ], // 写法三 最全配置的写
         },
       ],
     }
   }
   
   ```
2.   现在我们已经可以通过 `css-loader` **来加载css文件了** 
3.  此时我们运行`npm run build`,虽然没有报错也把类名添加上去了，但是**css效果并没有生效** 

  <img src="https://pica.zhimg.com/80/v2-7456c4ab0c10ee58689568f8f5bdd09d_1420w.png" style="margin-top:20px;" />

####   6.认识style-loader
::: list-warning css没有生效的原因?
   -  :label: 因为 `css-loader` 只是负责 `.css文件进行解析` **并不会将解析之后的css插入到页面中；**
   -  :label:   如果我们希望再完成插入style的操作,那么我们 **还需要另外一个loader** `style-loader`
:::

-  :gear: 安装 `style-loader`

   ```sh [npm]
   npm install  style-loader -D 
   ```

#### 7.配置style-loader
::: list-default 在配置文件中,添加style-loader
   -  :label: 注意事项：`webpack`**在执行loader的时候，是通过从后往前执行的**
   -  :label:  所以我们的`style-loader`是要在`css-loader`前面的，这样就是等`css-loader` 解析完成后`css文件`
    交给`style-loader`去插入到页面中，生成对应的css样式
:::


  ````js [webpack.config.js]
  module.exports = {
   // ... 省略其他配置
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'style-loader', // 再执行 style-loader 添加style在页面中 // [!code focus]
            'css-loader'， // 注意先执行css-loader 解析css文件  // [!code focus]
          ]
        },
      ],
    }
  }
  ````

1. 重新执行编译 `npm run build`，可以发现打包后的**css已经生效了** 
   - :label:  当前目前我们的css是通过页内样式的方式添加进来的； 
   - :label:  后续我们也会讲如何将**css抽取到单独的文件中**，并且进行压缩等操作；

<img src="https://picx.zhimg.com/80/v2-35415a76025e48e7bf5fb24dfdf9dd8a_1420w.png" style="margin-top:20px" />

### 二、Webpack打包预处理器

####  1.介绍预处理器

<!-- - 当我们在项目开发中一般不会直接使用css去开发项目，而是使用css的预处理器进行快速开发 <p></p>
    :round_pushpin:  常用的css预处理器 `less` `scss` `stylus` <p></p>
    :round_pushpin:  在css目录创建 `index.less` `index.scss` `index.stylus` <p></p>
    :round_pushpin:   我们编写如下的 `less` 样式  <p></p> -->
-  :round_pushpin: 当我们在项目开发中一般**不会直接使用css去开发项目**，而是使用 **css的预处理器进行快速开发**
::: list-info 处理器
  -   :label:  常用的css预处理器 `less` `scss` `stylus`
  -  :label:  在css目录创建 `index.less` `index.scss` `index.stylus`

:::
 :round_pushpin: 编写 `less` 样式 
  ```less [index.less]
  @color:#0486ea;
  @fonstSize:80px;
  .title{
      color:@color;
      font-size:@fonstSize;
  }
  ```

   :round_pushpin: 编写 `scss` 样式

   ```less [index.scss]
   $fontSize:80px;
   $redColor:red;
   $greenColor:green;
   .context-title {
     font-size: $fontSize;
     color: $redColor;
     background-color: $greenColor;
   }
   ```

   :round_pushpin:  编写 stylus 样式 扩展名 `.styl`

   ```stylus [index.styl]
   font-size = 14px
   color = orange
   baColor = black
    .content-t
         font-size: font-size 
         color: color
         background-color: baColor
   ```

  :round_pushpin: 每个 `css预处理器` 都有自己单独语法，**浏览器不认识这些语法** <br/>
  :round_pushpin: 通过 `webpack` 打包进行 **转换为浏览器认识的css语法** <br/>
  :round_pushpin: 每个`css预处理器` 都有合适的 `loader` 进行转换为`css`  


#### 2.安装各自对应的loader

  ```sh
  npm i less less-loader -D
  npm i sass sass-loader -D
  npm i stylus styuls-loader -D
  ```


 :round_pushpin:  `Less`、`Scss` `Stylus`工具 <br/>
 :round_pushpin: 直接用工具命令将预处理器语法 **转换为普通css**

```sh
npx lesscs ./src/css/index.less   title.css
npx sass  ./src/css/index.scss   content.css
npx stylus index.styl -o content.css
```

#### 3.配置预处理器

 :round_pushpin:  如果按照上面这种方式去**转换成普通css**,非常麻烦,如何**自动给我转换普通css**呢? <br/>
 :round_pushpin: 这个我们就要在配置文件去添加对应的 `loader` 处理 <p></p>
 :round_pushpin:  在们之前的`components` 文件下 `cps.js`  添加以下代码 
```js [cps.js]
import '../css/index.css';
import '../css/index.less';
import '../css/index.scss';
import '../css/index.styl';
const divEle = document.createElement('div');
divEle.textContent = 'Hello World';
divEle.classList.add('content');
document.body.appendChild(divEle);

const title = document.createElement('h1');
title.textContent = '你好我是标题';
title.classList.add('title');
document.body.appendChild(title);

const contextTitle = document.createElement('h2');
contextTitle.textContent = '你好我是标题2';
contextTitle.classList.add('context-title');
document.body.appendChild(contextTitle);

const StylusTitle = document.createElement('h3');
StylusTitle.textContent = '你好我是Stylus ';
StylusTitle.classList.add('content-t');
document.body.appendChild(StylusTitle);

```
<!-- 
- 以下是配置文件解释
  - 我们先让 各自对应loader`less-loader` `scss-loader` `stylus-loader`将对应代码转换成普通css代码
  - 然后通过`css-loader` 再次解析，交给`style-loader `将样式添加到页面中 -->
  
 :round_pushpin: 使以下是配置文件解释：
::: list-info 解释
- :round_pushpin: 我们先让各自对应loader `less-loader` `scss-loader` `stylus-loader`将对应代码转换成普通css代码
-  :round_pushpin:  然后通过`css-loader` 再次解析，交给 `style-loader `将样式添加到页面中
:::

```js [webpack.config.js]
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'less-loader' },
        ],
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.styl$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'stylus-loader' },
        ],
      },
    ],
  },
```

- 执行`npm run build`  然后运行`index.html`

<img src="https://pica.zhimg.com/80/v2-f8b8aaa6b4a166f376522880a0b65766_720w.png" style="zoom:80%" />



### 三、Webpack后处理器

####   1.认识PostCSS工具

- 什么是PostCSS呢？
::: list-success 解释
- :round_pushpin:  `PostCSS` 是一个通过 `JavaScript` 来 **转换样式的工具**
-  :round_pushpin:  这个工具可以帮助我们进行一些CSS的转换和适配 比如 **自动添加浏览器前缀、css样式的重置**
-
:::
  - 在  `index.css`  添加以下样式

  ```css [index.css]
  .content{
      color: red;
      font-size: 40px;
      user-select:all;  // 选择的选择全部内容
  }
  ```

- 但是实现这些功能，我们需要借助于PostCSS对应的插件
::: list-info 如何使用PostCSS呢？主要就是两个步骤：
- :round_pushpin:  第一步：查找PostCSS在构建工具中的扩展，**比如webpack中的postcss-loader；**
-  :round_pushpin:  第二步：选择可以添加你需要的PostCSS相关的插件
:::


#### 2.安装PostCSS及使用

-  :gear: 安装

   ```sh
   npm install postcss-loader -D
   ```

- :gear: 我们修改加载 `css` 的 `loader`:（配置项已经过多，给出一部分了）

   ```js [webpack.config.js]
       rules: [
         {
           test: /\.css$/,
           use: [
             { loader: 'style-loader' },
             { loader: 'css-loader' },
             {
               loader: 'postcss-loader', // [!code focus]
             },
           ],
       }
     ]
           
   ```

- :gear:  然后执行`npm run build` 发现 PostCSS **并没有给我加上浏览器前缀**


   ![](https://picx.zhimg.com/80/v2-f1ed311527fe9ecd36d31e08d982ea20_1420w.png)

#### 3.PostCSS插件的使用

::: list-danger 问题
-  :label:   我们刚刚发现使用`postcss-loader` 并没有给我们添加 **浏览器前缀** 这是咋回事
-  :label:   因为postcss需要有 **对应的插件才会起效果**，所以我们需要配置它的插件 `plugin`
:::
#####  autoprefiexr


1. 现在我们就要使用一个插件  `autoprefiexr`  这个 `postcss` 插件是专门做这件事
   -  **安装 autoprefiexr**
      ```sh
      npm install  autoprefiexr -D
      ```
2.  如何使用呢？有两种配置方式

    - :gear: 第一种方式：写在`webpack.config.js` 对应 `loader` 里面 `options` 中

       ```js [webpack.config.js] {9-13}
           rules: [
             {
               test: /\.css$/,
               use: [
                 { loader: 'style-loader' },
                 { loader: 'css-loader' },
                 {
                   loader: 'postcss-loader',
                   options: {
                     postcssOptions: { 
                       plugins: ['autoprefixer'],    //添加插件配置
                     },
                   },
                 },
               ],
           }
         ]
       ```

     - :gear: 第二种方式： 我们单独创建一个js文件,然后进行单独的`postcss`文件配置
         ::: list-success 单独创建一个文件
         - :round_pushpin: 创建一个`postcss.config.js`将`options`里面的配置全部放到这个文件里面
         - :round_pushpin: 这样能减少 `webpack` 配置文件里面东西，找配置项也比较好找
         -  :round_pushpin:  在 `postcss.config.js`中, 可以减少`postcssOptions`这一层**对象嵌套**
         :::
         
     - :gear: 在 `postcss.config.js` 文件中
         ```js [postcss.config.js]
         module.exports = {
             plugins: ['autoprefixer']
         };
         ```

      - :gear: 我们执行 `npm run build` 最终发现浏览器前缀已经给我们加上了

<img src="https://picx.zhimg.com/80/v2-1897c9aed7740c25685a12b77d61b2f0_1420w.png" style="margin-bottom:20px;" />

##### postcss-preset-env
::: item-info postcss预设是什么？
- :card_index_dividers:  它是一个postcss**功能强大的插件工具**，能够将现代 CSS 语法转换 **为兼容性更强的代码**，并自动处理**浏览器适配问题**。它的功能有哪些呢？
   - :page_facing_up: **自动添加浏览器前缀** 它内部已经帮我集成了`autoprefiexr`  所以我们就不用单独下载配置
   - :page_facing_up: **支持未来 CSS 语法转换**
   - :page_facing_up: **将尚未被广泛支持的 CSS 新特性**（如**嵌套、变量、颜色函数**等）转换为兼容性代码

     ```css [举例.css]
     /* 输入 */
     body { color: oklch(61% 0.2 29); }
     /* 输出 */
     body { color: rgb(225, 65, 52); }  
     ```
- :page_facing_up:  **自定义属性和变量**
   -  给自定义属性 **(CSS 变量)生成兼容性回退值** 确保在 **不支持变量的浏览器**中仍能**显示有效样式**
   ```css
    /* 输入 */
    :root { --main-color: #06c; }
    body { color: var(--main-color); }
    /* 输出 */
    body { 
      color: #06c;  /* 回退值 */
      color: var(--main-color); 
    }  
    ```
  - :page_facing_up:  **嵌套语法转换**

    - 将 CSS 嵌套语法（类似 Sass/Less）转换为标准 CSS。

    ```css
    /* 输入 */
    .parent {
      &:hover { color: red; }
      .child { font-size: 14px; }
    }
    /* 输出 */
    .parent:hover { color: red; }
    .parent .child { font-size: 14px; }  
    ```

  -  :page_facing_up:  **颜色函数兼容处理**

    - 转换现代颜色函数（如 `hwb()`、`lch()` `8位HEX 16进制`）为 RGB格式。

    ```css
    /* 输入 */
    div { color: hwb(120 20% 30%); }
    /* 输出 */
    div { color: rgb(51, 204, 51); }  
    
    /* 输入 */
    div {background-color: #66666666;}
    /* 输出 */
    div {background-color: rgba(102,102,102,0.4); }  
    ```

  - :page_facing_up:  **数学计算支持**

    - 转换 `calc`、`min()`、`max()` 等现代函数：

    ```css
    /* 输入 */
    .container {
      width: min(100% - 2rem, 960px);
    }
    /* 输出 - 低版本浏览器兼容 */
    .container {
      width: 960px;
      width: min(100% - 2rem, 960px);
    }
    ```
 - :round_pushpin:  总结：**postcss-preset-env 本质上是通过整合多个 PostCSS 插件，让开发者能够使用最新的 CSS 特性，而不必担心浏览器兼容性问题。** 更多配置和插件集成可参考[官方文档](https://github.com/csstools/postcss-preset-env)。

 - :gear: 安装及使用：

```sh
npm install postcss-preset-env -D
```

- :gear: 在 `postcss.config.js` 文件进行修改

```js [postcss.config.js]
module.exports = {
  // plugins: ['autoprefixer'],
  plugins: ['postcss-preset-env'],
};

```

- :card_index_dividers: 这样我们`npm run build`  查看效果图 这两个功能它都实现了
  - :spiral_notepad: **浏览器前缀**
  -  :spiral_notepad: **颜色函数兼容处理**
  - 
![](https://pic1.zhimg.com/80/v2-0832be0cf731bf01120b4993dcb9e3d4_1420w.png)
:::