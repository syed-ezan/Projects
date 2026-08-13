import { tweet } from "../models/tweet.model.js";
import { asyncHandler, handleJsonResponse } from "../utility/asyncHandler.util.js";
import mongoose from "mongoose";

const uploadTweet = asyncHandler(async(req,res,next) => {
    const user = req.user
    const {content} = req.body

    if(!content){
        handleJsonResponse(res,"Provide a content...")
        return
    }
    const newTweet = new tweet(
        {
            content: content,
            tweetBy: user._id
        }
    )
    await newTweet.save()

    handleJsonResponse(res,"Your tweet is uploaded...")
    return
})

const deleteTweet = asyncHandler(async(req,res,next) => {
    const user = req
    const {tweetId} = req.params

    const Tweet = await tweet.findOne({_id: new mongoose.Types.ObjectId(tweetId)},{tweetBy: user._id})

    if(!Tweet) {handleJsonResponse(res,"Tweet doesnot exist")}

    await tweet.findByIdAndDelete(Tweet._id)
    
    return handleJsonResponse(res,"Your tweet is deleted now...")
})

const getTweets = asyncHandler(async(req,res,next) => {
    const tweets = await tweet.find({})
    
    return res
    .json(
        {
            tweets,
            "Msg": "Ended..."
        }
    )    
})

export {uploadTweet,deleteTweet,getTweets}