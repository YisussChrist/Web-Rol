import re
import json


def parse_talento(texto):
    descripcion = ""

    if "→" in texto:
        texto, descripcion = texto.split("→", 1)
        descripcion = descripcion.strip().strip("()")

    partes = [p.strip() for p in texto.split("/")]

    return {
        "nombre": partes[0] if len(partes) > 0 else "",
        "ingles": partes[1] if len(partes) > 1 else "",
        "descripcion": descripcion
    }


def parse_tecnica(texto):
    extra = ""

    parentesis = re.search(r"\((.*?)\)$", texto)
    if parentesis:
        extra = parentesis.group(1).strip()
        texto = texto.replace(parentesis.group(0), "").strip()

    tipo = ""
    corchetes = re.search(r"\[(.*?)\]", texto)
    if corchetes:
        tipo = corchetes.group(1).strip()
        texto = texto.replace(corchetes.group(0), "").strip()

    grado = ""
    grado_match = re.search(r"\b(G[2-5])\b", texto)
    if grado_match:
        grado = grado_match.group(1)
        texto = texto.replace(grado, "").strip()

    partes = [p.strip() for p in texto.split("/")]

    return [
        partes[0] if len(partes) > 0 else "",
        partes[1] if len(partes) > 1 else "",
        grado,
        tipo,
        extra
    ]


def parse_sts(texto):
    lineas = [l.strip() for l in texto.strip().splitlines() if l.strip()]

    pj = {
        "nombre": "",
        "titulo": "",
        "equipo": "",
        "imagen": "../Hijos Inazuma/pjs/.jpg",
        "elemento": "",
        "posicion": "",
        "tecnicas": [],
        "talento": {
            "nombre": "",
            "ingles": "",
            "descripcion": ""
        },
        "espirituGuerrero": {
            "nombre": "",
            "ingles": "",
            "tecnicas": []
        },
        "miximax": {
            "nombre": "",
            "tecnicas": []
        }
    }

    seccion = None

    for linea in lineas:
        limpia = linea.replace("*", "").replace(":", "").strip().lower()

        if limpia == "técnicas":
            seccion = "TECNICAS"
            continue

        if limpia == "talento":
            seccion = "TALENTO"
            continue

        if limpia == "espíritu guerrero":
            seccion = "EG"
            continue

        if limpia == "miximax":
            seccion = "MIXIMAX"
            continue

        if not linea.startswith("-") and not linea.startswith("•"):
            continue

        contenido = linea.strip()

        if contenido.startswith("- -"):
            contenido = contenido.replace("- -", "", 1).strip()
            es_subtecnica = True
        elif contenido.startswith("-"):
            contenido = contenido.replace("-", "", 1).strip()
            es_subtecnica = False
        elif contenido.startswith("•"):
            contenido = contenido.replace("•", "", 1).strip()
            es_subtecnica = True
        else:
            continue

        if seccion == "TECNICAS":
            pj["tecnicas"].append(parse_tecnica(contenido))

        elif seccion == "TALENTO":
            pj["talento"] = parse_talento(contenido)

        elif seccion == "EG":
            if es_subtecnica:
                pj["espirituGuerrero"]["tecnicas"].append(parse_tecnica(contenido))
            else:
                partes = [p.strip() for p in contenido.split("/")]
                pj["espirituGuerrero"]["nombre"] = partes[0] if len(partes) > 0 else ""
                pj["espirituGuerrero"]["ingles"] = partes[1] if len(partes) > 1 else ""

        elif seccion == "MIXIMAX":
            if es_subtecnica:
                pj["miximax"]["tecnicas"].append(parse_tecnica(contenido))
            elif not pj["miximax"]["nombre"]:
                partes = [p.strip() for p in contenido.split("/")]
                pj["miximax"]["nombre"] = partes[0] if len(partes) > 0 else ""
            else:
                pj["miximax"]["tecnicas"].append(parse_tecnica(contenido))

    return [pj]


def convertir_a_js(personajes):
    resultado = []

    for pj in personajes:
        tecnicas = json.dumps(pj["tecnicas"], ensure_ascii=False, indent=4)
        tecnicas_eg = json.dumps(pj["espirituGuerrero"]["tecnicas"], ensure_ascii=False, indent=4)
        tecnicas_miximax = json.dumps(pj["miximax"]["tecnicas"], ensure_ascii=False, indent=4)

        bloque = f"""
{{
  nombre: "{pj['nombre']}",
  titulo: "",
  equipo: "",
  imagen: "../Hijos Inazuma/pjs/{pj['nombre']}.jpg",
  elemento: "",
  posicion: "",
  tecnicas: {tecnicas},
  talento: {{
    nombre: "{pj['talento']['nombre']}",
    ingles: "{pj['talento']['ingles']}",
    descripcion: "{pj['talento']['descripcion']}"
  }},
  espirituGuerrero: {{
    nombre: "{pj['espirituGuerrero']['nombre']}",
    ingles: "{pj['espirituGuerrero']['ingles']}",
    tecnicas: {tecnicas_eg}
  }},
  miximax: {{
    nombre: "{pj['miximax']['nombre']}",
    tecnicas: {tecnicas_miximax}
  }}
}},"""

        resultado.append(bloque)

    return "\n".join(resultado)


texto = """
***Técnicas:***
- Garra Celestial G5 [Parada]
- Zarpazo de Acero  [Parada]
- Muralla Pireneica [Parada]
- Mano Celestial del Tigre N2 [Parada]
- Salto Felino [Bloqueo]
- Rugido Final [Tiro] (con David)

***Talento:***
- 
"""

personajes = parse_sts(texto)
print(convertir_a_js(personajes))