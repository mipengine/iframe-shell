# iframe-shell

## 文件结构

```
├── README.md
├── build                               # 构建目录
│   ├── doc                             # 存放构建的文档页面
│   ├── packed                          # 存放打包后的文件
│   │   ├── iframe-shell.js
│   │   └── iframe-shell.min.js
│   ├── report
│   │   └── coverage                    # 覆盖率报告
│   ├── src                             # 编译后的源码文件
│   └── test                            # 编译后的测试文件
├── dist                                # 发布的 js 文件
│   ├── iframe-shell.js
│   └── iframe-shell.min.js
├── examples                            # 示例文件
│   ├── html5                           # 使用 html5 加载
│   └── sfapp                           # 使用 superframe service 加载
├── fis-conf.js                         # fis 配置
├── jsdoc.conf.json                     # jsdoc 配置
├── karma.conf.js                       # karma 自动测试配置
├── package.json                        # 开发与编译依赖
├── src                                 # 源码目录
│   ├── loader.js
│   ├── messenger.js
│   ├── utils
│   │   ├── debounce.js
│   │   ├── event.js
│   │   ├── extend.js
│   │   └── promise.js
│   └── viewer.js
├── test                                # 测试目录
└── tutorials                           # 使用指引
```

## 如何构建和开发

### 获取构建后文件

```bash
npm install
npm run release # 在 dist 中获取编译结果
```

### 运行测试、生成覆盖率报告

```bash
npm run test
npm run test-coverage
npm run test-reports
```

### 开发

```bash
npm run dev
npm run server
npm run test-watch
```

## 获取文档

```bash
npm run doc
open ./build/doc/index.html
```