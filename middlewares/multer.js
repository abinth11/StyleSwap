import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({})

const upload = multer({
  storage,
  limits: { fileSize: 100000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
})

function checkFileType (file, cb) {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|gif/
  // Check file extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  // Check MIME type
  const mimetype = filetypes.test(file.mimetype)
  if (mimetype && extname) {
    return cb(null, true)
  } else {
    return cb(new Error('Only images are allowed!'))
  }
}

export default upload
