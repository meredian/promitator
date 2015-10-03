Promitator
==========

Promitator is a small module that helps to work with promise-based API by proviting generic mechanism for lazy initialization. It is based on ES6 Promise, so for now it will work with Node 4.x only in harmony mode. This is kind of experimental work for exploring JS metaprogramming.

Module concept is quite simple. Nowadays there is a lot of convineint promise-based APIs, or APIs, that we can promisify. But sometimes they do require extra initialization step, which is not that convenient. Everybody like to use get rid of unnecessary routines and boilerplate.

Promitator is a single function, that wraps any async function (or promise) into promise, that pretends to be a resulting object and imitates all of it's method (via ES6 proxy).

```javascript
var db = promitator(function(callback) {
    someDbModule.connect('127.0.0.1:11211', opts, function(db) {
        callback(null, db);
    });
});

// You can start working with resulting object like
// you had already got result, not just a promise

db.get("some_key").then(function() {...})
```

## Prerequisites

* Node `>= 4.0`
* `--harmony --harmony_proxies` flags (You can use `harmonize` module for that)

## Installation

```
$ npm install promitator
```

## Usage

Promitator simple returns a promsise, that imitates resulting object. It can be used in numerous ways.

```javascript
var objProxy = promitator(Promise.resolve({
    test: function() {
        return Promise.resolve('This is test!');
    }
}));

objProxy.test().then((res) => {
    console.log(res); // Wow, this is realy test!
});

```

Every call on promitated object returns a new promise proxy, which emitates new object, which will be returned by result of emitated call. So you can easilly chain proxies. This can be applied to sync methods as well.

```javascript
var deep = function deep(level) {
    return Promise.resolve({
        deep: function() {
            return deep(level + 1);
        },
        level: level
    });
};

promitator(deep(0)).deep().deep().deep().deep().then((res) => {
    console.log(`${res.level} levels deep`); // 4 levels deep
});
```

If promise proxy stands in your way, you can easilly get access to original object just by resolving promise
```javascript
objProxy.then((realObject) => {
    // whatever
});
```

The most prominent way of using promitated objects for me is passing them to `module.exports`. Since module system in Node.js is quite powerful, is has problems while dealing with async initialization. Of cource you can pass just a promise, but it will force you to use `.then()` method each time you want to use this object's method.

Finally here is real `mongodb-native` example, which is fully working and helps to understand this idea
```javascript

// Usual flow requires preitialization, like:
// MongoClient.connect(url).then(function(db) {
//     db.collection('samples')....
// })

// We can export working object, so any module can just
// require and use, no need to worry about initialization
// and syncing (since each promise is resolved only once)
var db = module.exports = promitator(function(callback) {
    return MongoClient.connect(url, callback);
});

// Promise as initializer works as well
// var db = promitator(MongoClient.connect(url));

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
```
## License
The MIT License (MIT)

Copyright (c) 2015 Anton Sidelnikov
