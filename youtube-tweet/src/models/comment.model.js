import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

const commnentSchema = new mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    content:{
        type: String,
        required: true
    }

},{timestamps: true})

commnentSchema.plugin(mongoosePaginate)

export const comment = mongoose.model("comment",commnentSchema)