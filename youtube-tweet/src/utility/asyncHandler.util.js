import { error, log } from "console"

const asyncHandler = (fx) => {
    return (req,res,next) => {
        return Promise.resolve(fx(req,res,next))
        .catch((err) => next(err))
    }
}

const handleJsonResponse = (res,message) =>  res.json({msg: message}).status(404)

export {asyncHandler}
export {handleJsonResponse}