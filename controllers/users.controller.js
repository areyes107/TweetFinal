'use strict'
const jwt = require("../services/jwt");
const Users = require("../models/users.model");
const Tweets = require("../models/tweets.model");
const likeO = require("../models/likes.model");
const bcrypt = require("bcrypt");

const passGenerator = async (password) => {
    return await new Promise((res, rej) => {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) rej(err);
        res(hash);
      });
    });
  }
  const logInUser = async (args) => {
    try {
      const userLoc = await Users.findOne({
        $or: [{ user_username: args[0] }, { user_email: args[0] }],
      });
  
      if (!userLoc) return { message: "CHECK USER OR EMAIL, INCORRECT" };
      else {
        const exact_Password = await bcrypt.compare(args[1], userLoc.password);
        if (!exact_Password) return { message: "YOU HAVE USED A WRONG PASSWORD" };
        else {
          return { token: jwt.createToken(userLoc) };
        }
      }
    } catch (err) {
      console.log(err);
      return { message: "ERROR FOUND ON THE SERVER" };
    }
  }
const create_acount = async (args) => {
    const users = Users();
    try {
      let userAlreadyExists = await Users.findOne({
        $or: [{ user_email: args[1] }, { user_username: args[2] }],
      });
      if (userAlreadyExists) return { message: "THIS USER ALREADY EXISTS, PLEASE TRY AGAIN" };
      else {
        users.user_name = args[0];
        users.user_email = args[1];
        users.user_username = args[2];
        const password = await passGenerator(args[3]);
        if (!password) return { message: "ERROR CREATING YOUR PASSWORD" };
        else {
          users.password = password;
          let Succes_Create = await users.save();
          if (!Succes_Create) return { message: "ERROR IN THE CREATION OF THE ACCOUNT" };
          else {
            return Succes_Create;
          }
        }
      }
    } catch (err) {
      console.log(err);
      return { message: "ERROR FOUND ON THE SERVER" };
    }
  }
  const followU = async (users, args) => {
    try {
      const you_will_follow = await User.findOne({ user_username: args[0] });
      if (!you_will_follow)
        return { message: "THE USER YOU WANT TO FOLLOW DOES NOT EXIST" };
      else {
        const you_Following = await Users.findOne({
          $and: [{ _id: users.sub }, { following_People: { _id: you_will_follow._id } }],
        });
        if (you_Following)
          return { message: "YOU ALLREADY FOLLOW THIS PERSON" };
        else {
          const add_at_followings = await Users.findByIdAndUpdate(
            users.sub,
            { $push: { following_People: you_will_follow } },
            { new: true }
          )
            .select("user_username")
            .populate("following_People","-password -following_People -follow_People -user_name -user_email");
          const add_at_followers = await Users.findByIdAndUpdate(you_will_follow._id, {
            $push: { follow_People: users.sub },
          });
          if (add_at_followings && add_at_followers) {
            return add_at_followings;
          } else {
            return { message: "ERROR WHEN FOLLOWING THIS USER" };
          }
        }
      }
    } catch (err) {
      console.log(err);
      return { message: "ERROR FOUND ON THE SERVER" };
    }
  }
  const unfollowU = async (users, args) => {
    try {
      const user_UnFollow = await Users.findOne({ user_username: args[0] });
      if (!user_UnFollow)
        return { message: "THIS USER NAME DOES NOT EXIST" };
      else {
        const following_People = await User.findOne({
          $and: [{ _id: users.sub }, { following_People: { _id: user_UnFollow._id } }],
        });
        if (!following_People)
          return { message: "DO NOT FOLLOW THIS USER" };
        else {
          const dontFollowing = await Users.findByIdAndUpdate(
            users.sub,
            { $pull: { following_People: user_UnFollow._id } },
            { new: true }
          )
            .populate("following_People", "-following_People -password -follow_People -user_name -user_email")
            .select("user_username");
  
          const delete_follower = await Users.findByIdAndUpdate(user_UnFollow._id, {
            $pull: { follow_People: users.sub },
          });
  
          if (dontFollowing && delete_follower) {
            return dontFollowing;
          } else {
            return { message: "THERE WAS AN ERROR WHEN TRYING TO FOLLOW THIS USER" };
          }
        }
      }
    } catch (err) {
      console.log(typeof err);
      return { message: "ERROR FOUND ON THE SERVER" };
    }
  }
  const show_profileS = async (args) => {
    try {
      const show_profileS = await Users.findOne({ user_username: args[0] })
        .select("_id user_username following_People follow_People")
        .populate("following_People", "-_id -user_name -user_email -user_password -following_People -follow_People")
        .populate("follow_People","-_id -user_name -user_email -user_password -following_People -follow_People -following_People");
      if (!show_profileS)
        return {
          message: "MPOSSIBLE TO ACCESS THE PROFILE, THE USER IS INCORRECT",
        };
      else return show_profileS;
    } catch (err) {
      console.log(err);
      return { message: "ERROR FOUND ON THE SERVER" };
    }
  }
  const visualize_Tweets = async (args) => {
    try {
      if (args[0] === "*") {
        const everyone_Tweets = await Tweets.find({})
          .populate("author", "-password -following_People -follow_People -user_name -user_email")
          .populate("tweet_like", "-_id -other_users");
        if (!everyone_Tweets) return { message: "NVALID TWEETS COMMUNICATION" };
        else return everyone_Tweets;
      } else {
        const user_Founds = await User.findOne({ user_username: args[0] });
        if (!user_Founds)
          return { message: "THE PERSON WITH THE USER THAT YOU HAVE ENTERED DOES NOT EXIST" };
        else {
          const tweets = await Tweets.find({ author: user_Founds._id })
            .populate("author", "user_username")
            .populate("tweet_like", "-_id -other_users");
          if (!tweets) return { message: "THE TWEET CANNOT BE RECEIVED" };
          else if (tweets.length === 0)
            return { message: "CURRENTLY YOU DO NOT OWN TWEETS" };
          else return tweets;
        }
      }
    } catch (err) {
      console.log(err);
      return { message: "ERROR FOUND ON THE SERVER" };
    }
  }
