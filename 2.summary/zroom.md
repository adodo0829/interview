# xx如总结(架构方向)
- 流程
```
1.常规的自我介绍
2.离职原因
3.未来的发展方向
  对求职岗位的了解, 发展方向说大了就会陷入是否有其他技术底蕴并有落地成果
4.项目概述(比较重要, 说了一大堆, 感觉没对她的胃口)
  更多的在意你在这个项目(团队 or 单人)中的角色(主程?参与?其他)
  因为是招架构方向, 会问是如何设计这个项目的架构
  包括选型(基于第三方还是自研), 是否有团队脚手架, 组件库等一些偏基础建设的内容
5.面试题
  ...
```
## 面试题
- 1.[数据类型]如何将值类型的变量以引用的方式传递?指针和引用的差别？(小弟我没看明白)
```
变量: 标识符的一种,相当于一个占位符,声明时会保存对数据值的引用

# 1.数据值存在哪? 
基础数据类型变量: 内存栈空间 Number String Null Undefined Boolean Symbol BigInit
引用数据类型变量: 内存堆空间 Object

stack栈空间: 变量标识符 -> 对应值
          基础值变量 -> 值
          引用值变量 -> 0x1201ff地址
heap堆空间:
      引用值 1: { name: 'huhua' }
      引用值 2: [1, 2, 3]
      引用值 3: function() { ... }
      ...

# 2.数据值访问
基础值我们可以直接操作, 比如 1+1, 引用值我们只能通过变量去操作...
上面说如何将值类型的变量以引用的方式传递? 就是把基础值变成对象成员?
var a = 1
var obj = {
  a: a
}

指针和引用的区别?(其实都是变量 -> 地址)
引用只能在定义时被初始化一次,之后不可变
就像 const a = { a: 1 }

同样指针也是指向一块内存地址, 但是它可以再次指向别的地址
let b = { b: 2 }
b = { c: 3 }
```
- 2.[ES6/ES7]闭包应用的场景?class、symbol是否可以实现私有？闭包中的数据/私有化的数据的内存什么时候释放？
```js
/**
 * 闭包使用场景
 * 闭包: 引用了上一级上下文(作用域链中的)变量对象的函数
 * 利用闭包特性去做一些事情
 * 1.函数作用域内的变量无法被外部访问, 即函数作用域内的变量是私有的
 * 2.函数体内的变量数据存放在堆内存中,在作用域链(上下文)中被引用时,
 * 不会被销毁,有记忆功能, 可以保存状态
 */

// 利用上述特性我们具体可以做什么呢?
// 1.减少全局变量导致的污染, 实现成员私有, 模块化
var module = (function() {
  var id = 0; // 私有变量
  var count = function () { console.log(id++); }
  return {
    count
  }
})()
// 内部计数, 我们不用再全局维护一个 id 去累计
console.log(module.count()) // 0
console.log(module.count()) // 1

// 2.模拟一个单例: 只会实例化一次
class FactoryFood {
  constructor(name) {
    this.name = name
  }
  getName() {
    console.log(this.name)
    return this.name
  }
}

// 创建多个实例
function creatFood(name) {
  return new FactoryFood(name)
}

let apple = creatFood('apple')
let pie = creatFood('pie')
apple.getName()
pie.getName()

// 如何保证只创建一个实例, 就需要闭包维护一个标志符
let creatOneFood = (function() {
  let isInstance = null // 记录状态
  return function (name) {
    if (!isInstance) isInstance = new FactoryFood(name)
    return isInstance
  }
})()

let xxx = creatOneFood('xxx')
let ooo = creatOneFood('ooo')
xxx.getName() // xxx
ooo.getName() // xxx

// 3.函数防抖节流(简单版演示)
function debounce(fn, delay = 1000) {
  let timeId // 保留计时器状态
  return function () {
    if (timeId) {
      clearTimeout(timeId)
      timeId = null
    }
    setTimeout(() => {
      fn()
    }, delay)
  }
}

// 4.函数式编程应用, 不说了, 懂就行...

/**
 * class、symbol是否可以实现私有? 所谓私有就是不能被外部访问
 * class + symbol
 */
const _name = Symbol('name') // 定义一个全局唯一不重复的值

class Person {
  constructor(name) {
    this[_name] = name
  }
  getName() {
    console.log(this[_name])
  }
}
let p1 = new Person('huhua')
p1.getName()
console.log(p1[_name]) // huhua
// 因为还能直接访问,并不能算的上私有;
// 原因是Object.getOwnPropertySymbols()仍然会遍历
// 所以还是的结合闭包来实现

const PersonPrivate = (function () {
  let _name = Symbol('name') // 函数内部唯一的symbol
  class Person {
    constructor(name) {
      this[_name] = name
    }
    getName() {
      console.log(this[_name])
    }
  }
  return Person
})()

let p2 = new PersonPrivate('xxoo')
p2.getName()
console.log(p2)
console.log(p2[Symbol('name')]) // undefined, 不能访问

/*
 * 闭包函数执行后主动释放对变量的引用
*/
```
- 3.[Promise]promise 有几种状态, 如何实现then处理? 如何实现 Promise.all ? async/await,await做了什么?
```js
/**
 * Promise: 一个对象, 用来表示一个异步操作的最终完成 (或失败),及其结果值 
 *          可以理解创建了一个占位符来表示未来的结果
 * 属性: [[promiseStatus]]: pending, fulfilled(成功), reject(失败)
 *      [[promiseValue]]: 成功和失败传递出来的值
 */

// 想一想你为何要使用promise? 
// 1.包装异步操作, 返回promise实例, 解决回调嵌套的写法? 貌似是这样
let promise = new Promise((res, rej) => {
  let num = Math.random()
  console.log('未进入异步操作', num);
  // 异步操作, 将异步操作的结果值 通过 res,rej 传递出去
  // 把这个看成一个耗时操作
  setTimeout(() => {
    num > 0.5 ? res(num) : rej('value lower than 0.5')
  }, 0)
})

// 在某个时机将异步状态取出来
promise.then(
  (resValue) => {
    console.log('success:', resValue)
  },
  (rejValue) => {
    console.log('failed:',rejValue);
  }
)
console.log(000);
setTimeout(() => {
  console.log(11);
}, 0);

// 浏览器: 先 then 再 11
// node:  先 11 再 then
// js事件循环(事件队列) -> 宏任务和微任务
// Promise.resolve() 和 Promise.reject() 会手动创建一个已经 resolve 或者 reject 的 Promise, 可以直接 then, 
// 传递到 then() 中的回调函数被置入了一个微任务队列
// 只有 resolve 和 reject 被调用then 中的回调才会被添加到微任务队列

// Promise.all([...])会返回有个顺序结果数组, 任一reject直接中断并返回错误
Promise.all([1, 2, Promise.reject('err')]).then((values) => {
  console.log(values);
});
// node 下reject要 catch

/**
 * async
 * await
 */

// 先看 async
async function testAsync() {
  return "hello async"
}
// 等价于==>
function testAsync1() {
  return Promise.resolve("hello async")
}
console.log(testAsync(), testAsync1())
/**
 * 返回值被包装成了: 一个成功的(fulfilled状态)的 promise 对象
 * [[PromiseStatus]]: "resolved"
 * [[PromiseValue]]: "hello async" 
 */

// 通过 then 取值, hello async
console.log(testAsync().then(res => console.log(res)))
// 所以 async 标记的函数执行后就是返回了一个 <resolved 状态>的promise 对象
// 等待 then 的调用去取出返回值

// 再看看 await, 一般是 await something
// let we see
function fn() {
  return 'normal func'
}
async function asyncFunc() {
  return 'asyncFunc'
}

async function start() {
  let value2 = await asyncFunc()
  console.log('await2:', value2);
  let value1 = await fn()
  console.log('await1', value1);
  // await 后面明明是个 promise, then 都没调用, 怎么取值的
  // 那是因为做了特殊处理
  // await 会被包装成一个(Generator函数和自动执行器)的函数
}
start()

// 下面手动实现一下 aysnc + await 语法
/**
 * promise 包装 Generator自动执行器
 * @param { Generator } genFn 
 */
function asyncToGen(genFn) {
  return function () {
    const gen = genFn() // 迭代器对象

    return new Promise((resolve, reject) => {

      function step(nextFunc) {
        let genResult
        try {
          genResult = nextFunc()
        } catch (err) {
          return reject(err);
        }
        const { value, done } = genResult // { value: xxx, done: false }
        // 最后一步
        if (done) {
          return resolve(value)
        }

        // 核心: 通过 promise.resolve 将值传递出去
        return Promise.resolve(value).then(
          (v) => {
            step(() => gen.next(v)) // 给 yield 传值
          },
          (err) => {
            step(() => gen.throw(err));
          },
        );
      }
      step(() => gen.next('fisrt')) // 首次传值不会被接受
    });
  };
}

// 生成器函数执行 await 的任务
function* generator() {
  let res1 = yield getData()
  console.log('res1:', res1);
  let res2 = yield getData()
  console.log('res2:', res2)
  return 'end'
}

function getData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('i am api data')
    }, 1000);
  })
}

let asyncPromise = asyncToGen(generator)
asyncPromise().then(res => console.log(res))
```

