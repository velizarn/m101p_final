# M101P: MongoDB for Developers Final Exam

## Question 7

### Problem

You have been tasked to cleanup a photo-sharing database. The database consists of two collections, albums, and images. Every image is supposed to be in an album, but there are orphan images that appear in no album. Here are some example documents (not from the collections you will be downloading).

~~~javascript
db.albums.findOne()
{
    "_id" : 67
    "images" : [
        4745,
        7651,
        57320,
        96342,
        99705
    ]
}

db.images.findOne()
{ "_id" : 99705, "height" : 480, "width" : 640, "tags" : [ "dogs", "kittens", "work" ] }
~~~

From the above, you can conclude that the image with _id = 99705 is in album 67. It is not an orphan.
Your task is to write a program to remove every image from the images collection that appears in no album. Or put another way, if an image does not appear in at least one album, it's an orphan and should be removed from the images collection.
Download final7.zip from Download Handout link and use mongoimport to import the collections in albums.json and images.json.
When you are done removing the orphan images from the collection, there should be 89,737 documents in the images collection. To prove you did it correctly, what are the total number of images with the tag 'kittens" after the removal of orphans? As as a sanity check, there are 49,932 images that are tagged 'kittens' before you remove the images.

*_Hint: you might consider creating an index or two or your program will take a long time to run._

Choose the best answer:

- 49 932
- 47 678
- 38 934
- 45 911
- **44 822**

### Queries

~~~javascript
db.getCollection('albums').createIndex({"images": 1});
db.getCollection('images').createIndex({"tags": 1});
~~~

~~~javascript
db.getCollection('images').find({}).sort({"_id": 1})
~~~

~~~javascript
db.getCollection('albums').find({"images": {$elemMatch: {$eq: 2212}}})

db.getCollection('albums').find({"images": {$elemMatch: {$eq: 99780}}})
~~~

~~~javascript
db.getCollection('albums').find({"images": {$elemMatch: {$eq: 99780}}}).count()
~~~

~~~javascript
db.getCollection('images').remove({"_id": 99780})
~~~

~~~javascript
db.getCollection('images').find({"tags": {$elemMatch: {$eq: "kittens"}}})
~~~

~~~javascript
db.getCollection('images').find({"tags": {$elemMatch: {$eq: "kittens"}}}).count()
~~~

### How to

1) Download files from **data** directory and import them intoyour local MongoDB:

~~~
mongoimport --drop -d photos -c albums C:/path-to-file/albums.json
mongoimport --drop -d photos -c images C:/path-to-file/images.json
~~~

2) Create indexes, see the queries above.

3) Install package dependencies:

~~~
npm install
~~~

This command will install mondodb driver for nodejs  and optional modules _i18n-2_ and _sprintf_.

4) Finally you can run app.js script

~~~
> node C:/path-to-file/app.js
~~~

When you run the script for the first time you see following result:

~~~
Successfully connected to MongoDB.
Image search start...
There are 100 000 images in collection.
Image search and processing: 7995ms
...
Img #99952 to be removed
Img #99954 to be removed
Img #99974 to be removed
Img #99980 to be removed
Img #99987 to be removed
44 822 images tagged 'kittens'.
Db connection closed by application.
~~~

Then if you run the script again the result will be as follows:

~~~
Successfully connected to MongoDB.
Image search start...
There are 89 737 images in collection.
Image search and processing: 7041ms
0 orphan images have been found.
44 822 images tagged 'kittens'.
Db connection closed by application.
~~~

...and the answer is: **After removing orphan images there are 44 822 images tagged 'kittens'.**

### Resources

- https://docs.mongodb.com/manual/
- https://robomongo.org/
- http://speakingjs.com/
- http://www.guru99.com/node-js-mongodb.html
- https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html
- https://github.com/jeresig/i18n-node-2
- https://gist.github.com/velizarn/3124dc82557e6e8316cbadf7c0ad06a8
- https://guides.github.com/features/mastering-markdown/