/*eslint-env node, assert, mongodb*/
'use strict';

var MongoClient = require('mongodb').MongoClient,
	assert = require('assert');

var formatNumber = function(n){
	return parseInt(n).toLocaleString('en-US', {minimumFractionDigits: 0}).replace(/\,/g, ' ');
};

MongoClient.connect('mongodb://localhost:27017/photos', function(err, db) {

	assert.equal(null, err);

    console.log("Successfully connected to MongoDB.");
    console.log('Image search start...');
    console.time('Image search and processing');

    db.collection('images').find({}).sort({"_id": 1}).toArray(function(err1, items) {

    	assert.equal(null, err1);

    	var connectionClosed = function(){
            db.close(/* @callback */ function(errc, result){
    			assert.equal(null, errc);
    			console.log('Db connection closed by application.');
            });
    	};

    	var getTaggedImages = function(){
    		db.collection('images').find({"tags": {$elemMatch:{$eq: "kittens"}}})
				.count(function(ec, count) {
					console.log(formatNumber(count)+' images tagged \'kittens\'.');
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
        				console.log('Img #'+_imgId+' has been removed');
        				processOrphans();
        			});
    			}(_imgId));
    		}
    	};

        var completed = 0;
        var complete = function() {
            ++completed;
            if (completed === items.length) {
            	console.log(formatNumber(orphans.length)+' orphan images have been found.');
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

    	console.log('There are '+formatNumber(items.length)+' images in collection.');

    	for( var i = 0; i < items.length; i++) {
    		var img = items[i];
    	    processing(img);
    	}

    	console.timeEnd('Image search and processing');
	});
});
