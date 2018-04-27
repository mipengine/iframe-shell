/* global sinon */
define(function () {
    describe('Loader class', function () {
        it('should create a loader correctly', function () {
            var Loader = require('../src/loader');
            var loader = new Loader();
            expect(loader).to.be.an.instanceof(Loader);
        });
        it('should create a loader correctly with custom config', function () {
            var Loader = require('../src/loader');
            var loader = new Loader({
                url: 'https://www.mipengine.org/',
                useMipCache: true,
                viewer: {
                    target: document.body
                }
            });
            expect(loader).to.be.an.instanceof(Loader);
            expect(loader.config).to.be.a('object');
            expect(loader.config).to.have.property('url', 'https://www.mipengine.org/');
            expect(loader.config).to.have.property('useMipCache', true);
            expect(loader.config).to.have.deep.property('viewer.target', document.body);
        });
        it('should create a loader correctly with custom viewer', function () {
            var spy = {};
            var Loader = require('../src/loader');
            var loader = new Loader({}, spy);
            expect(loader).to.be.an.instanceof(Loader);
            expect(loader).to.have.property('Viewer', spy);
        });
    });
    var createLoaderCycleTests = function (useStub, useMipCache, beforeEach, afterEach, it) {
        return function () {
            var loader;
            var Loader = require('../src/loader');
            var ViewerSpy = function (config) {
                this.spy = sinon.spy();
                this.spy();
                this.config = config;
                this.iframe = document.createElement('iframe');
                this.setConfig = sinon.spy();
                this.render = sinon.spy();
                this.attach = sinon.spy();
                this.detach = sinon.spy();
                this.destroy = sinon.spy();
                return this;
            };
            beforeEach(function () {
                var config = {
                    url: 'https://www.mipengine.org/',
                    useMipCache: useMipCache,
                    viewer: {
                        target: document.body
                    }
                };
                if (useStub) {
                    loader = new Loader(config, ViewerSpy);
                }
                else {
                    loader = new Loader(config);
                }
            });
            afterEach(function () {
                if (loader && loader._created && !loader._destroyed) {
                    loader.destroy();
                }
            });
            it('should fire create / created events only once', function () {
                var spyBefore = sinon.spy();
                var spyAfter = sinon.spy();
                loader.on('create', spyBefore);
                loader.on('created', spyAfter);
                loader.create();
                expect(loader._created).to.equal(true);
                loader.create(); // 重复创建不应该被调用多次 create 事件
                expect(loader._created).to.equal(true);
                expect(spyBefore).to.have.been.calledOnce;
                expect(spyAfter).to.have.been.calledOnce;
                if (useStub) {
                    expect(loader.viewer.spy).to.have.been.calledOnce;
                }
            });
            it('should fire attach / attached events only once', function () {
                var spyBefore = sinon.spy();
                var spyAfter = sinon.spy();
                loader.on('attach', spyBefore);
                loader.on('attached', spyAfter);
                loader.create();
                loader.attach();
                expect(loader._created).to.equal(true);
                loader.attach(); // 重复调用不应该被调用多次 attach 事件
                expect(loader._created).to.equal(true);
                expect(spyBefore).to.have.been.calledOnce;
                expect(spyAfter).to.have.been.calledOnce;
                if (useStub) {
                    expect(loader.viewer.attach).to.have.been.called;
                    expect(loader.viewer.render).to.have.been.called;
                }
            });
            it('should fire update / updated events', function () {
                var spyBefore = sinon.spy();
                var spyAfter = sinon.spy();
                loader.on('update', spyBefore);
                loader.on('updated', spyAfter);
                loader.create();
                loader.attach();
                loader.update();
                expect(spyBefore).to.have.been.calledOnce;
                expect(spyAfter).to.have.been.calledOnce;
                if (useStub) {
                    expect(loader.viewer.render).to.have.been.called;
                }
            });
            it('shouldnt update before created', function () {
                var spyBefore = sinon.spy();
                var spyAfter = sinon.spy();
                loader.on('update', spyBefore);
                loader.on('updated', spyAfter);
                // loader.create();
                // loader.attach();
                loader.update();
                expect(spyBefore).not.to.have.been.called;
                expect(spyAfter).not.to.have.been.called;
            });
            it('should fire detach / detached events', function () {
                var spyBefore = sinon.spy();
                var spyAfter = sinon.spy();
                loader.on('detach', spyBefore);
                loader.on('detached', spyAfter);
                loader.create();
                loader.attach();
                loader.detach();
                expect(spyBefore).to.have.been.calledOnce;
                expect(spyAfter).to.have.been.calledOnce;
                if (useStub) {
                    expect(loader.viewer.detach).to.have.been.calledOnce;
                }
            });
            it('shouldnt detach before attached', function () {
                var spyBefore = sinon.spy();
                var spyAfter = sinon.spy();
                loader.on('detach', spyBefore);
                loader.on('detached', spyAfter);
                loader.create();
                // loader.attach();
                loader.detach();
                expect(spyBefore).not.to.have.been.calledOnce;
                expect(spyAfter).not.to.have.been.calledOnce;
                if (useStub) {
                    expect(loader.viewer.detach).not.to.have.been.calledOnce;
                }
            });
            it('should fire destroy / destroyed events', function () {
                var spyBefore = sinon.spy();
                var spyAfter = sinon.spy();
                loader.on('destroy', spyBefore);
                loader.on('destroyed', spyAfter);
                loader.create();
                loader.attach();
                var viewerSpy = loader.viewer; // destroy 后就销毁了
                loader.destroy();
                expect(spyBefore).to.have.been.calledOnce;
                expect(spyAfter).to.have.been.calledOnce;
                // expect(viewerSpy.detach).to.have.been.calledOnce; // 这是真正的 viewer 里做的
                if (useStub) {
                    expect(viewerSpy.destroy).to.have.been.calledOnce;
                }
            });
            it('shouldnt detach before created', function () {
                var spyBefore = sinon.spy();
                var spyAfter = sinon.spy();
                loader.on('destroy', spyBefore);
                loader.on('destroyed', spyAfter);
                loader.destroy();
                expect(spyBefore).not.to.have.been.calledOnce;
                expect(spyAfter).not.to.have.been.calledOnce;
            });
            it('should fire update / updated events while setting config', function () {
                var spyBefore = sinon.spy();
                var spyAfter = sinon.spy();
                loader.on('update', spyBefore);
                loader.on('updated', spyAfter);
                loader.create();
                loader.attach();
                loader.setConfig({useMipCache: true}); // 默认会触发 update
                expect(loader.config).have.property('useMipCache', true);
                loader.setConfig({useMipCache: false}, true); // 不触发 update
                expect(loader.config).have.property('useMipCache', false);
                expect(spyBefore).to.have.been.calledOnce;
                expect(spyAfter).to.have.been.calledOnce;
                if (useStub) {
                    expect(loader.viewer.render).to.have.been.called;
                }
            });
        };
    };
    describe('Loader life cycle (with viewer stub)', function () {
        createLoaderCycleTests(true, false, beforeEach, afterEach, it)();
    });
    describe('Loader life cycle (with viewer stub and mip cache)', function () {
        createLoaderCycleTests(true, true, beforeEach, afterEach, it)();
    });
    describe('Loader life cycle (with real viewer)', function () {
        createLoaderCycleTests(false, false, beforeEach, afterEach, it)();
    });
    describe('Loader utils function', function () {
        var Loader = require('../src/loader');
        it('should use cached url if provided', function () {
            // 若传入的就是 cache url，则不管参数如何，一律使用 cached url（不二次优化）
            var loader = new Loader({
                url: 'https://mipcache.bdstatic.com/c/s/www.baidu.com',
                useMipCache: true
            });
            expect(loader.getFinalUrl()).to.equal('https://mipcache.bdstatic.com/c/s/www.baidu.com');
            loader.setConfig({useMipCache: false});
            expect(loader.getFinalUrl()).to.equal('https://mipcache.bdstatic.com/c/s/www.baidu.com');
        });
        it('should use cached url if specified', function () {
            // 若 useMipCache 为真，则转化为 cache url
            var loader = new Loader({
                url: 'https://www.baidu.com',
                useMipCache: true
            });
            expect(loader.getFinalUrl()).to.equal(location.protocol + '//mipcache.bdstatic.com/c/s/www.baidu.com');
            loader.setConfig({url: 'http://www.baidu.com'});
            expect(loader.getFinalUrl()).to.equal(location.protocol + '//mipcache.bdstatic.com/c/www.baidu.com');
            loader.setConfig({url: 'http://www.baidu.com/path/?query#hash'});
            expect(loader.getFinalUrl()).to.equal(
                location.protocol + '//mipcache.bdstatic.com/c/www.baidu.com/path/?query#hash'
            );
        });
        it('should get relative url correctly', function () {
            var loader = new Loader({
                url: 'https://www.baidu.com'
            });
            expect(loader.getRelativeUrl('//www.mipengine.org')).to.equal('https://www.mipengine.org');
            expect(loader.getRelativeUrl('https://www.mipengine.org')).to.equal('https://www.mipengine.org');
            expect(loader.getRelativeUrl('http://www.mipengine.org')).to.equal('http://www.mipengine.org');
            loader.setConfig({url: 'http://www.baidu.com'});
            expect(loader.getRelativeUrl('//www.mipengine.org')).to.equal('http://www.mipengine.org');
            expect(loader.getRelativeUrl('https://www.mipengine.org')).to.equal('https://www.mipengine.org');
            expect(loader.getRelativeUrl('http://www.mipengine.org')).to.equal('http://www.mipengine.org');
            loader.setConfig({url: '//www.baidu.com'});
            expect(loader.getRelativeUrl('//www.mipengine.org')).to.equal(location.protocol + '//www.mipengine.org');
            expect(loader.getRelativeUrl('https://www.mipengine.org')).to.equal('https://www.mipengine.org');
            expect(loader.getRelativeUrl('http://www.mipengine.org')).to.equal('http://www.mipengine.org');
        });
    });
    describe('Loader message handlers', function () {
        var loader;
        var Loader = require('../src/loader');
        beforeEach(function () {
            loader = new Loader({
                url: 'https://www.mipengine.org/'
            });
        });
        afterEach(function () {
            if (loader && loader._created && !loader._destroyed) {
                loader.destroy();
            }
        });
        it('should attach message handler to messenger', function () {
            var spy = sinon.spy();
            loader.messageHandlers = {
                spy: spy
            };
            loader.create();
            loader.attach();
            expect(loader.messenger.handlers).to.have.property('spy', spy);
        });
        it('should use handler to handle messenger two-way message', function () {
            var spy = sinon.spy();
            loader.messageHandlers = {
                spy: spy
            };
            loader.create();
            loader.attach();
            var eventData = {
                event: 'spy',
                type: 'two-way',
                sentinel: 'PM_REQUEST',
                sessionId: '12345'
            };
            loader.messenger.processMessageEvent({
                origin: '*',
                data: eventData
            });
            expect(spy).to.be.calledWith(eventData);
        });
    });
    describe('Loader (with iframe viewer)', function () {
        var loader;
        var Loader = require('../src/loader');
        beforeEach(function () {
            loader = new Loader({
                url: 'https://www.mipengine.org/',
                useMipCache: false,
                viewer: {
                    target: document.body
                }
            });
        });
        afterEach(function () {
            if (loader && loader._created && !loader._destroyed) {
                loader.destroy();
            }
        });
        it('should attach a iframe on body', function (done) {
            loader.on('attached', function () {
                try {
                    expect(document.body.querySelector('iframe')).to.be.equal(loader.viewer.iframe);
                    expect(document.body.querySelector('iframe')).to.have.property('src', 'https://www.mipengine.org/');
                    done();
                }
                catch (err) {
                    done(err);
                }
            });
            loader.create();
            loader.attach();
        });
        it('should fire a event on load', function (done) {
            loader.on('mip-mippageload', function (_, event) {
                try {
                    expect(event).to.have.deep.property('data.time');
                    done();
                }
                catch (err) {
                    done(err);
                }
            });
            loader.create();
            loader.attach();
        });
    });
});
