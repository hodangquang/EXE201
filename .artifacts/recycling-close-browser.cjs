(async()=>{
 const info=await(await fetch('http://127.0.0.1:9246/json/version')).json();
 const ws=new WebSocket(info.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 ws.send(JSON.stringify({id:1,method:'Browser.close'}));
 setTimeout(()=>ws.close(),1000);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
