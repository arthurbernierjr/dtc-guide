// Reuses the installed Remotion packages and browser. Never downloads a toolchain.
const fs = require('fs');
const path = require('path');
const {bundle} = require('@remotion/bundler');
const {openBrowser, selectComposition, renderStill} = require('@remotion/renderer');
const root = path.resolve(__dirname, '..');
const website = path.join(root, '../website');
const browserExecutable = process.env.REMOTION_BROWSER || '/home/bigpoppacode/code/obelisk/remotion-viral-videos/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell';
(async () => {
  if (!fs.existsSync(browserExecutable)) throw new Error('Existing browser not found; set REMOTION_BROWSER manually.');
  const ledger = JSON.parse(fs.readFileSync(path.join(website, 'content/path/diagrams.json')));
  const sessions = JSON.parse(fs.readFileSync(path.join(website, 'content/path/path.json'))).sessions;
  const written = sessions.filter(s => fs.existsSync(path.join(website, 'content/path/sessions', s.slug+'.md'))).map(s => s.id);
  const only = process.argv[2];
  const jobs = Object.entries(ledger).filter(([key,value]) => value.composition === 'CurriculumDiagram' && (!only || key.startsWith(only))).flatMap(([key,value]) => ['wide','tall'].map(layout => ({key, id:value.composition, props:{...value.props,layout}})));
  if (!only || only === 'path') for (const layout of ['wide','tall']) jobs.push({key:'path/path-map',id:'PathMap',props:{layout,written}});
  const serveUrl = await bundle({entryPoint:path.join(root,'src/index.ts')});
  const browser = await openBrowser('chrome',{browserExecutable});
  let done=0;
  try {
    const configs = {};
    for (const id of new Set(jobs.map(j=>j.id))) configs[id]=await selectComposition({serveUrl,id,inputProps:jobs.find(j=>j.id===id).props,puppeteerInstance:browser});
    let cursor=0;
    await Promise.all(Array.from({length:3},async()=>{
      while(cursor<jobs.length){
        const job=jobs[cursor++];
        const output=path.join(website,'build/assets/diagrams',job.key+'-'+job.props.layout+'.png');
        fs.mkdirSync(path.dirname(output),{recursive:true});
        const dimensions=job.props.layout==='wide'?{width:1600,height:900}:{width:900,height:1200};
        await renderStill({serveUrl,composition:{...configs[job.id],...dimensions,props:job.props},inputProps:job.props,output,imageFormat:'png',puppeteerInstance:browser,overwrite:true});
        done++; if(done%12===0||done===jobs.length) console.log(`Rendered ${done}/${jobs.length}`);
      }
    }));
  } finally {await browser.close({silent:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
