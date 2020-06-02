# nuxt框架应用
快速搭建 vue ssr 应用, 开箱即用

## nuxt项目结构
项目结构目录配置固定,不易扩展
```
assets: 放css,scss,img,js,打包时会被编译处理
components: 纯vue UI组件,没有Nuxt的扩展,不能执行asyncData
layouts: 默认布局文件 default.vue: 整体页面架构
middleware: 中间件文件中允许自定义一个函数在页面渲染之前执行, 类似渲染钩子
            在layouts, pages和nuxt.config.js中配置
pages: 页面目录, nuxt.js会自动读取该目录下的文件, 生成路由配置
plugins: 插件目录: ui插件,或者js插件 在nuxt.config.js配置完后可全局调用
static:  静态文件目录,不需要webpack构建编译处理的文件,比如 favicon,图片等
store: Vuex文件目录,通过新建store/index.js激活Vuex, 导出函数
nuxt.config.js: 全局的配置文件,会覆盖nuxt的默认配置
```
## nuxt渲染流程
```
客户端请求 -> nuxtServerInit(Store全局状态) -> middleware -> 
Pages/children -> asyncData() -> Render -> 
nuxt-link -> middleware -> Pages/children -> 如此循环
```
## nuxt项目运行
客户端: 接管组件mounted 后的视图界面以及逻辑
服务端: 运行koa应用服务, 负责接受处理路由请求, 返回html

- PM2管理项目服务进程  
nuxt运行在 node 环境下, 每次请求都需要调用nuxt.render(ctx.req, ctx.res)进行 html string 的吞吐;
保持nuxt应用在node环境下的稳定运行, 需要通过pm2进程管理工具来实现...
https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/
```
// pm2的功能
监听文件变化,自动重启程序
支持性能监控
负载均衡
程序崩溃自动重启
服务器重新启动时自动重新启动
自动化部署项目
```
```js
// 配置
module.exports = {
	apps: [
		{
			name: 'nuxt-demo',//项目名称
			cwd: './',//当前工作路径
			script: 'npm',//实际启动脚本
			args: 'run start',//参数
			autorestart: true, //自动重启
			error_file: 'logs/nuxt-demo-err.log',//错误日志
			out_file: 'logs/nuxt-demo-out.log', //正常运行日志
			exec_mode: 'cluster_mode',// 应用启动模式,支持fork和cluster模式
			min_uptime: '60s', //应用运行少于时间被认为是异常启动
			restart_delay: '60s',//重启时延
			instance: 4,//开启4个实例，仅在cluster模式有效，用于负载均衡
			watch: true,//监控变化的目录，一旦变化，自动重启
			watch: ['.nuxt', 'nuxt.config.js'],//监控变化的目录
			watch_delay: 1000,//监控时延
			ignore_watch: ['node_modules'],//从监控目录中排除
			watch_options: { // 监听配置
				'followSymlinks': false,
				'usePolling': true
			}
		}
	]
}
```
