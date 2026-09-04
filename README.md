<div align="center">

# Jack Bros. — Traduction Française

**Patch de traduction intégrale en français pour la version américaine de *Jack Bros.* sur Nintendo Virtual Boy (1995, Atlus)**

<br/>

<a href="https://fr.wikipedia.org/wiki/Virtual_Boy"><img src="https://img.shields.io/badge/Nintendo_Virtual_Boy-E60012?style=for-the-badge&logo=nintendo&logoColor=white" alt="Plateforme" /></a>
<img src="https://img.shields.io/badge/Statut-VERSION_FINALE_100%25-10b981?style=for-the-badge" alt="Statut" />
<img src="https://img.shields.io/badge/Développeur-ATLUS-005cb9?style=for-the-badge" alt="Développeur" />
<img src="https://img.shields.io/badge/Licence-CC_BY--NC--SA_4.0-lightgrey?style=for-the-badge" alt="Licence" />

<br/><br/>

**Le tout premier spin-off de la saga culte *Megami Tensei*, intégralement jouable en français pour la première fois.**

</div>

<br/>

---

## 📖 Présentation du Jeu

Sorti en **1995** par **ATLUS**, *Jack Bros.* (*Jack Bros. no Kieta Mahishō*) est l'un des jeux les plus acclamés et recherchés de la ludothèque Virtual Boy. Mettant en scène les mascottes emblématiques de la franchise *Shin Megami Tensei* — **Jack Frost**, **Jack Lantern** et **Jack Skelton** — le titre propose un jeu d'action en vue du dessus haletant.

Les frères Jack sont venus visiter le monde des humains pour la nuit d'Halloween. Mais à minuit, le portail menant au monde des Fées se refermera à jamais ! Guidés par la fée **Pixie**, traversez 6 mondes labyrinthiques truffés de pièges, d'ennemis et de boss redoutables pour regagner votre foyer à temps.

Jamais localisé dans les pays francophones à l'époque, ce projet propose une **traduction intégrale et soignée**, fidèle à l'humour et à l'esprit d'origine d'Atlus.

---

## 📸 Aperçu en Jeu (Captures d'Écran)

| Écran Titre | Nuit d'Halloween |
|:---:|:---:|
| <img src="assets/screenshots/01_ecran_titre.png" width="380" alt="Écran titre traduit en français" /> | <img src="assets/screenshots/02_intro_halloween.png" width="380" alt="Introduction d'Halloween" /> |

| Rencontre avec Pixie | Forêt des Fées (Monde 1) |
|:---:|:---:|
| <img src="assets/screenshots/03_dialogue_pixie.png" width="380" alt="Dialogue avec Pixie" /> | <img src="assets/screenshots/04_monde_foret_des_fees.png" width="380" alt="Entrée du Monde 1" /> |

| Astuces de Gameplay | Rencontre avec les Monstres |
|:---:|:---:|
| <img src="assets/screenshots/05_in_game_cle.png" width="380" alt="Dialogue in-game sur les clés" /> | <img src="assets/screenshots/06_in_game_slime.png" width="380" alt="Dialogue in-game sur le monstre Slime" /> |

---

## 📊 Avancement de la Traduction

| Catégorie | État | Détails |
|:---|:---:|:---|
| **Histoire & Cinématiques** | **100%** | Introduction d'Halloween, cinématiques de mondes et épilogues traduits |
| **Menus & Textes Système** | **100%** | Écran titre, sélection des personnages, options et crédits |
| **Dialogues In-Game (Fées & PNJ)** | **100%** | 142 répliques complètes vérifiées et testées |
| **Dialogues des Boss** | **100%** | Skelton, Morgan, Furin, Cyclops et Belzoff intégralement traduits |
| **Correction des Glyphes** | **100%** | Bug du dièse `#` résolu avec adaptation de l'espacement |
| **Stabilité de la ROM** | **100%** | Aucun débordement mémoire (`slot_size`), zéro glitch sonore |

---

## 🛠️ Comment Compiler la ROM Traduite

