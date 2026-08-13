import { Router } from "express";
import { addComment, deleteComment, editComment } from "../controller/comment.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const commentRouter = Router()

commentRouter.route("/add-comment/:videoId").post(auth,addComment)
commentRouter.route("/delete-comment/:commentId").post(auth,deleteComment)
commentRouter.route("/edit-comment/:userComment").post(auth,editComment)

export {commentRouter}