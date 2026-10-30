const fs = require('fs');
const path = require('path');
const root = 'D:/EXE201';
function edit(name, old, value) {
 const p=path.join(root,name), s=fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
 if(!s.includes(old)) throw Error(name+': '+old.slice(0,100));
 fs.writeFileSync(p,s.split(old).join(value));
}
function cut(name, start, end, value) {
 const p=path.join(root,name), s=fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
 const a=s.indexOf(start), b=s.indexOf(end,a);
 if(a<0||b<0) throw Error(name+': cut '+start);
 fs.writeFileSync(p,s.slice(0,a)+value+s.slice(b));
}
let src=fs.readFileSync('.artifacts/recycling-only-edit.py','utf8');
src=src.slice(src.indexOf('# Retain'));
src=src.replace(/'''([\s\S]*?)'''/g,(_,s)=>JSON.stringify(s));
src=src.replace(/^#(.*)$/gm,'//$1');
src=src.replace(/^(ops|ps|pc|cart|repo|ui|svc|sr|hook|pf|draft)=/gm,'var $1=');
eval(src);
