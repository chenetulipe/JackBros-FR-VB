# Documentation Technique & Romhacking — Jack Bros. (Virtual Boy)

Ce document rassemble l'ensemble des découvertes techniques issues du reverse-engineering de la ROM américaine de **Jack Bros.** (Virtual Boy, 1995, Atlus).

---

## 1. Architecture Matérielle & Mémoire

- **Console** : Nintendo Virtual Boy (1995).
- **Processeur** : NEC V810 (architecture RISC 32 bits, instructions 16/32 bits, little-endian, cadence 20 MHz).
- **Processeur Graphique** : VIP (Virtual Image Processor) pilotant deux écrans miroirs oscillants LED (384 × 224 pixels par œil, 4 nuances de rouge/noir).
- **Taille de la ROM** : Exactement 1 048 576 octets (1 Mo / `0x100000`).
- **Mappage mémoire cartouche** : La ROM est mappée à l'espace mémoire `0x07000000 - 0x070FFFFF`.

---

## 2. Système de Texte & Moteurs de Polices

Le jeu Jack Bros. utilise une architecture à **double moteur de police** (Dual-Font System) avec des tables d'encodage et des largeurs de boîte distinctes :

### A. Police 1 — Boîtes de Dialogue In-Game (`Font 1`)
- **Emplacement des textes** : Blocs inférieurs et boîtes d'astuces dans les donjons (offres des fées, PNJ, avertissements).
- **Contraintes géométriques** : Boîte étroite avec une largeur maximale de **14 caractères par ligne**.
- **Table d'encodage hexadécimal** :
  - Espace : `0x00`
  - Saut de ligne (`\n`) : `0x05`
  - Chiffres `0..9` : `0x10` à `0x19`
  - Majuscules `A..Z` : `0x1A` à `0x33` (`ord(c) - 39`)
  - Minuscules `a..z` : `0x5A` à `0x73` (`ord(c) - 7`)
  - Ponctuation : `!` = `0x34`, `.` = `0x75`, `,` = `0x74`, `'` = `0x7A`, `?` = `0x7B`, `:` = `0x37`, `[` = `0x78`, `]` = `0x79`, `(` = `0x39`, `)` = `0x3A`.
- ⚠️ **Découverte critique sur le tiret `-`** :  
  La cartouche d'origine **ne possède aucun caractère tiret dans Font 1**. L'octet `0x3E` correspond au symbole dièse `#` et `0x3F` au symbole esperluette `&`. L'injection d'un tiret dans une phrase (ex: `"Bats-le"`) affiche un `#` parasite en jeu (`"Bats#le"`).  
  **Solution technique** : Le moteur remplace automatiquement tout tiret de Font 1 par un espace propre (`0x00`) ou une tournure sans trait d'union.

### B. Police 2 — Cinématiques & Narration (`Font 2`)
- **Emplacement des textes** : Écran titre, cinématique d'introduction (Halloween), transitions de mondes et épilogues.
- **Contraintes géométriques** : Largeur jusqu'à **28 caractères par ligne**, maximum 4 lignes par écran.
- **Table d'encodage hexadécimal** :
  - Espace : `0x00`
  - Saut de ligne (`\n`) : `0x05`
  - Chiffres `0..9` : `0x10` à `0x19`
  - Majuscules `A..Z` : `0x1A` à `0x33` (`ord(c) - 39`)
  - Minuscules `a..z` : `0x60` à `0x79` (`ord(c) - 1`)
  - Ponctuation : `.` = `0x40`, `,` = `0x3E`, `'` = `0x45`, `:` = `0x41`, `?` = `0x42`, `!` = `0x34`, `-` = `0x3F`.

### C. Balises de Contrôle Mémoire
- **`0x05` (`\n`)** : Saut de ligne matériel immédiat.
- **`0x06` (`<PAGE>`)** : Saut de page. Le moteur suspend le défilement, affiche l'invite de touche et attend que le joueur appuie sur A/B avant de vider la boîte.
- **`0x02` (`<END>`)** : Fin de chaîne impérative. Indique au processeur V810 d'arrêter la lecture de la mémoire textuelle.
- **`0x00`** : Bourrage de fin de zone (padding). Les octets inutilisés dans un slot doivent être remplis de `0x00` pour éviter toute exécution parasite d'instructions résiduelles.

