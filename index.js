'use strict'

var mongoose = require('mongoose');
var port = 3150;
var app = require('./app');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/myTweets', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false}).then(()=>{
    console.log('THE CONNECTION TO YOUR DB IS SUCCESSFUL ');
    app.listen(port, ()=>{
        console.log('YOUR EXPRESS SERVER IS RUNNING', port);
    });
}).catch( err=>{
    console.log('ERROR AT TIME OF CONNECT', err);
});