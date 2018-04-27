/**
 * @file   提供入口模块。
 * @author oott123
 */

define(function (require) {
    return {
        loader: require('./loader'),
        messenger: require('./messenger'),
        Messenger: require('./messenger'),
        viewer: require('./viewer')
    };
});
