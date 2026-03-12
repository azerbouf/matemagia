# МатеМагия (MateMagia)

A math quiz game with leaderboard, player profiles, and achievements. Built with React, Vite, and Tailwind CSS.

## Features

- Math quiz game with multiple difficulty levels (easy, medium, hard, bonus)
- Leaderboard with score tracking
- Player profiles with avatars and badges
- Achievement system

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
git clone https://github.com/azerbouf/matemagia.git
cd matemagia
npm install
```

### Configuration

Create an `.env.local` file in the project root:

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Data

Game results data is stored in `data/GameResult_export.csv`.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Radix UI components
- Framer Motion
- Recharts
- React Router
