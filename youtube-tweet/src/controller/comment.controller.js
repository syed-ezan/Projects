import { Video } from "../models/video.model.js";
import { asyncHandler,handleJsonResponse } from "../utility/asyncHandler.util.js";
import { User } from "../models/user.model.js";
import { comment } from "../models/comment.model.js";
import mongoose from "mongoose";

//Write comment
//Read Comments
//delete commnet
//edit comment

const addComment = asyncHandler(async(req,res,next) => {

    const user = req.user
    const {userComment} = req.body
    const {videoId} = req.params

    const userVideo = await Video.findOne(new mongoose.Types.ObjectId(videoId))

    if(!userVideo){
        handleJsonResponse(res,"Video is not uploaded yet...")
        return
    }
    else if(!(userComment.trim())){
        handleJsonResponse(res,"Comment must contains the characters...")
        return
    }

    const newCommnet = await comment.create({
        owner: req.user._id,
        video: userVideo._id,
        content: userComment
    })

    handleJsonResponse(res,"Your comment is added in the video...")
    return
})

const deleteComment = asyncHandler(async(req,res,next) => {
    
    const user = req.user
    const {commentId} = req.params

    const userComment = await comment.findById(new mongoose.Types.ObjectId(commentId))

    if(!userComment){
        handleJsonResponse(res,"Comment not found...")
        return
    }
    else if(String(user._id) !== String(userComment.owner)){
        handleJsonResponse(res,"Unauthorized request...")
        return
    }
    else{
        await comment.findByIdAndDelete(userComment._id)
        handleJsonResponse(res,"Comment deleted...")
        return
    }
})

const editComment = asyncHandler(async(req,res,next) => {

    const user = req.user
    let {newComment} = req.body
    let {userComment} = req.params
    newComment = newComment + (" [Edited]")

    userComment = await comment.findOne({_id: new mongoose.Types.ObjectId(userComment),owner: user._id})
    
    if(!userComment){
        handleJsonResponse(res,"There is no comment in the video...")
        return
    }
    userComment.content = newComment
    console.log(newComment)

    await userComment.save()

    handleJsonResponse(res,"Your comment is edited...")
    return
})





export {addComment,deleteComment,editComment}