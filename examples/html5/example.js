require(['iframe-shell/loader'], function (Loader) {
    var Router = function (basePath, startUrl, useMipCache, target) {
        this.maxHistory = 2;
        this.basePath = basePath;
        this.url = startUrl;
        this.useMipCache = useMipCache;
        this.target = target;
        // this.loaderCache = {};
        this.history = [];
        this.init();
        return this;
    };
    Router.prototype = {
        constructor: Router,
        init: function () {
            this.createLoader(this.url);
        },
        createLoader: function (url) {
            this.loader = new Loader({
                url: url,
                useMipCache: this.useMipCache,
                viewer: {
                    target: this.target
                }
            });
            var router = this;
            var loaderMipLoadIframe = function (_, event) {
                router.go(event.data.url);
                document.getElementById('iframe-title').innerHTML = event.data.title;
                document.title = event.data.title;
            };
            var getloaderLoad = function () {
                var time = 0;
                var createTime = Date.now();
                return function (_, event) {
                    if (time > 0) {
                        console.warn('MIP Page navigated in iframe! This is not allowed.');
                        return;
                    }
                    time = Date.now() - createTime;
                    console.log('MIP Page loaded in ' + time + 'ms.');
                };
            };
            var loaderLoad;
            this.loader.on('attached', function () {
                loaderLoad = getloaderLoad();
                router.loader.on('mip-mippageload', loaderLoad);
                router.loader.on('mip-loadiframe', loaderMipLoadIframe);
            });
            this.loader.on('detached', function () {
                router.loader.off('mip-mippageload', loaderLoad);
                router.loader.off('mip-loadiframe', loaderMipLoadIframe);
                loaderLoad = null;
            });
            var events = [
                'create', 'created',
                'attach', 'attached',
                'update', 'updated',
                'detach', 'detached',
                'destroy', 'destroyed',
                'mip-mippageload',
                'mip-loadiframe',
                'mip-perfupdate'
            ];
            var loader = this.loader;
            for (var i = 0; i < events.length; i++) {
                (function (i) {
                    loader.on(events[i], function (_, event) {
                        console.log('[' + loader.config.url + '] Loader ' + events[i], event);
                    });
                })(i);
            }
            this.loader.create();
            this.loader.attach();
            this.url = url;
        },
        go: function (url, replace) {
            var oldTitle = document.title.toString();
            var newState = {url: this.url, title: oldTitle, loader: this.loader};
            if (this.loader) {
                this.loader.detach();
                url = this.loader.getRelativeUrl(url);
            }
            this.createLoader(url);
            if (!replace) {
                this.history.push(newState);
                history.pushState({url: this.url}, '', this.basePath + '#' + this.url);
                this.resetBack();
            }
            return newState;
        },
        resetBack: function () {
            if (this.history.length < 1) {
                document.getElementById('iframe-back').style.display = 'none';
            }
            else {
                document.getElementById('iframe-back').style.display = 'inline';
            }
            if (this.history.length > this.maxHistory) {
                for (var i = 0; i < this.history.length - this.maxHistory; i++) {
                    if (this.history[i].loader) {
                        this.history[i].loader.destroy();
                        this.history[i].loader = null;
                    }
                }
            }
        },
        back: function () {
            var old = this.history.pop();
            if (!old) {
                throw new Error('No more history');
            }
            this.resetBack();
            this.loader.destroy();
            if (old.loader && old.loader._created && !old.loader._destoryed) {
                this.loader = old.loader;
            }
            else {
                this.createLoader(old.url);
                old.loader = this.loader;
            }
            this.loader.attach();
            return old;
        }
    };
    var defaultUrl = 'http://172.20.182.27:8056/examples/img-mip-2.html';
    var url = location.hash.slice(1) || defaultUrl;
    var a = document.createElement('a');
    a.href = url;
    document.title = document.getElementById('iframe-title').innerHTML = a.hostname;
    var router = new Router(
        location.pathname,
        url,
        false,
        document.getElementById('iframe-shell')
    );
    window.addEventListener('popstate', function () {
        if (router.history.length > 0) {
            var state = router.back();
            if (state.title) {
                document.title = document.getElementById('iframe-title').innerHTML = state.title;
            }
        }
        else {
            router.go(location.hash.slice(1) || defaultUrl, true);
        }
    });
    document.getElementById('iframe-back').addEventListener('click', function (event) {
        history.back();
        event.preventDefault();
    });
    window.router = router;
});
