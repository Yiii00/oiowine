/* Gera o PDF de recurso: um ecrã por página, no estado final de cada um.
   Uso:  node ferramentas/gerar_pdf.js                                        */
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs'), os = require('os');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RAIZ = path.join(__dirname, '..');
const FILE = path.resolve(process.argv[2] || path.join(RAIZ, 'oiowine-defesa.html'));
const SAIDA = path.resolve(process.argv[3] || path.join(RAIZ, 'oiowine-defesa.pdf'));

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'defesa-pdf-'));
  const b = await chromium.launch({ channel:'chrome', headless:true });
  // 1x e JPEG: o Chrome embebe as imagens no PDF sem as recomprimir, por isso
  // capturar a 2x em PNG dava um ficheiro de 22 MB para o mesmo resultado visível.
  const c = await b.newContext({ viewport:{width:1920,height:1080}, deviceScaleFactor:1 });
  const p = await c.newPage();
  await p.goto('file://'+FILE, { waitUntil:'load' }); await sleep(1200);
  // o mobiliário de condução não entra no PDF
  await p.addStyleTag({ content:'#ajuda,#progresso,#notas,#crono{display:none!important}' });
  const info = await p.evaluate(() => ({ N, passos:passosDe }));

  const paginas = [];
  for (let i=0; i<info.N; i++){
    await p.evaluate(k => irPara(k), i); await sleep(900);
    for (let s=1; s<info.passos[i]; s++){ await p.keyboard.press('ArrowRight'); await sleep(330); }
    await sleep(700);
    // Esperar até NADA estar a correr. Uma só espera não chega: há revelações
    // que só arrancam quando outra animação acaba (o ecrã do Keller espera
    // pelo logótipo), ou seja já depois da primeira espera ter regressado.
    for (let k=0;k<8;k++){
      await p.evaluate(() => Promise.all(document.getAnimations()
        .map(a => a.finished.catch(()=>{}))).then(()=>{})).catch(()=>{});
      await sleep(200);
      if (await p.evaluate(() => document.getAnimations()
            .filter(a=>a.playState==='running').length) === 0) break;
    }
    await sleep(200);
    const f = path.join(tmp, `p${String(i+1).padStart(2,'0')}.jpg`);
    await p.screenshot({ path:f, type:'jpeg', quality:82 });
    paginas.push(f);
    process.stdout.write(`\r  capturado ${i+1}/${info.N}`);
  }
  console.log('');

  // Montagem sem dependências: uma página HTML com uma imagem por folha,
  // impressa pelo próprio Chrome. Evita precisar de Pillow ou img2pdf.
  const html = '<!doctype html><meta charset="utf-8"><style>' +
    '@page{size:1920px 1080px;margin:0}html,body{margin:0;padding:0}' +
    'img{display:block;width:1920px;height:1080px;page-break-after:always}' +
    'img:last-child{page-break-after:auto}</style>' +
    paginas.map(f => `<img src="file://${f}">`).join('');
  const hf = path.join(tmp, 'montagem.html');
  fs.writeFileSync(hf, html);
  const q = await c.newPage();
  await q.goto('file://'+hf, { waitUntil:'load' }); await sleep(1500);
  await q.pdf({ path:SAIDA, width:'1920px', height:'1080px', printBackground:true, pageRanges:'' });
  await b.close();
  fs.rmSync(tmp, { recursive:true, force:true });
  console.log(`  ${path.basename(SAIDA)}: ${info.N} páginas, ${(fs.statSync(SAIDA).size/1024/1024).toFixed(2)} MB`);
})().catch(e => { console.error('REBENTOU:', e.message); process.exit(1); });
