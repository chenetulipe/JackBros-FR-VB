<div align="center">

# Jack Bros. (Virtual Boy) - Patch Français

**Traduction française intégrale de *Jack Bros.* sur Nintendo Virtual Boy (Atlus, 1995)**

<br/>

<a href="https://fr.wikipedia.org/wiki/Virtual_Boy"><img src="https://img.shields.io/badge/Virtual_Boy-red?style=flat-square&logo=nintendo&logoColor=white" alt="Plateforme" /></a>
<img src="https://img.shields.io/badge/Version-1.0_Finale-emerald?style=flat-square" alt="Version" />
<img src="https://img.shields.io/badge/Statut-100%25_Jouable-blue?style=flat-square" alt="Statut" />
<a href="https://github.com/chenetulipe/JackBros-FR-VB/releases"><img src="https://img.shields.io/badge/Releases-Télécharger_le_patch-purple?style=flat-square" alt="Releases" /></a>

<br/><br/>

Premier spin-off officiel de la série *Megami Tensei*, mettant en vedette Jack Frost, Jack Lantern et Jack Skelton.  
Le jeu est désormais entièrement jouable en français.

</div>

<br/>

---

## Présentation

Sorti à l'automne 1995 par **Atlus**, *Jack Bros.* est l'un des rares jeux d'action en vue du dessus du Virtual Boy. 

Les trois frères Jack ont profité d'Halloween pour visiter le monde des humains. Le problème : ils ont jusqu'à minuit pour retrouver le portail féerique, sans quoi ils resteront bloqués pour toujours. Guidés par la fée Pixie, ils doivent traverser 6 mondes remplis de pièges, d'ennemis et de boss.

Le jeu n'était sorti qu'au Japon et aux États-Unis. Ce patch traduit l'ensemble des textes en français : cinématiques, dialogues des boss, indices des fées et menus.

<br/>

---

## Captures d'écran

<br/>

| Écran-titre | Introduction |
|:---:|:---:|
| <img src="assets/screenshots/01_ecran_titre.png" width="370" alt="Écran-titre en français" /> | <img src="assets/screenshots/02_intro_halloween.png" width="370" alt="Introduction d'Halloween" /> |

<br/>

| Dialogue avec Pixie | Monde 1 (Forêt des Fées) |
|:---:|:---:|
| <img src="assets/screenshots/03_dialogue_pixie.png" width="370" alt="Dialogue avec Pixie" /> | <img src="assets/screenshots/04_monde_foret_des_fees.png" width="370" alt="Forêt des Fées" /> |

<br/>

| Indice de jeu (Clés) | Astuce en donjon (Slime) |
|:---:|:---:|
| <img src="assets/screenshots/05_in_game_cle.png" width="370" alt="Indice en donjon" /> | <img src="assets/screenshots/06_in_game_slime.png" width="370" alt="Astuce en jeu" /> |

<br/>

---

## Comment appliquer le patch

Vous devez posséder une copie légale de la ROM américaine originale :  
`Jack Bros. (USA).vb` (taille exacte : 1 048 576 octets).

<br/>

### Option A : Via le patch xdelta (le plus simple)

1. Rendez-vous dans l'onglet **[Releases](https://github.com/chenetulipe/JackBros-FR-VB/releases)** de ce dépôt.
2. Téléchargez le fichier de patch `JackBros_FR.xdelta`.
3. Ouvrez un patcher en ligne (par exemple [Marc Robledo ROM Patcher JS](https://www.marcrobledo.com/RomPatcher.js/)).
4. Sélectionnez votre ROM d'origine et le patch `.xdelta`.
5. Sauvegardez votre fichier patché `Jack Bros (Fr).vb`.

<br/>

### Option B : Via l'outil de traduction inclus (Tool)

Le dépôt contient un outil local avec interface web pour inspecter les dialogues et compiler la ROM directement :

1. Double-cliquez sur `start.bat` à la racine.
2. Votre navigateur s'ouvre sur `http://127.0.0.1:8000`.
3. Glissez votre ROM `Jack Bros. (USA).vb` dans l'interface.
4. Cliquez sur **Compiler la ROM**.

<br/>

---

## Comment jouer

La ROM patchée fonctionne sur tous les émulateurs Virtual Boy actuels :

- **Sur PC** : [Mednafen](https://mednafen.github.io/) (recommandé pour sa fidélité) ou **RetroArch** (core Beetle VB).
- **Sur Nintendo 3DS** : avec l'émulateur homebrew **Red-Viper** (gestion de la 3D stéréoscopique de la console).
- **En Réalité Virtuelle** : via **Virtual Boy Go** (Oculus Quest / PCVR).
- **Sur vraie console Virtual Boy** : compatible avec les cartouches flash (FlashBoy Plus, Virtual Boy Pro).

<br/>

---

## Contenu du projet

```text
JackBros-FR-VB/
├── start.bat                  # Lanceur de l'outil web local
├── README.md                  # Présentation du projet
├── DOCUMENTATION.md           # Notes techniques sur la ROM et le romhacking
├── CREDITS.md                 # Remerciements et crédits
├── assets/screenshots/        # Captures d'écran du jeu en français
├── traduction/
│   └── JackBros_FR.json       # Fichier JSON contenant les 142 textes traduits
└── tool/                      # Outil web local (Python / FastAPI / HTML)
```

<br/>

---

## Crédits & Remerciements

- Projet réalisé par **[chenetulipe](https://github.com/chenetulipe)**.
- Merci à **Atlus** pour le jeu original (1995).
- Retrouvez tous les détails et remerciements dans le fichier **[CREDITS.md](./CREDITS.md)**.
