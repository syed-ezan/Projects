import { asyncHandler, handleJsonResponse } from "../utility/asyncHandler.util.js";
import { User } from "../models/user.model.js";
import mongoose, { Error } from "mongoose";
import { uploadFile } from "../utility/cloudinary.util.js";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth.middleware.js";
import { Video } from "../models/video.model.js";
import { subscriptionModel } from "../models/subscription.model.js";

const getInfo = asyncHandler(async (req,res) => {
    const userInfo = req.body
    for (let keys in userInfo){
        if(userInfo[keys] == null){
            handleJsonResponse(res,"Values should be defined. Data not stored in DB...")
            throw TypeError("Missing data")          
        }
        else if(keys == "email"){
            if(!(userInfo[keys].endsWith("@gmail.com"))){
                handleJsonResponse(res,"Gmail does not ends with correct domain. Failed to secured...")
                throw TypeError("Gmail Issue")
            }
        }
        else if(keys == "password"){
            if(userInfo[keys].length <= 5){
                handleJsonResponse(res,"Password must have length of more than 5 characters...")
                throw TypeError("Password Issue")
            }
        }
    }
    console.log("Data secured...")
    return userInfo
})

const validateUser = async (res,username,email) => {
    try{
        let users = await User.findOne({username, email})
        if(users !== null){
            users = null
            handleJsonResponse(res,"Already registered. Login already...")
            throw TypeError("User already rejisterd")
        }
        else{
            console.log("Found unique user!!!")
        }
    }
    catch(err){
        throw(err)
    }
}

const uploadLocalImage = (req,res) => {
    let avatarPath = req.files?.avatar?.[0]?.path ?? null
    let framePath = req.files?.profilePic?.[0]?.path ?? null
    if(avatarPath === null){
        handleJsonResponse(res,"Avatar is required!!!")
        throw TypeError("No avatar")
    }
    let paths = [avatarPath,framePath]
    return paths
}

const uploadToCloudinary = async (next,paths,userInformation) => {
    let links = [null,null]
    links[0] = await uploadFile(paths[0],next)
    console.log(links[0])
    if(paths[1] === null) console.log("Profile Pic is not provided by user!!!")
    else links[1] = await uploadFile(paths[1],next)
    let newUserInformation = Object.assign(
        userInformation,
        {"avatar": links[0].secure_url},
        {"profilePic": links[1]?.secure_url}
    )
    console.log(newUserInformation)
    return newUserInformation
}

const rejisterUser = async (userInformation) => {
    try{
        let result = new User(userInformation)
        result = await result.save()
        console.log(result)
    }
    catch(err){
        console.log("Error: ",err)
    }
}

const getloginInfo = (req,res) => {
    const {email,password} = req.body
    if([email,password].some((elements) => elements === undefined)){ 
        res.json({
            msg : "Information is incomplete..."
        })
        throw TypeError("Information is incomplete...")

    }
    else{
        console.log("Secured UserInfo...")
        return [email,password]
    }
}

const getUserAndValidate = async (req,res,logInfo) => {
    try{
        let email = logInfo[0]
        let reqUser = await User.findOne({email}) ?? null
        if(reqUser){
            console.log("Found User...")
            //Validate password
            let pass = logInfo[1]
            if(reqUser.isCorrect(pass)){
                console.log("User validated and now can have access and refresh tokens...")
                return reqUser
            }
            else{
                handleJsonResponse(res,"Password iscorrect...") 
                throw Error("Password doesnot match...")
            }
        }
        else{
            console.log(reqUser)
            handleJsonResponse(res,"Register with this email...")
            throw TypeError("No user found...")
        }
    }
    catch(err){
        console.log(err)
        throw err
    }  
} 

async function assignToken(user){
    try{
        let accessToken = await user.genAccessToken()
        let refreshToken = await user.genRefreshToken()
        let updatedUser = await user.save()
        console.log(updatedUser)
        return {accessToken,refreshToken}
    }
    catch(err){
        throw err
    }
}

const userRejister = asyncHandler(async (req,res,next) => {
    
    let userInformation = await getInfo(req,res,next)
    await validateUser(res, userInformation.username,userInformation.email)
    const paths = await uploadLocalImage(req,res)
    await rejisterUser( await uploadToCloudinary(next,paths,userInformation))
    res.status(200).json({
        message: "Rejistered. You can login now..."
    })
})

