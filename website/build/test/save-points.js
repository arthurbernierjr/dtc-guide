const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const {spawn} = require('node:child_process');
const {chromium} = require('playwright');
const site = path.resolve(__dirname, '../..');
const KEY = 'dtc:save-point:v1';
(async () => {
 const port = await new Promise(resolve => { const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));}); });
 const base=`http://127.0.0.1:${port}`;
 const server=spawn(process.execPath,[site+'/server.js'],{env:{...process.env,PORT:String(port),NODE_ENV:'test'},stdio:'ignore'});
 let browser;
 try {
  for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  const catalog=await (await fetch(base+'/save-lessons.json')).json();assert.equal(catalog.length,66);assert(catalog.every((s,i)=>s.position===i+1&&!('dayName' in s)),'ordered self-paced catalogue');
  const first=catalog[0],last=catalog.at(-1);
  browser=await chromium.launch();const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const home=await ctx.newPage(),lesson=await ctx.newPage(),errors=[],logs=[];
  for(const p of [home,lesson])p.on('pageerror',e=>errors.push(e.message));home.on('console',m=>logs.push(m.text()));
  const ready=async p=>p.locator('[data-clear-save]').waitFor({state:'visible'});
  const read=()=>home.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
  await home.goto(base);await ready(home);assert.equal(await read(),null);assert.equal(await home.locator('[data-resume]').getAttribute('href'),first.url);
  assert(logs.some(s=>s.includes('S U P E R   C O D E R')),'console art');
  await lesson.goto(base+first.url);await ready(lesson);await lesson.locator('[data-save-lesson]').click();
  await home.waitForFunction(k=>localStorage.getItem(k),KEY);const saved=await read();assert.deepEqual(Object.keys(saved).sort(),['lessonId','savedAt','version']);assert.equal(saved.lessonId,first.id);
  await home.reload();await ready(home);assert.match(await home.locator('[data-resume]').innerText(),/Resume/);
  await lesson.goto(base+last.url);await ready(lesson);assert.deepEqual(await read(),saved,'navigation does not save');
  await lesson.locator('[data-save-lesson]').click();await home.waitForFunction(url=>document.querySelector('[data-resume]').getAttribute('href')===url,last.url);
  assert.equal((await read()).lessonId,last.id);assert.match(await home.locator('.rc-when').textContent(),/^Session 66 of 66 ·/);
  await home.evaluate(()=>{localStorage.setItem('dtc:gate:probe','yes');localStorage.setItem('unrelated','keep');});
  const out=process.env.SAVE_SCREENSHOTS;if(out){fs.mkdirSync(out,{recursive:true});await home.locator('[data-save-card]').screenshot({path:path.join(out,'saved-home.png')});}
  for(const width of [390,320]){
   await home.setViewportSize({width,height:950});assert(await home.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'home overflow '+width);
   await lesson.setViewportSize({width,height:950});assert(await lesson.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'lesson overflow '+width);
   if(out&&width===390)await lesson.locator('.save-panel').screenshot({path:path.join(out,'lesson-mobile.png')});
  }
  await home.locator('[data-clear-save]').click();assert.equal(await read(),null);assert.equal(await home.evaluate(()=>localStorage.getItem('dtc:gate:probe')),'yes');assert.equal(await home.evaluate(()=>localStorage.getItem('unrelated')),'keep');
  await lesson.waitForFunction(()=>document.querySelector('[data-save-status]').textContent.includes('No save point'));
  await lesson.locator('[data-save-lesson]').click();await home.goto(base+'/privacy/');await ready(home);await home.locator('[data-clear-preferences]').click();assert.equal((await read()).lessonId,last.id);assert.equal(await home.evaluate(()=>localStorage.getItem('dtc:gate:probe')),null);
  await home.locator('[data-clear-save]').click();assert.equal(await read(),null);
  for(const invalid of ['{broken',JSON.stringify({version:1,lessonId:'https://evil.example',savedAt:new Date().toISOString(),url:'javascript:alert(1)'})]){
   await home.evaluate(([k,v])=>localStorage.setItem(k,v),[KEY,invalid]);await home.goto(base);await ready(home);assert.equal(await home.locator('[data-resume]').getAttribute('href'),first.url);
  }
  await home.evaluate(([key,id])=>localStorage.setItem(key,JSON.stringify({version:1,lessonId:id,savedAt:new Date().toISOString(),url:'javascript:alert(1)',title:'<img onerror=alert(1)>'})),[KEY,last.id]);
  await home.reload();await ready(home);assert.equal(await home.locator('[data-resume]').getAttribute('href'),last.url);assert.equal(await home.locator('.rc-title a').innerText(),last.title);
  await home.goto(base+'/guide/save-points/');assert(await home.locator('h1').innerText());assert(await home.locator('.sidebar a[href^="#"]').count()>4);assert(await home.locator('pre').count()>=3);
  if(out){await home.setViewportSize({width:1440,height:1000});await home.screenshot({path:path.join(out,'save-crystal-lesson.png')});}
  for(const mode of ['blocked','full']){
   const broken=await browser.newContext();await broken.addInitScript(mode=>{
    if(mode==='blocked')Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});
    else Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError');};
   },mode);
   const p=await broken.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+first.url);await ready(p);await p.locator('[data-save-lesson]').click();assert.match(await p.locator('[data-save-status]').innerText(),/Could not save/);await broken.close();
  }
  const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();await p.goto(base);assert.equal(await p.locator('[data-resume]').getAttribute('href'),first.url);assert.equal(await p.locator('[data-clear-save]').isVisible(),false);await nojs.close();
  assert.deepEqual(errors,[]);console.log('PASS: explicit save, reload, overwrite, cross-tab updates, scoped clearing, invalid records, blocked/full storage, no-JS, console art, lesson outline and mobile layout.');
 } finally {if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