Pour des raisons légales évidentes, **aucune ROM commerciale n'est fournie dans ce dépôt**. Vous devez disposer de votre propre copie de la ROM originale américaine :  
`Jack Bros. (USA).vb` (Taille exacte : `1 048 576 octets`).

### Méthode 1 — Avec l'Outil Web Moderne (Recommandé)

1. Double-cliquez simplement sur le fichier **`start.bat`** à la racine du projet.
2. Le script vérifie les dépendances Python requises (`fastapi`, `uvicorn`, `pydantic`) et démarre le serveur.
3. Votre navigateur s'ouvre automatiquement sur l'interface : **`http://127.0.0.1:8000`**
4. Glissez-déposez votre fichier `Jack Bros. (USA).vb`.
5. Cliquez sur **Compiler la ROM traduite [Jack Bros (Fr).vb]**.
6. Votre ROM traduite et prête à jouer est générée instantanément !

### Méthode 2 — En Ligne de Commande (Python)

Si vous préférez la ligne de commande :

```bash
# 1. Installer les dépendances légères
pip install -r tool/requirements.txt

# 2. Compiler via le moteur
python -c "
import sys; sys.path.insert(0, 'tool')
from core_engine import encode_and_insert_text
with open('Jack Bros. (USA).vb', 'rb') as f: rom = f.read()
patched = encode_and_insert_text(rom, 'traduction/JackBros_FR.json', print)
with open('Jack Bros (Fr).vb', 'wb') as f: f.write(patched)
print('ROM compilee avec succes !')
"
```

---

## 🎮 Comment Jouer

La ROM compilée `Jack Bros (Fr).vb` est compatible avec toutes les solutions d'émulation et le matériel d'origine :

1. **Sur PC (Windows / Linux / macOS)** :
   - **[Mednafen](https://mednafen.github.io/)** (Recommandé) : L'émulateur le plus fidèle au matériel d'origine. Glissez simplement la ROM sur l'exécutable `mednafen.exe`.
   - **[RetroArch](https://www.retroarch.com/)** avec le cœur **Beetle VB**.
2. **En Réalité Virtuelle / Casques VR** :
   - Compatible avec **Virtual Boy Go** (Meta Quest / PCVR) pour revivre la 3D stéréoscopique rouge d'origine dans des conditions optimales.
3. **Sur Nintendo 3DS** :
   - Via l'émulateur homebrew **Red-Viper** (effet 3D stéréoscopique de la 3DS parfait !).
4. **Sur Vraie Console Virtual Boy** :
   - 100% fonctionnel sur le matériel d'origine via cartouche flash (**FlashBoy Plus**, **Virtual Boy Pro**).

---

## 📁 Architecture du Dépôt

```text
JackBros-FR-VB/
├── start.bat                  # Lanceur rapide du Web Tool (double-clic)
├── README.md                  # Présentation générale du projet
├── DOCUMENTATION.md           # Documentation technique approfondie de la ROM
├── CREDITS.md                 # Remerciements et crédits officiels
├── assets/
│   └── screenshots/           # Captures d'écran in-game de la version française
├── traduction/
│   └── JackBros_FR.json       # Les 142 répliques traduites (format JSON standard)
└── tool/
    ├── requirements.txt       # Dépendances Python minimales
    ├── server.py              # Serveur local FastAPI (API REST)
    ├── core_engine.py         # Moteur de réinjection textuelle et contrôle des bornes
    └── dist/                  # Interface utilisateur Web (Glassmorphism, Tailwind CSS)
        ├── index.html
        ├── app.js
        └── style.css
```

---

## 📚 Documentation & Reverse-Engineering

Pour consulter l'étude complète de la cartouche (spécificités de l'architecture NEC V810, format des tuiles 2bpp du coprocesseur VIP, cartographie des polices et gestion des délimitations de pointeurs), lisez :  
👉 **[DOCUMENTATION.md](./DOCUMENTATION.md)**

Pour consulter l'ensemble des remerciements et contributeurs :  
👉 **[CREDITS.md](./CREDITS.md)**

---

<div align="center">
  <sub>Projet libre et open-source développé par <b><a href="https://github.com/chenetulipe">chenetulipe</a></b>. Jack Bros. © 1995 ATLUS.</sub>
</div>
