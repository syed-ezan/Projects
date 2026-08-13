import mongoose, {Schema, model} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
    username:{
        type: String,
        unique: true,
        required: true,
        index: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    fullName:{
        type: String,
        required: true,
        trim: true
    },
    password:{
        type: String,
        required: true,
        unique: true
    },
    videoHistory:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    avatar:{
        type: String,   //Cloudinary Image --> Basically a Link
        required: true,
    },
    profilePic:{
        type: String,
    },
    refreshToken:{
        type: String
    },

},{timestamps:true})

userSchema.pre("save", async function () {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10) 
        return
    }
    else{
        return
    }
})

userSchema.methods.isCorrect = async function (password) {
    if(await bcrypt.compare(password,this.password)){
        return true
    }
    else{
        return false
    }
}

userSchema.methods.genAccessToken = function (){
    const payload = {
        id_ : this._id,
        name: this.username,
        email: this.email,
        fullName: this.fullName
    }
    let accessToken = jwt.sign(payload,process.env.PRIVATE_KEY_ACCESS_TOKEN.replace(/\\n/g, '\n'),{expiresIn: '1h',algorithm:"ES256"})   
    return accessToken
}

userSchema.methods.genRefreshToken = function(){
    const payload = {
        _id : this._id,     // --> All these methods and attributes of schma object is directly stored in db  
    }
    this.refreshToken = jwt.sign(payload,process.env.PRIVATE_KEY_REFRESH_TOKEN.replace(/\\n/g, '\n'),{expiresIn: '20d',algorithm:"ES256"}) 
    return this.refreshToken
}

export const User = model("User",userSchema)