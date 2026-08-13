import mongoose from "mongoose";

const likesSchema = new mongoose.Schema({
    likeVideo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    likedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    tweet:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tweet"
    },
    comment:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment"
    }

},{timestamps: true})


// likesSchema.index({likeVideo: 1, likedBy: 1},{unique: true})
// likesSchema.index({tweet: 1, likedBy: 1},{unique: true})
// likesSchema.index({comment: 1, likedBy: 1},{unique: true})

export const likes = mongoose.model("likes",likesSchema)

