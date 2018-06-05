/**
 * @file   fis-conf.js
 * @author oott123
 */

/* global fis */

fis.hook('amd');

fis.set('project.files', [
    'src/**',
    'test/**'
]);

fis.set('project.ignore', [
    'dist/**',
    'build/**'
]);

fis.match('/amd_modules/(**).js', {
    isMod: true,
    packTo: 'packed/iframe-shell.js',
    moduleId: '$1'
});

fis.match('src/(**).js', {
    isMod: true,
    packTo: 'packed/iframe-shell.js',
    moduleId: 'iframe-shell2/$1'
});

fis.match('src/index.js', {
    moduleId: 'iframe-shell2'
});

fis.match('test/(**).js', {
    isMod: true,
    moduleId: 'iframe-shell2-test/$1'
});
