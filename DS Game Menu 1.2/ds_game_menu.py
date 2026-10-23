from __future__ import annotations

import json
import os
import configparser
import subprocess
import sys
import tomllib
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Callable

import tkinter as tk
from tkinter import filedialog, messagebox, ttk

try:
    from PIL import Image, ImageDraw, ImageTk
except ImportError:
    Image = ImageDraw = ImageTk = None


APP_NAME = "DS Game Menu"
APP_VERSION = "1.2"
CONFIG_DIR = Path(os.getenv("APPDATA", Path.home())) / "DSGameMenu"
CONFIG_FILE = CONFIG_DIR / "config.json"

BG = "#111318"
PANEL = "#24272e"
PANEL_2 = "#30343d"
SCREEN = "#f5f6f7"
INK = "#1c2229"
TEXT = "#f4f5f6"
MUTED = "#b0b8c3"
ACCENT = "#60b9e5"
ACCENT_2 = "#8ed3f2"
SUCCESS = "#67b99f"
WARN = "#d8ad62"
SCREEN_EDGE = "#090a0c"
CARD = "#ffffff"
CARD_SELECTED = "#edf6fa"
LINE = "#d9dee3"
SUBTLE = "#535e6a"


def resource_path(filename: str) -> Path:
    """Locate bundled assets both in source mode and in the packaged app."""
    bundle_dir = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
    return bundle_dir / filename


@dataclass
class Game:
    path: Path
    title: str
    image: object | None = None


@dataclass
class SaveInfo:
    save_files: list[Path]
    state_files: list[Path]

    @property
    def active(self) -> Path | None:
        return self.save_files[0] if self.save_files else None


def load_config() -> dict:
    defaults = {
        "desmume_path": "",
        "melonds_path": "",
        "emulator_type": "DeSmuME",
        "rom_folder": "",
        "covers_folder": "",
        "saves_folder": "",
        "recursive": False,
        "extra_args": "",
    }
    try:
        data = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            defaults.update(data)
    except (OSError, json.JSONDecodeError):
        pass
    return defaults


def emulator_path(config: dict, emulator_name: str | None = None) -> Path | None:
    name = emulator_name or config.get("emulator_type", "DeSmuME")
    key = "melonds_path" if name == "melonDS" else "desmume_path"
    value = str(config.get(key, "")).strip()
    return Path(value) if value else None


def _clean_config_path(value: object, base: Path) -> Path | None:
    if not isinstance(value, str) or not value.strip():
        return None
    text = os.path.expandvars(os.path.expanduser(value.strip().strip('"')))
    path = Path(text)
    return path if path.is_absolute() else base / path


def _melonds_save_roots(config: dict) -> list[Path]:
    result: list[Path] = []
    melon = emulator_path(config, "melonDS")
    candidates: list[Path] = []
    if melon:
        candidates.append(melon.parent / "melonDS.toml")
    for variable in ("APPDATA", "LOCALAPPDATA"):
        root = os.getenv(variable)
        if root:
            candidates.extend([Path(root) / "melonDS" / "melonDS.toml", Path(root) / "melonDS.toml"])
    for config_file in candidates:
        try:
            with config_file.open("rb") as source:
                data = tomllib.load(source)
        except (OSError, tomllib.TOMLDecodeError):
            continue

        pending = [data]
        while pending:
            item = pending.pop()
            if not isinstance(item, dict):
                continue
            path = _clean_config_path(item.get("SaveFilePath"), config_file.parent)
            if path:
                result.append(path)
            pending.extend(value for value in item.values() if isinstance(value, dict))
    return result


def _desmume_save_roots(config: dict) -> list[Path]:
    result: list[Path] = []
    desmume = emulator_path(config, "DeSmuME")
    if not desmume:
        return result
    candidates = [desmume.with_suffix(".ini"), desmume.parent / "desmume.ini"]
    for config_file in candidates:
        parser = configparser.ConfigParser(interpolation=None)
        try:
            parser.read(config_file, encoding="utf-8")
        except (OSError, configparser.Error, UnicodeError):
            continue
        for section in parser.sections():
            for key, value in parser.items(section):
                if key.casefold() in {"battery", "battery_path", "savepath", "save_path"}:
                    path = _clean_config_path(value, config_file.parent)
                    if path:
                        result.append(path)
    return result


def save_roots_for_game(game: Game, config: dict) -> list[Path]:
    roots: list[Path] = [game.path.parent]
    configured = str(config.get("saves_folder", "")).strip()
    if configured:
        roots.append(Path(configured))
    roots.extend(_melonds_save_roots(config))
    roots.extend(_desmume_save_roots(config))
    for name in ("DeSmuME", "melonDS"):
        executable = emulator_path(config, name)
        if executable:
            roots.append(executable.parent)
            roots.extend(executable.parent / folder for folder in ("Battery", "battery", "Saves", "saves", "Save", "save"))

    unique: list[Path] = []
    seen: set[str] = set()
    for root in roots:
        try:
            marker = str(root.resolve(strict=False)).casefold()
        except OSError:
            marker = str(root).casefold()
        if marker not in seen:
            seen.add(marker)
            unique.append(root)
    return unique


def find_save_info(game: Game, config: dict) -> SaveInfo:
    save_extensions = (".sav", ".dsv")
    state_extensions = tuple(f".ds{i}" for i in range(10)) + tuple(f".ml{i}" for i in range(1, 10))
    bases = (game.path.stem, game.path.name)
    saves: list[Path] = []
    states: list[Path] = []
    seen: set[str] = set()

    for root in save_roots_for_game(game, config):
        if not root.is_dir():
            continue
        for extension in save_extensions + state_extensions:
            for base in bases:
                direct = root / f"{base}{extension}"
                candidates = [direct]
                try:
                    candidates.extend(root.glob(f"*/{base}{extension}"))
                except OSError:
                    pass
                for candidate in candidates:
                    try:
                        marker = str(candidate.resolve(strict=False)).casefold()
                        exists = candidate.is_file()
                    except OSError:
                        continue
                    if not exists or marker in seen:
                        continue
                    seen.add(marker)
                    (saves if extension in save_extensions else states).append(candidate)

    def newest(path: Path) -> float:
        try:
            return path.stat().st_mtime
        except OSError:
            return 0

    saves.sort(key=newest, reverse=True)
    states.sort(key=newest, reverse=True)
    return SaveInfo(saves, states)


