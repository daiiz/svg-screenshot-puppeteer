const {createSvg} = require('svgize')

const fmt = (text='') => {
  return text.replace(/</g, '').replace(/>/g, '')
}

const sourceStyle = [
  `.source text {
    fill: #888888;
    font-size: 11px;
    font-weight: 400;
    text-decoration: none;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }`,
  `.source text:hover {
    text-decoration: underline;
    fill: #2962FF;
  }`
]

function createSVGTag ({width, height, url, title, image, anchors}) {
  const externals = []
  // Puppeteerによって抽出されたページ内リンク
  for (const anchor of anchors) {
    const {position, text} = anchor
    if (!anchor.url.startsWith('http')) continue
    const external = {
      url: fmt(anchor.url),
      x: position.left,
      y: position.top,
      width: position.width,
      height: position.height,
      text: fmt(text)
    }
    externals.push(external)
  }
  // 出典
  externals.push({
    url: fmt(url),
    text: fmt(title),
    className: 'source',
    x: 4,
    y: height - 4
  })

  return createSvg(`data:image/png;base64,${image}`, {
    width, height,
    className: 'svg-screenshot',
    dataset: {
      url: fmt(url),
      title: fmt(title)
    },
    externals,
    style: sourceStyle,
  })
}

module.exports = {createSVGTag}