### D. Gestion Absolue des Slots (`slot_size`)
La ROM contient **142 entrées textuelles identifiées**.  
Chaque texte est confiné dans un slot de taille fixe (`slot_size`). Si un texte traduit dépasse cette taille en octets encodés, il écrase le pointeur ou le code assembleur suivant, provoquant un crash système ou des glitchs sonores. Le compilateur intègre un contrôle strict vérifiant que `taille_encodee <= slot_size`.

---

## 3. Analyse Graphique & Tuiles 2bpp VIP

### A. Format de Stockage des Graphismes
Le processeur VIP stocke les graphismes en tuiles de **8 × 8 pixels** encodées en **2 bits par pixel** (2bpp Chunky LSB-first).
- Chaque tuile fait **16 octets**.
- Chaque ligne de 8 pixels est encodée sur 2 octets consécutifs (`b1`, `b2`) :
  - Pixels 0 à 3 : `(b1 >> (p * 2)) & 3`
  - Pixels 4 à 7 : `(b2 >> (p * 2)) & 3`
- Palette de 4 niveaux d'intensité Virtual Boy :
  - `0` : Noir / Transparent `(0, 0, 0)`
  - `1` : Rouge sombre `(115, 0, 0)` (ombrage et contours)
  - `2` : Rouge moyen `(195, 0, 0)` (détails intermédiaires)
  - `3` : Rouge vif `(255, 40, 40)` (corps des lettres et premier plan)

### B. Découverte des Planches de Polices Officielles (16 × 16)
Contrairement aux sprites de donjons qui sont multiplexés, les polices de caractères sont stockées en méta-tuiles structurées de 16 × 16 pixels (blocs de 4 tuiles 8x8) :
1. **`0xA4000 - 0xA6000`** : **Police officielle latine complète** (chiffres `0..9`, majuscules `A..Z`, minuscules `a..z`, symboles et croix directionnelle D-Pad).
2. **`0xA0000 - 0xA2000`** : **Police japonaise Hiragana & Kanji** (laissée intacte par Atlus dans la ROM américaine).
3. **`0xA2000 - 0xA4000`** : **Police japonaise Katakana & idéogrammes de combat**.

### C. Analyse des Tuiles du HUD
- **`AUTOSHOT` (Offset `0xA8210`)** : 4 tuiles 8x8 consécutives (32 × 8 pixels). Les 6 premières lignes contiennent le lettrage avec contour sombre ; les 2 dernières lignes correspondent à la ligne de délimitation horizontale du cadre de jeu.
- **`FLOOR` (Offset `0xA8520`)** : 5 tuiles composites décalées de 4 pixels. Le début du `F` se situe à l'offset `0xA8510` (pixel 4).
- **Chronomètre & Vies (`0xA8280 - 0xA8500`)** : Le chronomètre numérique n'utilise pas des chiffres pré-dessinés complets, mais une décomposition en segments matriciels 7-segments assemblés dynamiquement par le VIP en VRAM.

### D. Pourquoi l'injection brute de tuiles corrompt l'affichage
Le processeur VIP ne lit pas les graphismes de manière séquentielle fixe, mais référence une **table de disposition d'objets (OAM)** stockée en RAM vidéo. Réécrire des tuiles brutes sans reconstruire la table de correspondance décale le multiplexage d'affichage, ce qui produit du bruit visuel lors des phases de jeu actives. La préservation des tuiles graphiques originales garantit ainsi une stabilité à 100%.

---

## 4. Pipeline d'Extraction & de Recompilation

1. **Extraction (`tool/core_engine.py`)** :  
   Lit la ROM source américaine (`Jack Bros. (USA).vb`) et exporte l'intégralité des 142 textes dans `traduction/JackBros_FR.json`.
2. **Édition** :  
   Modification des champs `texte_fr` directement dans le fichier JSON ou via l'interface web interactive (`start.bat`).
3. **Compilation Atomique** :  
   Le moteur réencode chaque chaîne, applique le contrôle des bornes physiques, remplit les octets restants par `0x00`, préserve le reste de la cartouche sans toucher aux registres graphiques, et produit le fichier **`Jack Bros (Fr).vb`**.
