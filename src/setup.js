import argv from 'argv'

export function getArgs () {
  // target page URL
  argv.option({
    name: 'url',
    short: 'u',
    type: 'string'
  })

  // range `left,top,width,height`
  argv.option({
    name: 'range',
    short: 'r',
    type: 'string'
  })

  // window inneSize `width,height`
  argv.option({
    name: 'viewport',
    short: 'v',
    type: 'string'
  })

  const {options} = argv.run()
  // const range = (options.range || '0,0,300,300').split(',').map(px => parseInt(px.trim()))
  // const window = (options.viewport || '600,400').split(',').map(px => parseInt(px.trim()))
  // const res = {
  //   url: options.url,
  //   range: {
  //     x: range[0],
  //     y: range[1],
  //     width: range[2],
  //     height: range[3],
  //     scroll: {
  //       x: range[0],
  //       y: range[1]
  //     },
  //     page: {
  //       left: range[0],
  //       top: range[1],
  //     }
  //   },
  //   window: {
  //     width: window[0],
  //     height: Math.max(window[1], (range[1] + range[3]))
  //   }
  // }
  return parseOptions(options)
}

export const parseOptions = options => {
  const range = (options.range || '0,0,300,300').split(',').map(px => parseInt(px.trim()))
  const win = (options.viewport || '600,400').split(',').map(px => parseInt(px.trim()))
  const res = {
    url: options.url,
    range: {
      x: range[0],
      y: range[1],
      width: range[2],
      height: range[3],
      scroll: {
        x: range[0],
        y: range[1]
      },
      page: {
        left: range[0],
        top: range[1],
      }
    },
    win: {
      width: win[0],
      height: Math.max(win[1], (range[1] + range[3]))
    }
  }
  return res
}
