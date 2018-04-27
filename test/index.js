define(function () {
    return function () {
        var tests = [];
        var regex = /\/base\/test\/.*\.js$/;

        // Get a list of all the test files to include
        Object.keys(window.__karma__.files).forEach(function (file) {
            if (file !== '/base/test/index.js' && regex.test(file)) {
                var mod = file.replace(/\.js$/g, '').replace(/^\/base\/test\//, 'iframe-shell-test/');
                tests.push(mod);
            }
        });
        require(tests, window.__karma__.start);
    };
});

(function () {
    var map = __RESOURCE_MAP__;
    var res = map.res;
    var paths = {};
    Object.keys(res).forEach(function (id) {
        var file = res[id];
        if (file.extras && file.extras.moduleId) {
            paths[file.extras.moduleId] = '/base' + file.uri.replace(/.js$/g, '');
        }
    });
    require.config({
        baseUrl: '/base/src',
        paths: paths
    });
    if (window.__karma__) {
        window.__karma__.loaded = function () {};
    }
})();

require(['./index'], function (start) {
    if (window.__karma__) {
        start();
    }
});
