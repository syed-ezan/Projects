import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { subscriptionModel } from "../models/subscription.model.js";
import { asyncHandler } from "../utility/asyncHandler.util.js";


const verifyChannel = asyncHandler(async(req,res,next) => {

    const channelID = new mongoose.Types.ObjectId(req.params.id)
    const requiredChannel = await User.findById(channelID)

    if(!requiredChannel){
        res.json({"Error": "Channel doesnot exist..."})
        throw new Error("Channel is unavalible")
    }
    req.channel = requiredChannel
    next()

})

export {verifyChannel}