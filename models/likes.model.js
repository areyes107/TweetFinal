'use strict'
const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const likesSchema = Schema(
  {
    other_users: [{ type: Schema.Types.ObjectId, ref: "users" }],
    tweet_like: { type: Number, default: 0 },
  });
module.exports = Mongoose.model("likesO", likesSchema);