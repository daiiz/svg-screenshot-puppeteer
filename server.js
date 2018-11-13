import polka from 'polka'
import send from '@polka/send-type'
import serveStatic from 'serve-static'
import path from 'path'
import fs from 'fs'
import {core} from './'
import {parseOptions} from './src/setup'

const PORT = 9010
const {PWD} = process.env

const app = polka()

app.get('/range/:range/viewport/:viewport', (req, res) => {
  let {range, viewport} = req.params
  if (!req.query.url) {
    return res.end()
  }
  const url = decodeURIComponent(req.query.url)

  range = range.replace(/-/g, ',')
  viewport = viewport.replace(/-/g, ',')
  const options = parseOptions({url, range, viewport})

  console.log('enqueue', url)
  core(options)

  // res.end(JSON.stringify(options))
  // res.redirect('/0.png')
  const buf = fs.readFileSync('./static/0.png')
  // res.redirect = '/0.png'
  // res.send(buf, {'Content-Type': 'image/png'}, 200)
  // res.end()
  send(res, 200, buf, {'Content-Type': 'image/png'})
})

app.use(serveStatic(path.resolve(PWD, 'static')))
app.listen(PORT, _ => {
  console.log(`> Running on http://localhost:${PORT}`)
})
