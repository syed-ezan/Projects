import mongoose,{model,Schema} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

const videoModel = new Schema({
    videoFile:{
        type: String,
        required: true
    },
    thumbnail:{
        type: String,
        required: true,
    },
    title:{
        type: String,
        required: true,
        index: true
    },
    description:{
        type: String
    },
    duration:{
        type: Number,
        required: true
    },
    isPublished:{
        type: Boolean,
        default: false,
        required: true
    },
    views:{
        type: Number,
        default: 0
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }

},{timestamps: true})

videoModel.plugin(mongoosePaginate)

videoModel.methods.generateViews = function (users){
    let views = 0
    for(let arrays of users){
        if(arrays.videoHistory.length > 0){
            let elements = new Set(arrays.videoHistory)
            for(let values of elements){
                if(String(values) === String(this._id)){
                    views += 1 
                    break
                }
            }
        }
    }
    return views
}


export const Video = model("Video",videoModel)