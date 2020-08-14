'use strict'

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const User_DBSchema = Schema({
    user_name : String,
    user_email : String,
    user_username : String,
    password : String,
    follow_People : [{type:Schema.Types.ObjectId,ref: 'users'}],
    following_People : [{type:Schema.Types.ObjectId,ref: 'users'}]
});
module.exports = Mongoose.model('users',User_DBSchema);
