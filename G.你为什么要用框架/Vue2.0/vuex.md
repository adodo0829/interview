## vuex应用背景
开发复杂的应用时,经常会遇到多个组件共享同一个状态,亦或是多个组件会去更新同一个状态,在应用代码量较少的时候,我们可以组件间通信去维护修改数据,或者是通过事件总线来进行数据的传递以及修改。但是当应用逐渐庞大以后,代码就会变得难以维护,从父组件开始通过prop传递多层嵌套的数据由于层级过深而显得异常脆弱,而事件总线也会因为组件的增多、代码量的增大而显得交互错综复杂,难以捋清其中的传递关系

将数据层与组件层,把数据层放到全局形成一个单一的Store,组件层变得更薄,专门用来进行数据的展示及操作。所有数据的变更都需要经过全局的Store来进行,形成一个单向数据流

vuex将共享的数据抽离到全局,以一个单例存放,同时利用响应式机制来进行高效的状态管理与更新

Vuex实现了一个单向数据流,在全局拥有一个State存放数据,所有修改State的操作必须通过Mutation进行,Mutation的同时提供了订阅者模式供外部插件调用获取State数据的更新。所有异步接口需要走Action,常见于调用后端接口异步获取更新数据,而Action也是无法直接修改State的,还是需要通过Mutation来修改State的数据。最后,根据State的变化,渲染到视图上

## 使用
store 实例: new Vuex.Store({ modulesObj })
Vue.use()后: 调用 install 方法, 注入到 Vue 根实例对象 new Vue({ store })
在beforeCreate钩子初始化, this.$store = options.parent.$store 或者 options.store
所有组件都公用全局的同一份store

## 核心resetStoreVM(this, state)
创建了 一个 vue 实例
```js
function resetStoreVM (store, state, hot) {
  // 省略...
  Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state // state 要提前声明,添加响应式依赖
    },
    computed         // 修改vuex data的时候,依赖其数据的组件会得到更新
  })
}
// store._vm.$data.$$state === store.state
```
## commit（mutation）
通过commit（mutation）修改state数据的时候, committing标志位

## dispatch（action)
异步操作...
在进行dispatch的第一个参数中获取state、commit等方法。之后,执行结果res会被进行判断是否是Promise,不是则会进行一层封装,将其转化成Promise对象