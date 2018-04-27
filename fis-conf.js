/**
 * @file   fis-conf.js
 * @author oott123
 */

/* global fis */

fis.hook('amd');
fis.hook('node_modules');

fis.set('project.files', [
    'src/**',
    'test/**'
]);

fis.set('project.ignore', [
    'dist/**',
    'build/**'
]);

fis.match('/(node_modules/micro-event/**).js', {
    isMod: true,
    packTo: 'packed/iframe-shell.js',
    moduleId: 'iframe-shell/deps/$1'
});

fis.match('src/(**).js', {
    isMod: true,
    packTo: 'packed/iframe-shell.js',
    moduleId: 'iframe-shell/$1'
});

fis.match('src/index.js', {
    moduleId: 'iframe-shell'
});

fis.match('test/(**).js', {
    isMod: true,
    moduleId: 'iframe-shell-test/$1'
});

fis.media('prod').match('/node_modules/micro-event/**.js', {
    packTo: 'packed/iframe-shell.min.js',
    optimizer: fis.plugin('uglify-js', {
        mangle: {
            expect: 'exports, module, require, define'
        },
        compress: {
            drop_console: true
        }
    })
});

fis.media('prod').match('src/(**).js', {
    packTo: 'packed/iframe-shell.min.js',
    optimizer: fis.plugin('uglify-js', {
        mangle: {
            expect: 'exports, module, require, define'
        },
        compress: {
            drop_console: true
        }
    })
});
