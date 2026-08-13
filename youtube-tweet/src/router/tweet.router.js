import { Router } from "express";
import { deleteTweet, getTweets, uploadTweet } from "../controller/tweet.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { tweet } from "../models/tweet.model.js";

const tweetRouter = Router()

tweetRouter.route("/").get(auth,getTweets)
tweetRouter.route("/upload-tweet").post(auth,uploadTweet)
tweetRouter.route("/remove-tweet/:tweetId").post(auth,deleteTweet)


export {tweetRouter}