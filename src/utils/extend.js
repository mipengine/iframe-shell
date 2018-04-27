/**
 * Extend object
 *
 * @file
 * @author oott123
 */

define(function () {
    var hasProp = {}.hasOwnProperty;
    return function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
    };
});
