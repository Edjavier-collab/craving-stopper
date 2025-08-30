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
This is a single-page React application built with Vite that helps users track craving resistance using a stopwatch timer. The app has evolved through version 7 iterations and consists of two main views with sophisticated offline/online capabilities:

- **Timer Mode**: Advanced stopwatch functionality with enhanced visual feedback
- **Trends Mode**: Comprehensive analytics dashboard with embedded calendar and charts

### Key Components

**App.jsx (Lines 103-361)**: Main application component with robust error handling:
- Firebase configuration validation with graceful offline fallbacks
- Anonymous authentication with comprehensive error handling
- Real-time data synchronization with Firestore and localStorage backup
- Connection status monitoring (online/offline, Firebase connected/disconnected)
- View state management between timer and trends modes
- Error boundary implementation for crash protection

**Stopwatch Component (Lines 390-598)**: Enhanced timer functionality featuring:
- High-precision timing (10ms intervals) with smooth animations
- Sophisticated interaction pattern: single-click start/stop, double-click reset (250ms window)
- Canvas-confetti celebration effects on successful resistance logging
- Animated visual feedback with breathing effects and pulsing animations
- Quick stats widget showing today's sessions and best streak
- Automatic data logging with dual Firebase/localStorage persistence

**TrendsView Component (Lines 664-731)**: Comprehensive analytics dashboard:
- Robust data validation and error handling for invalid logs
- Statistics grid showing total sessions and best time
- Embedded calendar view with color-coded intensity indicators
- Interactive bar chart (Recharts) displaying last 7 sessions with custom styling
- Responsive design with neumo-style shadows and hover effects

**CalendarView Component (Lines 602-660)**: Monthly calendar interface:
- Month navigation with previous/next controls
- Color-coded daily indicators based on resistance duration thresholds:
  - Green: < 1 minute total daily resistance
  - Yellow: 1-5 minutes total daily resistance  
  - Red: >= 5 minutes total daily resistance
- Current date highlighting and session count indicators
- Responsive grid layout with proper spacing

### Firebase Integration & Offline Capabilities

**Enhanced Data Structure**: 
```
artifacts/{APP_ID}/users/{USER_UID}/cravings/
├── {doc_id}
│   ├── duration: number (milliseconds)
│   └── date: Firestore Timestamp
```

**Robust Authentication**: 
- Anonymous authentication with comprehensive error handling
- Automatic fallback to localStorage-only mode when Firebase unavailable
- Connection status indicators for user awareness

**Dual Persistence Strategy**:
- Primary: Real-time Firestore synchronization with onSnapshot listeners
- Fallback: localStorage persistence with data validation and recovery
- Automatic sync when connection restored

**Configuration Validation**:
- Runtime validation of all Firebase environment variables
- Detection of placeholder values and missing configuration
- Graceful degradation with user-friendly error messages

### State Management & Error Handling
- Local React state for UI interactions with comprehensive loading states
- Firebase handles persistent data with localStorage backup
- Error boundary component prevents application crashes
- Connection status monitoring for offline/online awareness
- Data validation throughout the application stack

### Environment Configuration
Firebase configuration with robust validation:

**Setup Instructions**:
1. Copy `.env.example` to `.env`
2. Replace placeholder values with your actual Firebase configuration from Firebase Console
3. Never commit the actual `.env` file to git (it's already in `.gitignore`)

**Environment Variables**:
- `VITE_FIREBASE_API_KEY` - Your Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Your Firebase app ID
- `VITE_APP_ID` (optional override for Firebase app identification)

### Enhanced Styling & Animations
- Tailwind CSS with custom neumo-style design system
- Sophisticated shadow effects and hover states
- Smooth animations including breathing effects and pulsing
- Responsive design optimized for mobile devices
- Safe area insets for mobile compatibility
- Backdrop blur effects and gradient backgrounds
- Canvas confetti celebrations with multi-burst patterns

### Recent Updates (Version 7)
- Enhanced visual feedback and animations
- Improved error handling and offline capabilities
- Sophisticated interaction patterns for timer controls
- Connection status indicators
- Comprehensive data validation
- Enhanced mobile responsiveness and safe area handling