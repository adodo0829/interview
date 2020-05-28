## 1.对MVVM模式的理解
M: model(模型, data)  
V: View(视图, DOM)  
VM: ViewModel(视图模型, 衔接视图和模型, 相当于一个中介者)  
VM将模型中的数据提前暴露出来, 与视图进行双向绑定, 不需要完全依赖于模型中的数据,加速了前后端分离开发模式的进程...

## 2.new Vue() 的过程
构造函数实例化, 内部调用了init方法进行一系列初始化操作, 然后挂载
- init
```
合并options -> lifecycle -> event -> render节点 -> 
callHook(beforeCreate) -> inject -> State(data,methods,computed,watch...)
-> provide -> callHook(created)
```
- $mount
```
挂载的过程中,Vue只认render函数,那么就会先将组件的template转换为render函数,生成 vnode

$mount -> (template经过compile,optimize..,render)
-> vnode -> patch(diff,createElm) -> DOM


这里涉及到: 
$mount -> mountComponent(Render Watcher) -> updateComponent(vm._update(vm._render())

vm._render: 执行 createElement 方法并返回的是 vnode
vm._update: 把VNode渲染成真实的DOM(首次渲染 和 数据更新调用)
            patch -> 
            createElm -> (遍历所有子VNode递归调用createElm创建真实的 DOM 并插入到它的父节点中) 
```
- 小结
```
vue整个初始化是一个深度递归遍历的过程, 递归的实例化根,子组件生成完整的 VNode 树, 
遍历 VNode通过createElm生成真实 DOM 插入到父节点
```
## 3.vue的响应式原理
observe() ->: 监测数据的变化
Observer类 ->: 给对象的属性添加__ob__属性, 依赖收集和派发更新
defineReactive() ->: 定义一个响应式对象,给对象动态添加 getter 和 setter
Object.defineProperty: 重写 get 和 set, 在访问数据以及写数据的时候能自动执行一些逻辑

Dep 和 Watcher 类实现数据和视图的双向绑定
- 依赖收集
```
defineReactive()引入了一个dep实例; Dep.target 全局唯一watcher
在根节点root下我们会最终调用render函数, 属性在被访问时调用dep.depend() -> water.addDep();
所有被视图所依赖的data中的属性就会被getter收集到dep的subs(watcher队列)中去进行管理,
相当于每个对象值的 getter 都持有一个 dep
```
- 派发更新
```
watcher被添加到Dep的subs中
修改模板中的 data 属性时, 我们便会触发notify方法, 即dep的subs中的更新(update)函数
```
## 4.vue DOM是怎么批量异步更新的
```
data.xo = 'xxoo' =>
=> setter
=> dep.notify() 
=> watcher.update() 
=> queueWatcher(this)   // watcher把自身传进了queueWatcher()

在queueWatcher方法中
=> queue.push(watcher)  // watcher去重
=> !waiting && waiting = true && nextTick(() => {
		// ... 执行queue中所有watcher的run
    waiting = false
	})

当触发某个数据的 setter 方法后,对应的 Watcher 对象其实会被 push 进一个队列 queue 中,
会在本轮数据更新后，再去异步更新视图(在下一个 tick 的时候将这个队列 queue 全部拿出来run(): Watcher对象的一个方法,用来触发 patch 操作)

DOM 的更新是一个异步过程, 被放到了微任务队列里;
this.xo = res.data -> 视图更新
this.$nextTick(() => {
  // 这里我们可以获取变化后的 DOM
})
```
## 5.nextTick(cb)原理: 创建微任务
js 执行流程:
主线程的执行过程是一个tick, macro task处理后回调放在任务队列;
每轮macro task结束后,清空当前所有的micro task; 开始下一轮macro task...

nextTick,接受一个cb,这个cb会被存储到一个队列中, 在下一个tick时触发队列中的所有cb事件,
调用timerFunc:(各平台兼容性写法), 创建微任务放到微任务队列, 在本轮事件循环末执行

## 6.vue array 响应式
对 data 中的依赖的数组的方法
'push','pop','shift','unshift','splice','sort','reverse'方法进行重写,
observeArray => 数组项添加响应式依赖

## 7.vue computed属性对象
计算属性缓存: 只有依赖的属性发生变化才会更新
```js
// 属性对应的 watcher
watcher = {
  dirty: false // 用户在取值时,不会重新求值, 直接返回
}

// 减少 getter 的触发, 减少 methods 逻辑; 当value在多个地方使用时有用
computed: {
  value: function () {
    // this.value 做一些复杂处理
    return resolveValue
  }
}
```
## 8.侦听器Watch中的deep:true
用户手动添加的 watch
```js
watch: {
  // 如果 `arr` 发生改变，这个函数就会运行
  arr: {
    handler: function (newV, oldV) {
      // do something
    },
    deep: true
  }
},
// 源码部分
if (this.deep) {  // 如果需要深度监控
  traverse(value) // 会对对象中的每一项取值,取值时会执行对应的get方法,添加 watcher
}
```
## 9. vue生命周期
在Vue实例化过程中所触发执行的钩子函数: 可以添加自定义操作

