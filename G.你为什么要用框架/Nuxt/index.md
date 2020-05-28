## nuxt 应用
项目结构目录配置固定,不易扩展
- 项目结构目录
```
assets: 放css,scss,img,js,打包时会被编译处理
components: 纯vue UI组件,没有Nuxt的扩展,不能执行asyncData
layouts: 默认布局文件 default.vue: 整体页面架构
middleware: 中间件文件中允许自定义一个函数在页面渲染之前执行, 类似渲染钩子
            在layouts, pages和nuxt.config.js中配置
pages: 页面目录, Nuxt.js会自动读取该目录下的文件, 生成路由配置
plugins: 插件目录: ui插件,或者js插件 在nuxt.config.js配置完后可全局调用
static:  静态文件目录,不需要webpack构建编译处理的文件,比如 favicon,图片等
store: Vuex文件目录,通过新建store/index.js激活Vuex, 导出函数
nuxt.config.js: 全局的配置文件,会覆盖nuxt的默认配置
```
- 渲染流程
```
客户端请求 -> nuxtServerInit(Store全局状态) -> middleware -> Pages/children -> asyncData() -> Render -> nuxt-link -> middleware
```
- 项目运行管理
```js
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
			exec_mode: 'cluster_mode',// 应用启动模式，支持fork和cluster模式
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
