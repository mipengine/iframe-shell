/**
 * 一个简单的事件机制
 *
 * @file   event.js
 * @author oott123
 */

define(['micro-event'], function (Emmiter) {
    return function (targetInstance) {
        Emmiter.mixin(targetInstance, ['on', 'off', 'trigger']);
    };
});
