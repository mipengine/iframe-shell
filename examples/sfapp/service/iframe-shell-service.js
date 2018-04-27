/**
 * iframe-shell 支持 service
 *
 * @file   iframe-shell-service.js
 * @author oott123
 */

define(
    ['service', '../view/ifsView', 'iframe-shell/loader', 'action'],
function (service, IfsView, Loader, Action) {
    var ShellService = service.create();
    var scopes = {};
    ShellService.getScope = function (url) {
        return scopes[url] = scopes[url] || {};
    };
    var getScope = ShellService.getScope;
    ShellService.prototype.create = function (after) {
        var s = getScope(after.url);
        s.url = after.url;
        s.loader = new Loader({
            url: after.query.url,
            useMipCache: after.query.mc,
            viewer: {
                target: document.createElement('div')
            }
        });
        s.title = after.query.title;
        s.afterResize = function () {
            setTimeout(function () {
                s.view.resize();
            }, 50);
        };
        s.loader.on('attach', function () {
            s.view = new IfsView();
            s.view.create();
            s.view.viewer = s.loader.viewer;
            s.view.render(s.title);
            s.view.attach();
            window.$(window).on('resize', s.afterResize);
        });
        s.loader.on('detached', function () {
            s.view.detach();
            s.view.destroy();
            window.$(window).off('resize', s.afterResize);
        });
        s.loader.on('mip-loadiframe', function (_, event) {
            Action.redirect('/mip', {
                url: event.data.url,
                title: event.data.title
            });
        });
        s.loader.create();
    };
    ShellService.prototype.attach = function (after) {
        var s = getScope(after.url);
        s.loader.attach();
    };
    ShellService.prototype.update = function (after) {
        var s = getScope(after.url);
        s.loader.update();
    };
    ShellService.prototype.detach = function (after, before) {
        var s = getScope(before.url);
        s.loader.detach();
    };
    ShellService.prototype.destroy = function (after, before) {
        var s = getScope(before.url);
        s.loader.destroy();
    };
    return ShellService;
});
