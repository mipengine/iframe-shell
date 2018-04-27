/**
 * @file   提供 iframe-shell/viewer 模块。
 * @author oott123
 */

define(['./utils/debounce'], function (debounce) {

    /**
     * 渲染一个 iframe 加载 mip 页
     *
     * @constructor
     * @exports iframe-shell/viewer
     * @param  {Object}     config               iframe viewer 配置
     * @param  {DOMElement} [config.target]      渲染 iframe 的目标容器；默认为 body
     * @param  {string}     [config.src]         目标 url 的原始地址
     * @param  {string}     [config.height]      viewer height；默认 100%
     */
    var Viewer = function (config) {
        config = config || {};
        if (!config.target) {
            config.target = document.body;
        }
        if (!config.src) {
            config.src = '';
        }
        this.config = {};
        this.setConfig(config);
        this.name = 'iframe-shell-' + Math.random().toString(36).slice(2);
        var iframeElement = document.createElement('iframe');
        iframeElement.setAttribute('name', this.name);
        iframeElement.setAttribute('data-mip-loader', 'view');
        iframeElement.setAttribute('scrolling', 'yes');
        iframeElement.setAttribute('sandbox', [
            'allow-top-navigation',
            'allow-popups',
            'allow-scripts',
            'allow-forms',
            'allow-pointer-lock',
            'allow-popups-to-escape-sandbox',
            'allow-same-origin',
            'allow-modals'
        ].join(' '));
        Object.assign(iframeElement.style, {
            width: '100%',
            height: this.config.height || '100%',
            border: 'none'
        });
        /**
         * 加载 mip 页的 iframe 元素
         *
         * @public
         * @type {DOMElement}
         */
        this.iframe = iframeElement;
        var resizeLisenter = function () {
            // console.log('resize');
            this.render();
        };
        this.resizeLisenter = debounce(resizeLisenter.bind(this), 50);
        return this;
    };
    Viewer.prototype = {
        constructor: Viewer,

        /**
         * 获得或设置配置
         *
         * @public
         * @param  {Object}     [conf]           要传入的 config；不带参数则只获取 config
         * @param  {DOMElement} conf.target      渲染目标节点
         * @param  {string}     conf.src         要渲染的 url
         * @param  {Function}   conf.errorHander 要设置的错误处理函数
         * @return {Object}                      修改后的 config
         */
        setConfig: function (conf) {
            conf = conf || {};
            if (conf.target) {
                this.config.target = conf.target;
            }
            if (conf.src && this.config.src !== conf.src) {
                this.config.src = conf.src;
                this.srcUpdated = true;
            }
            if ((typeof conf.errorHandler) === 'function') {
                this.errorHandler = conf.errorHandler;
            }
            if (this.config.height !== conf.height) {
                if (this.iframe) {
                    this.iframe.style.height = conf.height;
                }
                this.config.height = conf.height;
            }
            return this.config;
        },

        /**
         * 创建一个 iframe ，但不将其加入 dom 树。
         * 若 iframe 尚不存在，将新建；若已存在，将更新之，并将调整其尺寸到合适大小。
         *
         * @public
         */
        render: function () {
            if (this.config.src) {
                if (this.srcUpdated) {
                    this.iframe.src = this.config.src;
                    this.srcUpdated = false;
                }
                // 如果当前有设置，但是又不太对，就缩放一下
                if (!this.config.height || this.iframe.style.height !== this.config.height) {
                    this.iframe.style.height = '' + this.config.target.clientHeight + 'px';
                }
            }
        },

        /**
         * 将 iframe 加入 dom 树并显示。
         *
         * @public
         */
        attach: function () {
            if (this._attached) {
                return;
            }
            this._attached = true;
            this.iframe.style.display = 'block';
            if (!this.inDom()) {
                this.config.target.appendChild(this.iframe);
            }
            window.addEventListener('resize', this.resizeLisenter);
            this.iframe.addEventListener('error', this.errorHandler);
        },

        inDom: function () {
            return this.iframe.parentElement === this.config.target;
        },

        /**
         * 将 iframe 从 dom 树移除或隐藏。
         *
         * @param {boolean} removeFromDom 是否真正从 dom 移除
         * @public
         */
        detach: function (removeFromDom) {
            if (removeFromDom && this.inDom()) {
                this.config.target.removeChild(this.iframe);
            }
            if (!this._attached) {
                return;
            }
            this._attached = false;
            this.iframe.style.display = 'none';
            window.removeEventListener('resize', this.resizeLisenter);
            this.iframe.removeEventListener('error', this.errorHandler);
        },

        /**
         * 销毁 view
         *
         * @public
         */
        destroy: function () {
            this.detach(true);
            this.iframe = null;
        },

        /**
         * 错误处理函数
         * 可被替换成自己的错误处理函数
         *
         * @abstract
         * @param  {Error} err 接受到的错误
         */
        errorHandler: function (err) {
            console.error(err);
        }
    };
    return Viewer;
});
