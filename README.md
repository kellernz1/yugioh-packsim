# 🃏 Millennium Pack Sim

A Yu-Gi-Oh!-inspired booster opening simulator built with **Vanilla JavaScript**, featuring real card data from the **YGOPRODeck API**, tactile opening animations, holographic foil effects, and a mini in-game economy system.

The project focuses on recreating the excitement of opening trading card packs:
- boosters tear open dramatically,
- cards spread into a fan layout,
- rare cards receive cinematic reveals,
- and holographic cards shimmer dynamically with cursor interaction.

---

## 🎮 Overview

**Millennium Pack Sim** combines:
- collectible card mechanics,
- weighted rarity systems,
- local progression,
- and satisfying visual feedback

into a lightweight browser-based experience inspired by classic Yu-Gi-Oh! booster openings.

No frameworks. No build tools. Just HTML, CSS, and JavaScript.

---

## ✨ Features

---

### 📦 Booster Opening Animation

Each pack opening includes:
- CSS tear effect
- Dramatic reveal timing
- Card fan spread
- Spotlight reveal for the final card

The experience is designed to feel physical and rewarding.

---

### 🃏 Real Card Data

Cards are loaded dynamically from the **YGOPRODeck API**.

Fetched data includes:
- Card name
- Card type
- Card artwork
- Market price estimates

---

### 🧪 Fallback System

If the API becomes unavailable:
- Demo cards are automatically used
- The simulator remains fully playable offline

---

### 🎴 Rarity System

Each pack contains:
- Commons
- Rare cards
- Guaranteed shiny slot

Higher rarities include:
- Super Rare
- Ultra Rare
- Secret Rare

---

### ✨ Interactive Holographic Effects

High-rarity cards feature:
- Cursor-based 3D tilt
- Dynamic foil reflections
- `mix-blend-mode: color-dodge`
- Animated shine overlays

---

### 🌟 Secret Rare Effects

Secret Rare pulls trigger:
- Sparkle particles
- Enhanced glow
- Dramatic spotlight effects

---

### 📚 Collector Album

Your collection is automatically saved using:
- `localStorage`

Includes:
- Owned cards
- Collection value
- Duplicate tracking potential

---

### 💰 Economy System

Features:
- Wallet balance
- Card selling
- Bulk sell for commons
- Multiple booster prices

Players can:
- Open packs
- Sell duplicates
- Upgrade into premium boosters

---

### 🔊 Audio Controls

Includes:
- Sound effects
- Mute toggle
- Rare pull audio feedback

---

### 🐦 Social Sharing

Rare pulls can be shared directly to:
- Twitter / X

---

## 🎁 Booster Types

| Booster | Price | Description |
|---|---:|---|
| Starter Pack | $0.00 | Free beginner booster |
| Gold Sarcophagus | $12.00 | Better rare odds |
| Pharaoh's Vault | $30.00 | Highest Secret Rare chance |

The free starter pack helps players:
- build an initial collection,
- earn money,
- and progress naturally into premium boosters.

---

## 🎲 RNG Logic

Each pack contains **9 cards**.

### Starter Pack Distribution

- 7 × Common
- 1 × Rare
- 1 × Shiny Slot

### ✨ Shiny Slot Odds

```js
Super Rare: 70%
Ultra Rare: 25%
Secret Rare: 5%
```

Premium boosters improve:
- rarity rates
- shiny distribution
- Secret Rare probability

---

## 💰 Economy System

Each card receives a sell value based on:
1. API market price
2. Rarity multiplier

### 📊 Rarity Multipliers

```js
Common: 0.65
Rare: 1
Super Rare: 1.8
Ultra Rare: 3
Secret Rare: 5.5
```

Minimum values are also applied to ensure:
- low-price cards remain useful,
- progression always feels rewarding.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 | Styling & animations |
| Vanilla JavaScript | Game logic |
| localStorage | Persistence |
| YGOPRODeck API | Card data |

---

## 🧠 Technical Highlights

This project was built to practice and demonstrate:

- Weighted RNG systems
- Browser persistence
- Interactive CSS effects
- Animation sequencing
- Economy balancing
- API integration
- Responsive UI logic

---

## 🚀 How to Run

No dependencies or build step are required.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/millennium-pack-sim.git
```

### 2. Open the project

Simply open:

```txt
index.html
```

in any modern web browser.

---

### Optional: Use a Local Server

You can also run the project with:
- VS Code Live Server
- Python HTTP server
- Any static server

Example:

```bash
npx live-server
```

---

## 📂 Project Structure

```text
.
├── index.html
├── styles.css
├── app.js
└── README.md
```

---

## 🌐 API

Card data is loaded from:

```txt
https://db.ygoprodeck.com/api/v7/cardinfo.php
```

The project uses:
- Card names
- Artwork
- Types
- Market prices

---

## 🎨 Visual Style

Inspired by:
- Classic Yu-Gi-Oh! pack openings
- TCG simulator websites
- Holographic foil cards
- Dark arcade aesthetics

Visual effects include:
- Glow overlays
- Reflective gradients
- Animated particles
- Dynamic tilt lighting

---

## 🔮 Roadmap Ideas

- [ ] 📂 Album rarity filters
- [ ] 🧾 Duplicate tracking
- [ ] 🏆 Rare pull history
- [ ] 💸 Sell all duplicates button
- [ ] 🔊 Real booster sound assets
- [ ] 📸 Automatic rare-card screenshots
- [ ] 📱 Mobile drag-to-tear interaction
- [ ] 🌍 Multiplayer trading system

---

## ⚖️ Disclaimer

This is an unofficial fan project created for:
- educational purposes,
- portfolio showcase,
- and learning.

All Yu-Gi-Oh! names, artwork, cards, and related assets belong to:
- Konami
- Yu-Gi-Oh! franchise owners

No copyright infringement is intended.

Please support the official game and TCG products.

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

## 🙏 Credits

Card data, images, and pricing information are provided by:
- **YGOPRODeck API**

---

## 👨‍💻 Author

Developed with 🃏 by **Keller Nz**

---

## ⭐ Support

If you enjoyed this project, consider giving it a ⭐ on GitHub!
