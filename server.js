const polka = require('polka')
const send = require('@polka/send-type')
const serveStatic = require('serve-static')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const core = require('.')
const parseOptions = require('./src/setup')

const PORT = 9010
const {PWD} = process.env

const app = polka()

app.get('/range/:range/viewport/:viewport', (req, res) => {
  let {range, viewport} = req.params
  if (!req.query.url) {
    return res.end()
  }
  const url = req.query.url

  range = range.replace(/-/g, ',')
  viewport = viewport.replace(/-/g, ',')
  const options = parseOptions({url, range, viewport})

  console.log(chalk.cyan(`enqueue: ${url}`))
  core(options)

  const buf = fs.readFileSync('./static/0.png')
  send(res, 200, buf, {'Content-Type': 'image/png'})
})

app.use(serveStatic(path.resolve(PWD, 'static')))
app.listen(PORT, _ => {
  console.log(`> Running on http://localhost:${PORT}`)
})