- 4.[Error]标准的 JavaScript 错误常见有哪些？Node.js 中错误处理几种方法？怎么处理未预料的出错? 用 try/catch , 还是其它什么?
```js
// js常见错误
// 语言自身抛出的异常 new Error() RangeError ReferenceError TypeError...
// 调用Web Api时发生异常: DOMException
// Promise中的拒绝 Promise.reject Promise.catch
// 网页加载资源失败

// node 下处理错误一般是事件监听
// 系统错误 + 手动触发的错误
// 代码层的错误 try catch
process.on('uncaugthExcetion', err => {})
domain.on('error', err => {})
new Events.EventEmitter().on('error', err => {}) // 手动触发
promise.catch()
// 浏览器下监听error 事件和 try catch

// 错误上报通过 new Image()
// img.src = `${上报地址}?${processErrorParam(error)}`
```

- 5.[React/Vue]现在要你完成一个Dialog组件，说说你设计的思路？它应该有什么功能？JSX/TSX？
```
组件: UI组件(展示为主) or 功能组件(逻辑为主)
一般设置通过 props 设置默认配置 和 接受扩展配置
结合插槽来实现自定义展示

通用也可以通过函数组件实现, 样式通过设置类名, 给类名写好样式
```

- 6.[React/Vue]Vue3.0/React Hooks 了解么简单说下？  
https://github.com/vuejs/rfcs/tree/master/active-rfcs
```
1.TypeScript 重写, 更好的 ts 支持
2.性能更好
  模板编译函数compare, 添加PatchFlag标记,枚举定义
  事件监听缓存cacheHandlers
  按需引入优化, 支持 tree shaking
3.Composition API 组合式 API 写法, 减少副作用
  setup() {
    reactive({})
    ...
  }
```
- 7.[Node.js]Require 原理？  
node 中模块文件的require,exports和module这3个变量并没有在模块中显式定义, 那么是如何实现能导入文件并执行的呢?
```js
// node 源码: https://github.com/nodejs/node/blob/v5.x/lib/module.js
// Module原型上的一个方法, module实例继承
Module.prototype.require = function(path) {
  return Module._load(path, this, /* isMain */ false);
};
// 源码调用顺序:
// Module._load -> Module._resolveFilename -> Module._findPath
// 先从缓存中读取 -> 没有则做文件校验 -> 解析成功则cache

// 在编译的时候Node对js文件内容进行了头尾的包装
// 模块文件会被包裹成这样, 然后入口是runInThisContext
NativeModule.wrap = function(script) {
    return NativeModule.wrapper[0] + script + NativeModule.wrapper[1];
  };

NativeModule.wrapper = [
    '(function (exports, require, module, __filename, __dirname) { ', '\n});'
  ];
```

- 8.[Webpack]Es6如何转Es5?
```shell
# es6 -> babel(AST) -> es5
# babel 配置 .babelrc
{
  "presets": ["es2015"],
  "plugins": []
}
```

-9. [架构设计]说下渐进式框架的理解？以及曾开发过的组件库/工具库/脚手架的架构设计方案？
```
渐进式: step by step
```

- 10.[Performance]性能调优？webpack对项目进行优化？
```
1.页面所需资源加载性能
  - 如何保证资源稳定快速传输
    - 请求体积缩小 (how to)
    - 请求数量减少 (how to)

2.页面渲染交互性能
  - 如何保证页面流畅呈现,交互不卡顿
```
```
webpack主要是打包资源文件
  - 压缩文件体积
  - 拆分代码 chunkSpliting
  - 异步加载代码文件(动态资源)
```
