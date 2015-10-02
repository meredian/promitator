require('harmony-reflect');
var promisify = require('es6-promisify');
var isPromise = require('is-promise');

function createInterimProxy(targetPromise) {
    'use strict';
    return Proxy(targetPromise, {
        get: function(target, name) {
            if (targetPromise[name] !== void 0) {
                // Object should primarily behave as promise,
                // including prototypes and getters
                let ref = targetPromise[name];
                if (typeof ref === 'function') {
                    return function() {
                        return ref.apply(targetPromise, arguments);
                    };
                } else {
                    return ref;
                }
            }
            return function() {
                return createInterimProxy(targetPromise.then((obj) => {
                    return obj[name].apply(obj, arguments);
                }));
            };
        }
    });
}

module.exports = function(fn) {
    'use strict';
    const promise = isPromise(fn) ? fn : promisify(fn)();
    return createInterimProxy(promise);
};
