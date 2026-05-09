# Documentación de la API — Rock Paper Scissors

Backend construido con **NestJS 11** + **Socket.IO**.  
Puerto por defecto: `3000` (configurable via `PORT`).

---

## Índice

1. [Endpoints HTTP](#1-endpoints-http)
2. [WebSockets (Socket.IO)](#2-websockets-socketio)
3. [Entidades](#3-entidades)
4. [Diagrama de flujo del juego](#4-diagrama-de-flujo-del-juego)

---

## 1. Endpoints HTTP

### 1.1 `POST /register`

Registra un nuevo jugador en el sistema (en memoria).

- **Body:**
  ```json
  { "username": "string" }
  ```
- **Response (200):** Objeto `Player`
  ```json
  { "username": "string" }
  ```
- **Errores:**
  - `400` — username vacío o ya registrado

---

### 1.2 `POST /exit`

Elimina un jugador del sistema (en memoria).

- **Body:**
  ```json
  { "username": "string" }
  ```
- **Response (200):** `null`

---

### 1.3 `GET /`

Renderiza la página principal (registro + lobby).

- **Response:** HTML (template Handlebars `index.hbs`)

---

### 1.4 `GET /game`

Renderiza la sala de juego.

- **Query params (uso del cliente):** `?matchId=...&username=...`
- **Response:** HTML (template Handlebars `game.hbs`)

---

### 1.5 Archivos estáticos

| Ruta | Archivo |
|---|---|
| `/public/css/style.css` | Hoja de estilos |
| `/public/js/session.js` | Manejo de sesión (localStorage) |
| `/public/js/lobby.js` | Lógica del lobby |
| `/public/js/matchStorage.js` | Estado local de la partida |
| `/public/js/game.js` | Lógica de la sala de juego |

---

## 2. WebSockets (Socket.IO)

**Namespace:** `/game`

### 2.1 Eventos Cliente → Servidor

#### `game:create-match-room`

Crea una nueva partida y asigna al creador como Player 1.

- **Payload:**
  ```ts
  { playerUsername: string }
  ```
- **ACK (success):**
  ```json
  {
    "status": "ok",
    "data": {
      "gameMatch": { "id": "uuid" },
      "message": "Game match room crceated"
    }
  }
  ```
- **ACK (error):**
  ```json
  { "status": "error", "data": { "message": "..." } }
  ```
- **Acción:** El cliente se une automáticamente a la room `match-<id>`.

---

#### `game:join-match-room`

Un segundo jugador se une a una partida existente.

- **Payload:**
  ```ts
  { gameMatchId: string, playerUsername: string }
  ```
- **ACK (success):** `{ "status": "ok" }`
- **ACK (error):** `{ "status": "error" }`
- **Eventos emitidos a la room `match-<id>`:**
  - `game:room-match-notifications` — notificación de ingreso
  - `game:room-info-updated` — información actualizada de la partida

---

#### `game:choose-move`

Un jugador envía su jugada.

- **Payload:**
  ```ts
  { matchId: string, username: string, moveChoise: Choice }
  ```
  - `Choice`: `0` = ROCK, `1` = PAPER, `2` = SCISSORS
- **ACK (error):**
  ```json
  { "status": "error", "message": "..." }
  ```
- **Eventos emitidos a la room `match-<id>`:**
  1. `game:room-match-notifications` (`status: "player-choose"`) — indica qué jugador eligió
  2. Si ambos jugadores ya eligieron:
     - `game:room-match-notifications` (`status: "round-ended"`) — la ronda terminó
     - `game:room-info-updated` — resultados actualizados

---

### 2.2 Eventos Servidor → Cliente

#### `game:room-match-notifications`

Notificaciones generales de la sala.

- **Payload:**
  ```json
  {
    "status": "ok | error | player-choose | round-ended",
    "data": {
      "message": "string",
      "user": "string (solo en player-choose)"
    }
  }
  ```

| Status | Significado |
|---|---|
| `ok` | Usuario se unió a la sala |
| `error` | No se pudo unir (con motivo) |
| `player-choose` | Un jugador hizo su jugada |
| `round-ended` | Ambos jugadores jugaron y la ronda se resolvió |

---

#### `game:room-info-updated`

Estado completo de la partida (se emite tras cada evento importante).

- **Payload:**
  ```json
  {
    "data": {
      "id": "uuid",
      "master": "username_del_player1",
      "players": ["username_del_player2"], 
      "rounds": {
        "played": 0,
        "results": [null, "username", null]
      }
    }
  }
  ```

---

## 3. Entidades

### `Choice` (enum)

```ts
ROCK     = 0
PAPER    = 1
SCISSORS = 2
```

### `Player`

| Campo | Tipo | Descripción |
|---|---|---|
| `username` | `string` (readonly) | Nombre único del jugador |
| `choice` | `Choice \| undefined` | Jugada actual (se limpia tras cada ronda) |

### `GameRound`

| Campo | Tipo | Descripción |
|---|---|---|
| `winner` | `Player \| null` | Ganador de la ronda (`null` = empate) |

Reglas: `ROCK > SCISSORS > PAPER > ROCK`.

### `GameMatch`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` (UUID) | Identificador único |
| `rounds` | `GameRound[]` | Historial de rondas jugadas |
| `winner` | `Player \| null` | Ganador global (más rondas ganadas; `null` = empate) |
| `info` | `object` | Resumen usado en `game:room-info-updated` |

- Por defecto se juegan **3 rondas** por partida.
- `playRound()` crea una ronda con las jugadas actuales, evalúa el ganador y limpia las elecciones.

---

## 4. Diagrama de flujo del juego

```
Registro (POST /register)
       │
       ▼
Crear partida (game:create-match-room)
       │
       ▼
Unirse a partida (game:join-match-room)
       │
       ▼
Ambos jugadores eligen jugada (game:choose-move)
       │
       ▼ (×3 rondas)
Se evalúa la ronda y se emiten resultados
       │
       ▼
Ganador global: quien gane más rondas
```
