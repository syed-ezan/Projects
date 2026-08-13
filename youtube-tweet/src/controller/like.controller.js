import { asyncHandler,handleJsonResponse } from "../utility/asyncHandler.util.js";
import { User } from "../models/user.model.js";
import { likes } from "../models/likes.model.js";
import { Video } from "../models/video.model.js";
import { tweet } from "../models/tweet.model.js";
import mongoose from "mongoose"

//-------Todos-------
//like tweet method
//like comment method
//remove like from these content 


const likeVideo = asyncHandler(async(req,res,next) => {
    const user = req.user
    const {videoTitle} = req.params
    if(!videoTitle){
        handleJsonResponse(res,"You cannot like a video without selecting it...")
        return
    }

    const video = await Video.findOne({title: videoTitle})

    if(!video){
        handleJsonResponse(res,"This video doesnot exist...")
        return
    }

    const likedVideoDoc = await likes.findOne({likedBy: user._id, likeVideo: video._id})

    if(likedVideoDoc){
        await likes.findByIdAndDelete(likedVideoDoc._id)
        handleJsonResponse(res,"The video is removed from your like video list...")
        return
    }
    const newLikeVideo = new likes(
        {
            likedBy: user._id,
            likeVideo: video._id,
            tweet: null,
            comment: null
        }
    )
    await newLikeVideo.save()

    handleJsonResponse(res,"Successfully liked this video")
    return
})

const getLikedVideos = asyncHandler(async(req,res,next) => {
    const user = req.user

    const likedVideos = await likes.aggregate(
        [
            {
                $match: {
                    likedBy: user._id,
                    likeVideo: {
                        $ne: null,
                    }
                }
            },
            {
                $lookup:{
                    from: "videos",
                    localField: "likeVideo",
                    foreignField: "_id",
                    as: "likedHistory",
                    pipeline: [
                        {
                            $project:{
                                thumbnail: 1,
                                title: 1,
                                description: 1,
                                videoFile: 1,
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    likedHistory: {
                        $first: "$likedHistory"
                    }
                }
            },
            {
                $project:{
                    likedHistory: 1
                }
            }
        ]
    )
    const reversed = likedVideos.reverse()

    return res
    .json({
        "Liked Videos's details": reversed,
        "User detail": user
    })
})

const likeTweet = asyncHandler(async(req,res,next) => {
    const user = req.user
    const tweetID = new mongoose.Types.ObjectId(req.params.tweetId)

    const userTweet = await tweet.findById(tweetID)

    if(!userTweet){
        handleJsonResponse(res,"Tweet is not avalible...")
        return
    }

    const tweetDoc = await likes.findOne({tweet: tweetID,likedBy: user._id})
    
    if(tweetDoc){
        await likes.findByIdAndDelete(tweetDoc._id)
        handleJsonResponse(res,"Successfully unliked the tweet...")
        return
    }
    await likes.create(
        {
            tweet: userTweet._id,
            likedBy: user._id,
            likeVideo: null,
            comment: null
        }
    )
    handleJsonResponse(res,"Successfully liked the tweet...")
    return
})

const getLikedTweets = asyncHandler(async(req,res,next) => {
    const user = req.user

    const likedTweets = await likes.aggregate(
        [
            {
                $match: {
                    likedBy: user._id,
                    tweet: {
                        $ne: null,
                    }
                }
            },
            {
                $lookup:{
                    from: "tweets",
                    localField: "tweet",
                    foreignField: "_id",
                    as: "likedHistory",
                    pipeline: [
                        {
                            $project:{
                                content: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    likedHistory: {
                        $first: "$likedHistory"
                    }
                }
            },
            {
                $project:{
                    likedHistory: 1
                }
            }
        ]
    )
    const reversed = likedTweets.reverse()

    return res
    .json({
        "Liked tweet's details": reversed,
        "User detail": user
    })
})



export {likeVideo,getLikedVideos,likeTweet,getLikedTweets}