/* Regenera o NOTAS_ORADOR.md a partir da própria apresentação, para as
   contagens de passos e a cronometragem nunca divergirem do que está feito.
   Uso:  node ferramentas/gerar_notas.js                                      */
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RAIZ = path.join(__dirname, '..');
const FILE = path.resolve(process.argv[2] || path.join(RAIZ, 'oiowine-defesa.html'));
const SAIDA = path.resolve(process.argv[3] || path.join(RAIZ, 'NOTAS_ORADOR.md'));

const NOME = {"bg-azul":"azul","bg-vermelho":"vermelho","bg-marrom":"marrom",
  "bg-marrom-fundo":"marrom escuro","bg-oliva":"oliva","bg-branco":"branco","bg-preto":"preto"};
const mmss = s => `${Math.floor(s/60)}:${String(Math.round(s)%60).padStart(2,'0')}`;

(async () => {
  const b = await chromium.launch({ channel:'chrome', headless:true });
  const p = await (await b.newContext()).newPage();
  await p.goto('file://'+FILE); await sleep(900);
  const d = await p.evaluate(() => ({ ecras:ECRAS, passos:passosDe,
    fundos: ecras.map(s => [...s.classList].find(c=>c.startsWith('bg-')) || '—') }));
  await b.close();

  const E=d.ecras, PA=d.passos, FU=d.fundos;
  const tot = E.reduce((a,e)=>a+e.d, 0);
  const iCal = E.findIndex(e => e.t === 'Calendário');
  const L = [];  const w = s => L.push(s);

  w("# ÓióWine · Notas do orador"); w("");
  w("**Ricardo Araújo, nº 2939790** · defesa do Projeto de licenciatura em Marketing");
  w("ISCAP · P.Porto · orientação da Prof.ª Maria Antónia Rodrigues"); w("");
  w(`**Total previsto:** ${mmss(tot)}. **${E.length} ecrãs, ${PA.reduce((a,b)=>a+b,0)} passos.**`);
  w(""); w("> Documento gerado. Para o actualizar: `node ferramentas/gerar_notas.js`.");
  w(""); w("---"); w("");
  w("## Antes de começar · a vista de orador"); w("");
  w("Na sala, com o projetor ligado, siga esta ordem:"); w("");
  w("1. Ligue o projetor em **ecrã estendido**, não espelhado.");
  w("2. Abra o `oiowine-defesa.html` e carregue em **`P`**. Abre uma segunda janela com as notas, o cronómetro e o ecrã seguinte.");
  w("3. Arraste essa janela para o **ecrã do portátil**.");
  w("4. Ponha a janela da apresentação em **ecrã inteiro no projetor** (`⌃⌘F` no Mac, `F11` no Windows).");
  w(""); w("As setas funcionam nas duas janelas. A projeção fica sempre limpa: com a");
  w("vista de orador aberta, a tecla `N` deixa de pôr notas por cima da apresentação.");
  w(""); w("> Se o navegador bloquear a segunda janela, aparece um aviso. Autorize janelas");
  w("> para este ficheiro e volte a carregar em `P`. Em último recurso, use este");
  w("> documento impresso e não carregue em `N`."); w(""); w("---"); w("");
  w("## Comandos"); w(""); w("| Tecla | Ação |"); w("|---|---|");
  w("| `P` | **Vista de orador** numa segunda janela |");
  w("| `→` `Espaço` `PageDown` | Avançar um passo |");
  w("| `←` `PageUp` | Recuar um passo (repõe o ecrã anterior completo) |");
  w("| `Home` `End` | Primeiro e último ecrã |");
  w("| `N` | Notas sobrepostas, só sem a vista de orador aberta |");
  w("| `T` | Cronómetro |"); w("| `G` | Grelha de navegação |");
  w("| `V` | Repor o vídeo do protótipo |");
  w("| `Esc` | Fechar qualquer painel |"); w("");
  w("A roda do rato e o deslize no ecrã avançam um passo, com bloqueio de 700 ms entre");
  w("eventos. Uma tecla premida durante a transição **não se perde**: fica em fila e");
  w("executa quando a transição acaba."); w("");
  w("O cronómetro arranca ao primeiro avanço, não ao abrir o ficheiro, e pára sozinho");
  w("no último ecrã."); w(""); w("---"); w("");
  w("## Corte de emergência"); w("");
  w("Se o tempo apertar, abrir o `oiowine-defesa.html` num editor de texto e mudar a");
  w("primeira linha do bloco de código para:"); w(""); w("```js");
  w("var INCLUIR_CALENDARIO = false;"); w("```"); w("");
  if (iCal >= 0) {
    w(`O ecrã ${iCal+1}, o Calendário, desaparece e a numeração recalcula-se sozinha:`);
    w(`passam a ser ${E.length-1} ecrãs e ${PA.reduce((a,b)=>a+b,0)-PA[iCal]} passos, com o total em ${mmss(tot-E[iCal].d)}.`);
    w("É o único ecrã cuja ausência não parte nenhuma cadeia de argumento.");
    w(`Poupa ${E[iCal].d} segundos, e a data de lançamento passa a ser dita de viva voz.`);
  }
  w(""); w("---"); w("");
  w("## Cronometragem"); w("");
  w("| # | Ecrã | Início | Duração | Passos | Fundo |"); w("|---:|---|---:|---:|---:|---|");
  let t = 0;
  E.forEach((e,i) => { w(`| ${i+1} | ${e.t} | ${mmss(t)} | ${e.d} s | ${PA[i]} | ${NOME[FU[i]]||FU[i]} |`); t += e.d; });
  w(`| | **total** | | **${mmss(tot)}** | **${PA.reduce((a,b)=>a+b,0)}** | |`); w("");
  w("Vários ecrãs têm um passo só e revelam tudo em cascata, sem tecla no meio:");
  w("os rodapés de fonte, a revisão da literatura, o «Sem catálogo» e o resultado da");
  w("regressão. A tabela acima diz quantas teclas cada ecrã pede."); w(""); w("---"); w("");
  w("## Guião falado"); w("");
  w("> O texto falado nunca aparece no ecrã. As linhas marcadas com ▸ são instruções");
  w("> ao orador, não são para dizer."); w("");
  t = 0;
  E.forEach((e,i) => {
    w(`### ${i+1} · ${e.t}`); w("");
    w(`\`${mmss(t)}\` → \`${mmss(t+e.d)}\` · ${e.d} segundos · ${PA[i]} ${PA[i]===1?'passo':'passos'} · fundo ${NOME[FU[i]]||FU[i]}`); w("");
    e.n.split("\n").filter(l=>l.trim()).forEach(l => {
      w(l.trim().startsWith("▸") ? `**${l.trim()}**` : l.trim()); w("");
    });
    w("---"); w(""); t += e.d;
  });
  w("## Nota sobre a paleta"); w("");
  w("O briefing atribui as cores por ecrã (ponto 3.1) e exige contraste mínimo AA em");
  w("todo o texto (ponto 8). Nove combinações não podiam cumprir as duas coisas ao");
  w("mesmo tempo. Foram resolvidas com **variantes tonais da mesma cor**, sem alterar");
  w("nenhuma decisão de composição:"); w("");
  w("| Onde | Original | Usado | Contraste |"); w("|---|---|---|---|");
  w("| Ecrã do 25% · fundo | `#615C48` | `#3E3B2E` | n/a |");
  w("| Ecrã do 25% · número | `#BC642F` | `#CC6D33` | 3,10:1 |");
  w("| Oliva sobre branco | `#9F9772` | `#7B7454` | 4,70:1 |");
  w("| Texto sobre fundo oliva | `#615C48` | `#474334` | 3,37:1 |");
  w("| Alerta sobre fundo oliva | `#A13532` | `#7C2926` | 3,24:1 |");
  w("| Seta sobre fundo azul | `#BC642F` | `#D8814D` | 3,33:1 |");
  w("| Rótulos pequenos a laranja | `#BC642F` | `#B05D2C` | 4,72:1 |"); w("");
  w("O laranja da norma do relatório, `#BC642F`, continua a ser o único laranja de");
  w("display da apresentação e não é fundo de nenhuma secção inteira."); w("");

  fs.writeFileSync(SAIDA, L.join("\n"), 'utf8');
  console.log(`  ${path.basename(SAIDA)}: ${L.length} linhas · ${E.length} ecrãs · ${PA.reduce((a,b)=>a+b,0)} passos`);
})().catch(e => { console.error('REBENTOU:', e.message); process.exit(1); });
