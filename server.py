"""Servidor local de «Mi rodilla» (solo biblioteca estándar de Python).

- Sirve la app (carpeta app/) en http://127.0.0.1:8790.
- Guarda tus datos en datos/estado.json y tus fotos en datos/fotos/, con una copia por día en datos/copias/.
- Solo escucha en este ordenador (127.0.0.1) y solo acepta peticiones de la propia app.

Arranque: abrir.bat (o `py -3 server.py`). Parada: parar.bat.
"""
import datetime
import json
import os
import re
import sys
import threading
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PUERTO = 8790
BASE = Path(__file__).resolve().parent
APP = BASE / "app"
DATOS = BASE / "datos"
FOTOS = DATOS / "fotos"
COPIAS = DATOS / "copias"
ESTADO = DATOS / "estado.json"
MAX_ESTADO = 20 * 1024 * 1024
MAX_FOTO = 15 * 1024 * 1024
COPIAS_A_GUARDAR = 60
HOSTS = {f"127.0.0.1:{PUERTO}", f"localhost:{PUERTO}"}
ID_FOTO = re.compile(r"^[a-z0-9]{6,40}$")
bloqueo = threading.Lock()


def log(msg):
    DATOS.mkdir(exist_ok=True)
    with open(DATOS / "servidor.log", "a", encoding="utf-8") as f:
        f.write(f"{datetime.datetime.now():%Y-%m-%d %H:%M:%S} {msg}\n")


def escribir_atomico(ruta: Path, contenido: bytes):
    ruta.parent.mkdir(parents=True, exist_ok=True)
    tmp = ruta.with_suffix(ruta.suffix + ".tmp")
    with open(tmp, "wb") as f:
        f.write(contenido)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, ruta)


def copia_del_dia(contenido: bytes):
    COPIAS.mkdir(parents=True, exist_ok=True)
    escribir_atomico(COPIAS / f"estado-{datetime.date.today():%Y-%m-%d}.json", contenido)
    copias = sorted(COPIAS.glob("estado-*.json"))
    for vieja in copias[:-COPIAS_A_GUARDAR]:
        vieja.unlink(missing_ok=True)


class Manejador(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP), **kwargs)

    def log_message(self, formato, *args):  # sin ruido; solo errores al log
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # --- utilidades ---
    def _json(self, codigo, datos):
        cuerpo = json.dumps(datos, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.end_headers()
        self.wfile.write(cuerpo)

    def _host_ok(self):
        return self.headers.get("Host", "") in HOSTS

    def _escritura_ok(self):
        # Exigir la cabecera propia obliga al navegador a pedir permiso (CORS) a cualquier web ajena: así solo escribe la app.
        return self._host_ok() and self.headers.get("X-Mi-Rodilla") == "1"

    def _leer_cuerpo(self, maximo):
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0 or n > maximo:
            return None
        return self.rfile.read(n)

    def _foto(self):
        m = re.match(r"^/api/fotos/([^/?#]+)$", self.path)
        if not m or not ID_FOTO.match(m.group(1)):
            return None
        return FOTOS / f"{m.group(1)}.jpg"

    # --- métodos ---
    def do_GET(self):
        if not self._host_ok():
            return self._json(403, {"error": "host"})
        if self.path == "/api/ping":
            return self._json(200, {"app": "mi-rodilla", "datos": str(DATOS)})
        if self.path == "/api/datos":
            if not ESTADO.exists():
                return self._json(404, {"error": "sin datos"})
            cuerpo = ESTADO.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(cuerpo)))
            self.end_headers()
            self.wfile.write(cuerpo)
            return
        if self.path.startswith("/api/fotos/"):
            ruta = self._foto()
            if not ruta or not ruta.exists():
                return self._json(404, {"error": "no existe"})
            cuerpo = ruta.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "image/jpeg")
            self.send_header("Content-Length", str(len(cuerpo)))
            self.end_headers()
            self.wfile.write(cuerpo)
            return
        if self.path.startswith("/api/"):
            return self._json(404, {"error": "no existe"})
        return super().do_GET()

    def do_PUT(self):
        if not self._escritura_ok():
            return self._json(403, {"error": "prohibido"})
        if self.path == "/api/datos":
            cuerpo = self._leer_cuerpo(MAX_ESTADO)
            if cuerpo is None:
                return self._json(413, {"error": "tamaño"})
            try:
                datos = json.loads(cuerpo.decode("utf-8"))
                if not isinstance(datos, dict) or "checkins" not in datos:
                    raise ValueError("formato")
            except Exception:
                return self._json(400, {"error": "json no válido"})
            with bloqueo:
                escribir_atomico(ESTADO, cuerpo)
                copia_del_dia(cuerpo)
            return self._json(200, {"ok": True})
        if self.path.startswith("/api/fotos/"):
            ruta = self._foto()
            cuerpo = self._leer_cuerpo(MAX_FOTO)
            if not ruta or cuerpo is None:
                return self._json(400, {"error": "foto no válida"})
            escribir_atomico(ruta, cuerpo)
            return self._json(200, {"ok": True})
        return self._json(404, {"error": "no existe"})

    def do_DELETE(self):
        if not self._escritura_ok():
            return self._json(403, {"error": "prohibido"})
        ruta = self._foto() if self.path.startswith("/api/fotos/") else None
        if not ruta:
            return self._json(404, {"error": "no existe"})
        ruta.unlink(missing_ok=True)
        return self._json(200, {"ok": True})

    def do_POST(self):
        if self.path == "/api/parar" and self._escritura_ok():
            self._json(200, {"ok": True})
            threading.Thread(target=self.server.shutdown, daemon=True).start()
            return
        return self._json(403, {"error": "prohibido"})


def ya_en_marcha():
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{PUERTO}/api/ping", timeout=1) as r:
            return json.load(r).get("app") == "mi-rodilla"
    except Exception:
        return False


def main():
    DATOS.mkdir(exist_ok=True)
    if ya_en_marcha():
        return 0
    try:
        servidor = ThreadingHTTPServer(("127.0.0.1", PUERTO), Manejador)
    except OSError as e:
        log(f"No se puede usar el puerto {PUERTO}: {e}")
        return 1
    log(f"Arrancado en http://127.0.0.1:{PUERTO}")
    try:
        servidor.serve_forever()
    finally:
        servidor.server_close()
        log("Parado")
    return 0


if __name__ == "__main__":
    sys.exit(main())
