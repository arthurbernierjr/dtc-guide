/* Runs only in the response-sandboxed, opaque-origin example document. */
(() => {
  'use strict';
  let started = false;
  const sendReady = () => parent.postMessage({type:'runner-ready'},'*');
  window.addEventListener('message', event => {
    if (started || event.source !== parent || !event.data || event.data.type !== 'runner-start' || event.ports.length !== 1) return;
    const m = event.data;
    if (!['live','worker'].includes(m.mode) || typeof m.code !== 'string' || m.code.length > 500000) return;
    started = true;
    const port = event.ports[0]; let count = 0;
    const send = value => { if (++count <= 2501) port.postMessage(value); };
    const describe = value => {
      if (typeof value === 'string') return value.slice(0,8000);
      try { return (JSON.stringify(value) ?? String(value)).slice(0,8000); } catch { return String(value).slice(0,8000); }
    };
    const report = error => send({type:'error',text:describe(error && error.message || error)});
    addEventListener('error',event=>{event.preventDefault();report(event.error || event.message);});
    addEventListener('unhandledrejection',event=>{event.preventDefault();report(event.reason);});
    if (m.mode === 'worker') {
      if (typeof m.engine !== 'string' || m.engine.length > 100000) return report('Invalid runner.');
      const url = URL.createObjectURL(new Blob([m.engine],{type:'text/javascript'}));
      const worker = new Worker(url); URL.revokeObjectURL(url);
      const timer = setTimeout(()=>{worker.terminate();report('Execution time limit exceeded.');},12000);
      worker.onmessage = event => {
        const value = event.data;
        if (!value || !['log','done','error'].includes(value.type)) return;
        send({type:value.type,text:describe(value.text || ''),level:value.level});
        if (count > 2500 || value.type === 'done' || value.type === 'error') {clearTimeout(timer);worker.terminate();}
      };
      worker.onerror = event=>{event.preventDefault();clearTimeout(timer);worker.terminate();report(event.message);};
      worker.postMessage({id:1,src:m.src,code:m.code});
      return;
    }
    if (typeof m.html !== 'string' || m.html.length > 100000) return report('Invalid stage.');
    const root = document.createElement('div'); root.className = 'stage-root'; root.setAttribute('data-stage-root','');
    // HTML is build-authored, validated by the build, and remains inside this sandbox.
    root.innerHTML = m.html; document.body.appendChild(root);
    const con = Object.fromEntries(['log','info','debug','warn','error','table','dir','trace','group'].map(level=>[level,(...args)=>send({type:'log',level:level==='error'?'err':level==='warn'?'warn':'log',text:args.map(describe).join(' ').slice(0,8000)})]));
    Object.assign(con,{groupEnd(){},clear(){},count(){},time(){},timeEnd(){},assert(ok,...args){if(!ok)con.error('Assertion failed',...args);}});
    window.__dtcStage = () => ({document,console:con,setTimeout:setTimeout.bind(window),setInterval:setInterval.bind(window),clearTimeout:clearTimeout.bind(window),clearInterval:clearInterval.bind(window)});
    document.addEventListener('submit',event=>{if(!event.defaultPrevented){event.preventDefault();con.error('The form submitted without event.preventDefault(). Navigation is blocked in this example.');}});
    const size = ()=>send({type:'size',height:Math.ceil(root.getBoundingClientRect().height)+4});
    let pending = false;
    new ResizeObserver(()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;size();});}}).observe(root);
    const url = URL.createObjectURL(new Blob([m.code],{type:'text/javascript'}));
    const script = document.createElement('script'); script.type = 'module'; script.src = url;
    script.onload = ()=>{URL.revokeObjectURL(url);size();send({type:'done'});};
    script.onerror = ()=>{URL.revokeObjectURL(url);report('Example could not load.');};
    document.head.appendChild(script);
  });
  sendReady();
})();
