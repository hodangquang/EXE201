// Read-only acceptance against actual product/gallery APIs and Cloudinary images.
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const origin = process.env.REWEAR_GALLERY_QA_ORIGIN || 'http://localhost:5173';
  const cdp = process.env.REWEAR_GALLERY_QA_CDP || 'http://127.0.0.1:9239';
  const out = path.resolve('Rewear_BackEnd/.artifacts/gallery-qa');
  fs.mkdirSync(out, { recursive: true });
  const products = await (await fetch(origin + '/api/Products?IsActive=true&Status=0')).json();
  const results = [], errors = [], writes = [];
  const check = (name, passed) => { results.push({ name, passed: !!passed }); if (!passed) throw Error(name); };
  check('Six existing products', products.length === 6);
  for (const product of products) {
    check(`Four distinct images: ${product.title}`, product.imageUrls.length === 4 && new Set(product.imageUrls).size === 4);
    check(`Ordered angle labels: ${product.title}`, JSON.stringify(product.imageLabels) === JSON.stringify(['Mặt trước', 'Mặt sau', 'Góc nghiêng', 'Cận cảnh']));
    const journey = (await (await fetch(origin + '/api/products/' + product.id + '/journey')).json()).data;
    check(`Before photos preserved: ${product.title}`, journey.beforeImages.length === (product.productType === 'Upcycled' ? 1 : 0) && journey.afterImages.length === 4);
  }
  const tab = await (await fetch(cdp + '/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let sequence = 0;
  const pending = new Map();
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timed out: ' + method)); }, 20000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { const item = pending.get(message.id); if (item) { pending.delete(message.id); message.error ? item.reject(Error(message.error.message)) : item.resolve(message.result); } }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Network.requestWillBeSent') { const request = message.params.request; if (request.url.includes('/api/') && !['GET', 'OPTIONS'].includes(request.method)) writes.push(request.method); }
  });
  const evaluate = async expression => {
    const response = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description || 'Browser evaluation failed');
    return response.result.value;
  };
  const waitFor = async expression => {
    for (let attempt = 0; attempt < 150; attempt++) { if (await evaluate(`!!(${expression})`)) return; await sleep(100); }
    throw Error('Timed out: ' + expression);
  };
  try {
    await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
    for (const width of [1440, 768, 390]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 500 });
      for (const product of products) {
        await call('Page.navigate', { url: origin + '/product/' + product.id });
        await waitFor("document.querySelectorAll('.rains-detail-switch-btn').length === 4 && !document.querySelector('.global-loader-overlay')");
        check(`Hero has distinct consecutive views ${width}/${product.id}`, await evaluate("new Set([...document.querySelectorAll('.rains-conveyor-img')].slice(0,4).map(img=>img.src)).size === 4"));
        check(`Close-up is the default detail ${width}/${product.id}`, await evaluate(`document.querySelector('.rains-detail-img').src === ${JSON.stringify(product.imageUrls[3])}`));
        await evaluate("document.querySelector('#product-details').scrollIntoView({block:'start',behavior:'instant'})");
        for (let index = 0; index < 4; index++) {
          await evaluate(`document.querySelectorAll('.rains-detail-switch-btn')[${index}].click()`);
          await waitFor(`document.querySelector('.rains-detail-img').src === ${JSON.stringify(product.imageUrls[index])} && document.querySelector('.rains-detail-img').complete && document.querySelector('.rains-detail-img').naturalWidth > 0`);
          check(`Angle selector ${product.imageLabels[index]} ${width}/${product.id}`, await evaluate(`document.querySelectorAll('.rains-detail-switch-btn')[${index}].getAttribute('aria-pressed') === 'true'`));
        }
        check(`No horizontal overflow ${width}/${product.id}`, await evaluate('document.documentElement.scrollWidth <= innerWidth'));
        check(`All angle buttons stay on screen ${width}/${product.id}`, await evaluate("[...document.querySelectorAll('.rains-detail-switch-btn')].every(button=>{const r=button.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})"));
        if (product.id === products[0].id) {
          await sleep(400);
          await call('Page.captureScreenshot', { format: 'png' }).then(image => fs.writeFileSync(path.join(out, `detail-${width}.png`), Buffer.from(image.data, 'base64')));
          await evaluate("document.querySelector('.rains-zoom-badge').click()");
          await waitFor("document.querySelector('dialog[open] .rains-lightbox-img')");
          check(`Zoom opens ${width}`, await evaluate("document.querySelector('dialog[open]') !== null"));
          await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
          await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
          await waitFor("!document.querySelector('dialog[open]')");
        }
      }
    }
    check('No API writes', writes.length === 0);
    check('No browser exceptions', errors.length === 0);
    console.log(JSON.stringify({ passed: results.length, evidence: out }));
  } finally {
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ results, errors, writes, source: 'Actual local API, actual Cloudinary images; no fixtures or interception.' }, null, 2));
    await call('Page.close').catch(() => {}); ws.close();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
