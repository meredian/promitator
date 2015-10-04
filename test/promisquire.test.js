var expect = require('./helper').expect;

var isPromise = require('is-promise');
var promitator = require('../index');

var AsyncApiObject = function(initValue) {
    this.state = initValue;
};

AsyncApiObject.prototype.get = function() {
    return Promise.resolve(this.state);
};

AsyncApiObject.prototype.inc = function(value) {
    return Promise.resolve(new AsyncApiObject(this.state + value));
};

var Initializer = function(callback) {
    process.nextTick(() => {
        callback(null, new AsyncApiObject(0));
    });
};

describe('promitated object', function() {
    beforeEach(function() {
        this.obj = promitator(Initializer);
    });

    it('behaves as promise on direct request', function() {
        expect(isPromise(this.obj)).to.be.true;
    });

    it('resolves into proxied object, if used as promise', function() {
        return this.obj.should.eventually.be.instanceOf(AsyncApiObject);
    });

    it('returs promise for wrapped object methods', function() {
        expect(isPromise(this.obj.get())).to.be.true;
    });

    it('correctly returns value for wrapped object method call', function() {
        return this.obj.get().should.eventually.equal(0);
    });

    it('chains sequent method calls', function() {
        return this.obj.inc(10).inc(10).get().should.eventually.equal(20);
    });

    it('resolves non-functional properties into promises', function() {
        return this.obj.state().should.eventually.equal(0);
    });
});
