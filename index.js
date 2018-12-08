require('dotenv').config()
const puppeteer = require('puppeteer-core')
const fs = require('fs')
const AnchorsInArea = require('anchors-in-area')
const {createSVGTag} = require('./src/svg-screenshot')
const {uploadToSvgScreenshot} = require('./src/svg-screenshot-api')
const {oauth, checkToken} = require('./src/oauth')

const {UPLOADER, executablePath, userDataDir} = process.env
const LAUNCH_OPTION = {
  headless: true,
  executablePath,
  userDataDir
}

const capture = async ({win, url, range}) => {
  const deviceScaleFactor = 2

  const browser = await puppeteer.launch(LAUNCH_OPTION)
  const page = await browser.newPage()
  await page.goto(url, {
    timeout: 30 * 1000,
    waitUntil: 'networkidle0'
  })
  await page.waitFor(500)
  await page.setViewport({
    width: win.width,
    height: win.height,
    deviceScaleFactor
  })
  const anchors = await page.evaluate(AnchorsInArea.getAnchors, JSON.stringify(range))
  const fileName = `${Date.now()}`
  const tmpPngPath = `./out/${fileName}.png`
  const title = await page.title()
  const buffer = await page.screenshot({
    clip: range,
    path: tmpPngPath
  })
  browser.close()

  const image = fs.readFileSync(tmpPngPath, 'base64')
  const svg = createSVGTag({
    width: range.width,
    height: range.height,
    image,
    url,
    title: decodeURIComponent(title),
    anchors
  })
  fs.unlinkSync(tmpPngPath)

  switch (UPLOADER) {
    case 'local': {
      saveLocal({svg, fileName})
      break
    }
    case 'gcs': {
      saveToGCS({svg, fileName})
      break
    }
    case 'svgss': {
      saveToSvgScreenshot({svg, url, image, title, range, dpr: deviceScaleFactor})
      break
    }
  }
}

const saveLocal = ({svg, fileName}) => {
  fs.writeFileSync(`./out/${fileName}.svg`, svg)
}

const saveToGCS = ({svg, fileName}) => {
  uploadToGoogleCloudStorage({
    fileName,
    text: svg
  })
}

const saveToSvgScreenshot = ({svg, url, image, title, range, dpr}) => {
  const viewbox = `0 0 ${range.width} ${range.height}`
  uploadToSvgScreenshot({
    svg, url, title, viewbox, dpr,
    image: `data:iamge/png;base64,${image}`
  })
}

const saveToGyazo = () => {}

const core = async ({url, win, range}) => {
  const callback = () => {
    capture({url, win, range})
  }
  if (UPLOADER === 'local') {
    return callback()
  }
  // const tokenValid = await checkToken()
  if (!await checkToken()) {
    return oauth(callback)
  } else {
    callback()
  }
}

module.exports = core
