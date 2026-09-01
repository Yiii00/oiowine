/* Bateria de aceitação da apresentação.
   Uso:  node ferramentas/verificar.js [caminho/para/oiowine-defesa.html]        */
const { chromium } = require('playwright-core');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FILE = path.resolve(process.argv[2] || path.join(__dirname, '..', 'oiowine-defesa.html'));
let falhas = 0;
const diz = (rot, ok, det='') => { if(!ok) falhas++;
  console.log(`  ${ok?'ok  ':'FALHA'} ${rot}${det?'  · '+det:''}`); };

(async () => {
  const b = await chromium.launch({ channel:'chrome', headless:true });

  // ---- 1 · navegação, painéis, vídeo, isolamento -----------------------
  let c = await b.newContext({ viewport:{width:1920,height:1080} });
  let p = await c.newPage();
  const externos = [], consola = [];
  p.on('request', r => { const u=r.url(); if(!/^(file|data|blob):/.test(u)) externos.push(u); });
  p.on('console', m => { if(m.type()==='error') consola.push(m.text()); });
  p.on('pageerror', e => consola.push('PAGEERROR: '+e.message));
  await p.goto('file://'+FILE, { waitUntil:'load' }); await sleep(1200);

  const info = await p.evaluate(() => ({ N, T:TOTAL_PASSOS, passos:passosDe }));
  console.log(`\n  ${info.N} ecrãs · ${info.T} passos · [${info.passos.join(',')}]\n`);

  // índice global de passo (e*100+p não serve: um ecrã pode ter 1 passo)
  const iG = () => p.evaluate(() => { let n=0; for(let i=0;i<estado.e;i++) n+=passosDe[i]; return n+estado.p; });

  const trilho = [];
  for (let i=0; i<info.T+2; i++){ trilho.push(await iG()); await p.keyboard.press('ArrowRight'); await sleep(820); }
  const unicos = [...new Set(trilho)];
  diz('percorre todos os passos', unicos.length===info.T, `${unicos.length} de ${info.T}`);
  diz('sem saltos na ordem', unicos.every((v,i)=> i===0 || v===unicos[i-1]+1));
  const fim = await p.evaluate(() => ({e:estado.e+1,p:estado.p+1}));
  diz('termina no último ecrã', fim.e===info.N, `ecrã ${fim.e} passo ${fim.p}`);

  // recuar repõe o ecrã anterior completo
  await p.evaluate(() => irPara(6)); await sleep(950);
  await p.keyboard.press('ArrowLeft'); await sleep(1100);
  const volta = await p.evaluate(() => { const s=ecras[estado.e];
    return { p:estado.p+1, vis:s.querySelectorAll('[data-passo].visivel').length,
             tot:s.querySelectorAll('[data-passo]').length }; });
  diz('recuar repõe o ecrã completo', volta.vis===volta.tot, `${volta.vis}/${volta.tot}`);

  // um gesto rápido de roda avança exatamente um passo
  await p.evaluate(() => irPara(2)); await sleep(950);
  const a0 = await iG();
  for (let i=0;i<6;i++){ await p.mouse.wheel(0,120); await sleep(25); }
  await sleep(500);
  diz('gesto rápido de roda avança 1 passo', (await iG())-a0===1);

  // tecla premida durante a transição não se perde
  await p.evaluate(() => irPara(4)); await sleep(1000);
  const b0 = await iG();
  await p.keyboard.press('ArrowRight'); await sleep(80);
  await p.keyboard.press('ArrowRight'); await sleep(2200);
  diz('tecla durante a transição não se perde', (await iG())-b0===2);

  // painéis
  await p.keyboard.press('n'); await sleep(250);
  diz('N abre as notas', await p.evaluate(()=>!document.querySelector('#notas').hidden));
  await p.keyboard.press('t'); await sleep(250);
  diz('T abre o cronómetro', await p.evaluate(()=>!document.querySelector('#crono').hidden));
  await p.keyboard.press('g'); await sleep(350);
  const g = await p.evaluate(()=>({v:!document.querySelector('#grelha').hidden,
    n:document.querySelectorAll('#grelha button').length}));
  diz('G abre a grelha', g.v && g.n===info.N, `${g.n} miniaturas`);
  await p.keyboard.press('Escape'); await sleep(250);
  diz('Esc fecha tudo', await p.evaluate(()=>['#notas','#crono','#grelha']
    .every(s=>document.querySelector(s).hidden)));

  // vídeo do protótipo
  const iv = await p.evaluate(()=>ECRAS.findIndex(e=>e.t==='O protótipo'));
  await p.evaluate(k=>irPara(k), iv); await sleep(2500);
  const v1 = await p.evaluate(()=>{const v=document.querySelector('#videoProto');
    return {t:v.currentTime, pausa:v.paused, dur:v.duration};});
  diz('o vídeo arranca sozinho', !v1.pausa && v1.t>0, `${v1.t.toFixed(2)}s de ${v1.dur.toFixed(1)}s`);
  diz('o vídeo dura entre 28 e 32 s', v1.dur>=28 && v1.dur<=32);
  await p.keyboard.press('v'); await sleep(400);
  diz('V repõe o vídeo', (await p.evaluate(()=>document.querySelector('#videoProto').currentTime)) < v1.t);

  diz('nenhum pedido externo', externos.length===0, externos.slice(0,2).join(', '));
  diz('nenhum erro de consola', consola.length===0, consola[0]||'');
  await c.close();

  // ---- 2 · degradação a 1280x720 ---------------------------------------
  c = await b.newContext({ viewport:{width:1280,height:720} });
  p = await c.newPage(); await p.goto('file://'+FILE); await sleep(1000);
  let transbordos = 0;
  for (let i=0;i<info.N;i++){
    await p.evaluate(k=>irPara(k), i); await sleep(820);
    for (let s=1;s<info.passos[i];s++){ await p.keyboard.press('ArrowRight'); await sleep(320); }
    await sleep(700);
    transbordos += await p.evaluate(() => {
      const recortado = e => { for(let n=e.parentElement;n&&n!==document.body;n=n.parentElement){
        const o=getComputedStyle(n).overflow; if(/hidden|clip|auto|scroll/.test(o)) return true; } return false; };
      let n=0;
      ecras[estado.e].querySelectorAll('*').forEach(e => {
        const r=e.getBoundingClientRect();
        if((r.width||r.height) && !recortado(e) &&
           Math.max(0,r.right-innerWidth,-r.left,r.bottom-innerHeight,-r.top) > 2) n++;
      });
      return n;
    });
  }
  const sc = await p.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight}));
  diz('1280x720 sem transbordos', transbordos===0, `${transbordos} elemento(s)`);
  diz('1280x720 sem scroll do documento', sc.w<=1280 && sc.h<=720, `${sc.w}x${sc.h}`);
  await c.close();

  // ---- 3 · movimento reduzido ------------------------------------------
  c = await b.newContext({ viewport:{width:1920,height:1080}, reducedMotion:'reduce' });
  p = await c.newPage(); await p.goto('file://'+FILE); await sleep(900);
  const red = await p.evaluate(()=>({r:reduzido,
    logo:getComputedStyle(document.querySelector('.lockup .marca-svg')).animationName,
    dur:getComputedStyle(document.querySelector('.ecra [data-passo]')).transitionDuration}));
  diz('movimento reduzido detetado', red.r);
  diz('animação do logótipo parada', red.logo==='none');
  diz('transições curtas', red.dur.startsWith('0.15'), red.dur);
  await c.close();

  // ---- 4 · corte de emergência ------------------------------------------
  const fs = require('fs'), os = require('os');
  const alt = path.join(os.tmpdir(), 'defesa-sem-calendario.html');
  fs.writeFileSync(alt, fs.readFileSync(FILE,'utf8')
    .replace('var INCLUIR_CALENDARIO = true;','var INCLUIR_CALENDARIO = false;'));
  c = await b.newContext({ viewport:{width:1920,height:1080} });
  p = await c.newPage(); await p.goto('file://'+alt); await sleep(1000);
  const corte = await p.evaluate(()=>({N,T:TOTAL_PASSOS,
    tem:!!document.querySelector('[data-cortavel="calendario"]'),
    lista:ECRAS.some(e=>e.t==='Calendário')}));
  const iCal = info.passos[await (async()=>{ const q=await c.newPage(); await q.goto('file://'+FILE);
    await sleep(700); const k=await q.evaluate(()=>ECRAS.findIndex(e=>e.t==='Calendário')); await q.close(); return k; })()];
  diz('o corte remove um ecrã', corte.N===info.N-1, `${corte.N} de ${info.N}`);
  diz('o corte recalcula os passos', corte.T===info.T-iCal, `${corte.T}`);
  diz('o Calendário sai do DOM e da lista', !corte.tem && !corte.lista);
  fs.unlinkSync(alt);
  await b.close();

  console.log(falhas ? `\n  ${falhas} verificação(ões) falharam\n` : `\n  tudo verde\n`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error('REBENTOU:', e.message); process.exit(2); });
