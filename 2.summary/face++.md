# xx视

## 流程
```
自我介绍
  - 个人信息
  - 工作经历
  - 项目经历(承担的角色)
离职原因
  - 个人发展
一面
  - 基础面(偏基础: 知识的深度和广度)
  可适当展开性说自己的见解
二面
  - 项目面
  将项目中的某些点拎出来问
  一些需求实现的方法和想法
```
## 一面问题
有些记不起来,问的比较多,也比较广,也有很多追问环节, 面试更像一种交流, 总体感觉不错吧
- css
```
1.css的盒模型?
2.垂直居中实现的方式, flex方式实现时一定会居中吗? 文字居中? lineheight?(一些列追问)
3.项目用哪种 css 尺寸单位? em 和 rem?
4.BFC, 还有哪些类似的 FC, 解决了什么问题?
...
```
- js  
结合 js 的执行机制来说, 解析,编译,运行...
```
1.let 和 var 的区别?
2.let 和 const 的区别?
3.闭包, 变量对象?
4.浏览器的 event loop
5.代码输出
  var name = 'World!'; 
  (function () {  
    if (typeof name === 'undefined') {    
      var name = 'Jack';    
      console.log('Goodbye ' + name);  
    } else { 
      console.log('Hello ' + name);  
    } 
  })();
6.js是如何被解析的(流程)
7.代码输出
  function A(){this.name='a';}
  function B(){this.name='b';}
  A.prototype.getName = function() {return this.name;}
  B.prototype.getName = function() {return this.name;}
  A.prototype = new B;
  const c = new A;
  c.getName();
8.手写一个防抖函数
9.手写数组去重的几种方式
10.下面三行代码有哪些优化思路
  setInterval(() => {
    // domDiv.style.left += 10;
  }, 100);
```
- 浏览器&网络
```
1.浏览器的渲染流程
3.为什么 css3 的有些动画性能会高一点
2.cookie 和 seesion 的区别
```
- 性能优化
```
1.项目做了哪些性能优化
2.说一下 cdn
3.说一下http缓存
4.命中缓存客户端和服务端会进行通信吗
```
- 计算机基础和操作系统
```
1.进程和线程
2.说一下CPU
3.对 GPU 有了解吗
4.会什么一个 4 核cpu 的电脑能同时开启很多个页面进程
```
- node
```
1.对 node 了解多少
```
- vue
```
1.vue 的双向绑定原理
2.vue3 有哪些新特性, 了解多少
```
- 其他
```
平时有玩游戏吗
cpu,进程和线程还比较熟悉, 怎么学习的
```

## 二面问题
主要是项目点考察和需求方案

- h5项目国际化怎么做的, 如何新增了很多个页面, 又该怎么处理
- 有做过 h5 和 app 之间互相调用的操作吗, app下载方式, 唤醒等...
- 实现一个水印组件打上公司的logo, 并防止别人串改, 有什么思路
- 有实现过组件库吗? 组件解耦方案
- 骨架屏组件怎么实现, 以及加载的逻辑
- ssr 带来的主要效果和以及问题和解决方案
- 说一下项目中采用的缓存方案
- 还有什么要问我的