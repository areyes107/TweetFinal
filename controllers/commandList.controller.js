'use strict'
const { getAction } = require("twitter-command");
const {logInUser, create_acount, followU, unfollowU, visualize_Tweets, show_profileS, add_New_Tweet, Update_and_Delete, like_tweet} = require("./users.controller");

const commands = async (req, res) => {
  try {
    res.send(await mapAction(req.users, getAction(req)));
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "ERROR FOUND ON THE SERVER" });
  }
};

const mapAction = async (users, { command, args }) => {
  try {
    if (command === "THIS COMMAND IS NOT VALID") return { message: "THIS COMMAND IS NOT VALID" };
    else if (args === "THIS ARGUMENTS IS NOT VALID")
      return { message: "THIS ARGUMENTS IS NOT VALID" };
    else {
      switch (command.toLowerCase()) {
        case "logInUser":
          return await logInUser(args);
          break;
        case "create_acount":
          return await create_acount(args);
          break;
        case "followU":
          return await followU(users, args);
          break;
        case "unfollowU":
          return await unfollowU(users, args);
          break;
        case "visualize_Tweets":
          return await visualize_Tweets(args);
          break;
        case "show_profileS":
          return await show_profileS(args);
          break;    
        case "add_New_Tweet":
          return await add_New_Tweet(users, args);
          break;
        case "Delete_Tweet":
          return await Update_and_Delete(users, args, 0);
          break;
        case "Update_Tweet":
          return await Update_and_Delete(users, args, 1);
          break;
        case "like":
          return await like_tweet(users, args);
          break;
        case "dislike":
          return await like_tweet(users, args);
          break;
        default:
          return { message: "Invalid command try again" };
      }
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = {
  commands,
};
