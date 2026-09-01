# Ferramentas da apresentação

Tudo o que é preciso para reconstruir e verificar a apresentação. Só dependem
do Node e do Chrome instalado no sistema.

```bash
npm install playwright-core        # uma vez, nesta pasta ou acima
```

| Comando | O que faz |
|---|---|
| `python3 build.py` | Constrói o `oiowine-defesa.html` a partir de `src/defesa.template.html`, embebendo fontes e media em base64 |
| `node ferramentas/verificar.js` | Bateria de aceitação: navegação, painéis, vídeo, 1280×720, movimento reduzido e corte de emergência |
| `node ferramentas/gerar_pdf.js` | Regenera o `oiowine-defesa.pdf`, um ecrã por página no estado final |
| `node ferramentas/gerar_notas.js` | Regenera o `NOTAS_ORADOR.md` a partir da própria apresentação |

## Ordem de trabalho

1. Editar **`src/defesa.template.html`**. Nunca o `oiowine-defesa.html`, que é gerado.
2. `python3 build.py`
3. `node ferramentas/verificar.js`
4. Se mudaram passos ou durações: `node ferramentas/gerar_notas.js`
5. Se mudou algum ecrã: `node ferramentas/gerar_pdf.js`

## Cuidados

- O `verificar.js` não leva contagens escritas à mão: deriva tudo do documento.
  Ao acrescentar testes, manter esse princípio, senão passam a acusar falhas
  sempre que a estrutura muda.
- O `gerar_pdf.js` espera em ciclo até nenhuma animação estar a correr. Há
  revelações que só arrancam quando outra acaba, e uma espera única fotografa-as
  a meio.
- Vídeo do site: só **H.264 High a 8 bits**. HEVC e 10 bits falham no Chrome
  sobre Mac Intel.
