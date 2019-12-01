import polka from 'polka'
import send from '@polka/send-type'
import serveStatic from 'serve-static'
import path from 'path'
import fs from 'fs'
import {core} from './'
import {parseOptions} from './src/setup'
const chalk = require('chalk')

const PORT = process.env.PORT || 9010
const {PWD} = process.env

const app = polka()

app.get('/range/:range/viewport/:viewport', async (req, res) => {
  let {range, viewport} = req.params
  if (!req.query.url) {
    return res.end()
  }
  const url = req.query.url

  range = range.replace(/-/g, ',')
  viewport = viewport.replace(/-/g, ',')
  const options = parseOptions({url, range, viewport})

  console.log(chalk.cyan(`enqueue: ${url}`))
  const imageName = await core(options)

  const imagePath = imageName ? `./out/${imageName}.svg` : './static/0.png'
  const contentType = imageName ? 'image/svg+xml' : 'image/png'
  const buf = await fs.promises.readFile(imagePath)
  console.log(imageName)
  send(res, 200, buf, { 'Content-Type': contentType })
})

app.use(serveStatic(path.resolve(PWD, 'static')))
app.listen(PORT, _ => {
  console.log(`> Running on http://localhost:${PORT}`)
})
