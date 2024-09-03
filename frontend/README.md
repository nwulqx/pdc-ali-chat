# 百炼大模型平台 saas 页面模板

## 开发提示

1. 项目使用 ice.js 框架，框架问题可参考https://v3.ice.work/。
2. 开发环境：node.js 版本 16 以上。
3. 在入口文件的时候会根据平台类型（PC、pad/移动端）来确定加载移动端组件和 PC 组件，注意改动内容时要留意双端是否同步修改。
4. 目前只支持 react 版本。

## 本地运行

```bash
$ npm install

$ npm start
```

## 本地开发

1. 通过设置 HOST 变量，值为后端服务本地 ip 地址加端口；在 libs/request.tsx 文件里设置。
2. 如果已经有一个页面地址，如 http://ip:80 这样的地址能够访问页面的话，可以通过谷歌浏览器插件[xswitch](https://chromewebstore.google.com/detail/xswitch/idkjhjggpffolpidfkikidcokdkdaogg?hl=zh-CN&utm_source=ext_sidebar)进行代理。代理方法如下：

```json
{
  "proxy": [
    [
      "http://[页面地址ip]:[端口]/js/main.js",
      "http://[本地ip]:[端口]/js/main.js"
    ],
    [
      "http://[页面地址ip]:[端口]/css/main.css",
      "http://[本地ip]:[端口]/css/main.css"
    ]
  ]
}

    [
      "https://121.43.108.153/js/main.js",
      "http://127.0.0.1:3002/js/main.js"
    ],
    [
      "https://121.43.108.153/css/main.css",
      "http://127.0.0.1:3002/css/main.css"
    ]
```

## 构建

```bash
$ npm run build
```

## 部署

1. 执行 `npm run build` 会在目录里创建一个 build 文件夹。
2. 将 build 文件夹放到后端项目里。

## 目录文件

```md
.
├── README.md
├── ice.config.mts # 项目配置
├── package.json
├── .browserslistrc # Browsers that support.
├── src # 项目文件夹
│   ├── app.ts # 入口文件
│   ├── assets # 静态资源文件（图片、iconfont.js）
│   ├── document.tsx # 本地运行和构建打包时的 html 模板
│   ├── components # 组件库
│   ├── context # useContext
│   ├── hooks # hooks
│   ├── libs # hooks
│   │   └── chatSDK # 对话 sdk
│   │   └── fetchEventSource # sse 配置
│   │   └── constant.ts # 常量配置
│   │   └── eventEmit.ts # 事件监听
│   │   └── request.ts # 网络请求封装
│   │   └── utils.ts # 工具函数
│   ├── locales # 语言配置文件
│   ├── mComponents # 移动端 h5 组件库
│   ├── model # 状态管理
│   ├── pages # 页面 采用约定式路由，全局是 spa，hash 路由的模式，文件名就是 hash 路由路径名
│   │   └── index.tsx # 首页/对话页
│   ├── providers # providers
│   ├── services # 接口请求
│   ├── types # interface 定义
│   ├── global.less # 全局样式，自动引入的样式文件
│   ├── lightStyle.less # 覆盖一些 antd 组件样式
│   └── typings.d.ts # 全局 types
└── tsconfig.json
```

For more detail, please visit [docs](https://v3.ice.work/).
