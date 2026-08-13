import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { getLikedTweets, getLikedVideos, likeTweet, likeVideo } from "../controller/like.controller.js";

const likeRouter = Router()

likeRouter.route("/like-video/:videoTitle").post(auth,likeVideo)
likeRouter.route("/like-tweet/:tweetId").post(auth,likeTweet)
likeRouter.route("/getTweets").get(auth,getLikedTweets)
likeRouter.route("/likedHistory").get(auth,getLikedVideos)


export {likeRouter}