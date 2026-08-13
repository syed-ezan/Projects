import { v2 as cloudinary } from 'cloudinary';
import { error } from 'console';
import fs from "fs"

async function fileConverter(next) {
    cloudinary.config({ 
        cloud_name: 'w2fqxnfy', 
        api_key: process.env.api_key, 
        api_secret: process.env.api_secret
    })
}

const uploadFile = async (filePath,next) => {
    try{
        fileConverter(next)
        let result = await cloudinary.uploader.upload(filePath,{resource_type: 'auto'})
        return result
    }
    catch(err){
        console.log("Error Agya: ",err);
        
    }
    finally{
        fs.unlinkSync(filePath)
    }   
}

export {uploadFile}