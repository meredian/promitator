require('harmonize')();

var promitator = require('../index');

var deep = function deep(level) {
    return Promise.resolve({
        deep: function() {
            return deep(level + 1);
        },
        level: level
    });
};

promitator(deep(0)).deep().deep().deep().deep().then((res) => {
    console.log(`${res.level} levels deep`);
});
