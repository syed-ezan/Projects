import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name:{
        required: true,
        type: String,
        unique: true
    },
    description:{
        type: String
    },
    videos:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

export const playlist = mongoose.model("playlist",playlistSchema)