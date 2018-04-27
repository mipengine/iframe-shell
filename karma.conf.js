/**
 * @file   该文件为Karma配置文件，所有配置项都可被对应的命令行参数覆盖。
 * @see    https://karma-runner.github.io/1.0/config/configuration-file.html
 * @author yangjun14(yangjun14@baidu.com)
 */

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './build',

        // Important: 所有插件必须在此声明
        plugins: [
            // frameworks
            'karma-mocha',
            'karma-chai',
            'karma-chai-as-promised',
            'karma-chai-sinon',

            // reporters
            'karma-mocha-reporter',
            'karma-coverage',
            'karma-html-reporter',

            // launchers
            'karma-chrome-launcher'
        ],

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        // Important: 下列数组中文件将『逆序载入』
        frameworks: ['mocha', 'chai-as-promised', 'chai-sinon', 'chai'],

        // list of files / patterns to load in the browser
        files: [
            'http://s1.bdstatic.com/r/www/cache/ecom/esl/2-1-4/esl.js',
            'test/index.js',
            {
                pattern: 'src/**/*.js',
                included: false
            },
            {
                pattern: 'node_modules/**/*.js',
                included: false
            },
            {
                pattern: 'test/**/*.js',
                included: false
            },
            {
                pattern: 'test/assets/**/*',
                included: false
            }
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'src/**/*.js': ['coverage']
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha'],
        htmlReporter: {
            outputDir: 'report/test'
        },
        coverageReporter: {
            dir: 'report/coverage'
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        // Note: 如果要调试Karma，请设置为DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        // Note: 代码改动自动运行测试，需要singleRun为false
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['AlmostHiddenChrome'],
        customLaunchers: {
            AlmostHiddenChrome: {
                base: 'Chrome',
                // Chrome命令行参数
                // Document: http://peter.sh/experiments/chromium-command-line-switches/
                // Note: 隐藏窗口和后台运行都不会载入DOM，只能调整窗口大小和位置
                flags: ['--window-position=0,0', '--window-size=0,0']
            }
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        // 脚本调用请设为 true
        singleRun: true
    });
};