//------------------------------------------------------TWEETS OPTIONS SECTION----------------------------------------*/
const add_New_Tweet = async (users, args) => {
    try {
      let newTweets = new Tweets();
      let other_users = new likesO();
      newTweets.author = users.sub;
      newTweets.tweet_date = new Date();
      newTweets.tweet_content = args[0];
  
      const save_Reaction = await other_users.save();
      if (!save_Reaction) {
        return {
          message:"THIS TWEET CANNOT STORE YOUR LIKE"};
      } else {
        newTweetS.tweet_like = save_Reaction._id;
        const add_news_tweet = await (await newTweets.save())
          .populate("author", "-password -following_People -follow_People -user_name -user_email")
          .populate("likes", "-_id -interactors")
          .execPopulate();
        if (!add_news_tweet) return { message: "ERROR STORING TWEET" };
        else {
          return add_news_tweet;
        }
      }
    } catch (err) {
      console.log(err);
      return { message: "ERROR FOUND ON THE SERVER" };
    }
  }
  const Update_and_Delete = async (users, args, operation) => {
    try {
      let tweet_placed;
      let tweet_located;
      if (operation === 0) tweet_located = await Tweets.findById(args[1]);
      else tweet_located = await Tweets.findById(args[0]);
  
      if (!tweet_located) return { message: "THIS TWEET DOES NOT EXIST" };
      else {
        if (String(users.sub) !== String(tweet_located.author)) {
          return { message: "SORRY YOU CAN'T INTERACT WITH THE TWEET" };
        } else {
          if (operation === 0) {
            tweet_placed = await TweetS.findByIdAndUpdate(
              args[1],
              { tweet_content: args[0] },
              { new: true }
            );
          } else {
            const reaction_delete = await other_users.findByIdAndRemove(
              tweet_located.tweet_like
            );
            tweet_placed = await Tweets.findByIdAndRemove(args[0]);
          }
          if (!tweet_placed)
            return { message: "UNEXPECTED ERROR, TRY AGAIN" };
          else {
            if (operation === 0) return tweet_placed;
            else return { message: "TWEET DELETED" };
          }
        }
      }
    } catch (err) {
      console.log(err);
      return { message: "ERROR FOUND ON THE SERVER" };
    }
  }
  const i_like_them = async (id, userId) => {
    try {
      const tweet_likes = await likesO.findOneAndUpdate(
        { _id: id },
        { $push: { other_users: userId }, $inc: { tweet_like: 1 } }
      );
      if (!liked) return { message: "ERROR TO GIVE LIKE" };
      else return { message: "YOU LIKE THIS TWEET" };
    } catch (err) {
      console.log(err);
      return { message: "ERROR FOUND ON THE SERVER" };
    }
  }
  const dislike_tweet = async (id, userId) => {
    try {
      const disliked_tweet = await likesO.findOneAndUpdate(
        { _id: id },
        { $pull: { other_users: userId }, $inc: { tweet_like: -1 } }
      );
      if (!disliked) return { message: "ERROR WHEN TRYING TO GIVE DISLIKE" };
      else return { message: "YOU DON´T LIKE THIS TWEET" };
    } catch (err) {
      console.log(err);
      return { message: "ERROR FOUND ON THE SERVER" };
    }
  }
  const like_tweet = async (users, args) => {
    try {
      const tweets = await Tweets.findById(args[0]);
      if (!tweets) return { message: "SORRY TWEET NOT EXISTING " };
      else {
        const pre_reaction = await likesO.findOne({
          $and: [{ _id: tweets.tweet_like }, { interactors: { _id: users.sub } }],
        });
        if (!pre_reaction) {
          const toLike_this = await likesO.findById(tweets.tweet_like);
          return await doLike(toLike_this._id, users.sub);
        } else return await dislike(pre_reaction._id, users.sub);
      }
    } catch (err) {
      console.log(err);
      return { message: "ERROR FOUND ON THE SERVER" };
    }
  }

module.exports = {
logInUser,
create_acount,
followU,
unfollowU,
show_profileS,
visualize_Tweets,
    //tweets xports
add_New_Tweet,
Update_and_Delete,
i_like_them,
dislike_tweet,
like_tweet
}