// Isolated browser fixture: no customer session and no backend writes.
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const origin = 'http://127.0.0.1:5184';
  const out = path.resolve('Rewear_BackEnd/.artifacts/sourcing-detail-qa');
  fs.mkdirSync(out, { recursive: true });
  const id = '111111111111111111111111';
  const images = ['/images/catalog-drafts/resale-shirt.png', '/images/catalog-drafts/resale-shirt-back.png'];
  let scenario = 'paid';
  const base = {
    id, title: 'Áo khoác đã qua sử dụng', description: 'Đã mặc vài lần, còn sử dụng tốt. Vết xước nhỏ ở tay áo.',
    size: 'M', color: 'Đen', declaredCondition: 2, inspectedCondition: 2,
    customerExpectedPrice: 500000, offeredPrice: 450000, status: 5,
    adminNote: 'Đã kiểm tra và nhận hàng.', imageUrls: images,
    createdAt: '2026-10-24T08:00:00Z',
    payout: { amount: 450000, state: 'Confirmed', reference: 'REF-UI-TEST', paidAt: '2026-10-25T08:00:00Z' },
  };
  const detail = () => scenario === 'unpriced'
    ? { ...base, title: 'Áo chưa định giá', status: 0, offeredPrice: null, payout: null, inspectedCondition: null, imageUrls: [] }
    : scenario === 'long'
      ? { ...base, title: 'Áo khoác '.repeat(18), description: 'Mô tả món đồ dài. '.repeat(80), color: 'Xanh đậm '.repeat(20), adminNote: 'Ghi chú kiểm tra. '.repeat(35) }
      : base;
  const fixture = (url) => {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname === '/api/sourcing/my') return [{ ...detail(), imageUrls: images }];
    if (pathname === '/api/sourcing/' + id) return detail();
    if (pathname.includes('/api/brands') || pathname.includes('/api/categories')) return [];
    if (pathname.includes('/api/profile')) return { fullName: 'Khách kiểm thử' };
    if (pathname.includes('/api/cart')) return { items: [], totalItems: 0 };
    return [];
  };
  const tab = await (await fetch('http://127.0.0.1:9225/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  const pending = new Map(), errors = [], writes = [], results = [];
  let seq = 0;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const callId = ++seq;
    const timer = setTimeout(() => { pending.delete(callId); reject(Error('CDP timeout: ' + method)); }, 20000);
    pending.set(callId, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: reason => { clearTimeout(timer); reject(reason); } });
    ws.send(JSON.stringify({ id: callId, method, params }));
  });
  ws.addEventListener('message', async event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const waiter = pending.get(message.id);
      if (waiter) { pending.delete(message.id); message.error ? waiter.reject(Error(message.error.message)) : waiter.resolve(message.result); }
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params;
      if (request.method !== 'GET') writes.push(request.method + ' ' + request.url);
      await call('Fetch.fulfillRequest', {
        requestId, responseCode: 200,
        responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
        body: Buffer.from(JSON.stringify({ success: true, data: fixture(request.url) })).toString('base64'),
      });
    }
  });
  const evaluate = async expression => {
    const response = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description || 'Evaluation failed');
    return response.result.value;
  };
  const waitFor = async expression => {
    for (let i = 0; i < 120; i += 1) { if (await evaluate(`!!(${expression})`)) return; await sleep(100); }
    throw Error('Timeout: ' + expression);
  };
  const check = (label, passed) => { results.push({ label, passed: !!passed }); if (!passed) throw Error(label); };
  const click = async selector => evaluate(`document.querySelector(${JSON.stringify(selector)})?.click()`);
  const open = async () => {
    await call('Page.navigate', { url: origin + '/profile?tab=sourcing' });
    await waitFor("document.querySelector('.pp-sourcing-item button') && !document.querySelector('.global-loader-overlay')");
    await click('.pp-sourcing-item button');
    await waitFor("document.querySelector('.srd-intro h4') && !document.querySelector('.global-loader-overlay')");
  };
  try {
    await call('Page.enable'); await call('Runtime.enable');
    await call('Fetch.enable', { patterns: [{ urlPattern: '*/api/*' }] });
    const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    const session = JSON.stringify({ token: `fixture.${payload}.fixture`, role: 'MEMBER', fullName: 'Khách kiểm thử' });
    await call('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('auth_session', ${JSON.stringify(session)})` });
    for (const width of [1440, 768, 390, 320]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 850, deviceScaleFactor: 1, mobile: width <= 390 });
      scenario = 'paid'; await open();
      const state = await evaluate(`(() => { const modal=document.querySelector('.srd-dialog'); const body=modal.querySelector('.pp-modal-body'); return {
        width:innerWidth, pageOverflow:document.documentElement.scrollWidth>innerWidth+1,
        modalOverflow:modal.scrollWidth>modal.clientWidth+1, bodyOverflow:body.scrollWidth>body.clientWidth+1,
        title:modal.querySelector('.srd-intro h4')?.innerText,
        prices:[...modal.querySelectorAll('.srd-prices strong')].map(e=>e.innerText),
        payout:modal.querySelector('.srd-payout')?.innerText,
        condition:modal.querySelector('.srd-facts')?.innerText,
        imageWidth:modal.querySelector('.srd-image-stage img')?.getBoundingClientRect().width,
        stageWidth:modal.querySelector('.srd-image-stage')?.getBoundingClientRect().width,
        buttonCount:modal.querySelectorAll('.srd-thumbnails button').length,
        footerVisible:modal.querySelector('.pp-modal-footer')?.getBoundingClientRect().bottom<=innerHeight,
      }; })()`);
      check(`${width}: no horizontal overflow`, !state.pageOverflow && !state.modalOverflow && !state.bodyOverflow);
      check(`${width}: truthful money`, state.prices[0].includes('500.000') && state.prices[1].includes('450.000') && state.payout.includes('ghi nhận chi trả 450.000'));
      check(`${width}: declared and inspected condition`, state.condition.includes('Tình trạng khách khai báo') && state.condition.includes('Tình trạng sau kiểm định'));
      check(`${width}: photo contained and controls visible`, state.imageWidth <= state.stageWidth + 1 && state.buttonCount === 2 && state.footerVisible);
      await click('.srd-thumbnails button:nth-child(2)');
      check(`${width}: second image selected`, await evaluate("document.querySelector('.srd-thumbnails button:nth-child(2)').getAttribute('aria-pressed') === 'true' && document.querySelector('.srd-image-stage img').src.endsWith('resale-shirt-back.png')"));
      if (width === 1440 || width === 390) {
        const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        fs.writeFileSync(path.join(out, `paid-${width}.png`), Buffer.from(shot.data, 'base64'));
      }
    }
    scenario = 'unpriced'; await open();
    check('pending: no invented offer/payout/inspection', await evaluate("document.querySelector('.srd-price-offer').innerText.includes('Chưa có báo giá') && document.querySelector('.srd-payout').innerText.includes('Chưa có xác nhận') && !document.querySelector('.srd-gallery') && !document.querySelector('.srd-facts').innerText.includes('sau kiểm định')"));
    scenario = 'long'; await open();
    check('long content stays within dialog', await evaluate("(() => {const d=document.querySelector('.srd-dialog'); return d.scrollWidth<=d.clientWidth+1 && d.querySelector('.pp-modal-body').scrollWidth<=d.querySelector('.pp-modal-body').clientWidth+1;})()"));
    check('no writes', writes.length === 0);
    check('no runtime errors', errors.length === 0);
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ results, errors, writes }, null, 2));
    console.log(JSON.stringify({ checks: results.length, out, failed: results.filter(result => !result.passed) }));
  } finally {
    await call('Browser.close').catch(() => {});
    ws.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
