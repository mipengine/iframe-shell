define(function () {
    describe('Messenger', function () {
        var Messenger = require('../src/messenger');
        var Promise = require('../src/utils/promise');
        var pendingIframe;
        var iframe;
        before(function () {
            iframe = document.createElement('iframe');
            iframe.src = '/base/test/assets/messenger-pages/page.html';
            iframe.name = 'messenger-test';
            pendingIframe = new Promise(function (res, rej) {
                iframe.addEventListener('load', res.bind(this));
                iframe.addEventListener('error', rej.bind(this));
            });
            document.body.appendChild(iframe);
        });
        var messenger;
        beforeEach(function () {
            messenger = new Messenger({
                targetWindow: iframe.contentWindow,
                name: iframe.name
            });
        });
        afterEach(function () {
            if (messenger) {
                messenger.destory();
            }
            messenger = null;
        });
        it('should create a messenger instance for a iframe', function (done) {
            pendingIframe
            .then(function () {
                expect(messenger).to.be.an.instanceOf(Messenger);
                expect(messenger).to.have.property('targetWindow', iframe.contentWindow);
                expect(messenger).to.have.property('name', iframe.name);
                done();
            })
            .catch(function (err) {
                done(err);
            });
        });
        it('should send message to iframe on time', function (done) {
            pendingIframe
            .then(function () {
                iframe.contentWindow.test1 = false;
                iframe.contentWindow.test2 = false;
                messenger.sendMessage('test1', {}, false);
                messenger.sendMessage('test2', {}, false);
                setTimeout(function () {
                    try {
                        expect(iframe.contentWindow.test1).to.be.equal(true);
                        expect(iframe.contentWindow.test2).to.be.equal(true);
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                }, 100);
            })
            .catch(function (err) {
                done(err);
            });
        });
        it('should recieve message from iframe', function (done) {
            pendingIframe
            .then(function () {
                messenger.on('tick', done.bind(this, null));
            })
            .catch(done.bind(this));
        });
        it('should recieve message from iframe after get event', function (done) {
            pendingIframe
            .then(function () {
                var data = (new Date()).getTime().toString('32');
                messenger.on('test4', function (_, event) {
                    try {
                        expect(event).to.have.property('hi', 'yes');
                        expect(event).to.have.property('hello', data);
                        done();
                    }
                    catch (e) {
                        done(e);
                    }
                });
                return messenger.sendMessage('test3', {hello: data});
            })
            .catch(done.bind(this));
        });
        it.skip('should get result from iframe', function (done) {
            // console.log('WTF??');
            pendingIframe
            .then(function () {
                return messenger.sendMessage('call1', {}, true);
            })
            .then(function (str) {
                try {
                    // console.log('resolved!');
                    expect(str).to.have.property('data', 'call1');
                    done();
                }
                catch (err) {
                    done(err);
                }
            })
            .catch(done.bind(this));
        });
        it.skip('should get result from iframe with arguments', function (done) {
            pendingIframe
            .then(function () {
                return messenger.sendMessage('call2', {arg: 'yes'}, true);
            })
            .then(function (data) {
                try {
                    expect(data).to.have.property('arg', 'yes');
                    done();
                }
                catch (err) {
                    done(err);
                }
            })
            .catch(done.bind(this));
        });
        it.skip('should get error if handler fails', function (done) {
            pendingIframe
            .then(function () {
                return messenger.sendMessage('calle', {}, true);
            })
            .then(function () {
                done(new Error('message send success which is not expected'));
            })
            .catch(function (err) {
                try {
                    expect(err).to.have.property('message', 'calle');
                    done();
                }
                catch (e) {
                    done(e);
                }
            });
        });
    });
});
