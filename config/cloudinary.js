import { v2 as cloudinary } from "cloudinary"
// Process the uploaded files and respond to the client

export async function uploadImages(images) {
  cloudinary.config({
    // eslint-disable-next-line no-undef
    cloud_name: process.env.CLOUD_NAME,
    // eslint-disable-next-line no-undef
    api_key: process.env.API_KEY,
    // eslint-disable-next-line no-undef
    api_secret: process.env.API_SECRET,
  })
  const urls = []
  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.uploader.upload(images[i].path)
    urls.push(result.secure_url)
  }
  return urls
}
export async function uploadSingle(image) {
  cloudinary.config({
    // eslint-disable-next-line no-undef
    cloud_name: process.env.CLOUD_NAME,
    // eslint-disable-next-line no-undef
    api_key: process.env.API_KEY,
    // eslint-disable-next-line no-undef
    api_secret: process.env.API_SECRET,
  })
  const result = await cloudinary.uploader.upload(image.path)
  return result.secure_url
}
