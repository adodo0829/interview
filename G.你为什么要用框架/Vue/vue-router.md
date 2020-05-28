## vue-router
path -> component: 路径与组件的映射关系
router实例对象: new VueRouter({ routesArr })
Vue.use()后: 调用 install 方法, 注入到 Vue 根实例对象 new Vue({ router })
**前端路由: 改变url, 不触发页面重新请求, 更新视图**
#### hash 实现
```js
// hashchange事件监听hash 值变化
window.addEventListener("hashchange", funcRef, false)

// 路由历史记录储存
function pushHash (path) {
    window.location.hash = path
}
// 对应的视图更新
// 通过 Vue.mixin()方法, 全局注册一个混合，影响注册之后所有创建的每个Vue实例,
// 该混合在beforeCreate钩子中通过Vue.util.defineReactive()定义了响应式的_route属性。
// 所谓响应式属性，即当_route值改变时,会自动调用Vue实例的render()方法,更新视图
$router.push() -> HashHistory.push() -> History.transitionTo() ->
History.updateRoute() -> {app._route=route} -> vm.render()
// 大概就是这么一个过程

// hash只有在设置的新值必须与原来不一样才会触发记录添加到栈中
```
#### history 实现
HTML5引入了history.pushState()和history.replaceState()方法,分别可以添加和修改历史记录条目; 监听使用popstate事件
```js
// 调用这两个方法修改浏览器历史栈,虽然当前url改变了,但浏览器不会立即发送请求该url
window.history.pushState(stateObject, title, url)
window.history.replaceState(stateObject, title, url)

// popstate事件监听stateObject变化
window.addEventListener('popstate', e => { transitionTo() })

// history模式则将url修改的就和正常请求后端的url,后端没有配置对应路由处理逻辑就会报错404
// 所以,需要在服务端增加一个覆盖所有情况的候选资源, 定位不到就返回同一个index.html
```

## vue-router常用知识点
- 配置
```
嵌套路由页面
路由传参
重定向
路由导航守卫
  全局守卫
  组件守卫
  导航解析流程: 触发 -> 离开 -> 路由配置表中的钩子 -> 全局 -> 组件
元信息 meta 对象
过渡效果 transition 包裹
懒加载 import()函数实现 codeSpliting
```
- 实例属性和方法
```
router实例(增删改查路由对象)
  this.$router & router
路由对象$route
  this.$route
```


