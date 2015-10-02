require('harmony-reflect');
var promisify = require('es6-promisify');

module.exports = function(initFunc) {
    var initPromise = promisify(initFunc)();
    return Proxy(initPromise, {
        get: function(target, name) {
            if (name === 'then' || name === 'catch') {
                return initPromise[name];
            }
            return function() {
                return initPromise.then((obj) => {
                    return obj[name].apply(obj, arguments);
                });
            };
        },
        // Has to be sync, we can't extract properties from
        // promissed object
        has: function(target, name) {
            return name === 'then' || name === 'catch';
        }
    });
};
