// UI acceptance only. Synthetic sessions stay in an isolated headless browser;
// all /api/* requests are intercepted. No live product or stock is written.
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const origin = process.env.REWEAR_DRAFT_QA_ORIGIN || 'http://127.0.0.1:5198';
  const cdp = process.env.REWEAR_DRAFT_QA_CDP || 'http://127.0.0.1:9237';
  const out = path.resolve('Rewear_BackEnd/.artifacts/catalog-drafts-qa');
  fs.mkdirSync(out, { recursive: true });
  const tab = await (await fetch(`${cdp}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let sequence = 0, catalogFailure = false;
  const pending = new Map(), errors = [], requests = [], results = [];
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timed out: ${method}`)); }, 15000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  ws.addEventListener('message', async event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id);
      if (task) { pending.delete(message.id); message.error ? task.reject(Error(message.error.message)) : task.resolve(message.result); }
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Fetch.requestPaused') {
      if (new URL(message.params.request.url).pathname === '/catalog/rewear-drafts.json') {
        await call(catalogFailure ? 'Fetch.fulfillRequest' : 'Fetch.continueRequest', catalogFailure
          ? { requestId: message.params.requestId, responseCode: 503, body: '' }
          : { requestId: message.params.requestId });
        return;
      }
      requests.push(message.params.request.method);
      await call('Fetch.fulfillRequest', { requestId: message.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from('[]').toString('base64') });
    }
  });
  const evaluate = async expression => {
    const response = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) throw Error(`${response.exceptionDetails.exception?.description || 'Browser expression failed'}; expression: ${expression}`);
    return response.result.value;
  };
  const check = (name, passed) => { results.push({ name, passed: !!passed }); if (!passed) throw Error(`Failed: ${name}`); };
  const count = () => evaluate('document.querySelectorAll(".rw-drafts-card").length');
  const click = async text => {
    const clicked = await evaluate(`(()=>{const button=[...document.querySelectorAll('button')].find(el=>el.textContent.trim()===${JSON.stringify(text)});button?.click();return !!button;})()`);
    if (!clicked) throw Error(`Missing button: ${text}`);
    await sleep(200);
  };
  const navigate = async route => {
    await call('Page.navigate', { url: origin + route });
    for (let attempt = 0; attempt < 80; attempt++) {
      if (await evaluate('!!document.querySelector(".rw-drafts-grid, .rw-drafts[role=alert], .login-page, input[type=password]")')) break;
      await sleep(100);
    }
    await sleep(150);
  };
  try {
    await call('Page.enable');
    await call('Runtime.enable');
    await call('Fetch.enable', { patterns: [{ urlPattern: '*/api/*' }] });
    const sessionScript = await call('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('auth_session', JSON.stringify({role:'ADMIN', fullName:'Quản trị kiểm thử', token:'draft-ui-fixture'}));` });
    for (const width of [1440, 768, 390]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 500 });
      await navigate('/products/drafts');
      check(`All six proposals at ${width}px`, await count() === 6);
      check(`No horizontal overflow at ${width}px`, await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      check(`Draft status without AI label at ${width}px`, await evaluate('document.body.innerText.includes("Bản nháp — chưa mở bán") && !document.body.innerText.includes("Ảnh minh họa được tạo bằng AI")'));
      check(`Draft notice has a light background at ${width}px`, await evaluate("getComputedStyle(document.querySelector('.rw-drafts .ant-alert-info')).backgroundColor === 'rgb(247, 247, 242)'"));
      await click('Tái chế sáng tạo');
      check(`Upcycling filter at ${width}px`, await count() === 2);
      await evaluate('document.querySelector(".rw-drafts-photo").click()');
      await sleep(300);
      check(`Before and four after views at ${width}px`, await evaluate('document.querySelectorAll(".rw-drafts-comparison figure").length === 5 && document.querySelectorAll(".rw-drafts-comparison img")[0].src !== document.querySelectorAll(".rw-drafts-comparison img")[1].src'));
      check(`Five downloadable images at ${width}px`, await evaluate('document.querySelectorAll(".rw-drafts-comparison a[download]").length === 5'));
      await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await sleep(350);
      check(`Escape closes dialog at ${width}px`, await evaluate("![...document.querySelectorAll('.ant-modal-wrap')].some(element => getComputedStyle(element).display !== 'none')"));
      await click('Bán lại');
      check(`Resale filter at ${width}px`, await count() === 4);
      await evaluate('document.querySelector(".rw-drafts-photo").click()');
      await sleep(250);
      check(`Resale shows four current views at ${width}px`, await evaluate('document.querySelectorAll(".rw-drafts-comparison figure").length === 4 && !document.querySelector(".rw-drafts-detail").innerText.includes("Trước tái chế")'));
      await evaluate('document.querySelector(".ant-modal-close").click()');
      await sleep(350);
      await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }).then(screenshot => fs.writeFileSync(path.join(out, `catalog-${width}.png`), Buffer.from(screenshot.data, 'base64')));
    }
    await click('Tất cả');
    await evaluate(`(()=>{const input=document.querySelector('.rw-drafts-tools input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'khong-ton-tai-000');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await sleep(200);
    check('Search has a useful empty state', await count() === 0 && await evaluate('document.body.innerText.includes("Không có sản phẩm phù hợp")'));
    const catalog = await (await fetch(origin + '/catalog/rewear-drafts.json')).json();
    check('Export is draft data with unconfirmed stock', catalog.status === 'Draft' && catalog.products.every(p => p.stockQuantity === null && p.condition === null));
    for (const product of catalog.products) {
      for (const asset of [...product.imageUrls, ...product.beforeImages]) {
        const response = await fetch(origin + asset);
        check(`Image is served: ${asset}`, response.ok && response.headers.get('content-type').startsWith('image/'));
        check(`Image decodes: ${asset}`, await evaluate(`(async()=>{const img=new Image();img.src=${JSON.stringify(asset)};await img.decode();return img.naturalWidth===1024 && img.naturalHeight===1536;})()`));
      }
    }
    await call('Fetch.enable', { patterns: [{ urlPattern: '*/api/*' }, { urlPattern: '*/catalog/rewear-drafts.json' }] });
    catalogFailure = true;
    await navigate('/products/drafts');
    check('Static data failure is explained', await evaluate('document.body.innerText.includes("Chưa tải được bộ sản phẩm")'));
    catalogFailure = false;
    await click('Thử lại');
    for (let attempt = 0; attempt < 30 && await count() !== 6; attempt++) await sleep(100);
    check('Retry recovers the collection', await count() === 6);
    await call('Page.removeScriptToEvaluateOnNewDocument', { identifier: sessionScript.identifier });
    await evaluate("localStorage.setItem('auth_session', JSON.stringify({role:'STAFF',token:'draft-ui-fixture'}))");
    await navigate('/products/drafts');
    check('Staff can review proposals', await count() === 6);
    await evaluate("localStorage.removeItem('auth_session')");
    await call('Page.navigate', { url: origin + '/products/drafts' });
    await sleep(700);
    check('Anonymous access redirects to login', await evaluate("location.pathname === '/login'"));
    check('No API write happened', requests.every(method => method === 'GET'));
    check('No unhandled browser exception', errors.length === 0);
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ results, errors, evidence: 'Chromium with isolated fixture sessions; no live backend writes.' }, null, 2));
    console.log(JSON.stringify({ passed: results.length, screenshots: out }));
  } finally {
    await call('Page.close').catch(() => {});
    ws.close();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
