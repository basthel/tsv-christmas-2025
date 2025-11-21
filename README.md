# TSV Marquartstein - Saison 2025 Statistiken 🎄⚽

Eine festliche, mobile-optimierte Statistik-Website für den TSV Marquartstein Fußballverein.

## Features

- 📈 **Interaktive Statistiken**: Rollierender Durchschnitt der Tore über die Saison
- 📊 **10-Jahres-Übersicht**: Entwicklung der Spielerzahlen über die Zeit
- 🏆 **Top-Spieler**: Rangliste nach Anwesenheitsquote
- 🎄 **Weihnachtsthema**: Festliches Design mit Vereinsfarben
- 📱 **Mobile-First**: Optimiert für Smartphone-Ansicht
- ❄️ **Animationen**: Schneeflocken und festliche Effekte

## Live Demo

Die Website ist live unter: **https://basthel.github.io/tsv-christmas-2025/**

## QR-Code

Scanne den QR-Code mit deinem Smartphone für direkten Zugriff zur Website:

![QR Code](https://basthel.github.io/tsv-christmas-2025/qr_code_printable.png)

## Technologie

- **Frontend**: HTML5, CSS3, JavaScript
- **Charts**: Chart.js
- **Hosting**: GitHub Pages
- **Datenverarbeitung**: Python (Pandas, PIL)

## Projektstruktur

```
.
├── docs/                # Website-Dateien (für GitHub Pages)
│   ├── index.html         # Hauptseite
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript
│   ├── assets/            # Assets (Bilder, Daten)
│   └── qr_code*.png       # QR-Codes
├── data/                  # Rohdaten (nicht im Repo)
├── utils/                 # Python-Skripte für Datenverarbeitung
└── venv/                  # Python Virtual Environment

```

## Entwicklung

### Datenverarbeitung

```bash
# Virtual environment aktivieren
source venv/bin/activate

# Daten verarbeiten
python utils/process_all_data.py

# QR-Code generieren
python utils/generate_qr.py "https://your-url.com"
```

### Lokaler Test

```bash
cd docs
python -m http.server 8000
# Öffne http://localhost:8000
```

## Deployment

Die Website wird automatisch über GitHub Pages bereitgestellt.

1. Repository auf GitHub pushen
2. In Repository-Settings → Pages → Source: Branch `main`, Folder `/docs`
3. Website ist live unter: https://basthel.github.io/tsv-christmas-2025/

## Lizenz

Erstellt für TSV Marquartstein | Saison 2025

---

🎅 Frohe Weihnachten und ein erfolgreiches neues Jahr! 🎄
