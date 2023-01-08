const multer = require('multer')
const path=require('path')


const fileStorage=multer.diskStorage({
    destination:'images',
    filename:(req,file,cb)=>{
        cb(null,file.filename+'_'+Date.now()+path.extname(file.originalname))
    }
})
 
const uploadImage=multer({
    storage:fileStorage,
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(png|jpb)$/)){
            return cb(new Error("Please upload an Image file!"));
        }
        cb(undefined,true);
    }
})

module.exports={uploadImage}