// Read-only acceptance against the actual local API and the user's Vite server.
// No authentication, intercepts, fixtures or database writes.
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const origin = process.env.REWEAR_CATALOG_QA_ORIGIN || 'http://localhost:5173';
  const cdp = process.env.REWEAR_CATALOG_QA_CDP || 'http://127.0.0.1:9238';
  const out = path.resolve('Rewear_BackEnd/.artifacts/catalog-storefront-qa');
  fs.mkdirSync(out, { recursive: true });
  const products = await (await fetch(origin + '/api/Products?IsActive=true&Status=0')).json();
  const results = [], errors = [], apiWrites = [];
  const check = (name, passed) => { results.push({ name, passed: !!passed }); if (!passed) throw Error(name); };
  check('Actual API exposes exactly six new products', products.length === 6);
  check('Test and former names are absent', products.every(product => !/test|levi|iphone|^t1$/i.test(product.title)));
  check('All images come from persisted HTTPS URLs', products.every(p => p.imageUrls.length && p.imageUrls.every(url => url.startsWith('https://res.cloudinary.com/'))));
  check('Physical stock and condition remain unconfirmed', products.every(p => p.isPreview && p.stockQuantity === 0 && p.condition === null));
  const tab = await (await fetch(cdp + '/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let sequence = 0;
  const pending = new Map();
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout: ' + method)); }, 20000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id);
      if (task) { pending.delete(message.id); message.error ? task.reject(Error(message.error.message)) : task.resolve(message.result); }
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Network.requestWillBeSent') {
      const request = message.params.request;
      if (request.url.includes('/api/') && !['GET', 'OPTIONS'].includes(request.method)) apiWrites.push(request.method);
    }
  });
  const evaluate = async expression => {
    const response = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description || 'Browser evaluation failed');
    return response.result.value;
  };
  const waitFor = async expression => {
    for (let i = 0; i < 120; i++) { if (await evaluate(`!!(${expression})`)) return; await sleep(150); }
    throw Error('Timed out: ' + expression);
  };
  const navigate = async route => {
    await call('Page.navigate', { url: origin + route });
    await waitFor("document.readyState === 'complete' && !document.querySelector('.global-loader-overlay')");
  };
  const click = async text => {
    await evaluate(`(()=>{const button=[...document.querySelectorAll('button')].find(el=>el.textContent.trim()===${JSON.stringify(text)});if(!button)throw Error('Missing button');button.click();})()`);
    await sleep(250);
  };
  try {
    await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
    for (const width of [1440, 768, 390]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 500 });
      await navigate('/new-in');
      await waitFor("document.querySelectorAll('.new-in-product-card').length === 6");
      await evaluate("document.querySelector('.new-in-grid').scrollIntoView({block:'start',behavior:'instant'})");
      await waitFor("[...document.querySelectorAll('.new-in-product-card img:not([aria-hidden])')].every(img=>img.complete && img.naturalWidth>0)");
      // Let decoded CDN images reach the compositor before capturing visual evidence.
      await sleep(1000);
      check(`Six actual cards at ${width}px`, await evaluate("document.querySelectorAll('.new-in-product-card').length === 6"));
      check(`New images decode at ${width}px`, await evaluate("document.querySelectorAll('.new-in-product-card img:not([aria-hidden])').length === 6"));
      check(`No AI labels at ${width}px`, await evaluate("document.querySelectorAll('.catalog-ai-label').length === 0"));
      check(`No horizontal overflow at ${width}px`, await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      await call('Page.captureScreenshot', { format: 'png' }).then(image => fs.writeFileSync(path.join(out, `listing-${width}.png`), Buffer.from(image.data, 'base64')));
      for (const product of products.filter(p => p.productType === 'Upcycled')) {
        await navigate('/product/' + product.id);
        await waitFor("document.querySelector('.rw-journey-switch') && document.querySelector('.rw-journey-images img')");
        await evaluate("document.querySelector('.rw-product-journey').scrollIntoView({block:'start',behavior:'instant'})");
        await waitFor("[...document.querySelectorAll('.rw-journey-images img')].every(img=>img.complete && img.naturalWidth>0)");
        const before = await evaluate("document.querySelector('.rw-journey-images img').src");
        await click('Sau tái chế');
        await waitFor("[...document.querySelectorAll('.rw-journey-images img')].every(img=>img.complete && img.naturalWidth>0)");
        check(`Before and after differ for ${product.title} at ${width}px`, before !== await evaluate("document.querySelector('.rw-journey-images img').src"));
        check(`Preview cannot be added to cart at ${width}px for ${product.id}`, await evaluate("document.querySelector('.rains-add-to-cart-btn').disabled && document.querySelector('.rains-add-to-cart-btn').innerText.includes('SẮP MỞ BÁN')"));
        check(`No invented QC timeline at ${width}px for ${product.id}`, await evaluate("!document.querySelector('.rw-journey-timeline')"));
        if (product.id === products[0].id) await call('Page.captureScreenshot', { format: 'png' }).then(image => fs.writeFileSync(path.join(out, `upcycling-${width}.png`), Buffer.from(image.data, 'base64')));
      }
      await navigate('/product/' + products.find(p => p.productType === 'SecondHand').id);
      await waitFor("document.querySelector('.rw-journey-images img')");
      check(`Resale has no before/after selector at ${width}px`, await evaluate("!document.querySelector('.rw-journey-switch')"));
    }
    await navigate('/');
    await waitFor("document.querySelectorAll('.rw-prod-item').length === 6");
    check('Home receives six products without AI labels', await evaluate("document.querySelectorAll('.rw-prod-item').length === 6 && document.querySelectorAll('.rw-prod-ai-label').length === 0"));
    check('No API write during acceptance', apiWrites.length === 0);
    check('No unhandled browser error', errors.length === 0);
    console.log(JSON.stringify({ passed: results.length, evidence: out }));
  } finally {
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ results, errors, apiWrites, source: 'Actual local API and Cloudinary images; no intercepted API responses.' }, null, 2));
    await call('Page.close').catch(() => {}); ws.close();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
