### 加载 iframe-shell

#### 直接使用 script 标签引入

要使用 script 标签引入 iframe-shell，首先需要确定目标页面有 AMD 加载器，如 esl。

在引入 esl 后，使用 script 标签加载 iframe-shell.min.js，如下：

```html
<script src="dist/iframe-shell.min.js"></script>
```

这样就引入了 iframe shell。

#### ……或者使用 fis inline 语法

在 js 中使用：

```javascript
__inline('path/to/libs/iframe-shell.min.js');
```

即可引入 iframe-shell。

### 创建 loader

Loader 是 iframe-shell 的核心组件，它用于管理 iframe-shell 的生命周期和 DOM 渲染。

首先创建一个合适宽高的 iframe 容器，如

```html
<style>
    #iframe-container {
        width: 100%;
        height: 100%;
    }
</style>
<div id="iframe-container"></div>
```

在 js 代码中，新建一个 Loader：

```html
<script>
require(['iframe-shell/loader'], function (Loader) {
    var loader = new Loader({
        url: 'https://www.mipengine.com/',
        useMipcache: false,
        viewer: {
            target: document.getElementById('iframe-container')
        }
    });
    loader.create();
});
</script>
```

即可创建一个新的 loader。

### 管理 loader 的生命周期

在前述代码中，loader 已经被 `create` 了。此时，iframe 元素还未添加到 dom 中去。使用如下代码，即可将 iframe 附加到 dom 里，展现给用户：

```javascript
loader.attach();
```

若加载的是 mip 页面，可用 `on` 语法监听 mip 事件。请注意，仅当 loader 被 attach 时，才会触发这些事件。

```javascript
// 监听的事件名为 `mip-原mip事件名`
loader.on('mip-mippgeload', function (event, args) {
    // args 为原 mip 事件参数。
    console.log('Mip 页成功加载，加载时间：' + args.time);
});
loader.on('mip-loadiframe', function (event, args) {
    redirect('/url/' + args.url, args.title);
})
```

若需要销毁 loader 和相关 dom，则需执行 destroy：

```javascript
loader.detach(); // 将 dom 隐藏
loader.destroy(); // 将 dom 隐藏并移出 dom 树，销毁相关变量
```

### 更多示例

在 `/examples/html5` 目录下，有一个不依赖于任何框架，可独立运行的 iframe-shell 的 demo，实现了简单的路由管理和历史缓存等逻辑。