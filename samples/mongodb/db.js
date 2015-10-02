require('harmonize')();

var Promisquire = require('../../index');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/node_promisquire_test';

var initFunc = function(callback) {
    return MongoClient.connect(url, callback);
};

var db = module.exports = Promisquire(initFunc);

db.collection('samples').insertOne({
    message: 'This is sample; Generated at ' + Date.now()
}).then((res) => {
    var id = res.ops[0]._id;
    console.log('Sample created with id: ' + id);
    return db.collection('samples').remove({_id: id});
}).then(() => {
    console.log('Sample deleted');
    return db.close();
}).catch((e) => {
    console.log('We got error, chief!', e.stack);
    process.exit(1);
});
