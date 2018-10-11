/**
 * @file   提供 iframe-shell/loader 模块。
 * @author oott123
 */

define(
    ['./viewer', './messenger', './utils/event', './utils/extend'],
function (DefaultViewer, Messenger, wrapEvent, extend) {
    var currentScheme = location.protocol === 'https:' ? 'https:' : 'http:';
    var cachePrefix = new RegExp(
        '^(https?\\:)?//'
        + '(mipcache\\.bdstatic\\.com|'
        + '[^.]+\\.mipcdn.com)'
    );
    var mipHostName = 'mipcdn.com';
    var isHttps = function (url) {
        url = '' + url;
        if (url.indexOf('//') === 0) {
            return true;
        }
        return (url.indexOf('https://') === 0);
    };

    var isMipCachedUrl = function (url, mcReg) {
        if (!mcReg || !(mcReg instanceof RegExp)) {
            mcReg = cachePrefix;
        }
        url = '' + url; // toString
        return !!url.match(cachePrefix);
    };
    var getMipCachedUrl = function (url, mcReg, mcHostName) {
        // 不合法的 url
        if ((url && url.length < 4)
            || !(url.indexOf('http') === 0 || url.indexOf('//') === 0)) {
            return url;
        }
        // 用户可配置自己的mipcdn域名
        if (!mcReg || !(mcReg instanceof RegExp)) {
            mcReg = cachePrefix;
        }
        if (!mcHostName) {
            mcHostName = mipHostName;
        }
        // 已经是 mip cache url 的仅去掉协议头
        if (isMipCachedUrl(url, mcReg)) {
            return url.replace(/^https?:/, '');
        }
        var prefix = '';
        // 获取 domain
        var parser = document.createElement('a');
        parser.href = url;
        var hostname = '' + parser.hostname;
        var subDomain = hostname.replace(/-/g, '--').replace(/\./g, '-');
        prefix = '//' + subDomain + '.' + mcHostName + '/c/';
        if (url.indexOf('//') === 0 || url.indexOf('https') === 0) {
            prefix += 's/';
        }
        // 去掉 http
        var urlParas = url.split('//');
        urlParas.shift();
        url = urlParas.join('//');
        return prefix + url;
    };

    /**
     * iframe-shell 加载器
     *
     * @constructor
     * @exports iframe-shell/loader
     * @param  {Object}  config             加载器配置
     * @param  {string}  config.url         要加载的 url
     * @param  {boolean} config.useMipCache 是否使用 mip cache 加载
     * @param  {Object}  config.viewer      Viewer 配置(see Viewer.setConfig)
     * @param  {Viewer}  [Viewer]           要使用的 Viewer 类
     * @return {Loader}
     */
    var Loader = function (config, Viewer) {
        wrapEvent(this);
        this.config = config || {};
        this.Viewer = Viewer || DefaultViewer;
        return this;
    };
    Loader.prototype = {

        /**
         * 获取最终 url
         *
         * @protected
         * @return {string} 返回最终用于加载 iframe 的 url
         */
        getFinalUrl: function () {
            var url = this.config.url || '';
            var mcReg = this.config.mcReg || '';
            var mcHostName = this.config.mcHostName || '';
            if (!url) {
                return url;
            }
            if (isMipCachedUrl(url, mcReg)) {
                return url;
            }
            var useMipCache = this.config.useMipCache;
            if (!useMipCache && currentScheme === 'https:' && !isHttps(url)) {
                // useMipCache = true;
            }
            if (useMipCache) {
                return getMipCachedUrl(url, mcReg, mcHostName);
            }
            return url;
        },

        /**
         * 转换相对 url 到绝对 url
         * 仅支持 //domain/path 形式转换为完整的 protocol://domain/path
         *
         * @public
         * @param  {string} url 要转换的 url
         * @return {string}     转换后的 url
         */
        getRelativeUrl: function (url) {
            var oldUrl = this.config.url;
            if (url.indexOf('//') === 0) {
                var protocol = oldUrl.match(/(^.*:)\/\//);
                if (protocol) {
                    protocol = protocol[1];
                }
                else {
                    protocol = location.protocol;
                }
                url = protocol + url;
            }
            return url;
        },

        /**
         * 获取 viewer 配置项
         *
         * @private
         * @return {Object}  生成的 viewer 配置（带 src）
         */
        getViewerConfig: function () {
            var viewerConfig = {};
            extend(viewerConfig, this.config.viewer || {});
            viewerConfig.src = this.getFinalUrl();
            viewerConfig.errorHandler = this.errorHandler.bind(this);
            return viewerConfig;
        },

        /**
         * 获取所有的双向消息处理器
         * 第三方若需增加自己的消息处理器，可以重写这个方法。
         *
         * @return {Object} eventName -> handler function
         */
        getMessageHandlers: function () {
            if (this.messageHandlers) {
                return this.messageHandlers;
            }
            this.messageHandlers = {};
            return this.messageHandlers;
        },

        /**
         * 附加消息处理器
         * 内部使用方法；将 getMessageHandlers 中获取的消息处理器附加到 messenger 上。
         *
         * @see  getMessageHandlers
         * @private
         */
        attachMessageHandlers: function () {
            var handlers = this.getMessageHandlers();
            for (var x in handlers) {
                this.messenger.setHandler(x, handlers[x]);
            }
            var loader = this;
            this.allMessageHandler = function (_, event) {
                if (handlers[event.event]) {
                    handlers[event.event](event);
                }
                loader.trigger('mip-' + event.event, [event]);
            };
            this.messenger.on('recivemessage', this.allMessageHandler);
        },

        /**
         * 移除消息处理器
         * 内部使用方法；将 getMessageHandlers 中获取的消息处理器从 messenger 上移除。
         *
         * @see getMessageHandlers
         * @private
         */
        detachMessageHandlers: function () {
            var handlers = this.getMessageHandlers();
            for (var x in handlers) {
                this.messenger.removeHandler(x);
            }
            this.messenger.off('recivemessage', this.allMessageHandler);
        },

        /**
         * 错误处理函数
         * 需要被替换成自己的错误处理
         *
         * @abstract
         * @param  {Error} err 接收到的错误
         */
        errorHandler: function (err) {
            console.log(err);
        },

        /**
         * 设置 loader 配置
         *
         * @public
         * @param {Object}  conf       配置格式同构造器
         * @param {boolean} skipUpdate 是否跳过触发更新
         */
        setConfig: function (conf, skipUpdate) {
            extend(this.config, conf);
            if (!skipUpdate) {
                this.update();
            }
        },

        /**
         * 创建一个 loader。对每个实例而言， 只应在被构造时执行一次。
         *
         * @public
         */
        create: function () {
            if (this._created || this._destoyed) {
                return;
            }
            this._created = true;
            this.trigger('create');
            this.viewer = new this.Viewer(this.getViewerConfig());
            this.messenger = new Messenger({
                targetWindow: this.viewer.iframe,
                name: this.viewer.name
            });
            this._iframeCompleted = false;
            var triggerComplete = this.triggerComplete.bind(this);
            this.viewer.iframe.addEventListener('load', triggerComplete);
            this.on('mip-performance_update', triggerComplete);
            this.on('mip-mippageload', triggerComplete);
            this.trigger('created');
        },

        /**
         * 将一个 mip 页附加到网页上，以展现给用户。此时绑定所有与用户操作相关的事件处理函数。
         *
         * @public
         */
        attach: function () {
            if (this._attached) {
                return;
            }
            this._attached = true;
            this.trigger('attach');
            this.viewer.attach();
            this.attachMessageHandlers();
            this.viewer.render();
            this.trigger('attached');
        },

        /**
         * 配置被更新后，重新渲染 mip 页的 iframe。此时按需更新 iframe 的尺寸和 url。
         *
         * @public
         */
        update: function () {
            if (!this._created) {
                return;
            }
            this.trigger('update');
            this.viewer.setConfig(this.getViewerConfig());
            this.viewer.render();
            this.trigger('updated');
        },

        /**
         * 将一个 mip 页从网页上移除，使用户不可见。此时解绑所有与用户操作相关的事件处理函数。
         *
         * @public
         */
        detach: function () {
            if (!this._attached) {
                return;
            }
            this._attached = false;
            this.trigger('detach');
            this.detachMessageHandlers();
            this.viewer.detach();
            this.trigger('detached');
        },

        /**
         * 销毁一个 mip 页实例。销毁后，该实例将不能再被 attach 到网页上，也不能再复用；若已被 attach，则会自动先 detach 再 执行 destory。
         *
         * @public
         */
        destroy: function () {
            if (!this._created || this._destoyed) {
                return;
            }
            if (this._attached) {
                this.detach();
            }
            this._destoyed = true;
            this.trigger('destroy');
            this.messenger.destory();
            this.viewer.destroy();
            this.viewer = null;
            this._iframeCompleted = false;
            this.trigger('destroyed');
        },

        triggerComplete: function () {
            if (this._iframeCompleted) {
                return;
            }
            this.trigger('complete');
            this._iframeCompleted = true;
        }
    };
    Loader.prototype.constructor = Loader;
    return Loader;
});
