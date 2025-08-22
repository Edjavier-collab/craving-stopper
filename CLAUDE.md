# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development Server
```bash
npm run dev
```
Starts Vite development server at http://localhost:5173

### Production Build
```bash
npm run build
```
Creates optimized production build in `dist/` folder

### Linting
```bash
npm run lint
```
Runs ESLint on JavaScript/JSX files with React-specific rules

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing

## Architecture Overview

### Core Structure
This is a single-page React application built with Vite that helps users track craving resistance using a stopwatch timer. The app consists of three main views managed by state in the root App component:

- **Timer Mode**: Core stopwatch functionality with start/stop/reset controls
- **Trends Mode**: Statistics dashboard with charts and calendar view
- **Calendar View**: Monthly calendar showing resistance patterns (embedded in trends)

### Key Components

**App.jsx (Lines 37-124)**: Main application component that handles:
- Firebase authentication (anonymous sign-in)
- Real-time data synchronization with Firestore
- View state management between timer and trends modes
- User session management

**Stopwatch Component (Lines 140-224)**: Timer functionality with:
- Millisecond precision timing (10ms intervals)
- Single-click to start/stop, double-click to reset pattern
- Automatic data logging to Firebase on stop

**TrendsView Component (Lines 290-353)**: Analytics dashboard featuring:
- Overall statistics (total cravings, longest hold, average duration)
- Embedded calendar view
- Bar chart showing duration trends over time using Recharts

**CalendarView Component (Lines 228-286)**: Monthly calendar with:
- Color-coded intensity based on total daily duration
- Navigation between months
- Visual indicators for days with logged resistance

### Firebase Integration

**Data Structure**: 
```
artifacts/{APP_ID}/users/{USER_UID}/cravings/
├── {doc_id}
│   ├── duration: number (milliseconds)
│   └── date: Firestore Timestamp
```

**Authentication**: Uses Firebase anonymous authentication for user sessions
**Real-time Updates**: Firestore onSnapshot listeners for live data synchronization

### State Management
- Local React state for UI interactions and view switching
- Firebase handles persistent data storage and real-time synchronization
- No external state management library used

### Environment Configuration
Firebase configuration uses environment variables with fallbacks:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN` 
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Styling
- Tailwind CSS for all styling with responsive design
- Component-specific styles using Tailwind utility classes
- Mobile-first approach with max-width constraints