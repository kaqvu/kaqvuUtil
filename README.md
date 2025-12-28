<div align="center">

# 🎮 kaqvuUtil

### Real-time WebSocket Management Panel

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-Ready-00ff41?style=for-the-badge&logo=websocket&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-00ff41?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Nowoczesny panel zarządzania z komunikacją WebSocket w czasie rzeczywistym**

[Funkcje](#-funkcje) • [Quick Start](#-quick-start) • [Dokumentacja](#-api-endpoints) • [Konfiguracja](#-konfiguracja)

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%">

</div>

## ✨ Funkcje

<table>
<tr>
<td width="50%">

### 🔌 Backend
- WebSocket Server (port 8080)
- HTTP Server (port 3000)
- Real-time Communication
- Token Authentication
- RESTful API

</td>
<td width="50%">

### 🎨 Frontend
- Cyberpunk/Neon Design
- Responsive Layout
- Live Updates
- Smooth Animations
- Modern Interface

</td>
</tr>
</table>

---

<div align="center">

## 📸 Screenshots

### Login Panel
<img src="https://via.placeholder.com/800x400/000000/00ff41?text=Login+Panel" alt="Login Panel" width="80%">

### Management Dashboard
<img src="https://via.placeholder.com/800x400/000000/00ff41?text=Management+Dashboard" alt="Dashboard" width="80%">

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%">

</div>

## 🚀 Quick Start

### Wymagania

```bash
Node.js v18+
npm lub yarn
```

### Instalacja i Uruchomienie

```bash
# Sklonuj repozytorium
git clone https://github.com/kaqvu/kaqvuUtil

# Przejdź do folderu projektu
cd kaqvuUtil

# Zainstaluj zależności
npm install

# Uruchom serwer
npm start
```

<div align="center">

### 🌐 Dostęp do Panelu

| Usługa | URL | Opis |
|--------|-----|------|
| 🖥️ Panel Logowania | `http://localhost:3000` | Interfejs webowy |
| 🔌 WebSocket Server | `ws://localhost:8080` | Serwer komunikacji |

### 🔐 Domyślne Dane Logowania

```
Login: kaqvu
Hasło: password
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%">

</div>

## 📁 Struktura Projektu

```
kaqvuUtil/
│
├── 📂 server/
│   ├── index.js              # HTTP Server (port 3000)
│   ├── websocket.js          # WebSocket Manager (port 8080)
│   ├── auth.js               # System autoryzacji
│   │
│   └── 📂 api/
│       ├── send.js           # Endpoint wysyłania
│       ├── disconnect.js     # Endpoint rozłączania
│       └── players.js        # Endpoint listy klientów
│
├── 📂 public/
│   ├── 📂 login/
│   │   ├── index.html        # Strona logowania
│   │   ├── styles.css        # Style logowania
│   │   └── script.js         # Logika logowania
│   │
│   └── 📂 panel/
│       ├── index.html        # Panel zarządzania
│       ├── styles.css        # Style panelu (Cyberpunk)
│       └── script.js         # Logika panelu
│
├── 📂 node_modules/
├── package.json
├── package-lock.json
└── README.md
```

---

<div align="center">

## 🛠️ Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white)

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%">

</div>

## 🔧 Konfiguracja

### Zmiana Portów

**HTTP Server** (`server/index.js`):
```javascript
const PORT = 3000; // Port panelu webowego
```

**WebSocket Server** (`server/websocket.js`):
```javascript
const WS_PORT = 8080; // Port serwera WebSocket
```

### Zmiana Danych Logowania

W pliku `server/websocket.js`:
```javascript
const CREDENTIALS = {
    login: 'kaqvu',
    password: 'k11pspro'
};
```

> ⚠️ **Uwaga:** Pamiętaj aby zmienić dane logowania przed wdrożeniem produkcyjnym!

---

<div align="center">

## 📡 API Endpoints

</div>

### 📤 POST `/api/send`
Wysyła wiadomość lub komendę do wybranego klienta

**Request Body:**
```json
{
  "player": "nazwa_klienta",
  "type": "message" | "command",
  "content": "treść wiadomości lub komendy"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 🔌 POST `/api/disconnect`
Rozłącza wybranego klienta z serwera

**Request Body:**
```json
{
  "player": "nazwa_klienta"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 📋 GET `/api/players`
Pobiera listę wszystkich aktywnych połączeń

**Response:**
```json
{
  "success": true,
  "players": ["klient1", "klient2", "klient3"],
  "count": 3
}
```

---

<div align="center">

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| 🟢 Neon Green | `#00ff41` | Primary, Accents |
| 🔴 Neon Red | `#ff0041` | Danger, Alerts |
| ⚫ Black | `#000000` | Background |
| ⚪ Transparent | `rgba(0,0,0,0.9)` | Cards, Overlays |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%">

</div>

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests

---

<div align="center">

## 👤 Autor

**kaqvu**

[![GitHub](https://img.shields.io/badge/GitHub-kaqvu-181717?style=for-the-badge&logo=github)](https://github.com/kaqvu)

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%">

## 📄 Licencja

MIT License - możesz swobodnie używać, modyfikować i dystrybuować ten projekt.

---

**Made with 💚 by kaqvu**

⭐ Star this repo if you find it useful!

</div>