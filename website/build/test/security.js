const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const {spawn} = require('node:child_process');
const site = path.resolve(__dirname, '../..');
const {chromium} = require(site+'/node_modules/playwright');
const out = process.env.SECURITY_SCREENSHOTS;
(async()=>{
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
 const base=`http://127.0.0.1:${port}`;
 const server=spawn(process.execPath,[site+'/server.js'],{env:{...process.env,PORT:String(port),NODE_ENV:'test'},stdio:'ignore'});
 let browser;
 try {
  for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch(); const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'});
  page.on('console',m=>{if(process.env.DEBUG_SECURITY) console.log(m.type(),m.text().slice(0,300));});
  const manifest=JSON.parse(fs.readFileSync(site+'/build/.manifest.json'));
  const live=manifest.lives[0]; await page.goto(base+live.url);
  await page.evaluate(()=>{window.__securityMarker='unchanged';localStorage.setItem('security-test','synthetic');});
  const button=page.locator(`[data-live][data-stage="${live.name}"]`); await button.click();
  await page.locator(`.stage[data-stage="${live.name}"].is-live`).waitFor();
  const iframe=page.locator('.example-sandbox').first(); assert.equal(await iframe.getAttribute('sandbox'),'allow-scripts');
  const frame=await (await iframe.elementHandle()).contentFrame();
  console.log('live example ready');
  const isolation=await frame.evaluate(async()=>{
   const result={};
   for(const [name,fn] of Object.entries({parent:()=>parent.document.body,storage:()=>localStorage.getItem('security-test'),cookie:()=>document.cookie,indexedDB:()=>indexedDB.open('security-probe')})){
    try{fn();result[name]='accessible';}catch(e){result[name]=e.name;}
   }
   for(const url of ['/security-network-probe','https://example.com/security-network-probe']){try{await fetch(url);result[url]='accessible';}catch{result[url]='blocked';}}
   return result;
  });
  for(const key of ['parent','storage','cookie','indexedDB'])assert.equal(isolation[key],'SecurityError',key);
  assert.equal(isolation['/security-network-probe'],'blocked');assert.equal(isolation['https://example.com/security-network-probe'],'blocked');
  assert.equal(await page.evaluate(()=>window.__securityMarker),'unchanged');
  assert.equal(await page.evaluate(()=>typeof window.__dtcStage),'undefined');
  const sandboxResponse=await fetch(base+'/sandbox/runner');
  assert.match(sandboxResponse.headers.get('content-security-policy'),/sandbox allow-scripts/);
  assert.match(sandboxResponse.headers.get('content-security-policy'),/connect-src 'none'/);
  if(out){fs.mkdirSync(out,{recursive:true});await page.locator(`.stage[data-stage="${live.name}"]`).screenshot({path:path.join(out,'isolated-example.png')});}
  // A blob worker inherits the sandbox's origin and network policy.
  console.log('live isolation passed');
  const workerIsolation=await frame.evaluate(()=>new Promise(resolve=>{
   setTimeout(()=>resolve({error:'worker probe timeout'}),5000);
   const code=`self.onmessage=async()=>{let storage;try{indexedDB.open('probe');storage='accessible'}catch(e){storage=e.name}let network;try{await fetch('https://example.com/security-worker-probe');network='accessible'}catch{network='blocked'}postMessage({storage,network})}`;
   const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));const w=new Worker(url);URL.revokeObjectURL(url);w.onmessage=e=>{w.terminate();resolve(e.data);};w.postMessage('start');
  })); assert.equal(workerIsolation.storage,'SecurityError');assert.equal(workerIsolation.network,'blocked');
  // Approved worker examples still execute and report their actual result.
  console.log('worker isolation passed');
  const run=manifest.runnables.find(r=>r.mode!=='node');await page.goto(base+run.url);
  const runBtn=page.locator(".run-btn[data-run]").first();await runBtn.click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.code-out-body')].some(e=>e.textContent.includes('finished in the isolated runner')));
  await runBtn.evaluate(b=>b.setAttribute('data-run','https://example.com/evil.js'));await runBtn.click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.code-out-body')].some(e=>e.textContent.includes('not approved')));
  // An approved example that loops forever must be terminated without freezing the lesson.
  const runUrl=base+'/assets/src/'+run.rel;
  await page.route(runUrl,route=>route.fulfill({contentType:'text/plain',body:'while (true) {}'}));
  await runBtn.evaluate((b,src)=>b.setAttribute('data-run',src),'/assets/src/'+run.rel);
  await runBtn.click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.code-out-body')].some(e=>e.textContent.includes('Execution time limit exceeded')),null,{timeout:16000});
  assert.equal(await page.locator('iframe.example-sandbox').count(),0);
  await page.unroute(runUrl);await runBtn.click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.code-out-body')].some(e=>e.textContent.includes('finished in the isolated runner')));
  // Regression cases for parsing, prototype dispatch, resource caps and a normal command.
  await page.goto(base+'/path/1-1-welcome-to-the-new-world/');
  const shell=await page.evaluate(()=>{
   let output='';const sh=new window.__dtcTerm.Shell({write:t=>output+=t,clear:()=>{output='';}});
   const result={};for(const input of ['echo ${','seq 1 100000000000','constructor','source /dev/null','echo safe','echo test | grep -E "(a+)+$"']){output='';sh.runLine(input);result[input]=output;}
   sh.writeFile('cycle.sh','source cycle.sh\n',false);output='';sh.runLine('source cycle.sh');result.recursion=output;
   return result;
  });
  assert.match(shell['echo ${'],/bad substitution/);assert.match(shell['seq 1 100000000000'],/limited/);assert.match(shell.constructor,/command not found/);assert.match(shell['echo safe'],/safe/);assert.match(shell['echo test | grep -E "(a+)+$"'],/too complex/);assert.match(shell.recursion,/limit/);
  // No external preview request; opting in creates exactly one player; disconnect removes it.
  console.log('terminal guards passed');
  const explained=Object.entries(manifest.pages).find(([,p])=>p.id==='EXPL-01')[0];
  const external=[];page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});
  await page.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Consent test player</title>'}));
  await page.goto(base+explained,{waitUntil:'networkidle'});
  const card=page.locator('.video-card');assert.equal(await card.locator('iframe').count(),0);assert.deepEqual(external,[]);
  assert(await card.locator('img').evaluate(img=>img.complete&&img.naturalWidth>300));
  await page.evaluate(()=>document.fonts.ready);
  if(out){await card.screenshot({path:path.join(out,'video-desktop.png')});}
  const titles=Object.values(manifest.pages).filter(p=>/^EXPL-/.test(p.id)&&p.id!=='EXPL-00').map(p=>p.title);
  for(const width of [320,390,834,1440]) {
    await page.setViewportSize({width,height:1050});
    const failures=await card.evaluate((card,titles)=>{
      const heading=card.querySelector('h2');const original=heading.textContent;const failures=[];
      for(const title of titles){
        heading.textContent=title;
        const c=card.getBoundingClientRect(),p=card.querySelector('.video-preview').getBoundingClientRect(),r=heading.getBoundingClientRect(),label=card.querySelector('.video-eyebrow').getBoundingClientRect();
        if(r.right>c.right||r.left<c.left||heading.scrollWidth>heading.clientWidth+1||p.right>c.right||r.top<label.bottom+8)failures.push(title);
      }
      heading.textContent=original;return failures;
    },titles);
    assert.deepEqual(failures,[],`All episode previews must fit at ${width}px`);
    if(out&&width===390)await card.screenshot({path:path.join(out,'video-mobile.png')});
  }
  await card.locator('[data-video-load]').click();await card.locator('iframe').waitFor();await page.waitForTimeout(150);
  assert(external.some(u=>u.startsWith('https://www.youtube-nocookie.com/embed/')));
  await card.locator('[data-video-unload]').click();assert.equal(await card.locator('iframe').count(),0);assert(await card.locator('.video-preview').isVisible());
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('.video-card iframe').count(),0);
  await page.goto(base+'/privacy/');await page.evaluate(()=>{localStorage.setItem('dtc:gate:probe','1');localStorage.setItem('unrelated','keep');});
  await page.locator('[data-clear-preferences]').click();assert.equal(await page.evaluate(()=>localStorage.getItem('dtc:gate:probe')),null);assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated')),'keep');
  await page.evaluate(()=>{localStorage.removeItem('unrelated');localStorage.removeItem('security-test');});
  console.log('PASS security: live and worker isolation; parent/storage/cookie/IndexedDB/network denied; approved execution; source rejection; infinite-loop termination and recovery; terminal limits; all 103 preview titles at four widths; video opt-in/disconnect/reload; scoped preference clearing.');
 } finally {if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
