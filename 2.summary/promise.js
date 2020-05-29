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

// Promise.all([1, 2, Promise.reject('err')]).then((values) => {
//   console.log(values);
// });
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
// gen 自执行 + Promise.reslove(value)传值: yield 传值
/**
 * promise 包装 Generator自动执行器
 * @param { Generator } genFn 
 */
function asyncToGen(genFn) {
  return function () {
    const gen = genFn() // 迭代器对象

    // 用 promise 包装, 同过 resolve 把值传出去
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

// 生成器函数执行 `await` 后面的任务
function* generator() {
  let res1 = yield getData()
  console.log('res1:', res1);
  let res2 = yield getData()
  console.log('res2', res2)
  return 'end'
}

function getData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('i am api data')
    }, 1000);
  })
}

let asyncPromise = asyncToGen(generator) // async 返回一个 promise
asyncPromise().then(res => console.log(res))

