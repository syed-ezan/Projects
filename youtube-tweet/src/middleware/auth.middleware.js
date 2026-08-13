import jwt from "jsonwebtoken"
import { asyncHandler } from "../utility/asyncHandler.util.js"
import { User } from "../models/user.model.js"

//Purpose: Basically a middleware that will authnticate whether a user is logedIn or not

const auth = asyncHandler(async (req,res,next) => {
   try {
    // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    const token = req.cookies?.accessToken
    if(!token) {throw new Error("Access Token is expired")}
    const decode = jwt.verify(token,process.env.PRIVATE_KEY_ACCESS_TOKEN.replace(/\\n/g, '\n'))
    
    if(!decode){
        throw TypeError("Unauthorized User...")
    }
    const user = await User.findById(decode.id_)
    req.user = user
    next()
   }
   catch (err) {
    throw err
   }
})

export {auth}