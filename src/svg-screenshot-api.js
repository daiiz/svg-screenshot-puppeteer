import fs from 'fs'
import axios from 'axios'

const accessTokenFilename = "./keys/svg-screenshot-token.json"
const appUrl = 'http://localhost:8080'

const existFile = filePath => {
  try {
    fs.statSync(filePath)
    return true
  } catch(err) {
    return false
  }
}

const apiClient = axios.create({
  timeout: 60000
})

export async function uploadToSvgScreenshot ({ svg, url, image, title, viewbox, dpr }) {
  if (!existFile(accessTokenFilename)) return
  const { access_token } = JSON.parse(fs.readFileSync(accessTokenFilename))
  const uploadApiEndpoint = `${appUrl}/_ah/api/items/v1/upload?access_token=${access_token}`

  const item = {
    svg,
    orgurl: url,
    base64png: image,
    title,
    viewbox,
    dpr
  }

  try {
    const { data } = await apiClient.post(uploadApiEndpoint, item)
    console.log(data)
  } catch (err) {
    console.error(err.message)
  }
}
