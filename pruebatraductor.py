import mss
import cv2
import numpy as np
import easyocr
from deep_translator import GoogleTranslator
import keyboard
import time
import os

# =========================
# CONFIGURACIÓN
# =========================

IDIOMA_ORIGEN = "en"
IDIOMA_DESTINO = "es"

# Zona aproximada del cuadro de diálogo.
# Puedes cambiarla luego si no pilla bien el texto.
ZONA = {
    "left": 250,
    "top": 1000,
    "width": 2940,
    "height": 300
}

TIEMPO_ENTRE_CAPTURAS = 1.2

# =========================
# INICIO
# =========================

os.system("cls")
print("Cargando OCR... puede tardar un poco la primera vez.")
reader = easyocr.Reader([IDIOMA_ORIGEN], gpu=False)

traductor = GoogleTranslator(source=IDIOMA_ORIGEN, target=IDIOMA_DESTINO)

ultima_frase = ""

print("\nTraductor iniciado.")
print("Pulsa F8 para pausar/reanudar.")
print("Pulsa ESC para cerrar.")
print("\nAbre Deltarune y deja visible el cuadro de diálogo.\n")

pausado = False

while True:
    if keyboard.is_pressed("esc"):
        print("\nCerrando traductor.")
        break

    if keyboard.is_pressed("f8"):
        pausado = not pausado
        print("\nPAUSADO" if pausado else "\nREANUDADO")
        time.sleep(0.8)

    if pausado:
        time.sleep(0.2)
        continue

    try:
        with mss.mss() as sct:
            captura = np.array(sct.grab(ZONA))

        # Convertir imagen para mejorar lectura
        imagen = cv2.cvtColor(captura, cv2.COLOR_BGRA2BGR)
        gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)

        # Aumenta contraste para texto blanco sobre fondo oscuro
        gris = cv2.resize(gris, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        _, procesada = cv2.threshold(gris, 140, 255, cv2.THRESH_BINARY)

        resultados = reader.readtext(procesada, detail=0, paragraph=True)

        texto = " ".join(resultados).strip()

        # Limpieza básica
        texto = texto.replace("|", "I")
        texto = texto.replace("  ", " ")

        if texto and texto != ultima_frase and len(texto) > 2:
            ultima_frase = texto

            try:
                traduccion = traductor.translate(texto)

                print("\n" + "=" * 60)
                print("INGLÉS:")
                print(texto)
                print("\nESPAÑOL:")
                print(traduccion)

            except Exception as e:
                print("\nError traduciendo:", e)

    except Exception as e:
        print("\nError leyendo pantalla:", e)

    time.sleep(TIEMPO_ENTRE_CAPTURAS)