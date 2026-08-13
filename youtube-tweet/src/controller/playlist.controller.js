import { asyncHandler, handleJsonResponse } from "../utility/asyncHandler.util.js"
import { User } from "../models/user.model.js"
import { playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import { watchVideo } from "./user.controller.js"
import { mongoose } from "mongoose"

const addPlaylist = asyncHandler(async(req,res,next) => {
    try {
        const user = req.user
        const {name,description} = req.body

        if((name) === null){
            res.json({"Alert": "Name is required..."})
            throw new Error("Name is required...")
        }
        
        const newPlaylist = new playlist({name,description,owner: user._id})

        await newPlaylist.save()

        res
        .status(210)
        .json({
            "Msg": `Your Playlist ${name} is avalible now...`
        })
    } 
    catch (err) {
        throw new Error(err)
    }
})

const addVideosInPlaylist = asyncHandler(async(req,res,next) => {
    //special key value type of route

    const {playlistName} = req.params
    const {VideoId} = req.body
    const user = req.user
    
    if(!(playlistName || VideoId)){
        res.json({"Alert": "Please provide complete information..."})
        return
    }

    const playList = await playlist.findOne({name: playlistName, owner: user._id})
    const video = await Video.findOne({_id: new mongoose.Types.ObjectId(VideoId)})

    if(!playList){
        res.json(`The Playlist ${playlistName} doesnot exist...`)
        return
    }
    if(!video){
        res.json(`The Video doesnot exist...`)
        return
    }

    for(let values of playList.videos){
        if(String(video._id) === String(values)){
            res.json("Video already exist in PlayList...")
            return
        }
    }
    let index = playList.videos.length
    playList.videos[index] = video._id
    await playList.save()

    console.log("Video added in the playlist...")
    return res.json("Video added in the playlist...")

})

const getPlaylist = asyncHandler(async(req,res,next) => {

    const user = req.user
    const {playlistName} = req.params

    const playList = await playlist.aggregate(
        [
            {
                $match: {owner: req.user._id, name: playlistName}
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField:"_id",
                    as: "allVideos",
                    pipeline: [
                        {
                            $project:{
                                videoFile: 1,
                                thumbnail: 1,
                                title: 1,
                                views: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    numberOfVideos: {
                        $size: "$allVideos"
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    allVideos: 1,
                    numberOfVideos: 1
                }
            }
        ]
    )
    
    if(playList.length === 0){
        console.log("Playlist doesnot exist...")
        return res.json("Playlist doesnot exist...")
    }
    console.log(playList)
    return  res.json({
        "Playlist": playList[0],
        "Msg": "Playlist send successfully..."
    })
})

const deleteVideoFromPlaylist = asyncHandler(async(req,res,next) => {
    const user = req.user
    const {videoTitle,playlistName} = req.params

    const video = await Video.findOne({title: videoTitle})
    const newplaylist = await playlist.findOne({name: playlistName, owner: user._id})

    if(!video){
        handleJsonResponse(res,"Video is currently not avalible...")
        return
    }
    if(!newplaylist){
        handleJsonResponse(res,"Playlist is currently not avalible...")
        return
    }

    const allVideos = newplaylist.videos
    let index = allVideos.indexOf(video._id)

    if(index !== undefined){
        console.log(allVideos.splice(index,1))
        newplaylist.videos = allVideos
        await newplaylist.save()
    }
    else{
        handleJsonResponse(res,`There is no video "${videoTitle}" in your "${playlistName}" playlist...`)
        return
    }

    return res.json({
        "Msg": "The video is removed from the playlist..."
    })
})

export {addPlaylist,addVideosInPlaylist,getPlaylist,deleteVideoFromPlaylist}