import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { addSubscriber, get_video, getUserByChannel, getWatchHistory, showChannels, watchVideo } from "../controller/user.controller.js";
import { verifyChannel } from "../middleware/channel.middleware.js";

const videoRouter = Router()

videoRouter.route("/").post(auth,get_video)
videoRouter.route("/:id").post(auth,watchVideo)
videoRouter.route("/channel").get(auth,showChannels)
videoRouter.route("/get-watch-history").post(auth,getWatchHistory)
videoRouter.route("/show-subscriber/:username").get(auth,getUserByChannel)
videoRouter.route("/subscribe/:id").post(auth,verifyChannel,addSubscriber)


export {videoRouter}