def save_config(data: dict) -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    CONFIG_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def title_from_filename(path: Path) -> str:
    title = path.stem.replace("_", " ").replace("-", " ")
    return " ".join(title.split()) or path.stem


def decode_ds_icon(path: Path):
    """Read the 32x32 icon embedded in an NDS ROM banner."""
    if Image is None:
        return None
    try:
        with path.open("rb") as rom:
            rom.seek(0x68)
            raw = rom.read(4)
            if len(raw) != 4:
                return None
            banner_offset = int.from_bytes(raw, "little")
            if banner_offset <= 0:
                return None
            rom.seek(banner_offset + 0x20)
            bitmap = rom.read(512)
            rom.seek(banner_offset + 0x220)
            palette_data = rom.read(32)
        if len(bitmap) != 512 or len(palette_data) != 32:
            return None

        palette = []
        for i in range(16):
            value = int.from_bytes(palette_data[i * 2 : i * 2 + 2], "little")
            r = (value & 0x1F) * 255 // 31
            g = ((value >> 5) & 0x1F) * 255 // 31
            b = ((value >> 10) & 0x1F) * 255 // 31
            palette.append((r, g, b, 0 if i == 0 else 255))

        icon = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
        pixels = icon.load()
        for tile_y in range(4):
            for tile_x in range(4):
                tile_start = (tile_y * 4 + tile_x) * 32
                for y in range(8):
                    for pair in range(4):
                        value = bitmap[tile_start + y * 4 + pair]
                        for nibble in range(2):
                            color_index = (value >> (nibble * 4)) & 0x0F
                            x = tile_x * 8 + pair * 2 + nibble
                            pixels[x, tile_y * 8 + y] = palette[color_index]
        return icon
    except OSError:
        return None


def make_placeholder(title: str, size: tuple[int, int] = (112, 112)):
    if Image is None:
        return None
    img = Image.new("RGBA", size, "#eef1f3")
    draw = ImageDraw.Draw(img)
    width, height = size
    draw.rounded_rectangle((4, 4, width - 5, height - 5), radius=18, fill="#e4e8eb", outline="#c4cbd1", width=2)
    draw.rounded_rectangle((20, 18, width - 21, height - 24), radius=9, fill="#f8f9fa", outline="#8e9ba5", width=2)
    initials = "".join(word[0] for word in title.split()[:2]).upper() or "DS"
    try:
        box = draw.textbbox((0, 0), initials)
        tw, th = box[2] - box[0], box[3] - box[1]
    except AttributeError:
        tw, th = draw.textsize(initials)
    draw.text(((width - tw) / 2, (height - th) / 2 - 2), initials, fill="#5e6972")
    draw.ellipse((width - 34, height - 31, width - 26, height - 23), fill="#67b99f")
    draw.ellipse((width - 24, height - 39, width - 16, height - 31), fill="#60b9e5")
    return img


def fit_image(img, size: tuple[int, int]):
    if Image is None or img is None:
        return None
    canvas = Image.new("RGBA", size, "#eef1f3")
    copy = img.copy()
    copy.thumbnail((size[0] - 10, size[1] - 10), Image.Resampling.LANCZOS)
    x = (size[0] - copy.width) // 2
    y = (size[1] - copy.height) // 2
    canvas.alpha_composite(copy, (x, y))
    return canvas


class RoundedButton(tk.Canvas):
    def __init__(self, master, text: str, command: Callable, width=160, height=44, color=ACCENT, hover=ACCENT_2, fg="#071324"):
        super().__init__(master, width=width, height=height, bg=master.cget("bg"), highlightthickness=0, cursor="hand2")
        self.command = command
        self.color = color
        self.hover = hover
        self.fg = fg
        self.width = width
        self.height = height
        self.shape = self._rounded_rect(2, 2, width - 2, height - 2, 14, fill=color, outline="")
        self.label = self.create_text(width / 2, height / 2, text=text, fill=fg, font=("Segoe UI Semibold", 11))
        self.bind("<Button-1>", lambda _e: self.command())
        self.bind("<Enter>", lambda _e: self.itemconfigure(self.shape, fill=self.hover))
        self.bind("<Leave>", lambda _e: self.itemconfigure(self.shape, fill=self.color))

    def _rounded_rect(self, x1, y1, x2, y2, radius=10, **kwargs):
        points = [x1 + radius, y1, x2 - radius, y1, x2, y1, x2, y1 + radius,
                  x2, y2 - radius, x2, y2, x2 - radius, y2, x1 + radius, y2,
                  x1, y2, x1, y2 - radius, x1, y1 + radius, x1, y1]
        return self.create_polygon(points, smooth=True, **kwargs)


