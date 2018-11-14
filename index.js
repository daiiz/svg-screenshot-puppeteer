import puppeteer from 'puppeteer'
import fs from 'fs'
import AnchorsInArea from 'anchors-in-area'
import {createSVGTag} from './src/svg-screenshot'
import {uploadToSvgScreenshot} from './src/svg-screenshot-api'
import {uploadToGoogleCloudStorage} from './src/gcs'
import {oauth, checkToken} from './src/oauth'

const LAUNCH_OPTION = { headless: true }

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

  // saveLocal({ svg, fileName })
  // saveToGCS({ svg, fileName })
  saveToSvgScreenshot({
    svg, url, image, title, range, dpr: deviceScaleFactor
  })
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

export const core = async ({url, win, range}) => {
  const tokenValid = await checkToken()
  const callback = () => {
    capture({url, win, range})
  }
  if (!tokenValid) {
    return oauth(callback)
  }
  callback()
}

// run()
