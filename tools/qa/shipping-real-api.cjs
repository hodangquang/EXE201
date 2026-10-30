// Browser acceptance against the test-owned API/Mongo database. No API interception.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), { spawn } = require('node:child_process');
const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(config.api)) throw Error('Only a test-owned local API is allowed');
const out = path.resolve('Rewear_BackEnd/.artifacts/delivery-browser'); fs.mkdirSync(out, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let chrome, vite, ws; const errors = [], results = [], apiRequests = [];
async function run() {
  vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5197', '--strictPort'], { env: { ...process.env, VITE_API_BASE_URL: config.api }, windowsHide: true, stdio: 'ignore' });
  const browser = process.env.REWEAR_QA_CHROME || path.join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1234/chrome-win64/chrome.exe');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rewear-delivery-chrome-'));
  chrome = spawn(browser, ['--headless=new', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=9226', '--remote-allow-origins=*', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  chrome.on('error', error => errors.push(error.message)); vite.on('error', error => errors.push(error.message));
  for (let i = 0; i < 60; i++) { try { if ((await fetch('http://127.0.0.1:5197')).ok && (await fetch('http://127.0.0.1:9226/json/version')).ok) break; } catch {} if (i === 59) throw Error('Local browser/frontend startup failed: ' + errors.join('; ')); await sleep(400); }
  const tab = await (await fetch('http://127.0.0.1:9226/json/new?about:blank', { method: 'PUT' })).json();
  ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r, { once: true }));
  let seq = 0, scriptId; const pending = new Map();
  const call = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; const timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout ' + method)); }, 15000); pending.set(id, { resolve: r => { clearTimeout(timer); resolve(r); }, reject: e => { clearTimeout(timer); reject(e); } }); ws.send(JSON.stringify({ id, method, params })); });
  ws.addEventListener('message', event => { const m = JSON.parse(event.data); if (m.id) { const p = pending.get(m.id); if (p) { pending.delete(m.id); m.error ? p.reject(Error(m.error.message)) : p.resolve(m.result); } } else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); else if (m.method === 'Network.requestWillBeSent' && m.params.request.url.includes('/api/')) apiRequests.push(m.params.request.url); });
  await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
  const js = async expression => { const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description); return r.result.value; };
  const until = async (expression, label) => { for (let i = 0; i < 100; i++) { if (await js(expression)) return; await sleep(100); } throw Error('Not ready: ' + label + '\n' + await js('document.body.innerText')); };
  const click = async (text, selector = 'button') => { await until(`(()=>{const b=[...document.querySelectorAll(${JSON.stringify(selector)})].find(e=>e.innerText.trim()===${JSON.stringify(text)}&&!e.disabled);if(b){b.click();return true;}return false})()`, text); await sleep(150); };
  const select = async (selector, label) => {
    await until("!document.querySelector('.ant-modal-confirm')", 'confirmation closed');
    await until(`!!document.querySelector(${JSON.stringify(selector)})`, selector);
    await js(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
    await sleep(150);
    const point = await js(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).closest('.ant-select').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await call('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await call('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
    await until(`(()=>{const e=[...document.querySelectorAll('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')].find(e=>e.innerText.trim()===${JSON.stringify(label)});if(e){e.click();return true;}return false})()`, label);
    await sleep(200);
  };
  const navigate = async (role, route) => {
    if (scriptId) await call('Page.removeScriptToEvaluateOnNewDocument', { identifier: scriptId });
    scriptId = (await call('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('auth_session',${JSON.stringify(JSON.stringify(config[role]))})` })).identifier;
    await call('Page.navigate', { url: 'http://127.0.0.1:5197' + route }); await until("!!document.querySelector('h1,h2') && !document.querySelector('.ant-skeleton-active') && !document.querySelector('.ant-spin-spinning')", route);
    await until("!document.querySelector('.global-loader-overlay')", 'loading overlay cleared'); await sleep(300);
  };
  const visibleText = text => `document.body.innerText.includes(${JSON.stringify(text)})`;
  const shot = async name => { const screen = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(screen.data, 'base64')); };
  const verifyLayout = async (name, route, role) => {
    for (const width of [390, 768, 1440]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width === 390 });
      await navigate(role, route); const overflow = await js('document.documentElement.scrollWidth > innerWidth + 1'); if (overflow) throw Error('Horizontal overflow: ' + name + ' ' + width);
      await shot(name + '-' + width); results.push({ name, width, overflow });
      if (name === 'customer-tracking') { await until("document.querySelectorAll('.pp-tracking-section').length===3", 'inline tracking ready'); await js("document.querySelectorAll('.pp-tracking-section')[1].scrollIntoView({block:'start'})"); await shot(name + '-detail-' + width); }
    }
  };
  await verifyLayout('dispatch-queue', '/shipping', 'staff');
  await click('Xem vận chuyển'); await until(visibleText('Phân công người giao hàng'), 'assignment form');
  await select('.ant-modal [role=combobox]', config.shipper.fullName);
  await click('Phân công giao hàng'); await until(visibleText('Chờ lấy hàng'), 'assigned state'); results.push({ flow: 'staff-assignment' });
  await verifyLayout('shipper-list', '/shipper/orders', 'shipper');
  await verifyLayout('shipper-detail', '/shipper/orders/' + config.orderId, 'shipper');
  if (!await js("!!document.querySelector('.ant-layout-sider') && !!document.querySelector('.rw-admin-header')")) throw Error('Shipper must reuse admin layout');
  if (await js("[...document.querySelectorAll('.ant-layout-sider .ant-menu-item')].some(e=>e.innerText.trim()!=='Đơn giao của tôi')")) throw Error('Shipper sees admin menu');
  if (await js("!!document.querySelector('[aria-label=\"Thông báo minh họa\"]')")) throw Error('Shipper sees internal demo notifications');
  results.push({ flow: 'shared-admin-layout-restricted-menu' });
  await select('.ant-modal form #status', 'Đã lấy hàng'); await click('Lưu cập nhật'); await click('Xác nhận cập nhật'); await until("document.querySelector('.shipping-detail')?.innerText.includes('Đã lấy hàng')", 'pickup persisted');
  await select('.ant-modal form #status', 'Đang giao'); await until("!!document.querySelector('.ant-modal #trackingNumber')", 'tracking input');
  await js("(()=>{const input=document.querySelector('.ant-modal #trackingNumber');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'RW-QA-DELIVERY');input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await click('Lưu cập nhật'); await click('Xác nhận cập nhật'); await until("document.querySelector('.shipping-detail')?.innerText.includes('Đang giao')", 'transit persisted');
  await navigate('customer', '/profile/orders/' + config.orderId); await until(visibleText('Đang giao'), 'customer sees transit');
  await until(visibleText('Người giao hàng:'), 'member sees assigned shipper');
  if (await js("[...document.querySelectorAll('.pp-menu button')].some(e=>e.innerText.includes('Lịch sử'))")) throw Error('Duplicate member history menu');
  if (await js(visibleText('Giao hàng thành công'))) throw Error('Customer sees future completion');
  await navigate('shipper', '/shipper/orders/' + config.orderId); await select('.ant-modal form #status', 'Đã giao'); await click('Lưu cập nhật'); await click('Xác nhận cập nhật'); await until("document.querySelector('.shipping-detail')?.innerText.includes('Đã giao')", 'delivery persisted');
  results.push({ flow: 'shipper-pickup-transit-delivery-via-ui' });
  await verifyLayout('customer-tracking', '/profile/orders/' + config.orderId, 'customer');
  await until(visibleText('Giao hàng thành công'), 'customer sees actual delivery'); await until(visibleText('Đã thanh toán'), 'payment status');
  results.push({ flow: 'customer-sees-same-history' });
  await navigate('customer', '/profile?tab=history'); await until("location.search==='?tab=orders'", 'legacy history redirect'); await click('Theo dõi đơn hàng'); await until(visibleText('Giao hàng thành công'), 'tracking inside purchases');
  if (await js("document.querySelectorAll('.pp-order').length") !== 1) throw Error('Duplicate order cards');
  results.push({ flow: 'single-purchases-section-with-inline-tracking-and-legacy-alias' });
  await navigate('emptyShipper', '/shipper/orders'); await until(visibleText('Bạn chưa có đơn được phân công'), 'empty shipper'); results.push({ flow: 'empty-state' });
  await navigate('emptyShipper', '/shipper/orders/' + config.orderId); await until(visibleText('Không tải được thông tin vận chuyển.'), 'foreign order error'); results.push({ flow: 'foreign-order-error' });
  if (apiRequests.some(url => !url.startsWith(config.api + '/api/'))) throw Error('Non-test API request');
  if (errors.length) throw Error(errors.join('\n'));
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ environment: 'Real local controllers/JWT/Mongo; payment provider is test double', checks: results, apiRequestCount: apiRequests.length, runtimeErrors: errors }, null, 2));
  console.log(JSON.stringify({ out, checks: results.length, apiRequestCount: apiRequests.length, runtimeErrors: errors }));
}
run().catch(error => { console.error(error.stack); process.exitCode = 1; }).finally(() => { ws?.close(); chrome?.kill(); vite?.kill(); });