const loginUser = asyncHandler(async (req,res,next) => {
    
    const logInfo = getloginInfo(req,res)
    let reqUser = await getUserAndValidate(req,res,logInfo)
    const tokens = await assignToken(reqUser)
    reqUser = await User.findOne(reqUser._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken",tokens.accessToken,options)
    .cookie("refreshToken",tokens.refreshToken,options)
    .json({
        "status": 200,
        reqUser,
        "accessToken": tokens.accessToken,
        "refreshToken": tokens.refreshToken,
        "msg": "You are logged in"
    })
})

const logoutUser = asyncHandler(async (req,res,next) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined}
        }
    )
    .select("-password -refereshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .status(200)
    .json(
        {
            "msg": "You are logged out..."
        }
    )

})

//endpoint functionality for refreshing accessToken

const refreshAccessToken = asyncHandler(async(req,res,next) => {
    //Assume front end user send req throgh cookie
    const token = req.cookies?.refreshToken
    if(!token){
        throw TypeError("Unauthorized request...")
    }

    let verfiedToken = null
    try { verfiedToken = jwt.verify(token,process.env.PRIVATE_KEY_REFRESH_TOKEN.replace(/\\n/g, '\n')) }
    catch (error) { throw error }

    const user = await User.findById(verfiedToken._id).select("-password")

    if(token !== user?.refreshToken){
        throw new Error("Invalid refresh token")
    }

    const accessToken = user.genAccessToken()
    const refreshToken = user.genRefreshToken()

    await user.save()

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        {
            "accessToken": accessToken,
            "refreshToken": refreshToken,
            "msg": "Tokens are updated..."
        }
    )
})

const changePassword = asyncHandler(async (req,res,next) => {

    const {oldPassword,newPassword,confirmPassword} = req.body
    let user = req.user
    user = await User.findById(user.id_).select("-refreshToken")

    if(newPassword !== confirmPassword) {throw new Error("Password doesnt match with your confirm password...")}
    else if (!(await User.isCorrect(oldPassword))) {throw new Error("Password doesnot match with your stored password")}

    user.password = newPassword
    await user.save()

    return res
    .json({
        msg: "Your password in changed and stored..."
    })

})

const updateAvatar = (async(req,res,next) => {

    const user = req.user
    const avatarPath = req.file?.path
    let result = await uploadFile(avatarPath)
    result = result?.secure_url
    user.avatar = result
    await user.save()
    return res
    .json(
        {
            picLink: user.avatar,
            msg: "Avatar is updated now..."   
        }
    )

})

const getUserByChannel = asyncHandler(async (req,res,next) => {
    const {username} = req.params
    if(!(username.trim())) {throw new Error("Invalid username")}
    const channel = await User.aggregate(
        [
            {
                $match:{username: username}
            },
            {
                $lookup:{   //gets subscribers from a channel
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "Subscriber"
                }
            },
            {
                $lookup:{//subscribers subcribed by this channel
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscribers",
                    as: "Subscribed"
                }
            },
            {
                $addFields:{
                    numberOfSubscribers: {$size: "$Subscriber"},
                    numberOfSubscribedTo: {$size: "$Subscribed"},
                    isSubcribed: {
                        if: {
                            $in: [req.user?._id,"$Subscriber.subscribers"]
                        },
                        then: true,
                        else: false
                    }
                }
            },
            {
                $project:{
                    username: 1,
                    fullName: 1,
                    email: 1,
                    watchHistory: 1,
                    avatar: 1,
                    profilePic: 1,
                    numberOfSubscribers: 1,
                    numberOfSubscribedTo: 1,
                    isSubcribed: 1
                }
            }
        ]
    )
    console.log(channel)
    if(!channel){throw new Error("This channel doesnot exist")}

    return res
    .json(
        {
            channel,
            msg: "User all details"
        }
    )
})

