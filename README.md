# ÓióWine · protótipo de comércio eletrónico

Protótipo académico de um serviço de subscrição mensal de vinho português com
curadoria surpresa. Desenvolvido no âmbito de um projeto do **ISCAP, Instituto
Superior de Contabilidade e Administração do Porto**.

> ⚠️ **Trabalho académico.** Este site é uma demonstração. **Não há pagamentos
> reais**, não há processamento de encomendas, autenticação verdadeira nem
> tratamento real de dados pessoais. Todos os fluxos de pagamento e de conta são
> simulados.

## O que é

A ÓióWine assume, por quem subscreve, a decisão de escolher vinho. Em vez de um
catálogo, o percurso conduz a visitante por sete vistas sequenciais até à
subscrição de um pack mensal (dois vinhos, um aperitivo regional e o folheto de
prova «Narrativas que Embebedam»).

O protótipo demonstra, entre outros:

- Configurador de subscrição (consumo próprio ou oferta), com decomposição
  visível do preço e escolha de duração e periodicidade;
- Carrinho, checkout simulado e confirmação com calendário de expedições;
- Área de subscritora com suspensão e cancelamento autónomos, sem percursos de
  retenção;
- Conformidade legal: verificação de maioridade, consentimento de marketing
  separado, banner de cookies com simetria de esforço, direitos RGPD e direito
  de livre resolução de 14 dias com a ressalva de bens perecíveis.

## Tecnologia

Aplicação de página única, sem estrutura de desenvolvimento externa nem servidor
aplicacional. Apenas **HTML, CSS e JavaScript** num único `index.html`, com os
recursos (vídeos, música e imagem) em `assets/`. O estado é mantido em memória
durante a sessão.

## Como ver

- **Online:** https://yiii00.github.io/oiowine/
- **Local:** por causa das políticas de reprodução de vídeo/áudio, serve a pasta
  em vez de abrir o ficheiro diretamente:

```bash
python3 -m http.server 8000
```

Depois abre `http://localhost:8000/`.

## Limitações assumidas

Fazem parte do âmbito do protótipo e **não** são defeitos a corrigir:

- Sem persistência de dados entre sessões;
- Pagamento simulado;
- Autenticação figurativa;
- Sem integração logística;
- Sem gestão de inventário.

## Créditos e dados

As imagens de persona e o pack são ilustrativos e não representam produtos nem
pessoas reais. Não há dados de terceiros no código.

---

Protótipo académico · ISCAP · sem fins comerciais.
