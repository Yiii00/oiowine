#!/usr/bin/env python3
"""Constroi oiowine-defesa.html a partir de src/defesa.template.html.

Embebe fontes, imagens, video e logotipo em base64, de modo a que o ficheiro
abra por duplo clique sem servidor e sem um unico pedido de rede.
As pastas fontes/ e media/ continuam a ser entregues, conforme o ponto 1.
"""
import base64, pathlib, re, sys

RAIZ = pathlib.Path(__file__).parent
TPL  = RAIZ / "src" / "defesa.template.html"
OUT  = RAIZ / "oiowine-defesa.html"

MIME = {".woff2":"font/woff2", ".jpg":"image/jpeg", ".jpeg":"image/jpeg",
        ".png":"image/png", ".mp4":"video/mp4", ".svg":"image/svg+xml"}

def datauri(p: pathlib.Path) -> str:
    mime = MIME.get(p.suffix.lower(), "application/octet-stream")
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()

LOCK_W, LOCK_H = 152.74332, 81.35854
PALAVRAS = [("sip", "slogan_sip.svg"), ("surprise", "slogan_surprise.svg"),
            ("shine", "slogan_shine.svg")]

# --- cadencia do slogan ------------------------------------------------
# A pausa depois de cada palavra entrar e proporcional ao seu numero de
# caracteres: ler SURPRISE leva mais tempo do que ler SIP, por isso a
# palavra seguinte espera mais. Os nomes em PALAVRAS sao a propria fonte da
# contagem, de modo que mudar o slogan reajusta a cadencia sozinho.
INICIO       = 720   # ms, entrada da primeira palavra (encavalita na marca)
ASSENTA      = 400   # ms, ponto em que a subida com esta curva ja esta ~93% feita
PAUSA_BASE   = 70    # ms, custo fixo de fixacao do olhar
POR_CARACTER = 30    # ms por caractere

def cadencia():
    """Devolve [(classe, ficheiro, atraso_ms)] com a pausa a crescer com a palavra."""
    t, fora = INICIO, []
    for classe, fich in PALAVRAS:
        fora.append((classe, fich, round(t)))
        t += ASSENTA + PAUSA_BASE + POR_CARACTER * len(classe)
    return fora

def _svg(nome: str) -> str:
    t = (RAIZ / "media" / nome).read_text(encoding="utf-8")
    return re.sub(r"<\?xml[^>]*\?>", "", t).strip()

def montar_lockup() -> str:
    marca = _svg("oiowine_marca.svg").replace("<svg", '<svg class="marca-svg"', 1)
    partes = [marca, '<span class="slogan" aria-hidden="true">']
    for classe, fich, atraso in cadencia():
        t = _svg(fich)
        vb = re.search(r'viewBox="([^"]+)"', t).group(1)
        x, y, w, h = (float(v) for v in vb.replace(",", " ").split())
        estilo = (f"left:{100*x/LOCK_W:.3f}%;top:{100*y/LOCK_H:.3f}%;"
                  f"width:{100*w/LOCK_W:.3f}%;height:{100*h/LOCK_H:.3f}%;"
                  f"--atraso:{atraso}ms")
        t = t.replace("<svg", '<svg class="wsvg"', 1)
        partes.append(f'<span class="mask m-{classe}" style="{estilo}">{t}</span>')
    partes.append("</span>")
    return "".join(partes)

def main():
    html = TPL.read_text(encoding="utf-8")
    usados = []

    # fontes
    def _font(m):
        p = RAIZ / "fontes" / (m.group(1) + ".woff2")
        if not p.exists(): sys.exit(f"falta a fonte {p}")
        usados.append((p.name, p.stat().st_size))
        return datauri(p)
    html = re.sub(r"\{\{FONT:([\w-]+)\}\}", _font, html)

    # media
    def _media(m):
        p = RAIZ / "media" / m.group(1)
        if not p.exists(): sys.exit(f"falta o ficheiro de media {p}")
        usados.append((p.name, p.stat().st_size))
        return datauri(p)
    html = re.sub(r"\{\{MEDIA:([\w.\-]+)\}\}", _media, html)

    # logotipo inline, para poder ser colorido por CSS
    logo = (RAIZ / "media" / "oiowine_logo.svg").read_text(encoding="utf-8")
    logo = re.sub(r"<\?xml[^>]*\?>", "", logo).strip()
    html = html.replace("{{LOGO}}", logo)

    # lockup: marca + slogan em tres palavras mascaradas. As posicoes das
    # mascaras saem do proprio viewBox de cada palavra, por isso nao ha
    # numeros a copiar a mao — se o desenho mudar, isto acompanha.
    html = html.replace("{{LOCKUP}}", montar_lockup())

    sobra = re.findall(r"\{\{[^}]+\}\}", html)
    if sobra: sys.exit(f"marcadores por substituir: {set(sobra)}")

    OUT.write_text(html, encoding="utf-8")
    print(f"recursos embebidos ({len(usados)}):")
    for n, s in usados: print(f"   {n:26} {s/1024:8.1f} KB")
    print("\ncadência do slogan:")
    ant = None
    for classe, _f, atraso in cadencia():
        gap = f"  (+{atraso-ant[2]} ms depois de {ant[0].upper()}, {len(ant[0])} caracteres)" if ant else ""
        print(f"   {classe.upper():9} entra a {atraso:5} ms{gap}")
        ant = (classe, _f, atraso)
    print(f"\n{OUT.name}: {OUT.stat().st_size/1024/1024:.2f} MB")

if __name__ == "__main__":
    main()
