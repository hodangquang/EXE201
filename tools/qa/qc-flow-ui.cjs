const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const out=path.resolve('Rewear_BackEnd/.artifacts/qc-flow-ui');fs.mkdirSync(out,{recursive:true});
 const tab=await(await fetch('http://127.0.0.1:9224/json/new?about:blank',{method:'PUT'})).json();
 const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let seq=0,scenario='populated';const pending=new Map(),errors=[],requests=[];const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;const timeout=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},15000);pending.set(id,{resolve:value=>{clearTimeout(timeout);resolve(value)},reject:error=>{clearTimeout(timeout);reject(error)}});ws.send(JSON.stringify({id,method,params}));});
 const now=new Date().toISOString(),pid='111111111111111111111111',source='222222222222222222222222',projectId='333333333333333333333333',orderId='444444444444444444444444';
 const inventory=[{id:source,sourcingId:source,title:'Quần Jeans kiểm thử giao diện',state:'AvailableRaw',acquisitionCost:100000,location:'Kho REWEAR',images:[],createdAt:now}];
 const project={id:projectId,title:'Túi Tote kiểm thử giao diện',concept:'Tái chế từ Jeans',state:'QualityCheck',inventoryIds:[source],beforeImages:[],afterImages:[],costs:[{idempotencyKey:'qa',kind:'Labor',amount:70000,note:'Chi phí kiểm thử'}],acquisitionCost:100000,responsibleStaffId:pid,createdAt:now,timeline:[{to:'QualityCheck',at:now,note:'Chờ kiểm định'}]};
 const order={id:orderId,orderCode:'RW-UI-FIXTURE',status:'Confirmed',totalAmount:299000,paymentStatus:'Paid',createdAt:now,shippingAddress:{recipientName:'Người nhận kiểm thử',phoneNumber:'0000000000',fullAddress:'Địa chỉ kiểm thử'},items:[{id:pid,productId:pid,productTitle:'Túi Tote kiểm thử',quantity:1,unitPrice:299000,lineTotal:299000}]};
 function fixture(url){const p=new URL(url).pathname;
  if(p.toLowerCase().startsWith('/api/cart') && p.toLowerCase().includes('count'))return 0;
  if(p.toLowerCase().startsWith('/api/cart'))return {items:[],totalItems:0,totalAmount:0};
  if(p.endsWith('/metrics'))return {receivedRevenue:299000,refundedAmount:0,netReceipts:299000,purchasePayouts:100000,productionSpending:70000,estimatedGrossProfit:129000,unknownCostOrders:0,reconciliationCases:0,orders:[{state:'Delivered',count:1}],inventory:[{state:'Consumed',count:1}],projects:[{state:'Completed',count:1}]};
  if(p==='/api/operations/shippers')return [{id:pid,fullName:'Người giao hàng kiểm thử'}];
  if(p==='/api/shipping/queue')return {items:[{orderId,orderCode:order.orderCode,shippingStatus:'Pending'}]};
  if(p==='/api/shipping/'+orderId)return {status:'Pending',trackingNumber:'',attemptCount:0};
  if(p==='/api/orders')return {orders:[{...order,status:'Delivered'}],totalCount:1,totalPages:1};
  if(p==='/api/orders/code/'+order.orderCode)return {...order,status:'Delivered'};
  if(p==='/api/orders/'+orderId+'/tracking')return {timeline:[{toStatus:'Delivered',note:'Đã giao hàng, mốc kiểm thử',createdAt:now}]};
  if(p==='/api/operations/inventory')return scenario==='empty'?[]:inventory;
  if(p.endsWith('/movements'))return [{id:pid,toState:'AvailableRaw',reason:'Đã ghi nhận chi trả',createdAt:now}];
  if(p==='/api/operations/projects')return scenario==='empty'?[]:[project];
  if(p==='/api/operations/projects/'+projectId)return {project,inspections:[]};
  if(p==='/api/operations/operators')return [{id:pid,fullName:'Nhân viên kiểm thử'}];
  if(p==='/api/operations/orders')return {items:scenario==='empty'?[]:[order],page:1,pageSize:20,total:scenario==='empty'?0:1};
  if(p==='/api/operations/orders/'+orderId)return {order,payment:{status:'Paid',amount:299000,paidAt:now},shipping:null,history:[{id:pid,toStatus:1,note:'Đã xác nhận thanh toán',createdAt:now}]};
  if(p==='/api/Sourcing')return [{id:source,title:'Quần Jeans kiểm thử',customerName:'Người gửi kiểm thử',status:scenario==='received'?4:5,offeredPrice:100000,acceptedOfferPrice:100000,declaredCondition:2,imageUrls:[],payout:scenario==='received'?null:{amount:100000,state:'Confirmed',reference:'fixture'},createdAt:now}];
  if(p==='/api/Sourcing/'+source)return {id:source,title:'Quần Jeans kiểm thử',customerName:'Người gửi kiểm thử',status:scenario==='received'?4:5,acceptedOfferPrice:100000,offeredPrice:100000,declaredCondition:2,inspectedCondition:2,imageUrls:[],payout:scenario==='received'?null:{amount:100000,state:'Confirmed',reference:'fixture'},createdAt:now};
  if(p==='/api/Brands'||p==='/api/Categories')return [{id:pid,name:'Danh mục kiểm thử'}];
  return [];
 }
 ws.addEventListener('message',async event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}return;}
  if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
  if(m.method==='Fetch.requestPaused'){
   const r=m.params;requests.push({url:r.request.url,method:r.request.method});const error=scenario==='error';
   await call('Fetch.fulfillRequest',{requestId:r.requestId,responseCode:error?503:200,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(error?{message:'Lỗi mạng kiểm thử'}:{success:true,data:fixture(r.request.url)})).toString('base64')});
  }
 });
 await call('Page.enable');await call('Runtime.enable');await call('Fetch.enable',{patterns:[{urlPattern:'*/api/*'}]});
 const payload=Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');
 await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('auth_session',${JSON.stringify(JSON.stringify({token:'fixture.'+payload+'.fixture',role:'ADMIN',fullName:'Quản trị kiểm thử'}))})`});
 const js=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value;};
 async function navigate(route){await call('Page.navigate',{url:'http://127.0.0.1:5184'+route});await sleep(1800);for(let i=0;i<30 && await js("!!document.querySelector(\".global-loader-overlay\")");i++)await sleep(100);}
 async function click(text){const ok=await js(`(()=>{const el=[...document.querySelectorAll('button')].find(e=>e.innerText.trim()===${JSON.stringify(text)});if(el){el.click();return true;}return false;})()`);if(!ok)throw Error('Missing button '+text);await sleep(250);}
 const results=[];
 for(const width of [1440,390]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
  for(const route of ['/inventory','/upcycling/qc','/collections/sourcing','/shipping']){
   await navigate(route);const state=await js(`({route:location.pathname,title:document.querySelector('h1')?.innerText,body:document.body.innerText,overflow:document.documentElement.scrollWidth>innerWidth+1,width:innerWidth,scroll:document.documentElement.scrollWidth})`);
   if(state.overflow)throw Error('Page overflow '+JSON.stringify(state));
   if(!state.title||state.body.includes('Không tìm thấy trang'))throw Error('Missing page '+route);
   results.push({width,route,title:state.title,overflow:state.overflow});
   if(width===1440||width===390){const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,route.replaceAll('/','_')+'-'+width+'.png'),Buffer.from(shot.data,'base64'));}
  }
  await navigate('/inventory');await click('Nghiệm thu QC');
  if(!await js("document.body.innerText.includes('Nếu QC đạt, tải 1–5 ảnh hiện vật')"))throw Error('QC photo requirement missing');
  results.push({width,modal:'inventory-qc'});
  await navigate('/collections/sourcing');
  if(await js("[...document.querySelectorAll('button')].some(b=>b.innerText.trim()==='Bán Second-hand')"))throw Error('Direct resale still available');
  await click('Chi tiết');
  if(!await js("document.body.innerText.includes('Đồ bán lại cần có ảnh hiện vật và kết quả QC đạt')"))throw Error('QC route explanation missing');
  results.push({width,modal:'sourcing-next-step'});
 }
 scenario='received';await navigate('/collections/sourcing');await click('Kiểm định');
 if(!await js("document.body.innerText.includes('Ảnh hiện vật khi kiểm định') && !document.body.innerText.includes('Quyết định hướng xử lý sau kiểm định')"))throw Error('Intake inspection form still implies a saved disposition');
 results.push({modal:'intake-inspection-evidence'});
 if(errors.length)throw Error(errors.join('\n'));
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors,requests},null,2));console.log(JSON.stringify({out,checks:results.length,errors}));ws.close();
})().catch(e=>{console.error(e);process.exitCode=1;process.exit(1)});


