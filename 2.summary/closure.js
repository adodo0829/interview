/**
 * 闭包使用场景
 * 闭包: 引用了上一级上下文变量对象的函数
 * 利用闭包特性去做一些事情
 * 1.函数作用域内的变量无法被外部访问, 即函数作用域内的变量是私有的
 * 2.函数体内的变量数据存放在堆内存中,在作用域链(上下文)中被引用时,
 * 不会被销毁,有记忆功能, 可以保存状态
 */

// 利用上述特性我们具体可以做什么呢?
// 1.减少全局变量导致的污染, 实现成员私有
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