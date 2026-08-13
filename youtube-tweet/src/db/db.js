import mongoose from "mongoose";
import { asyncHandler } from "../utility/asyncHandler.util.js";
import { DB_NAME } from "../constants.js";

const connectDB = asyncHandler(async(req,res) => {
    await mongoose.connect(`${process.env.CONNECTION_STRING}/${DB_NAME}`)
    console.log("Connection to MongoDB Atlas secured!!!");
})

export {connectDB}