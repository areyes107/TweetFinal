'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Tweet_DBSchema = Schema({
    tweet_date : Date,
    tweet_content: String,
    author : [{type:Schema.Types.ObjectId,ref:'users'}],
    tweet_like: { type: Schema.Types.ObjectId, ref: "likes" }
});
module.exports = mongoose.model('tweets',Tweet_DBSchema);