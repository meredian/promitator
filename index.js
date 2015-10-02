require('harmony-reflect');
var promisify = require('es6-promisify');
var isPromise = require('is-promise');

function createInterimProxy(targetPromise) {
    return Proxy(targetPromise, {
        get: function(target, name) {
            if (name === 'then' || name === 'catch') {
                return function() {
                    return targetPromise[name].apply(targetPromise, arguments);
                };
            }
            return function() {
                return createInterimProxy(targetPromise.then((obj) => {
                    return obj[name].apply(obj, arguments);
                }));
            };
        },
        // Has to be sync, we can't extract properties from
        // promissed object
        has: function(target, name) {
            return name === 'then' || name === 'catch';
        }
    });
}

module.exports = function(fn) {
    const promise = isPromise(fn) ? fn : promisify(fn)();
    return createInterimProxy(promise);
};
