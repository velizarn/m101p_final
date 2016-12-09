/*eslint-env node, assert, mongodb*/
'use strict';

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var i18n = new (require('i18n-2'))({
    locales: ['bg', 'en'],
    extension: '.json'
});

i18n.setLocale('en');

var formatNumber = function(n){
    return parseInt(n).toLocaleString('en-US', {minimumFractionDigits: 0}).replace(/\,/g, ' ');
};

MongoClient.connect('mongodb://localhost:27017/photos', function(err, db) {

    assert.equal(null, err);

    console.log( i18n.__('connected_ok') );
    console.log( i18n.__('search_start') );
    console.time( i18n.__('search_processing') );

    db.collection('images').find({}).sort({"_id": 1}).toArray(function(err1, items) {

        assert.equal(null, err1);

        var connectionClosed = function(){
            db.close(/* @callback */function(errc, result){
                assert.equal(null, errc);
                console.log( i18n.__('connection_closed') );
            });
        };

        var getTaggedImages = function(){
            db.collection('images').find({"tags": {$elemMatch:{$eq: "kittens"}}})
                .count(function(ec, count) {
                    console.log( i18n.__('total_img_tagged', formatNumber(count), "'kittens'"));
                    connectionClosed();
                });
        };

        var orphansCnt = 0;
        var processOrphans = function(){
            ++orphansCnt;
            if (orphansCnt === orphans.length) {
                getTaggedImages();
            }
        };

        var orphans = [];
        var removeOrphans = function(){
            if (orphans.length === 0) {
                getTaggedImages();
            }

            for (var j = 0; j < orphans.length; j++) {

                var _imgId = orphans[j];

                (function (_imgId) {
                    db.collection('images').remove({"_id": _imgId}, function(e, result){
                        assert.equal(null, e);
                        console.log( i18n.__('img_removed', _imgId) );
                        processOrphans();
                    });
                }(_imgId));
            }
        };

        var completed = 0;
        var complete = function() {
            ++completed;
            if (completed === items.length) {
                console.log( i18n.__('total_img_orphaned', formatNumber(orphans.length)) );
                removeOrphans();
            }
        };

        var processing = function(img) {

            db.collection('albums').find({"images": {$elemMatch:{$eq: img._id}}})
                .count(function(err1, count) {

                    if (count === 0) {
                        orphans.push(img._id);
                    }

                    complete();
                });
        };

        console.log( i18n.__('total_img_found', formatNumber(items.length)) );

        for( var i = 0; i < items.length; i++) {
            var img = items[i];
            processing(img);
        }

        console.timeEnd( i18n.__('search_processing') );
    });
});
