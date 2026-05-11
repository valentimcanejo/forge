# CLAUDE.md — Forge Fitness App

## Project Overview

**Forge** is a monorepo fitness app for natural athletes: workout logging, diet tracking, progress photos, gamification (XP/badges/streaks), and body metrics.

## Monorepo Structure

```
forge/
├── apps/
│   ├── web/          → Next.js 14 (App Router) — full dashboard at localhost:3000
│   └── mobile/       → Expo 51 + Expo Router — runs via `expo start`
├── packages/
│   └── common/       → Shared types, Firebase CRUD, i18n, gamification logic, API integrations
├── firestore.rules   → Firestore security rules (users read/write own data only)
├── storage.rules     → Firebase Storage rules
└── firebase.json     → Firebase project config
```

## Tech Stack

| Layer | Web | Mobile |
|-------|-----|--------|
| Framework | Next.js 14 | Expo 51 + Expo Router |
| UI | Inline styles (design tokens) | React Native + react-native-svg |
| State | Zustand | Zustand |
| i18n | i18next + react-i18next | i18next + expo-localization |
| Backend | Firebase (Auth, Firestore, Storage) | Same |
| Charts | SVG (custom FSparkline, FRing, FBars) | react-native-svg |

## Design System Tokens (from `packages/common/src/tokens.ts`)

- **Background**: bg0=#0B0F14, bg1=#121826, bg2=#1A2233
- **Accent**: #F97316 (orange)
- **Text**: #E6EAF2 / mid #AAB0C0 / dim #7B8193
- **Success**: #5ED19A / Error: #E26D6D / Warning: #F0B86E
- **Fonts**: DM Sans (display/headings), Inter (body), JetBrains Mono (numbers/labels)

## Development Commands

```bash
# Install everything
npm install

# Run web only
npm run web        # → http://localhost:3000

# Run mobile only
npm run mobile     # → Expo dev server (scan QR with Expo Go)

# Run both
npm run dev

# Type check
npm run type-check
```

## Firebase Setup

1. Create a Firebase project at console.firebase.google.com
2. Enable: Authentication (Email/Password + Google + Apple), Firestore, Storage
3. Copy `apps/web/.env.local.example` → `apps/web/.env.local` and fill in values
4. Copy `apps/mobile/.env.local.example` → `apps/mobile/.env.local` and fill in values
5. Deploy security rules: `firebase deploy --only firestore:rules,storage`

## Firestore Data Model

```
users/{uid}
  ├── workouts/{sessionId}     → WorkoutSession
  ├── dailyLogs/{YYYY-MM-DD}   → DailyLog (meals, macros, water)
  ├── progress/{entryId}       → ProgressEntry (weight, measures, photos)
  ├── prs/{exerciseId}         → PRRecord
  ├── exercises/{exerciseId}   → custom Exercise
  ├── foods/{foodId}           → custom Food
  └── gamification/state       → GamificationState (XP, level, badges, streak)

exercises/{id}   → shared exercise library (read-only for users)
foods/{id}       → shared food database (read-only for users)
```

## Gamification Logic (`packages/common/src/gamification/index.ts`)

- **XP awards**: Workout complete (+30+), PR (+50), Meal logged (+10), Macros hit (+25)
- **Levels**: 20 levels, Rookie → Legend (Epley formula for 1RM estimation)
- **Badges**: 10 badges (common/rare/legendary), auto-checked after each XP award
- **Streaks**: Checked via `isStreakAlive()` — must log within 48h to maintain

## API Integrations (`packages/common/src/api/`)

- **Exercises**: wger.de REST API — search + detail. Falls back to `POPULAR_EXERCISES` on failure.
- **Foods**: Open Food Facts — search + barcode scan. Falls back to `COMMON_FOODS` on failure.
- **Manual fallback**: Both exercise and food flows allow creating custom entries stored in Firestore.

## i18n

Languages: **EN**, **PT**, **ES** — translations in `packages/common/src/i18n/`.
- Web: browser language detection via `i18next-browser-languagedetector`
- Mobile: `expo-localization` device locale detection
- Manual language change: update `UserProfile.language` in Firestore

## Screens

### Web (`apps/web/src/app/`)
- `(auth)/login` — Login with email + Google
- `(auth)/register` — Registration
- `(app)/dashboard` — Stats overview, weight trend, workout card, macros, volume bars
- `(app)/workouts` — Active session timer, exercise table with PR tracking
- `(app)/meals` — Calorie ring, meal cards, hydration, smart swaps
- `(app)/progress` — Charts (weight + lift), photo timeline, body measurements
- `(app)/badges` — Level ring, badge grid, weekly mission, ranking
- `(app)/library` — Exercise + food library with search and filters

### Mobile (`apps/mobile/app/`)
- `(auth)/onboarding` — Splash + features + CTA
- `(tabs)/index` — Dashboard (streak, macros, workout CTA)
- `(tabs)/workout` — Day strip, timer, exercise list with set logging
- `(tabs)/diet` — Calorie ring, meal cards, FAB
- `(tabs)/progress` — Weight chart, measurements grid, photo compare
- `(tabs)/profile` — Profile card, badges, settings, Lumen banner

## Claude Code Permissions

Allowed in `.claude/settings.local.json` — expand as needed for the project toolchain.
