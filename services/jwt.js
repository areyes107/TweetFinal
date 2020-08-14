'use strict'
const jwt = require("jwt-simple");
const moment = require("moment");
const key = "my_unique_key";

exports.createToken = (users) => {
  const payload = {
    sub: users._id,
    user_name: users.user_name,
    user_username: users.user_username,
    lat: moment().unix(),
    exp: moment().add(30, 'day').unix(),
  };
  return jwt.encode(payload, key);
};
