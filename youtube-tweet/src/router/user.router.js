import { Router } from "express";
import { userRejister, loginUser, logoutUser, refreshAccessToken, changePassword, updateAvatar, videosDetail, clearHistory } from "../controller/user.controller.js";
import { upload } from "../middleware/multer.js";
import { auth } from "../middleware/auth.middleware.js";

const router = Router()

//Routes
router.route("/rejister").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "profilePic",
        maxCount: 1
    }
])
,userRejister)
router.route("/login").post(loginUser)
router.route("/logout").post(auth,logoutUser)
router.route("/upload").post(auth,upload.single("youtubeVideo"),videosDetail)
router.route("/refresh").post(refreshAccessToken)
router.route("/change-password").post(auth,changePassword)
router.route("/update-avatar").post(auth,upload.single("avatar"),updateAvatar)
router.route("/clear-history").post(auth,clearHistory)


export {router}

