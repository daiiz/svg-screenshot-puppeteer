import fs from 'fs'
import openurl from 'openurl'

const keyFilename = ".keys/private-key.json"
const projectId = "gyakky2"
const bucketName = `${projectId}.appspot.com`
let gcs = null

const existFile = filePath => {
  try {
    fs.statSync(filePath)
    return true
  } catch(err) {
    return false
  }
}

const initGCS = () => {
  if (!existFile(keyFilename)) return
  gcs = require('@google-cloud/storage')({
    projectId,
    keyFilename
  })
}

export async function uploadToGoogleCloudStorage ({ fileName, text }) {
  const dirName = 'puppeteer_svg_screenshot'
  const localFilePath = `./out/${fileName}.svg`
  initGCS()
  if (!gcs) {
    console.log(localFilePath)
    return
  }
  const bucket = gcs.bucket(bucketName)
  bucket.upload(localFilePath, {
    destination: `${dirName}/${fileName}.svg`,
    public: true,
    metadata: {
      contentType: 'image/svg+xml'
    }
  }, async (err, file) => {
    if (err) return
    await file.makePublic()
    fs.unlinkSync(localFilePath)
    const url = `http://storage.googleapis.com/${bucketName}/${dirName}/${fileName}.svg`
    console.log(url)
    openurl.open(url)
  })
}
