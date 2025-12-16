# <img src="public/logo.png" alt="Nephrite Logo" width="45" height="45" /> NEPHRITE.EXE // SYSTEM_MANUAL_v1.0

[![Live Demo](https://img.shields.io/badge/DEPLOYMENT-LIVE_SYSTEM-2ea44f?style=for-the-badge&logo=github)](https://jadie145.github.io/NEPHRITE-EXE/)
![React](https://img.shields.io/badge/CORE-REACT_18-blue?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/STYLE-TAILWIND_CSS-cyan?style=for-the-badge)
![Status](https://img.shields.io/badge/SYSTEM-ONLINE-success?style=for-the-badge)

> **"Turning caffeine into code since 2025."**

**NEPHRITE.EXE** is a high-fidelity, retro-futuristic personal operating system designed to showcase projects, skills, and experiments. It combines nostalgic **CRT aesthetics** with modern **React performance**, featuring a fully interactive interface, simulated hardware limitations, and a 3D parallax environment.

### 🟢 [ACCESS TERMINAL HERE (Live Demo)](https://jadie145.github.io/NEPHRITE-EXE/)

---

## 📸 VISUAL DATABASE

| **Boot Sequence** | **Desktop Environment** |
|:---:|:---:|
| _Simulated BIOS initialization with randomized hex dumps and loading bars._ | _Parallax 3D Grid Floor with Aurora Haze and fixed system UI._ |

| **Cartridge Launcher** | **System Config** |
|:---:|:---:|
| _Holographic project cards with scanline sweep interactions._ | _Real-time control over CRT effects, sound, and system resets._ |

---

## ⚡ CORE MODULES

### 🖥️ The Visual Engine
* **Pure CSS CRT Effect:** Scanlines, RGB shift, and screen curvature implemented without WebGL.
* **3D Parallax Background:** A "Synthwave" grid floor that moves in 3D space (`perspective: 500px`) with a fixed "Aurora" sky.
* **Responsive Design:**
    * **Arcade Mode (Desktop):** Projects launch in a fixed 16:9 CRT bezel container.
    * **Adaptive Mode (Mobile):** Projects automatically switch to a touch-friendly, full-width interface.

### ⚙️ System Architecture
* **Global State Management:** Custom `useSystemSettings` hook controls audio, CRT intensity, and theme persistence.
* **Session Persistence:** Boot sequence runs only once per session (via `sessionStorage`). Settings are saved to `localStorage`.
* **Interaction Design:**
    * "Clicky" UI sounds (optional toggle).
    * Blinking cursors and typing effects.
    * "Holofoil" hover states on cards.

### 📂 The "Dossier" (About Page)
* **Identity Card:** Fetches live avatar data from GitHub.
* **Skill Matrix:** Progress bars with neon glow effects tailored to Light/Dark modes.
* **System Log:** Chronological career history formatted as a terminal boot log.

---

## 🛠️ INSTALLATION PROTOCOL

**Prerequisites:** Node.js v16+

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/Jadie145/JMMD.git](https://github.com/Jadie145/JMMD.git)
    cd JMMD
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Initialize Development Server:**
    ```bash
    npm run dev
    ```

4.  **Build for Production:**
    ```bash
    npm run build
    ```

---

## 🕹️ CUSTOMIZATION GUIDE

### 1. Adding Projects
Navigate to `src/data/projects.json`. The system automatically generates "Cartridges" based on this data.

```json
{
  "title": "Project Name",
  "image": "/path/to/image.png",
  "link": "/path/to/project/index.html",
  "mode": "arcade", // or "adaptive" / "interactive"
  "version": "v1.0",
  "size": "128KB"
}
