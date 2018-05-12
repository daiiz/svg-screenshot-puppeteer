import puppeteer from 'puppeteer'
import fs from 'fs'
import {getArgs} from './src/setup'
import AnchorsInArea from 'anchors-in-area'
import {createSVGTag} from './src/svg-screenshot'
import {uploadToGoogleCloudStorage} from './src/gcs'

const LAUNCH_OPTION = { headless: true }

const run = async () => {
  const {window, url, range} = getArgs()

  const browser = await puppeteer.launch(LAUNCH_OPTION)
  const page = await browser.newPage()
  await page.goto(url, {
    timeout: 30 * 1000,
    waitUntil: 'networkidle0'
  })
  await page.waitFor(500)
  await page.setViewport({
    width: window.width,
    height: window.height,
    deviceScaleFactor: 2
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

  const svg = createSVGTag({
    width: range.width,
    height: range.height,
    image: fs.readFileSync(tmpPngPath, 'base64'),
    url,
    title: decodeURIComponent(title),
    anchors
  })
  fs.unlinkSync(tmpPngPath)

  fs.writeFileSync(`./out/${fileName}.svg`, svg)
  uploadToGoogleCloudStorage({
    fileName,
    text: svg
  })
}

run()
