import { Router } from "express";
import { addPlaylist, addVideosInPlaylist, deleteVideoFromPlaylist, getPlaylist } from "../controller/playlist.controller.js";
import express from "express"
import { auth } from "../middleware/auth.middleware.js";

const playlistRouter = Router()

playlistRouter.route("/new-playlist").post(auth,addPlaylist)
playlistRouter.route("/addVideos/:playlistName/videoId").post(auth,addVideosInPlaylist)
playlistRouter.route("/getPlaylist/:playlistName").get(auth,getPlaylist)
playlistRouter.route("/remove-video/:videoTitle/:playlistName").post(auth,deleteVideoFromPlaylist)

export {playlistRouter} 