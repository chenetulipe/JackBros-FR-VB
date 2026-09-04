# -*- coding: utf-8 -*-
"""
Jack Bros Translation Tool Backend - FastAPI Server
Développé pour la traduction française de Jack Bros (Virtual Boy)
"""

import os
import sys
import json
import threading
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from core_engine import extract_all_text, encode_and_insert_text

app = FastAPI(title="Jack Bros Translation Tool Backend")

DIST_DIR = Path(__file__).parent / "dist"
if (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

progress_state = {"current": 0, "task": "", "logs": []}
progress_lock = threading.Lock()

def update_progress(percent: float):
    with progress_lock:
        progress_state["current"] = int(percent * 100)

def reset_progress(task_name: str):
    with progress_lock:
        progress_state["task"] = task_name
        progress_state["current"] = 0
        progress_state["logs"].clear()

def get_logger(work_dir=None):
    def log(msg, level="info"):
        try:
            print(f"[{level.upper()}] {msg}")
        except Exception:
            pass
        with progress_lock:
            progress_state["logs"].append({"msg": msg, "type": level.upper()})
    return log

class RomRequest(BaseModel):
    rom_path: str
    work_dir: str

@app.get("/api/progress")
async def get_progress():
    with progress_lock:
        cur = progress_state["current"]
        task = progress_state["task"]
        response = {
            "current": cur,
            "task": task,
            "logs": list(progress_state["logs"])
        }
        progress_state["logs"].clear()
        if cur >= 100:
            progress_state["current"] = 0
            progress_state["task"] = ""
        return response

@app.get("/api/default-paths")
def api_default_paths():
    root_folder = Path(__file__).resolve().parent.parent
    return {
        "work_dir": str(root_folder),
        "rom_path": ""
    }

@app.post("/api/extract-text")
def api_extract_text(req: RomRequest):
    reset_progress("extract-text")
    logger = get_logger(req.work_dir)
    rom = Path(req.rom_path)
    if not rom.exists():
        raise HTTPException(status_code=400, detail="Fichier ROM introuvable")

    w = Path(req.work_dir)
    trad_dir = w / "traduction"
    trad_dir.mkdir(parents=True, exist_ok=True)
    out_json = trad_dir / "JackBros_FR.json"

    update_progress(0.2)
    count = extract_all_text(str(rom), str(out_json), logger)
    update_progress(1.0)
    return {"status": "ok", "msg": f"{count} dialogues extraits dans {out_json.name}", "count": count}

@app.get("/api/get-translations")
def api_get_translations(work_dir: str):
    w = Path(work_dir)
    target = w / "traduction" / "JackBros_FR.json"
    if not target.exists():
        raise HTTPException(status_code=404, detail="Fichier traduction/JackBros_FR.json introuvable.")
    with open(target, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

@app.post("/api/save-translations")
def api_save_translations(payload: dict):
    work_dir = payload.get("work_dir")
    data = payload.get("data")
    if not work_dir or data is None:
        raise HTTPException(status_code=400, detail="Paramètres manquants")
    w = Path(work_dir)
    target = w / "traduction" / "JackBros_FR.json"
    with open(target, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    return {"status": "ok", "msg": "Traductions sauvegardées avec succès."}

@app.post("/api/rebuild-rom")
def api_rebuild_rom(req: RomRequest):
    reset_progress("rebuild-rom")
    logger = get_logger(req.work_dir)
    rom_orig = Path(req.rom_path)
    w = Path(req.work_dir)
    if not rom_orig.exists():
        raise HTTPException(status_code=400, detail="ROM originale introuvable.")

    with open(rom_orig, 'rb') as f:
        rom_bytes = f.read()

    update_progress(0.3)
    json_path = w / "traduction" / "JackBros_FR.json"
    if not json_path.exists():
        raise HTTPException(status_code=404, detail="Fichier traduction/JackBros_FR.json introuvable.")

    rom_bytes = encode_and_insert_text(rom_bytes, str(json_path), logger)

    update_progress(0.8)
    out_rom = w / "Jack Bros (Fr).vb"
    with open(out_rom, 'wb') as f:
        f.write(rom_bytes)

    update_progress(1.0)
    logger(f"[OK] ROM compilée avec succès : {out_rom.name}", "success")
    return {"status": "ok", "msg": "ROM compilée avec succès !", "out_path": str(out_rom)}

@app.get("/")
def get_index():
    return FileResponse(str(DIST_DIR / "index.html"))

app.mount("/", StaticFiles(directory=str(DIST_DIR)), name="static")

if __name__ == "__main__":
    import uvicorn
    import webbrowser
    threading.Timer(1.2, lambda: webbrowser.open("http://127.0.0.1:8000")).start()
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
