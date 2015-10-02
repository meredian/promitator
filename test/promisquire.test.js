var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

var isPromise = require('is-promise');
var Promisquire = require('../index');

var AsyncApiObject = function(initValue) {
    this.state = initValue;
};

AsyncApiObject.prototype.get = function() {
    return Promise.resolve(this.state);
};

var Initializer = function(callback) {
    setTimeout(() => {
        callback(null, new AsyncApiObject(22));
    }, 10);
};

describe('Promisquire', function() {
    beforeEach(function() {
        this.obj = Promisquire(Initializer);
    });

    it('behaves as promise on direct request', function() {
        expect(isPromise(this.obj)).to.be.true;
    });

    it('returs promise for wrapped object methods', function() {
        expect(isPromise(this.obj.get())).to.be.true;
    });

    it('correctly returns value for wrapped object method call', function() {
        return this.obj.get().should.eventually.equal(22);
    });
});