beforeCreate: 在实例初始化之后, initState之前被调用 
created: initState之后, mount之前, 这里没有$el
beforeMount: 在挂载开始之前被调用,相关的 render 函数首次被调用
mounted: el被新创建的 vm.$el 替换,并挂载到实例上去之后调用该钩子
beforeUpdate: 数据更新时调用,发生在虚拟 DOM 重新渲染和patch之前
updated: 由于数据更改导致的虚拟 DOM 重新渲染和patch, 在这之后会调用该钩子。
beforeDestroy: 实例销毁之前调用。在这一步，实例仍然完全可用。
destroyed: Vue实例销毁后调用。调用后,Vue 实例指示的所有东西都会解绑定,
所有的事件监听器会被移除，所有的子实例也会被销毁

## 10.Vue中模板编译原理
模板到真实DOM渲染的过程中间有一个环节是把`模板`编译成`render函数`
[附上链接](https://ustbhuangyi.github.io/vue-analysis/v2/compile/parse.html#%E6%95%B4%E4%BD%93%E6%B5%81%E7%A8%8B)
```js
function baseCompile (template: string,options: CompilerOptions) {
  const ast = parse(template.trim(), options) // 1.将模板转化成ast语法树
  if (options.optimize !== false) {  // 2.优化树: 标记静态节点,静态根, 不用参与patch
    optimize(ast, options)
  }
  const code = generate(ast, options)         // 3.生成树
  return {
    ast,
    render: code.render, // new Function(`with(this){return ${code}`)
    staticRenderFns: code.staticRenderFns
  }
}
```
整个 parse 的过程是利用正则表达式顺序解析模板，当解析到开始标签、闭合标签、文本的时候都会分别执行对应的回调函数，来达到构造 AST 树的目的

## 11.patch过程的diff规则
发生在 `新旧vnode` 对比的时机

```
1.前置条件: 新旧 vnode 相同?
  相同则patch, 不同则销毁旧创建新

2.进入 patch 过程(4种情况)
  - 1.老有儿子,新的没儿子:
    移除该DOM节点的所有子节点

  - 2.老没儿子,新的有儿子:
    先清空老节点DOM的文本内容,然后为该DOM节点加入子节点

  - 3.老,新都没儿子:
    只是文本的替换

  - 4.新老节点均有儿子: 遍历老新节点对象并比较同层的树节点, 相同然后递归比较子节点对象
    
    new: 两个头尾指针节点  old: 两个头尾指针节点 互相进行匹配比较, 往中间夹走
    同时还要两组记录节点的索引, 交互位置时使用

    - 1.如果只是节点移动,节点更新(节点能匹配上)
      只是位移节点, 同时位移 DOM 元素

    - 2.如果有增删(节点匹配不: 有一个先被遍历完)
      会生成一个key与旧VNode的key对应的哈希表, 
      判断新VNode 中是否有 key与旧的比对, 进而进行创建或者移除操作
```

## 12. v-for中的 key 和 一个根节点
key的作用主要是为了高效的更新虚拟DOM, 在 diff 过程中会通过 key 去判断是否就地复用

## 13.子组件是如何渲染和更新
实例化的时候通过 Vue.extend 进行子组件实例化(tag 判断), 返回 vnode
渲染: child.$mount()挂载
更新: vm._update()

## 14.组件的 data 函数
当一个基础组件被复用时,会通过同一个构造函数创建多个实例,如果 data 是一个对象的话,那么所有组件都会共享了同一个对象;为了保证每个组件的数据独立性要求每个组件必须通过 data 函数`创建一个对象管理组件的数据状态`

## 15.vue 的事件绑定
1.原生dom事件 native: dom.addEventListener(),直接在真实 DOM 上绑定
2.组件事件: $on(event, fn)
'<my-component @click.native="fn" @click="fn1"></mycomponent>'

## 16.v-model: 自定义指令
v-model 可以看成是 value + input方法 的语法糖;原生的 v-model会根据标签的不同生成不同的事件和属性
```html
<input type="checkbox" :checked="check" @change="$emit('change',$event.target.checked)">
<!-- 通过$emit 和 自定义事件也可以实现 -->
```
## 17.vue父子组件生命周期钩子函数调用顺序
- 渲染过程 (patch过程先调用子组件的 mounted)
```
父beforeCreate -> 父created -> 父beforeMount -> 子beforeCreate
-> 子created -> 子beforeMount -> 子mounted -> 父mounted(手动挂载到#app)
```
- 子组件更新
```
父beforeUpdate -> 子beforeUpdate -> 子updated -> 父updated
```
- 父组件更新
```
父beforeUpdate -> 父updated
```
- 销毁 $destroy 方法中的 hook 销毁
```
父beforeDestroy -> 子beforeDestroy -> 子destroyed -> 父destroyed
```
## 18.Vue组件如何通信传值? 单向数据流
1.父子组件通信: 
  父->子通过 props 、子-> 父 $on、$emit (发布订阅)
2.父子组件实例的方式 $parent、$children
  访问父子组件实例数据
3.定义Provide、inject
  父 provide, 子 inject
4.ref获取实例的方式调用组件的属性或者方法
  父: this.$ref.childRef
5.Event Bus 实现跨组件通信 Vue.prototype.$bus = new Vue
  不推荐
6.Vuex 状态管理实现通信
  全局的 store = new Vuex.Store({})

## 19. vue 的 mixin 主要做什么?
抽离重复的组件逻辑
给组件每个生命周期,函数,data等都混入一些公共逻辑;
在组件初始化过程会被merge合并

## 20.vue 中的异步组件
当组件功能多打包出的结果会变大或者初始态没必要加载的组件(如弹框提示),可以采用异步的方式来加载组件;
主要依赖webpack 的 import()语法,可以实现文件的分割加载codeSplit
```js
components:{
  // require([])
  asyncComponent: ()=>import("../components/AddCustomer")
}
// 源码中:
// 当找不到 cid 时,即为异步组件, 调用resolveAsyncComponent
// 过程: 从服务端拿到异步组件的代码,将其变成一个组件构造器,并更新视图
// 异步组件加载时,当resolveAsyncComponent返回值为 undefined 时, 渲染占位符
// 加载成功后,通过 $forceUpdate 这个 api 来刷新视图
```
## 21. vue的插槽,作用域插槽
做到vnode结构复用,
- 插槽: 可以理解为父组件在子组件中的结构占位符
```html
<!-- 子基础组件 base -->
<div>
  <slot name="header" />
  <slot name="footer" />
</div>

<!-- 父业务组件引入 子基础组件: 插槽的作用域为父组件 -->
<template>
  <div slot="header">我是插到 a 的内容</div>
  <div slot="footer">我是插到 b 的内容</div>
</template>

<!-- 
  原理: 创建组件虚拟节点时,会将组件的children的虚拟节点保存起来,
  当初始化组件时, 通过插槽属性将children进行分类 {a:[vnode],b[vnode]},
  子组件_render 时: 直接获取vnode
  nodes = this.$slots[name]
  this.$createElement('template', { slot: target }, nodes)
-->
```
- 作用域插槽
```html
<!-- 子组件: 插槽的作用域为子组件 -->
<div>
  <slot name="footer" a="1" b="2"></slot>
</div>
<!-- 父组件 -->
<div slot-scope="msg" slot="footer">{{msg.a}}</div>

```
```js
with(this) {
  return _c('app', {
    scopedSlots: _u([{ // 作用域插槽的内容会被渲染成一个函数
    key: "footer",
    fn: function (msg) {
      return _c('div', {}, [_v(_s(msg.a))])
      }
    }])
  })
}
```
- 区别
```js
// 父组件下的普通插槽
slots: {
  xxoo: h('div')
}
// 父组件下的作用域插槽是个函数
scopedSlots: {
  xxoo: (scopedData) => h('div', scopedData.a)
}
// 子组件需要在父组件访问子组件的数据,
// 所以父组件下生成的是一个未执行的函数(slotScope) => return h('div',slotScope.msg)
// 接受子组件的slotProps参数, 在子组件渲染实例时会调用该函数传入数据
```
## 22. keep-alive 的理解
内置组件, 可以实现组件的缓存,当组件切换时不会对当前组件进行卸载,
常用的2个属性include和exclude,
2个生命周期 activated , deactivated; 
以及使用LRU算法
```
内部维护一个缓存列表
```
## 23.Vue中常见性能优化
- 1.编码优化
```
不要将所有的数据都放在data中,data中的数据都会添加依赖
vue 在 v-for 时给每项元素绑定事件需要用事件代理
SPA 页面采用keep-alive缓存组件
控制组件拆分的粒度( 提高复用性、增加代码的可维护性,减少不必要的渲染 )
v-if 当值为false时内部指令不会执行,具有阻断功能，很多情况下使用v-if替代v-show
vfor 时key 保证唯一性 ( diff 时 vue 会采用就地复用策略 )
Object.freeze 冻结数据, 只能冻结外层
合理使用路由懒加载、异步组件
数据持久化的问题 （防抖、节流）
```
- 2.加载优化
```
按需加载,导入模块组件
滚动到可视区域动态加载
图片懒加载
骨架屏
```
- 3.打包构建
```
使用 cdn 的方式加载第三方模块
多线程打包 happypack
splitChunks 抽离公共文件
```
- 4.访问优化
```
客户端缓存、服务端缓存
服务端 gzip 压缩
```
