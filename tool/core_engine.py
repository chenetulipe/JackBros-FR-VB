# -*- coding: utf-8 -*-
"""
Jack Bros (Virtual Boy) - Moteur de Romhacking et Encodage Texte
Dédié à la ROM américaine officielle (1995 Atlus)
"""

import os
import json

def extract_all_text(rom_path, out_json_path, logger=None):
    with open(rom_path, 'rb') as f:
        rom_data = bytearray(f.read())

    base_json = os.path.join(os.path.dirname(__file__), '..', 'traduction', 'JackBros_FR.json')
    if not os.path.exists(base_json):
        base_json = os.path.join(os.path.dirname(__file__), 'traduction', 'JackBros_FR.json')

    if os.path.exists(base_json):
        with open(base_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if logger: logger(f'Chargement de {len(data)} dialogues de référence.', 'info')
    else:
        data = []

    with open(out_json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    if logger: logger(f'[OK] {len(data)} dialogues prêts dans {os.path.basename(out_json_path)}', 'success')
    return len(data)

def encode_and_insert_text(rom_bytes, json_path, logger=None):
    rom = bytearray(rom_bytes)
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if logger: logger(f'Encodage de {len(data)} dialogues...', 'info')
    for d in data:
        off = d['offset']
        slot_size = d['slot_size']
        is_f2 = (d['font'] == 2)
        text = d.get('texte_fr', d.get('texte_orig', ''))

        res = bytearray()
        i = 0
        while i < len(text):
            if text[i:i+5] == '<END>':
                res.append(0x02)
                i += 5
                continue
            if text[i:i+6] == '<PAGE>':
                res.append(0x06)
                i += 6
                continue
            if text[i:i+2] == '\\n':
                res.append(0x05)
                i += 2
                continue

            c = text[i]
            if not is_f2:
                if c == ' ': res.append(0x00)
                elif c == '\n': res.append(0x05)
                elif c == '!': res.append(0x34)
                elif c == '.': res.append(0x75)
                elif c == ',': res.append(0x74)
                elif c == "'": res.append(0x7A)
                elif c == '=': res.append(0x4F)
                elif c == '?': res.append(0x7B)
                elif c == '-': res.append(0x00)
                elif c == ':': res.append(0x37)
                elif c == '[': res.append(0x78)
                elif c == ']': res.append(0x79)
                elif c == '(': res.append(0x39)
                elif c == ')': res.append(0x3A)
                elif 'A' <= c <= 'Z': res.append(ord(c) - 39)
                elif 'a' <= c <= 'z': res.append(ord(c) - 7)
                elif '0' <= c <= '9': res.append(ord(c) - 32)
                else: res.append(0x00)
            else:
                if c == ' ': res.append(0x00)
                elif c == '\n': res.append(0x05)
                elif c == '.': res.append(0x40)
                elif c == ',': res.append(0x3E)
                elif c == "'": res.append(0x45)
                elif c == ':': res.append(0x41)
                elif c == '?': res.append(0x42)
                elif c == '!': res.append(0x34)
                elif c == '-': res.append(0x3F)
                elif 'A' <= c <= 'Z': res.append(ord(c) - 39)
                elif 'a' <= c <= 'z': res.append(ord(c) - 1)
                elif '0' <= c <= '9': res.append(ord(c) - 32)
                else: res.append(0x00)
            i += 1

        encoded_len = min(len(res), slot_size)
        if len(res) > slot_size:
            if logger: logger(f"Texte ID {d['id']} tronqué ({len(res)} > {slot_size} octets)", 'warn')
            res = res[:slot_size]
            if slot_size > 0:
                res[-1] = 0x02
            encoded_len = len(res)

        for j in range(encoded_len):
            rom[off + j] = res[j]
        for j in range(encoded_len, slot_size):
            rom[off + j] = 0x00

    if logger: logger('[OK] Tous les textes ont été réinjectés proprement.', 'success')
    return bytes(rom)
