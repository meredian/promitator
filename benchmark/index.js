require('harmonize')();

var Benchmark = require('benchmark');
var promisquire = require('../index');

var AsyncApiObject = function(value) {
    this.value = value;
};

AsyncApiObject.prototype.get = function() {
    return Promise.resolve(this.value);
};

AsyncApiObject.prototype.inc = function(inc) {
    return Promise.resolve(new AsyncApiObject(this.value + inc));
};

var object = new AsyncApiObject(0);
var promisquireObject = promisquire(Promise.resolve(new AsyncApiObject(0)));

var suite = new Benchmark.Suite;

suite.add('object', {
    defer: true,
    fn: function(deferred) {
        object.inc(10).then(function(res) {
            return res.inc(10);
        }).then(function(res) {
            return res.inc(10);
        }).then(function(res) {
            return res.get();
        }).then(function() {
            deferred.resolve();
        });
    }
});
suite.add('promisqure', {
    defer: true,
    fn: function(deferred) {
        promisquireObject.inc(10).then(function(res) {
            return res.inc(10);
        }).then(function(res) {
            return res.inc(10);
        }).then(function(res) {
            return res.get();
        }).then(function() {
            deferred.resolve();
        });
    }
});
suite.add('promisquire_magic', {
    defer: true,
    fn: function(deferred) {
        promisquireObject.inc(10).inc(10).inc(10).get().then(function() {
            deferred.resolve();
        });
    }
})
.on('cycle', function(event) {
    console.log(String(event.target));
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
}).run({async: false});