class SettingsDialog(tk.Toplevel):
    def __init__(self, parent, config: dict, on_save: Callable[[dict], None]):
        super().__init__(parent)
        self.title("Configuración")
        self.geometry("980x660")
        self.minsize(920, 640)
        self.resizable(True, True)
        self.configure(bg=BG)
        self.transient(parent)
        self.grab_set()
        self.on_save = on_save
        self.vars = {
            "desmume_path": tk.StringVar(value=config.get("desmume_path", "")),
            "melonds_path": tk.StringVar(value=config.get("melonds_path", "")),
            "emulator_type": tk.StringVar(value=config.get("emulator_type", "DeSmuME")),
            "rom_folder": tk.StringVar(value=config.get("rom_folder", "")),
            "covers_folder": tk.StringVar(value=config.get("covers_folder", "")),
            "saves_folder": tk.StringVar(value=config.get("saves_folder", "")),
            "recursive": tk.BooleanVar(value=config.get("recursive", False)),
            "extra_args": tk.StringVar(value=config.get("extra_args", "")),
        }
        self._build()
        self.protocol("WM_DELETE_WINDOW", self.destroy)
        self.bind("<Escape>", lambda _e: self.destroy())
        self.after(50, self._center)

    def _center(self):
        self.update_idletasks()
        x = self.master.winfo_rootx() + (self.master.winfo_width() - self.winfo_width()) // 2
        y = self.master.winfo_rooty() + (self.master.winfo_height() - self.winfo_height()) // 2
        self.geometry(f"+{max(0, x)}+{max(0, y)}")

    def _build(self):
        tk.Label(self, text="CONFIGURACIÓN", font=("Segoe UI Semibold", 18), bg=BG, fg=TEXT).pack(anchor="w", padx=30, pady=(25, 4))
        tk.Label(self, text="Configura la biblioteca y uno o ambos emuladores. Pulsa Guardar para aplicar los cambios; la X y Cancelar los descartan.", font=("Segoe UI", 10), bg=BG, fg=MUTED).pack(anchor="w", padx=30, pady=(0, 18))
        form = tk.Frame(self, bg=BG)
        form.pack(fill="both", expand=True, padx=30)
        form.grid_columnconfigure(0, weight=1, uniform="settings")
        form.grid_columnconfigure(1, weight=1, uniform="settings")
        form.grid_rowconfigure(0, weight=1)

        emulator_panel = tk.Frame(form, bg=BG, padx=4)
        emulator_panel.grid(row=0, column=0, sticky="nsew", padx=(0, 22))
        emulator_panel.columnconfigure(0, weight=1)
        tk.Label(emulator_panel, text="EMULADORES", font=("Segoe UI Semibold", 9), bg=BG, fg=ACCENT).grid(row=0, column=0, sticky="w", pady=(0, 14))
        tk.Label(emulator_panel, text="Emulador activo", font=("Segoe UI", 9), bg=BG, fg=MUTED).grid(row=1, column=0, sticky="w", pady=(0, 5))
        selector = tk.OptionMenu(emulator_panel, self.vars["emulator_type"], "DeSmuME", "melonDS")
        selector.configure(bg=PANEL_2, fg=TEXT, activebackground="#424751", activeforeground=TEXT, relief="flat", borderwidth=0, highlightthickness=0, font=("Segoe UI", 10), anchor="w")
        selector["menu"].configure(bg=PANEL_2, fg=TEXT, activebackground="#424751", activeforeground=TEXT)
        selector.grid(row=2, column=0, columnspan=2, sticky="ew", ipady=4)
        self._path_row(emulator_panel, 2, "DeSmuME.exe", "desmume_path", self._browse_desmume)
        self._path_row(emulator_panel, 3, "melonDS.exe", "melonds_path", self._browse_melonds)
        tk.Label(emulator_panel, text="Opciones de inicio adicionales", font=("Segoe UI", 9), bg=BG, fg=MUTED).grid(row=8, column=0, sticky="w", pady=(13, 5))
        extra = tk.Entry(emulator_panel, textvariable=self.vars["extra_args"], font=("Segoe UI", 10), bg=PANEL_2, fg=TEXT, insertbackground=TEXT, relief="flat")
        extra.grid(row=9, column=0, columnspan=2, sticky="ew", ipady=8)

        library_panel = tk.Frame(form, bg=BG, padx=4)
        library_panel.grid(row=0, column=1, sticky="nsew", padx=(22, 0))
        library_panel.columnconfigure(0, weight=1)
        tk.Label(library_panel, text="BIBLIOTECA", font=("Segoe UI Semibold", 9), bg=BG, fg=ACCENT).grid(row=0, column=0, sticky="w", pady=(0, 14))
        self._path_row(library_panel, 1, "Carpeta de juegos", "rom_folder", self._browse_roms)
        self._path_row(library_panel, 2, "Carpeta de carátulas (opcional)", "covers_folder", self._browse_covers)
        self._path_row(library_panel, 3, "Carpeta de guardados (opcional)", "saves_folder", self._browse_saves)
        check = tk.Checkbutton(library_panel, text="Buscar ROMs dentro de subcarpetas", variable=self.vars["recursive"], bg=BG, fg=TEXT, activebackground=BG, activeforeground=TEXT, selectcolor=PANEL_2, font=("Segoe UI", 10))
        check.grid(row=8, column=0, columnspan=2, sticky="w", pady=16)
        tk.Label(library_panel, text="Los guardados también se buscan automáticamente junto a la ROM y en las carpetas configuradas por los emuladores.", font=("Segoe UI", 9), bg=BG, fg=MUTED, justify="left", wraplength=360).grid(row=9, column=0, columnspan=2, sticky="w")

        actions = tk.Frame(self, bg=BG)
        actions.pack(side="bottom", fill="x", padx=30, pady=24)
        tk.Button(actions, text="Cancelar", command=self.destroy, bg=PANEL_2, fg=TEXT, activebackground="#293956", activeforeground=TEXT, relief="flat", padx=22, pady=9, font=("Segoe UI Semibold", 10), cursor="hand2").pack(side="right", padx=(10, 0))
        tk.Button(actions, text="Guardar y cerrar", command=self._save, bg=ACCENT, fg="#071324", activebackground=ACCENT_2, relief="flat", padx=26, pady=9, font=("Segoe UI Semibold", 10), cursor="hand2").pack(side="right")

    def _path_row(self, parent, row, label, key, command):
        tk.Label(parent, text=label, font=("Segoe UI", 9), bg=BG, fg=MUTED).grid(row=row * 2, column=0, sticky="w", pady=(0 if row == 0 else 13, 5))
        entry = tk.Entry(parent, textvariable=self.vars[key], font=("Segoe UI", 10), bg=PANEL_2, fg=TEXT, insertbackground=TEXT, relief="flat")
        entry.grid(row=row * 2 + 1, column=0, sticky="ew", ipady=8, padx=(0, 8))
        tk.Button(parent, text="Elegir…", command=command, bg=PANEL_2, fg=TEXT, activebackground="#293956", activeforeground=TEXT, relief="flat", padx=14, pady=7, cursor="hand2").grid(row=row * 2 + 1, column=1)

    def _browse_desmume(self):
        chosen = filedialog.askopenfilename(parent=self, title="Selecciona DeSmuME", filetypes=[("Aplicación", "*.exe"), ("Todos los archivos", "*.*")])
        if chosen:
            self.vars["desmume_path"].set(chosen)

    def _browse_melonds(self):
        chosen = filedialog.askopenfilename(parent=self, title="Selecciona melonDS", filetypes=[("Aplicación", "*.exe"), ("Todos los archivos", "*.*")])
        if chosen:
            self.vars["melonds_path"].set(chosen)

    def _browse_roms(self):
        chosen = filedialog.askdirectory(parent=self, title="Selecciona tu carpeta de juegos")
        if chosen:
            self.vars["rom_folder"].set(chosen)

    def _browse_covers(self):
        chosen = filedialog.askdirectory(parent=self, title="Selecciona tu carpeta de carátulas")
        if chosen:
            self.vars["covers_folder"].set(chosen)

    def _browse_saves(self):
        chosen = filedialog.askdirectory(parent=self, title="Selecciona tu carpeta de guardados")
        if chosen:
            self.vars["saves_folder"].set(chosen)

    def _save(self):
        result = {key: var.get() for key, var in self.vars.items()}
        for key in ("desmume_path", "melonds_path", "rom_folder", "covers_folder", "saves_folder"):
            result[key] = result[key].strip().strip('"')
        if self.on_save(result) is not False:
            self.destroy()


