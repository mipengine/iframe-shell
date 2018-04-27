;/*!src/utils/debounce.js*/
/**
 * @file   debounce.js
 * @author oott123
 */

define('iframe-shell/utils/debounce', ['require'], function (require) {
    return function (func, wait) {
        var timeout;
        return function () {
            var context = this;
            var args = arguments;
            var later = function () {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
});

;/*!src/viewer.js*/
/**
 * @file   提供 iframe-shell/viewer 模块。
 * @author oott123
 */

define('iframe-shell/viewer', ['iframe-shell/utils/debounce'], function (debounce) {

    /**
     * 渲染一个 iframe 加载 mip 页
     *
     * @constructor
     * @exports iframe-shell/viewer
     * @param  {Object}     config               iframe viewer 配置
     * @param  {DOMElement} [config.target]      渲染 iframe 的目标容器；默认为 body
     * @param  {string}     [config.src]         目标 url 的原始地址
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
        /**
         * 加载 mip 页的 iframe 元素
         *
         * @public
         * @type {DOMElement}
         */
        this.iframe = iframeElement;
        var resizeLisenter = function () {
            console.log('resize');
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
                this.iframe.style.height = '' + this.config.target.clientHeight + 'px';
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

;/*!node_modules/micro-event/dist/micro-event.js*/
'use strict';

(function () {
    function Emitter() {
        var e = Object.create(emitter);
        e.events = {};
        return e;
    }

    function Event(type) {
        this.type = type;
        this.timeStamp = new Date();
    }

    var emitter = {};

    emitter.on = function (type, handler) {
        if (this.events.hasOwnProperty(type)) {
            this.events[type].push(handler);
        } else {
            this.events[type] = [handler];
        }
        return this;
    };

    emitter.off = function (type, handler) {
        if (arguments.length === 0) {
            return this._offAll();
        }
        if (handler === undefined) {
            return this._offByType(type);
        }
        return this._offByHandler(type, handler);
    };

    emitter.trigger = function (event, args) {
        if (!(event instanceof Event)) {
            event = new Event(event);
        }
        return this._dispatch(event, args);
    };

    emitter._dispatch = function (event, args) {
        if (!this.events.hasOwnProperty(event.type)) return;
        args = args || [];
        args.unshift(event);

        var handlers = this.events[event.type] || [];
        handlers.forEach(function (handler) {
            return handler.apply(null, args);
        });
        return this;
    };

    emitter._offByHandler = function (type, handler) {
        if (!this.events.hasOwnProperty(type)) return;
        var i = this.events[type].indexOf(handler);
        if (i > -1) {
            this.events[type].splice(i, 1);
        }
        return this;
    };

    emitter._offByType = function (type) {
        if (this.events.hasOwnProperty(type)) {
            delete this.events[type];
        }
        return this;
    };

    emitter._offAll = function () {
        this.events = {};
        return this;
    };

    Emitter.Event = Event;

    Emitter.mixin = function (obj, arr) {
        var emitter = new Emitter();
        arr.map(function (name) {
            obj[name] = function () {
                return emitter[name].apply(emitter, arguments);
            };
        });
    };

    // CommonJS
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Emitter;
    }
    // Browser
    else if (typeof define === 'function' && define.amd) {
            define('node_modules/micro-event/dist/micro-event', ['require'], function (require) {
                return Emitter;
            });
        } else {
            window.Emitter = Emitter;
        }
})();


;/*!src/utils/event.js*/
/**
 * 一个简单的事件机制
 *
 * @file   event.js
 * @author oott123
 */

define('iframe-shell/utils/event', ['node_modules/micro-event/dist/micro-event'], function (Emmiter) {
    return function (targetInstance) {
        Emmiter.mixin(targetInstance, ['on', 'off', 'trigger']);
    };
});

;/*!src/utils/promise.js*/
/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 标准： Promises/A+ https://promisesaplus.com/
 */

define('iframe-shell/utils/promise', ['require'], function(require) {
    function Promise(cb) {
        if (!(this instanceof Promise)) {
            throw 'Promise must be called with new operator';
        }
        if (typeof cb !== 'function') {
            throw 'callback not defined';
        }

        this._handlers = [];
        this._state = 'init'; // Enum: init, fulfilled, rejected
        this._errors = [];
        this._results = [];

        // 标准：Promises/A+ 2.2.4, see https://promisesaplus.com/ 
        // In practice, this requirement ensures that 
        //   onFulfilled and onRejected execute asynchronously, 
        //   after the event loop turn in which then is called, 
        //   and with a fresh stack.
        setTimeout(function() {
            cb(this._onFulfilled.bind(this), this._onRejected.bind(this));
        }.bind(this));
    }

    /*
     * 注册Promise成功的回调
     * @param cb 回调函数
     */
    Promise.prototype.then = function(cb) {
        //console.log('calling then', this._state);
        if (this._state === 'fulfilled') {
            //console.log(this._state);
            this._callHandler(cb, this._results);
        } else {
            this._handlers.push({
                type: 'then',
                cb: cb
            });
        }
        return this;
    };
    /*
     * 注册Promise失败的回调
     * @param cb 回调函数
     */
    Promise.prototype.catch = function(cb) {
        if (this._state === 'rejected') {
            this._callHandler(cb, this._errors);
        } else {
            this._handlers.push({
                type: 'catch',
                cb: cb
            });
        }
        return this;
    };
    /*
     * 注册Promise最终的回调
     * @param cb 回调函数
     */
    Promise.prototype.finally = function(cb) {
        if (this._state === 'fulfilled') {
            this._callHandler(cb, this._results);
        } else if (this._state === 'rejected') {
            this._callHandler(cb, this._errors);
        } else {
            this._handlers.push({
                type: 'finally',
                cb: cb
            });
        }
    };
    /*
     * 返回一个成功的Promise
     * @param obj 被解析的对象
     */
    Promise.resolve = function(obj) {
        var args = arguments;
        return _isThenable(obj) ? obj :
            new Promise(function(resolve, reject) {
                return resolve.apply(null, args);
            });
    };
    /*
     * 返回一个失败的Promise
     * @param obj 被解析的对象
     */
    Promise.reject = function(obj) {
        var args = arguments;
        return new Promise(function(resolve, reject) {
            return reject.apply(null, args);
        });
    };
    /*
     * 返回一个Promise，当数组中所有Promise都成功时resolve，
     * 数组中任何一个失败都reject。
     * @param promises Thenable数组，可以包含Promise，也可以包含非Thenable
     */
    Promise.all = function(promises) {
        var results = promises.map(function() {
            return undefined;
        });
        var count = 0;
        var state = 'pending';
        return new Promise(function(res, rej) {
            function resolve() {
                if (state !== 'pending') return;
                state = 'fulfilled';
                res(results);
            }

            function reject() {
                if (state !== 'pending') return;
                state = 'rejected';
                rej.apply(null, arguments);
            }
            promises
                .map(Promise.resolve)
                .forEach(function(promise, idx) {
                    promise
                        .then(function(result) {
                            results[idx] = result;
                            count++;
                            if (count === promises.length) resolve();
                        })
                        .catch(reject);
                });
        });
    };

    Promise.prototype._onFulfilled = function(obj) {
        //console.log('_onFulfilled', obj);
        if (_isThenable(obj)) {
            return obj
                .then(this._onFulfilled.bind(this))
                .catch(this._onRejected.bind(this));
        }

        this._results = arguments;
        var handler = this._getNextHandler('then');
        if (handler) {
            return this._callHandler(handler, this._results);
        }
        handler = this._getNextHandler('finally');
        if (handler) {
            return this._callHandler(handler, this._results);
        }
        this._state = 'fulfilled';
    };
    Promise.prototype._onRejected = function(err) {
        //console.log('_onRejected', err);
        this._errors = arguments;
        var handler = this._getNextHandler('catch');
        if (handler) {
            return this._callHandler(handler, this._errors);
        }
        handler = this._getNextHandler('finally');
        if (handler) {
            return this._callHandler(handler, this._errors);
        }
        this._state = 'rejected';
    };
    Promise.prototype._callHandler = function(handler, args) {
        //console.log('calling handler', handler, args);
        var result, err = null;
        try {
            result = handler.apply(null, args);
        } catch (e) {
            err = e;
        }
        if (err) {
            this._onRejected(err);
        } else {
            this._onFulfilled(result);
        }
    };
    Promise.prototype._getNextHandler = function(type) {
        var obj;
        while (obj = this._handlers.shift()) {
            if (obj.type === type) break;
        }
        return obj ? obj.cb : null;
    };

    function _isThenable(obj) {
        return obj && typeof obj.then === 'function';
    }

    return Promise;
});

;/*!src/utils/extend.js*/
/**
 * Extend object
 *
 * @file
 * @author oott123
 */

define('iframe-shell/utils/extend', ['require'], function (require) {
    var hasProp = {}.hasOwnProperty;
    return function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
    };
});

;/*!src/messenger.js*/
/**
 * @file   提供 iframe-shell/messenger 模块。
 * @author oott123
 */

define('iframe-shell/messenger', ['iframe-shell/utils/event', 'iframe-shell/utils/promise', 'iframe-shell/utils/extend'], function (wrapEvent, Promise, extend) {
    var messageTypes = {
        twoWay: 'two-way'
    };
    var messageSentinels = {
        request: 'PM_REQUEST',
        response: 'PM_RESPONSE'
    };
    function getSessionId() {
        return ((new Date()).getTime() * 1000 + Math.ceil(Math.random() * 1000)).toString(36);
    }
    var messengerInstances = {};

    /**
     * iframe - window 单双向通信组件
     *
     * @constructor
     * @exports iframe-shell/messenger
     * @param {Object} config 实例参数
     * @param {Window} config.targetWindow  通信对端窗口（iframe.contentWindow; parent; top）
     * @param {string} config.targetOrigin  通信对端允许接收的 Origin
     * @param {string} config.sourceOrigins 允许的通信来源 Origin 列表
     * @param {number} config.timeout       双向通信回复超时(ms)
     * @param {string} config.name          若对端为 iframe，则填写 iframe.name；若对端为 parent，则填写 window.name(即父窗口的 iframe.name)
     */
    var Messenger = function (config) {
        wrapEvent(this);
        this.targetWindow = config.targetWindow || top;
        this.targetOrigin = config.targetOrigin || '*';
        this.sourceOrigins = config.sourceOrigins || ['*'];
        this.timeout = config.timeout || 500;
        this.name = config.name || window.name;

        /**
         * 存放回调处理函数 sessionId -> Object
         *
         * @private
         * @type    {Object}
         * @example {resolve: function, reject: function, timer: timerId}
         */
        this.defers = {};

        /**
         * 存放双向通信处理函数 eventName -> function
         *
         * @private
         * @type {Object}
         */
        this.handlers = {};

        if (messengerInstances[this.name]) {
            console.warn(
                'The old messenger created for target %O will be replaced by the new one.',
                this.name
            );
        }
        messengerInstances[this.name] = this;
        Messenger.bindHandler();
        return this;
    };
    var messageReciver = function (event) {
        // 寻找对应的 messenger 实例
        var messenger = messengerInstances[event.data.name];
        if (!messenger) {
            // console.warn('A window with no messengers is sending message', event);
            // 兼容老 mip，没有给名字
            for (var x in messengerInstances) {
                messengerInstances[x].processMessageEvent(event);
            }
        }
        else {
            messenger.processMessageEvent(event);
        }
    };
    Messenger.bindHandler = function () {
        window.removeEventListener('message', messageReciver);
        window.addEventListener('message', messageReciver);
    };
    Messenger.prototype = {

        /**
         * 处理消息事件
         *
         * @protected
         * @param  {MessageEvent} event 收到的 message event
         */
        processMessageEvent: function (event) {
            var origin = event.origin || event.originalEvent.origin;
            var messenger = this;
            // 检查 origin 是否安全
            var isSafe = false;
            for (var i = 0; i < messenger.sourceOrigins.length; i++) {
                var safeOrigin = messenger.sourceOrigins[i];
                if (safeOrigin === '*') {
                    isSafe = true;
                    break;
                }
                if (safeOrigin === origin) {
                    isSafe = true;
                    break;
                }
            }
            if (!isSafe) {
                console.warn('Origin ' + origin + ' is not safe, ignore event', event);
                return;
            }
            // 检查单双向
            var eventData = event.data;
            if (!eventData) {
                console.warn('Event data %O is invalid, missing data.', event);
                return;
            }
            // console.log(eventData);
            if (eventData.type === messageTypes.twoWay) {
                if (!eventData.sentinel || !eventData.sessionId) {
                    console.warn('Event data %O is invalid, missing sentinel or/and sessionId.', eventData);
                    return;
                }
                // 检查请求 or 回复
                if (eventData.sentinel === messageSentinels.request) {
                    // 检查是否有对应的 handler
                    var response = {};
                    if (messenger.handlers[eventData.event]) {
                        try {
                            response = messenger.handlers[eventData.event].call(messenger, eventData);
                        }
                        catch (err) {
                            response = {
                                error: err
                            };
                        }
                    }
                    else {
                        console.warn('Event ' + eventData.event + ' has no handler.');
                    }
                    var send = function (response) {
                        response = response || {};
                        extend(response, {
                            type: messageTypes.twoWay,
                            sentinel: messageSentinels.response,
                            sessionId: eventData.sessionId,
                            name: messenger.name
                        });
                        messenger.targetWindow.postMessage(response, messenger.targetOrigin);
                    };
                    // 检查 promise
                    if (response && (typeof response.then) === 'function') {
                        response.then(function (response) {
                            send(response);
                        })
                        .catch(function (err) {
                            send({
                                error: err
                            });
                        });
                    }
                    else {
                        send(response);
                    }
                }
                else if (eventData.sentinel === messageSentinels.response) {
                    // 回复
                    console.log('response!', eventData);
                    var d = messenger.defers[eventData.sessionId];
                    delete messenger.defers[eventData.sessionId];
                    if (!d) {
                        console.warn('Event session is not found for two-way communication', eventData.sessionId);
                        return;
                    }
                    clearTimeout(d.timer);
                    if (eventData.error) {
                        d.reject(eventData.error);
                    }
                    else {
                        d.resolve(eventData);
                    }
                }
                else {
                    console.warn('Event sentinel is invalid ', eventData.sentinel);
                }
            }
            else {
                // 单向
                if (!eventData || !eventData.event) {
                    console.warn('Event data %O is invalid, missing event name.', eventData);
                    return;
                }
                messenger.trigger(eventData.event, [eventData]);
                messenger.trigger('recivemessage', [eventData]);
            }
        },

        /**
         * 给绑定的窗口发送消息
         *
         * @public
         * @param  {string}  eventName    消息名
         * @param  {Object}  data         消息数据；必须为 object
         * @param  {boolean} waitResponse 是否为双向消息（等待回复）
         * @return {Promise}              若为双向消息，则返回后 resolve；否则直接 resolve
         */
        sendMessage: function (eventName, data, waitResponse) {
            var messenger = this;
            return new Promise(function (resolve, reject) {
                var requestData = {
                    name: messenger.name,
                    event: eventName
                };
                var sessionId = getSessionId();
                if (waitResponse) {
                    extend(requestData, {
                        type: messageTypes.twoWay,
                        sentinel: messageSentinels.request,
                        sessionId: sessionId
                    });
                    messenger.defers[sessionId] = {
                        resolve: resolve.bind(this),
                        reject: reject.bind(this),
                        timer: setTimeout(function () {
                            delete messenger.defers[sessionId];
                            reject(new Error('timeout'));
                        }, messenger.timeout)
                    };
                }
                else {
                    setTimeout(resolve, 0);
                }
                extend(requestData, data);
                // 对于单向通信：requestData = {event, ...}
                // 对于双向通信：requestData = {event, type, sentinel, sessionId, ...}
                messenger.targetWindow.postMessage(requestData, messenger.targetOrigin);
            });
        },

        /**
         * 设置双向消息处理函数
         *
         * @public
         * @param {string}   eventName 消息名字
         * @param {Function} fn        处理函数（return object or promise which solves with object）
         */
        setHandler: function (eventName, fn) {
            if ((typeof fn) !== 'function') {
                throw new Error('Invalid handler for event ' + eventName);
            }
            this.handlers[eventName] = fn;
        },

        /**
         * 移除双向消息处理函数
         *
         * @public
         * @param  {string}   eventName 消息名字
         */
        removeHandler: function (eventName) {
            this.handlers[eventName] = undefined;
        },

        /**
         * 销毁消息处理器
         *
         * @public
         */
        destory: function () {
            delete messengerInstances[this.name];
        }
    };
    Messenger.prototype.constructor = Messenger;
    return Messenger;
});

;/*!src/loader.js*/
/**
 * @file   提供 iframe-shell/loader 模块。
 * @author oott123
 */

define('iframe-shell/loader', 
    ['iframe-shell/viewer', 'iframe-shell/messenger', 'iframe-shell/utils/event', 'iframe-shell/utils/extend'],
function (DefaultViewer, Messenger, wrapEvent, extend) {
    var currentScheme = location.protocol === 'https:' ? 'https:' : 'http:';
    var isHttps = function (url) {
        url = '' + url;
        if (url.indexOf('//') === 0) {
            return true;
        }
        return (url.indexOf('https://') === 0);
    };

    var mipCacheUrl = currentScheme + '//mipcache.bdstatic.com/c/';
    var isMipCachedUrl = function (url) {
        url = '' + url;
        return !!url.match(/^(https?:)?\/\/mipcache\.bdstatic\.com\/c\//);
    };
    var getMipCachedUrl = function (url) {
        var pieces = url.split('//');
        pieces.shift();
        var plainUrl = pieces.join('//');
        if (isHttps(url)) {
            return mipCacheUrl + 's/' + plainUrl;
        }
        return mipCacheUrl + plainUrl;
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
            if (!url) {
                return url;
            }
            if (isMipCachedUrl(url)) {
                return url;
            }
            var useMipCache = this.config.useMipCache;
            if (!useMipCache && currentScheme === 'https:' && !isHttps(url)) {
                useMipCache = true;
            }
            if (useMipCache) {
                return getMipCachedUrl(url);
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
            /*else if (url.indexOf('/') === 0) {
                // 相对路径
                var a = document.createElement('a');
                a.href = oldUrl;
                url = a.protocol + '//' + a.host + url;
            }*/
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
         * @return {object} eventName -> handler function
         */
        getMessageHandlers: function () {
            if (this.messageHandlers) {
                return this.messageHandlers;
            }
            var loader = this;
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
                targetWindow: this.viewer.iframe.contentWindow,
                name: this.viewer.name
            });
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
            this.trigger('destroyed');
        }
    };
    Loader.prototype.constructor = Loader;
    return Loader;
});