const getWatchHistory = (async(req,res,next) => {
    const watchHistory = await User.aggregate(
        [
            {
                $match: {_id: req.user._id}
            },
            {
                $lookup: {
                    from:"videos",
                    localField:"videoHistory",
                    foreignField:"_id",
                    as:"WatchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from:"users",
                                foreignField:"_id",
                                localField:"owner",
                                as:"owner",
                                pipeline:[
                                    {
                                        $project: {
                                            username: 1,
                                            email: 1,
                                            fullName: 1,
                                            avatar: 1,
                                            profilePic: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner:{
                                    $first:"$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ]
    )
    console.log(watchHistory)
    return res
    .json(
        {
            "watchHistory": watchHistory?.[0]?.WatchHistory ?? null,
            "msg": "Returned the history of videos successfully"
        }
    )
})

const videosDetail = asyncHandler(async(req,res,next) => {
    try {
        const owner = req.user._id
        const {thumbnail,title,description,isPublished} = req.body
        const videoFilePath = req.file?.path
        let videoFile = await uploadFile(videoFilePath,next)
        const duration = Number(videoFile.duration.toFixed(2))
        videoFile = videoFile.secure_url 
    
        const video = new Video(
            {
                videoFile,
                thumbnail,
                title,
                description,
                duration,
                isPublished,
                owner
            }
        )
        await video.save()

        return res
        .json({"msg": "Successfully uploaded details on DB..."})
    } 
    catch (error) {
        throw error
    }
})

const get_video = asyncHandler(async (req,res,next) => {
    try{
        const allVideos = await Video.find({}).select("-videoFile -thumbnail -duration -isPublished -owner")
        res
        .send(allVideos)
        next()
    }
    catch(err){
        next(err)
    }
})

const watchVideo = asyncHandler(async(req,res,next) => {
    
    try {
        const user = req.user
        let videoID = req.params?.id
    
        if(videoID.trim() === ""){
            throw new Error("Invalid Video request...")
        }
        videoID = new mongoose.Types.ObjectId(videoID)
        const getRealID = await Video.findById(videoID)
        if(!getRealID){
            throw new Error("Cannot find the video")
        }

        let index = user.videoHistory.length
        user.videoHistory[index] = getRealID._id
        await user.save()

        let allUser = await User.find({})

        let Views = getRealID.generateViews(allUser)
        getRealID.views = Views
        console.log(Views)
        await getRealID.save()

        console.log("History saved...")
        res.
        json(
            {
                "msg": "The data is updated in the Video History section..."
            }
        )  
    } 
    catch (err) {
        throw err
    }
})

const clearHistory = asyncHandler(async(req,res,next) => {
    const user = req.user

    user.videoHistory = []
    await user.save()

    handleJsonResponse(res,"Your history is clear now...")
    return
})

const showChannels = asyncHandler(async(req,res,next) => {
    const channels = await User.find({}).select("-password -updatedAt -createdAt -videoHistory -email -refreshToken")
    res
    .json({
        channels
    })
})

const addSubscriber = asyncHandler(async(req,res,next) => {
    //User wants to subscribe the channel
    const user = req.user
    const channel = req.channel

    const subscription = await subscriptionModel.findOne({
        channel: channel._id,
        subscribers: user._id
    })
    .select("-_id") 

    if(subscription){
        res.json({"alert": `You have already subscribed to ${channel.fullName}`})
        console.log(`You have already subscribed to ${channel.fullName}`)
        return
    }

    const newSubscription = new subscriptionModel(
        {
            channel: new mongoose.Types.ObjectId(channel._id),
            subscribers: user._id
        }
    )
    await newSubscription.save()
    return res
    .json({
        "msg": `You have successfully Subscribed to the ${channel.fullName}'s channel...`
    })
})

export{userRejister,loginUser,logoutUser,refreshAccessToken,changePassword,updateAvatar,getUserByChannel,getWatchHistory,videosDetail,get_video,watchVideo,addSubscriber,showChannels,clearHistory}


const getCurrentUser = asyncHandler(async(req,res,next) => {
    const user = req.user
    return user
})







// --> Algorithm 1

//Step 1: user's email, password get
//Step 2: validations of all fields whether they are empty or incorrect
//Step 3: check whether user already rejistered
//Step 4: check whether avatar is uploaded on the server
//Step 5: push image to cloudinary
//Step 6: check whether image succesfully uploaded at cloudinary
//Step 7: get the response after dealing with cloudinary and get the url from the response
//Step 8: create user object for entry of the user in DB and DB returns the response that has all the same info we have for user
//Step 9: Check whether the user object is null and if not send the resposne data to frontend 
//Step 10: rejistration successfull response send to user

// --> Alogorithm 2

//Get user email pass
//check user exists
//password varification
//assign access and refresh token