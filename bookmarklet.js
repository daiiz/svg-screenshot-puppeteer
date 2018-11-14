const func = () => {
  const appUrl = 'http://localhost:9010'
  const body = document.querySelector('body');
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.width = '100%';
  wrapper.style.height = '100%';
  wrapper.style.left = '0px';
  wrapper.style.top = '0px';
  wrapper.style.cursor = 'crosshair';
  wrapper.style.zIndex = 30010;

  const rect = document.createElement('div');
  rect.style.backgroundColor = '#ccc';
  rect.style.opacity = .5;
  rect.style.position = 'absolute';
  rect.style.zIndex = 30000;

  let start = { x: 0, y: 0 };
  wrapper.addEventListener('mousedown', event => {
    const {pageX, pageY} = event;
    start.x = pageX;
    rect.style.left = `${start.x}px`;
    start.y = pageY;
    rect.style.top = `${start.y}px`;
    rect.style.width = '0px';
    rect.style.height = '0px';
    body.appendChild(rect);
  }, false);

  const updateRect = (event) => {
    const {pageX, pageY} = event;
    const width = pageX - start.x;
    const height = pageY - start.y;
    rect.style.width = `${width}px`;
    rect.style.height = `${height}px`;
    return {width, height};
  };

  wrapper.addEventListener('mousemove', updateRect, false);
  wrapper.addEventListener('mouseup', event => {
    const {width, height} = updateRect(event);
    const url = location.href;
    const viewport = `${window.innerWidth}-${window.innerHeight}`;
    const range = `${start.x}-${start.y}-${width}-${height}`;
    const endpoint = `${appUrl}/range/${range}/viewport/${viewport}?url=${encodeURIComponent(url)}`
    const y = prompt('puppeteer-svg-screenshot', endpoint)
    if (y) {
      const img = new Image()
      img.onload = function () {
      }
      img.onerror = function () {
        window.open(endpoint)
      }
      img.src = endpoint
    }
    wrapper.remove()
    rect.remove();
  }, false);

  body.appendChild(wrapper);
};
func();
