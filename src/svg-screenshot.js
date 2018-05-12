export function createSVGTag ({ width, height, url, title, image, anchors }) {
  const aTags = []
  for (const anchor of anchors) {
    const pos = anchor.position
    const aTag = `
    <a
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xlink:href="${anchor.url}">
      <rect width="${pos.width}" height="${pos.height}" x="${pos.left}" y="${pos.top}" fill="rgba(0,0,0,0)"></rect>
      <text x="${pos.left}" y="${pos.top + 16}" fill="rgba(0,0,0,0)">
        ${anchor.text}
      </text>
    </a>`
    aTags.push(aTag)
  }
  const sourece = createSourceTag(url, title, height)
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"
    width="${width}" height="${height}">
    <style>
      a { cursor: pointer; }
    </style>
    <image
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="${width}" height="${height}" x="0" y="0"
      xlink:href="data:image/png;base64,${image}"></image>
    ${aTags.join('\n')}
    ${sourece.style}
    ${sourece.a}
  </svg>`
  return svg
}

const createSourceTag = (uri, title, height) => {
  const svgns = 'http://www.w3.org/2000/svg'
  const hrefns = 'http://www.w3.org/1999/xlink'

  // style
  const style = `
  <style>
    text.source {
      fill: #888888;
      font-size: 11px;
      font-weight: 400;
      text-decoration: none;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    text.source:hover {
      text-decoration: underline;
      fill: #2962FF;
    }
  </style>`

  const a = `
  <a
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xlink:href="${uri}"
    target="_blank"
    class="source">
    <text
      x="4"
      y="${height - 4}"
      class="source">
      ${title}
    </text>
  </a>`

  return { style, a }
}
