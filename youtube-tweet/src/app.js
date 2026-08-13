import express from "express"
import cookieParese from "cookie-parser"
import cors from "cors"
import { router as userRouter} from "./router/user.router.js"
import { videoRouter } from "./router/videos.router.js"
import { playlistRouter } from "./router/playlist.router.js"
import { tweetRouter } from "./router/tweet.router.js"
import { likeRouter } from "./router/like.router.js"
import { commentRouter } from "./router/comment.router.js"

const app = express()

app.use(cors({
    origin: process.env.CORS,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParese())

//Making initial routes for user

// --> Basic API eg: http//:users/{var} <--

app.use("/api/v1/users",userRouter)
app.use("/api/v1/users/videos",videoRouter)
app.use("/api/v1/users/playlist",playlistRouter)
app.use("/api/v1/users/tweet",tweetRouter)
app.use("/api/v1/users/like",likeRouter)
app.use("/api/v1/users/comment",commentRouter)

export {app}