class GameDetailsDialog(tk.Toplevel):
    def __init__(self, parent, game: Game, config: dict):
        super().__init__(parent)
        self.game = game
        self.config_data = config
        self.save_info = find_save_info(game, config)
        self.title(f"Detalles · {game.title}")
        self.geometry("780x535")
        self.minsize(660, 500)
        self.configure(bg=BG)
        self.transient(parent)
        self.grab_set()
        self._build()
        self.after(50, self._center)

    def _center(self):
        self.update_idletasks()
        x = self.master.winfo_rootx() + (self.master.winfo_width() - self.winfo_width()) // 2
        y = self.master.winfo_rooty() + (self.master.winfo_height() - self.winfo_height()) // 2
        self.geometry(f"+{max(0, x)}+{max(0, y)}")

    @staticmethod
    def _metadata(path: Path) -> str:
        try:
            stat = path.stat()
            size = stat.st_size
            if size >= 1024 * 1024:
                size_text = f"{size / (1024 * 1024):.1f} MB"
            elif size >= 1024:
                size_text = f"{size / 1024:.0f} KB"
            else:
                size_text = f"{size} bytes"
            changed = datetime.fromtimestamp(stat.st_mtime).strftime("%d/%m/%Y · %H:%M")
            return f"{size_text}  ·  Modificado {changed}"
        except OSError:
            return "No se pudo leer la información del archivo"

    def _build(self):
        header = tk.Frame(self, bg=BG)
        header.pack(fill="x", padx=32, pady=(27, 20))
        tk.Label(header, text="DETALLES DEL JUEGO", font=("Segoe UI Semibold", 9), bg=BG, fg=ACCENT).pack(anchor="w")
        tk.Label(header, text=self.game.title, font=("Segoe UI Semibold", 22), bg=BG, fg=TEXT).pack(anchor="w", pady=(5, 0))

        body = tk.Frame(self, bg=BG)
        body.pack(fill="both", expand=True, padx=32)
        self._file_block(body, "ROM", self.game.path, "Archivo Nintendo DS", True)

        save = self.save_info.active
        save_panel = tk.Frame(body, bg=PANEL, padx=18, pady=15)
        save_panel.pack(fill="x", pady=(14, 0))
        top = tk.Frame(save_panel, bg=PANEL)
        top.pack(fill="x")
        tk.Label(top, text="GUARDADO", font=("Segoe UI Semibold", 8), bg=PANEL, fg=MUTED).pack(side="left")
        status_text = "ARCHIVO ENCONTRADO" if save else "NO DETECTADO"
        status_color = SUCCESS if save else "#7e8690"
        tk.Label(top, text=f"●  {status_text}", font=("Segoe UI Semibold", 8), bg=PANEL, fg=status_color).pack(side="right")

        if save:
            self._readonly_path(save_panel, save)
            tk.Label(save_panel, text=self._metadata(save), font=("Segoe UI", 9), bg=PANEL, fg=MUTED).pack(anchor="w", pady=(7, 0))
            if len(self.save_info.save_files) > 1:
                tk.Label(save_panel, text=f"Se encontraron {len(self.save_info.save_files)} guardados; se muestra el modificado más recientemente.", font=("Segoe UI", 9), bg=PANEL, fg=WARN).pack(anchor="w", pady=(5, 0))
        else:
            tk.Label(save_panel, text="No se encontró un .sav o .dsv con el mismo nombre que la ROM.", font=("Segoe UI", 10), bg=PANEL, fg=TEXT).pack(anchor="w", pady=(12, 2))
            tk.Label(save_panel, text="La existencia del archivo indica que el emulador lo ha creado; no garantiza que haya progreso dentro del juego.", font=("Segoe UI", 9), bg=PANEL, fg=MUTED, wraplength=680, justify="left").pack(anchor="w")

        state_count = len(self.save_info.state_files)
        state_text = f"{state_count} estado{'s' if state_count != 1 else ''} rápido{'s' if state_count != 1 else ''} detectado{'s' if state_count != 1 else ''}"
        tk.Label(body, text=state_text, font=("Segoe UI", 9), bg=BG, fg=MUTED).pack(anchor="w", pady=(12, 0))

        actions = tk.Frame(self, bg=BG)
        actions.pack(fill="x", padx=32, pady=24)
        tk.Button(actions, text="Cerrar", command=self.destroy, bg=PANEL_2, fg=TEXT, activebackground="#424751", activeforeground=TEXT, relief="flat", padx=20, pady=9, font=("Segoe UI Semibold", 10), cursor="hand2").pack(side="right")
        if save:
            tk.Button(actions, text="Abrir carpeta del guardado", command=lambda: self._open_folder(save), bg=ACCENT, fg=INK, activebackground=ACCENT_2, relief="flat", padx=18, pady=9, font=("Segoe UI Semibold", 10), cursor="hand2").pack(side="left", padx=(0, 10))
        tk.Button(actions, text="Abrir carpeta de la ROM", command=lambda: self._open_folder(self.game.path), bg=PANEL_2, fg=TEXT, activebackground="#424751", activeforeground=TEXT, relief="flat", padx=18, pady=9, font=("Segoe UI Semibold", 10), cursor="hand2").pack(side="left")

    def _file_block(self, parent, label: str, path: Path, description: str, show_metadata: bool):
        panel = tk.Frame(parent, bg=PANEL, padx=18, pady=15)
        panel.pack(fill="x")
        tk.Label(panel, text=label, font=("Segoe UI Semibold", 8), bg=PANEL, fg=MUTED).pack(anchor="w")
        self._readonly_path(panel, path)
        detail = self._metadata(path) if show_metadata else description
        tk.Label(panel, text=detail, font=("Segoe UI", 9), bg=PANEL, fg=MUTED).pack(anchor="w", pady=(7, 0))

    def _readonly_path(self, parent, path: Path):
        value = tk.StringVar(value=str(path))
        entry = tk.Entry(parent, textvariable=value, state="readonly", readonlybackground="#191c21", fg=TEXT, relief="flat", font=("Segoe UI", 10))
        entry.pack(fill="x", pady=(9, 0), ipady=7)

    def _open_folder(self, path: Path):
        try:
            os.startfile(str(path.parent))
        except OSError as exc:
            messagebox.showerror("No se pudo abrir la carpeta", str(exc), parent=self)


class DSGameMenu(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title(f"{APP_NAME} {APP_VERSION}")
        icon = resource_path("DS Game Menu Icon.ico")
        if icon.is_file():
            try:
                self.iconbitmap(default=str(icon))
            except tk.TclError:
                pass
        self.geometry("1080x760")
        self.minsize(840, 650)
        self.configure(bg=BG)
        self.config_data = load_config()
        self.emulator_var = tk.StringVar(value=self.config_data.get("emulator_type", "DeSmuME"))
        self.games: list[Game] = []
        self.filtered_games: list[Game] = []
        self.selected_index = -1
        self.card_widgets: list[tk.Frame] = []
        self.photo_refs: list[object] = []
        self.hero_photo = None
        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", lambda *_: self.apply_filter())
        self._build_shell()
        self.bind_all("<KeyPress>", self._on_key)
        self.protocol("WM_DELETE_WINDOW", self.destroy)
        self.after(100, self.reload_games)
        self.after(250, self._first_run)
        self.after(1000, self._tick_clock)

    def _build_shell(self):
        style = ttk.Style(self)
        try:
            style.theme_use("clam")
        except tk.TclError:
            pass
        style.configure("DS.Vertical.TScrollbar", background="#4a4f58", troughcolor=SCREEN, bordercolor=SCREEN, arrowcolor="#7d858e", relief="flat")
        style.configure("DS.TCombobox", fieldbackground=PANEL, background=PANEL, foreground=TEXT, arrowcolor=MUTED, bordercolor="#3b4048", lightcolor=PANEL, darkcolor=PANEL, padding=5)
        style.map("DS.TCombobox", fieldbackground=[("readonly", PANEL)], foreground=[("readonly", TEXT)], selectbackground=[("readonly", PANEL)], selectforeground=[("readonly", TEXT)])

        header = tk.Frame(self, bg=BG, height=58)
        header.pack(fill="x", padx=30, pady=(16, 8))
        header.pack_propagate(False)
        logo = tk.Frame(header, bg=BG)
        logo.pack(side="left")
        tk.Label(logo, text="DS", font=("Segoe UI Semibold", 22), bg=BG, fg=TEXT).pack(side="left")
        tk.Label(logo, text="·", font=("Segoe UI", 22), bg=BG, fg=ACCENT).pack(side="left", padx=3)
        tk.Label(logo, text="Biblioteca", font=("Segoe UI", 13), bg=BG, fg=MUTED).pack(side="left", pady=(6, 0))
        self.clock_label = tk.Label(header, text="", font=("Segoe UI", 11), bg=BG, fg="#767e89")
        self.clock_label.pack(side="right", padx=(20, 0))
        tk.Button(header, text="Ajustes", command=self.open_settings, bg=BG, fg=MUTED, activebackground=BG, activeforeground=TEXT, relief="flat", borderwidth=0, padx=8, pady=8, font=("Segoe UI", 10), cursor="hand2").pack(side="right")
        emulator_switch = tk.Frame(header, bg=BG)
        emulator_switch.pack(side="right", padx=(0, 14))
        tk.Label(emulator_switch, text="EMULADOR", font=("Segoe UI Semibold", 7), bg=BG, fg="#676f79").pack(side="left", padx=(0, 7))
        self.emulator_combo = ttk.Combobox(emulator_switch, textvariable=self.emulator_var, values=("DeSmuME", "melonDS"), state="readonly", width=10, style="DS.TCombobox", font=("Segoe UI", 9))
        self.emulator_combo.pack(side="left")
        self.emulator_combo.bind("<<ComboboxSelected>>", self._emulator_changed)

        console = tk.Frame(self, bg=PANEL, highlightbackground="#343841", highlightthickness=1)
        console.pack(fill="both", expand=True, padx=30, pady=(0, 26))
        console.grid_columnconfigure(0, weight=1)
        console.grid_rowconfigure(0, weight=0)
        console.grid_rowconfigure(2, weight=1)

        self.top_screen = tk.Frame(console, bg=SCREEN, highlightbackground=SCREEN_EDGE, highlightthickness=5)
        self.top_screen.grid(row=0, column=0, sticky="nsew", padx=24, pady=(22, 8))
        self.top_screen.grid_columnconfigure(1, weight=1)
        self.top_screen.grid_rowconfigure(0, weight=1)

        self.hero_image_label = tk.Label(self.top_screen, bg=SCREEN)
        self.hero_image_label.grid(row=0, column=0, padx=(20, 20), pady=14)
        hero_text = tk.Frame(self.top_screen, bg=SCREEN)
        hero_text.grid(row=0, column=1, sticky="nsew", pady=14, padx=(0, 20))
        self.hero_kicker = tk.Label(hero_text, text="SELECCIÓN ACTUAL", font=("Segoe UI Semibold", 8), bg=SCREEN, fg=SUBTLE)
        self.hero_kicker.pack(anchor="w")
        self.hero_title = tk.Label(hero_text, text="Elige un juego", font=("Segoe UI Semibold", 22), bg=SCREEN, fg=INK, anchor="w", justify="left", wraplength=570)
        self.hero_title.pack(anchor="w", fill="x", pady=(8, 4))
        self.hero_path = tk.Label(hero_text, text="Configura tu carpeta para empezar", font=("Segoe UI", 9), bg=SCREEN, fg=SUBTLE, anchor="w", justify="left", wraplength=570)
        self.hero_path.pack(anchor="w", fill="x")
        play_row = tk.Frame(hero_text, bg=SCREEN)
        play_row.pack(anchor="w", pady=(18, 0))
        self.play_button = RoundedButton(play_row, "JUGAR", self.launch_selected, width=132, height=38, color=INK, hover="#35404a", fg=TEXT)
        self.play_button.pack(side="left")
        tk.Button(play_row, text="Detalles", command=self.show_selected_details, bg=SCREEN, fg=SUBTLE, activebackground=SCREEN, activeforeground=INK, relief="flat", borderwidth=0, padx=12, pady=8, font=("Segoe UI", 9), cursor="hand2").pack(side="left", padx=(8, 0))
        self.status_label = tk.Label(play_row, text="", font=("Segoe UI", 9), bg=SCREEN, fg="#518d78")
        self.status_label.pack(side="left", padx=14)

        hinge = tk.Frame(console, bg="#17191e", height=20)
        hinge.grid(row=1, column=0, sticky="ew")
        hinge.grid_propagate(False)
        tk.Frame(hinge, bg="#343840", height=1).place(relx=.1, rely=.5, relwidth=.8)
        hinge_center = tk.Canvas(hinge, width=54, height=20, bg="#17191e", highlightthickness=0)
        hinge_center.place(relx=.5, rely=.5, anchor="center")
        hinge_center.create_oval(12, 8, 16, 12, fill="#5a6069", outline="")
        hinge_center.create_oval(25, 8, 29, 12, fill=ACCENT, outline="")
        hinge_center.create_oval(38, 8, 42, 12, fill="#5a6069", outline="")

        bottom_shell = tk.Frame(console, bg=PANEL)
        bottom_shell.grid(row=2, column=0, sticky="nsew", padx=24, pady=(8, 22))
        bottom_shell.grid_columnconfigure(1, weight=1)
        bottom_shell.grid_rowconfigure(0, weight=1)

        self.dpad = self._make_dpad(bottom_shell)
        self.dpad.grid(row=0, column=0, padx=(3, 20), pady=20)

        screen_wrap = tk.Frame(bottom_shell, bg=SCREEN, highlightbackground=SCREEN_EDGE, highlightthickness=5)
        screen_wrap.grid(row=0, column=1, sticky="nsew")
        screen_wrap.grid_columnconfigure(0, weight=1)
        screen_wrap.grid_rowconfigure(1, weight=1)
        tools = tk.Frame(screen_wrap, bg=SCREEN)
        tools.grid(row=0, column=0, sticky="ew", padx=16, pady=(13, 8))
        tools.grid_columnconfigure(1, weight=1)
        tk.Label(tools, text="BUSCAR", font=("Segoe UI Semibold", 8), bg=SCREEN, fg=SUBTLE).grid(row=0, column=0, padx=(0, 10))
        search = tk.Entry(tools, textvariable=self.search_var, font=("Segoe UI", 10), bg=CARD, fg=INK, insertbackground=INK, relief="flat", highlightbackground=LINE, highlightcolor=ACCENT, highlightthickness=1)
        search.grid(row=0, column=1, sticky="ew", ipady=7, padx=(0, 12))
        self.count_label = tk.Label(tools, text="0 juegos", font=("Segoe UI", 9), bg=SCREEN, fg=SUBTLE)
        self.count_label.grid(row=0, column=2)

        self.game_canvas = tk.Canvas(screen_wrap, bg=SCREEN, highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(screen_wrap, orient="vertical", command=self.game_canvas.yview, style="DS.Vertical.TScrollbar")
        self.game_canvas.configure(yscrollcommand=self.scrollbar.set)
        self.game_canvas.grid(row=1, column=0, sticky="nsew", padx=(11, 0), pady=(0, 10))
        self.scrollbar.grid(row=1, column=1, sticky="ns", pady=(0, 10), padx=(0, 7))
        self.game_grid = tk.Frame(self.game_canvas, bg=SCREEN)
        self.grid_window = self.game_canvas.create_window((0, 0), window=self.game_grid, anchor="nw")
        self.game_grid.bind("<Configure>", lambda _e: self.game_canvas.configure(scrollregion=self.game_canvas.bbox("all")))
        self.game_canvas.bind("<Configure>", self._resize_grid)
        self.game_canvas.bind_all("<MouseWheel>", self._mousewheel)

        self.console_buttons = self._make_buttons(bottom_shell)
        self.console_buttons.grid(row=0, column=2, padx=(20, 3), pady=20)
        self.library_button = tk.Button(header, text="Ampliar biblioteca", command=self._toggle_library, bg=PANEL_2, fg=TEXT, relief="flat", padx=10, pady=8, cursor="hand2")
        self.library_button.pack(side="right", padx=10)
        self.library_expanded = False

        footer = tk.Frame(self, bg=BG)
        footer.place(relx=.5, rely=1, anchor="s", y=-3)
        tk.Label(footer, text="FLECHAS  mover     ENTER  jugar     I  detalles     R  actualizar", font=("Segoe UI", 10), bg=BG, fg=MUTED).pack()

    def _toggle_library(self):
        self.library_expanded = not self.library_expanded
        for widget in (self.dpad, self.console_buttons):
            widget.grid_remove() if self.library_expanded else widget.grid()
        self.library_button.configure(text="Vista consola" if self.library_expanded else "Ampliar biblioteca")

    def _make_dpad(self, parent):
        pad = tk.Frame(parent, width=112, height=112, bg=PANEL)
        pad.grid_propagate(False)
        for x, y, symbol, key in [(38, 0, "▲", "Up"), (38, 74, "▼", "Down"), (0, 37, "◀", "Left"), (76, 37, "▶", "Right")]:
            button = tk.Button(pad, text=symbol, command=lambda k=key: self.move_selection(k), bg="#15171b", fg="#777e87", activebackground="#343840", activeforeground=TEXT, relief="flat", borderwidth=0, font=("Segoe UI", 9), cursor="hand2")
            button.place(x=x, y=y, width=36, height=38)
        tk.Frame(pad, bg="#15171b").place(x=38, y=37, width=38, height=38)
        return pad

    def _make_buttons(self, parent):
        box = tk.Frame(parent, width=126, height=118, bg=PANEL)
        box.grid_propagate(False)
        self._circle_button(box, "A", self.launch_selected, 76, 28, ACCENT)
        self._circle_button(box, "B", lambda: self.search_var.set(""), 28, 66, "#858c95")
        tk.Label(box, text="SELECT", bg=PANEL, fg="#6f7680", font=("Segoe UI", 7)).place(x=78, y=77)
        return box

    def _circle_button(self, parent, text, command, x, y, color):
        canvas = tk.Canvas(parent, width=44, height=44, bg=PANEL, highlightthickness=0, cursor="hand2")
        canvas.place(x=x, y=y)
        circle = canvas.create_oval(3, 3, 41, 41, fill="#17191e", outline="#3b4048", width=2)
        canvas.create_text(22, 22, text=text, fill=color, font=("Segoe UI Semibold", 11))
        canvas.bind("<Button-1>", lambda _e: command())
        canvas.bind("<Enter>", lambda _e: canvas.itemconfigure(circle, fill="#343840"))
        canvas.bind("<Leave>", lambda _e: canvas.itemconfigure(circle, fill="#17191e"))

    def _first_run(self):
        rom_ok = Path(self.config_data.get("rom_folder", "")).is_dir()
        active = emulator_path(self.config_data)
        emulator_ok = bool(active and active.is_file())
        if not rom_ok or not emulator_ok:
            self.open_settings()

    def _emulator_changed(self, _event=None):
        self.config_data["emulator_type"] = self.emulator_var.get()
        try:
            save_config(self.config_data)
        except OSError:
            pass
        self.update_hero()

    def _tick_clock(self):
        self.clock_label.configure(text=datetime.now().strftime("%H:%M"))
        self.after(1000, self._tick_clock)

    def open_settings(self):
        SettingsDialog(self, self.config_data, self.apply_settings)

    def apply_settings(self, new_config: dict):
        merged = {**self.config_data, **new_config}
        try:
            save_config(merged)
        except OSError as exc:
            messagebox.showerror("No se pudo guardar", str(exc), parent=self)
            return False
        self.config_data = merged
        self.emulator_var.set(merged.get("emulator_type", "DeSmuME"))
        self.reload_games()
        return True

    def reload_games(self):
        folder_text = self.config_data.get("rom_folder", "")
        folder = Path(folder_text) if folder_text else None
        self.games = []
        if folder and folder.is_dir():
            pattern = "**/*.nds" if self.config_data.get("recursive") else "*.nds"
            paths = sorted(folder.glob(pattern), key=lambda p: p.name.casefold())
            self.games = [Game(path=p, title=title_from_filename(p)) for p in paths if p.is_file()]
        self.apply_filter()
        if not self.games:
            self._show_empty()

    def apply_filter(self):
        query = self.search_var.get().strip().casefold()
        self.filtered_games = [g for g in self.games if query in g.title.casefold()]
        self.selected_index = 0 if self.filtered_games else -1
        self.render_games()
        self.update_hero()

    def render_games(self):
        for widget in self.game_grid.winfo_children():
            widget.destroy()
        self.card_widgets.clear()
        self.photo_refs.clear()
        self.count_label.configure(text=f"{len(self.filtered_games)} juego{'s' if len(self.filtered_games) != 1 else ''}")
        columns = max(2, min(5, self.game_canvas.winfo_width() // 145))
        for col in range(columns):
            self.game_grid.grid_columnconfigure(col, weight=1, uniform="games")
        for index, game in enumerate(self.filtered_games):
            card = self._game_card(game, index)
            card.grid(row=index // columns, column=index % columns, padx=5, pady=5, sticky="nsew")
            self.card_widgets.append(card)
        self._highlight_selection()
        if not self.filtered_games:
            self._show_empty()

    def _game_card(self, game: Game, index: int):
        card = tk.Frame(self.game_grid, bg=CARD, highlightthickness=1, highlightbackground=LINE, cursor="hand2")
        image = self._load_game_art(game, (78, 78))
        if image is not None and ImageTk is not None:
            photo = ImageTk.PhotoImage(image)
            self.photo_refs.append(photo)
            icon = tk.Label(card, image=photo, bg=CARD, cursor="hand2")
        else:
            icon = tk.Label(card, text="DS", font=("Segoe UI Semibold", 16), bg="#eef1f3", fg=SUBTLE, cursor="hand2", width=6, height=3)
        icon.pack(padx=11, pady=(11, 7))
        label = tk.Label(card, text=game.title, font=("Segoe UI", 10), bg=CARD, fg=INK, wraplength=116, height=2, cursor="hand2")
        label.pack(fill="x", padx=8, pady=(0, 9))
        for widget in (card, icon, label):
            widget.bind("<Button-1>", lambda _e, i=index: self.select_game(i))
            widget.bind("<Double-Button-1>", lambda _e, i=index: self._select_and_launch(i))
            widget.bind("<Button-3>", lambda _e, i=index: self._select_and_show_details(i))
        return card

    def _cover_candidates(self, game: Game):
        extensions = (".png", ".jpg", ".jpeg", ".webp", ".bmp")
        folders = [game.path.parent]
        configured = self.config_data.get("covers_folder", "")
        if configured:
            folders.insert(0, Path(configured))
        folders.extend([game.path.parent / "covers", game.path.parent / "caratulas"])
        for folder in folders:
            for extension in extensions:
                yield folder / f"{game.path.stem}{extension}"

    def _load_game_art(self, game: Game, size: tuple[int, int]):
        if Image is None:
            return None
        if game.image is None:
            for candidate in self._cover_candidates(game):
                try:
                    if candidate.is_file():
                        with Image.open(candidate) as source:
                            game.image = source.convert("RGBA")
                        break
                except OSError:
                    continue
            if game.image is None:
                game.image = decode_ds_icon(game.path) or make_placeholder(game.title)
        return fit_image(game.image, size)

    def select_game(self, index: int):
        if 0 <= index < len(self.filtered_games):
            self.selected_index = index
            self._highlight_selection()
            self.update_hero()

    def _select_and_launch(self, index: int):
        self.select_game(index)
        self.launch_selected()

    def _select_and_show_details(self, index: int):
        self.select_game(index)
        self.show_selected_details()

    def _highlight_selection(self):
        for index, card in enumerate(self.card_widgets):
            selected = index == self.selected_index
            card.configure(highlightbackground=ACCENT if selected else LINE, highlightthickness=2 if selected else 1, bg=CARD_SELECTED if selected else CARD)
            for child in card.winfo_children():
                if isinstance(child, tk.Label):
                    child.configure(bg=CARD_SELECTED if selected else CARD)

    def update_hero(self):
        if self.selected_index < 0 or not self.filtered_games:
            self.hero_title.configure(text="Elige un juego")
            self.hero_path.configure(text="Configura tu carpeta para empezar" if not self.games else "No hay coincidencias")
            self.hero_image_label.configure(image="", text="DS", font=("Segoe UI Semibold", 36), fg="#9ba4ac", width=5)
            self.status_label.configure(text="")
            return
        game = self.filtered_games[self.selected_index]
        self.hero_title.configure(text=game.title)
        self.hero_path.configure(text=f"ROM  ·  {game.path}")
        art = self._load_game_art(game, (122, 122))
        if art is not None and ImageTk is not None:
            self.hero_photo = ImageTk.PhotoImage(art)
            self.hero_image_label.configure(image=self.hero_photo, text="", width=122)
        save = find_save_info(game, self.config_data).active
        self.status_label.configure(text="Guardado detectado" if save else "No se ha encontrado una partida", fg="#518d78" if save else SUBTLE)

    def _show_empty(self):
        if self.game_grid.winfo_children():
            return
        empty = tk.Frame(self.game_grid, bg=SCREEN)
        empty.pack(fill="both", expand=True, padx=30, pady=35)
        tk.Label(empty, text="No hay coincidencias" if self.games else "No hay juegos todavía", font=("Segoe UI Semibold", 16), bg=SCREEN, fg=INK).pack()
        tk.Label(empty, text="Prueba otro nombre o borra la búsqueda." if self.games else "Añade archivos .nds a la carpeta elegida\no cambia la carpeta desde Ajustes.", font=("Segoe UI", 10), bg=SCREEN, fg=SUBTLE, justify="center").pack(pady=6)
        tk.Button(empty, text="Abrir configuración", command=self.open_settings, bg=ACCENT, fg="#071324", activebackground=ACCENT_2, relief="flat", padx=18, pady=8, font=("Segoe UI Semibold", 10), cursor="hand2").pack(pady=8)

    def launch_selected(self):
        if self.selected_index < 0 or self.selected_index >= len(self.filtered_games):
            messagebox.showinfo(APP_NAME, "Primero selecciona un juego.", parent=self)
            return
        emulator_name = self.config_data.get("emulator_type", "DeSmuME")
        emulator = emulator_path(self.config_data, emulator_name)
        if not emulator or not emulator.is_file():
            messagebox.showwarning(f"Falta {emulator_name}", f"Selecciona el archivo ejecutable de {emulator_name} en Ajustes.", parent=self)
            self.open_settings()
            return
        game = self.filtered_games[self.selected_index]
        args = [str(emulator)]
        extra = self.config_data.get("extra_args", "").strip()
        if extra:
            import shlex
            args.extend(shlex.split(extra, posix=True))
        args.append(str(game.path))
        try:
            subprocess.Popen(args, cwd=str(emulator.parent))
            self.status_label.configure(text="Juego iniciado ✓")
        except OSError as exc:
            messagebox.showerror("No se pudo abrir el juego", f"{emulator_name} no pudo iniciarse.\n\n{exc}", parent=self)

    def show_selected_details(self):
        if self.selected_index < 0 or self.selected_index >= len(self.filtered_games):
            messagebox.showinfo(APP_NAME, "Primero selecciona un juego.", parent=self)
            return
        GameDetailsDialog(self, self.filtered_games[self.selected_index], self.config_data)

    def move_selection(self, direction: str):
        if not self.filtered_games:
            return
        columns = max(2, min(5, self.game_canvas.winfo_width() // 145))
        delta = {"Left": -1, "Right": 1, "Up": -columns, "Down": columns}.get(direction, 0)
        self.selected_index = max(0, min(len(self.filtered_games) - 1, self.selected_index + delta))
        self._highlight_selection()
        self.update_hero()
        if self.card_widgets:
            card = self.card_widgets[self.selected_index]
            self.game_canvas.yview_moveto(max(0, card.winfo_y() / max(1, self.game_grid.winfo_height())))

    def _on_key(self, event):
        if event.widget.winfo_toplevel() is not self:
            return
        if isinstance(self.focus_get(), (tk.Entry, ttk.Combobox, tk.Button)):

            if event.keysym == "Escape":
                self.focus_set()
            return
        if event.keysym in ("Left", "Right", "Up", "Down"):
            self.move_selection(event.keysym)
        elif event.keysym in ("Return", "space", "a", "A"):
            self.launch_selected()
        elif event.keysym in ("r", "R", "F5"):
            self.reload_games()
        elif event.keysym in ("i", "I"):
            self.show_selected_details()
        elif event.keysym in ("b", "B", "Escape"):
            self.search_var.set("")

    def _resize_grid(self, event):
        self.game_canvas.itemconfigure(self.grid_window, width=event.width)
        self.after_idle(self.render_games)

    def _mousewheel(self, event):
        try:
            self.game_canvas.yview_scroll(int(-event.delta / 120), "units")
        except tk.TclError:
            pass


def main():
    if sys.platform == "win32":
        try:
            import ctypes
            ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("DSGameMenu.Launcher.1.1")
        except (AttributeError, OSError):
            pass
    app = DSGameMenu()
    app.mainloop()


if __name__ == "__main__":
    main()
