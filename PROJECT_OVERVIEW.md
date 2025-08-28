# PROJECT OVERVIEW

## 1. Executive Summary

**Craving Stopper** is a progressive web application designed to help users track and manage their cravings by timing resistance periods. The app has evolved through 7 major iterations, transforming from a basic timer into a sophisticated habit-tracking system with advanced offline capabilities, visual feedback, and comprehensive analytics.

**Current State (Version 7):**
- Production-ready React PWA with Firebase backend
- Robust offline/online dual-persistence architecture
- Advanced UI with neumo-style design and smooth animations
- Comprehensive error handling and graceful degradation
- Mobile-optimized with PWA features and safe area handling

**Target Audience:** Individuals working to overcome various cravings (food, substances, habits) through mindful resistance timing and progress tracking.

## 2. Features Implemented

### ✅ Core Timer Functionality
- **High-Precision Stopwatch**: 10ms interval timing with millisecond display
- **Smart Interaction Pattern**: Single-click start/stop, double-click reset (250ms detection window)
- **Visual Feedback**: Breathing animations, pulsing effects, and color transitions during active timing
- **Celebration Effects**: Canvas-confetti multi-burst animations on successful resistance logging

### ✅ Data Persistence & Sync
- **Dual Persistence Strategy**: Primary Firebase Firestore + fallback localStorage
- **Offline-First Architecture**: Full functionality without internet connection
- **Real-Time Synchronization**: Automatic data sync when online with onSnapshot listeners
- **Connection Status Monitoring**: Visual indicators for online/offline and Firebase connection states

### ✅ Analytics & Visualization
- **Trends Dashboard**: Total sessions, best time, and recent performance metrics
- **Calendar View**: Monthly calendar with color-coded daily intensity indicators
  - Green: < 1 minute total daily resistance
  - Yellow: 1-5 minutes total daily resistance
  - Red: ≥ 5 minutes total daily resistance
- **Interactive Charts**: Recharts-powered bar chart showing last 7 sessions with custom neumo styling

### ✅ Progressive Web App (PWA)
- **Mobile-Optimized Design**: Safe area insets, responsive breakpoints, touch-friendly interactions
- **PWA Manifest**: Installable with custom icons and shortcuts
- **Offline Capability**: Service worker ready architecture
- **Cross-Platform**: Works on iOS, Android, and desktop browsers

### ✅ Advanced UI/UX
- **Neumo Design System**: Custom shadow effects, soft gradients, and tactile feedback
- **Smooth Animations**: CSS keyframes for breathing, pulsing, and glow effects
- **Error Boundary**: Crash protection with graceful error handling
- **Loading States**: Comprehensive loading indicators and skeleton screens

## 3. Technical Stack

### Frontend Framework
- **React 18.2.0**: Modern hooks-based architecture with concurrent features
- **Vite 5.0.8**: Fast build tool and development server
- **JavaScript (ES6+)**: No TypeScript, using JSX for components

### Styling & Design
- **Tailwind CSS 3.3.6**: Utility-first styling with custom neumo color palette
- **PostCSS 8.4.32**: CSS processing with Autoprefixer
- **Custom CSS Animations**: Keyframe animations for breathing effects and pulsing

### Backend Services
- **Firebase SDK 10.7.0**: Complete backend-as-a-service solution
  - **Firestore**: NoSQL document database for craving logs
  - **Authentication**: Anonymous sign-in for user sessions
  - **Hosting Ready**: Configured for Firebase deployment

### Data Visualization
- **Recharts 2.8.0**: React chart library for analytics dashboards
- **date-fns 2.30.0**: Date manipulation and formatting utilities

### UI Components & Icons
- **Lucide React 0.294.0**: Modern icon library with consistent styling
- **canvas-confetti 1.9.3**: Celebration animation effects

### Development Tools
- **ESLint 8.55.0**: Code linting with React-specific rules
- **React-specific ESLint plugins**: Hooks and JSX validation

## 4. Architecture

### Component Hierarchy
```
App (Main Container + Error Boundary)
├── ErrorBoundary (Crash Protection)
└── AppContent (Core Application Logic)
    ├── ConnectionStatus (Online/Offline Indicator)
    ├── ErrorNotification (User-friendly Error Display)
    ├── Header Widget (Brand + Motivational Text)
    ├── Timer View
    │   ├── Stopwatch Component (Timer + Controls)
    │   └── Quick Stats Widget (Today's sessions + Best streak)
    ├── Trends View
    │   ├── Stats Grid (Total sessions + Best time)
    │   ├── CalendarView (Monthly resistance patterns)
    │   └── Chart Widget (Recent sessions bar chart)
    └── Navigation (View switching controls)
```

### Data Flow Architecture
```
User Interaction
    ↓
React State Management (useState/useEffect)
    ↓
Dual Persistence Layer
├── Primary: Firebase Firestore (real-time sync)
└── Fallback: Browser localStorage (offline backup)
    ↓
Real-time Data Updates
    ↓
UI Re-rendering with Visual Feedback
```

### State Management Strategy
- **Local React State**: UI interactions, view switching, loading states
- **Firebase Real-time**: Persistent data with onSnapshot listeners
- **localStorage Fallback**: Offline data persistence and recovery
- **No External State Management**: Intentionally avoiding Redux/Zustand for simplicity

## 5. Database Design

### Firebase Firestore Schema
```
Collection: artifacts/{APP_ID}/users/{USER_UID}/cravings/
├── Document: {auto-generated-id}
    ├── duration: number (milliseconds of resistance)
    ├── date: Firestore.Timestamp (when resistance session ended)
```

### localStorage Schema (Fallback)
```javascript
// Key: 'cravingLogs'
// Value: JSON Array
[
  {
    id: "timestamp-string",
    duration: number, // milliseconds
    date: Date // JavaScript Date object
  }
]
```

### Data Validation Rules
- **Duration**: Must be positive number in milliseconds
- **Date**: Must be valid Date object or Firestore Timestamp
- **Automatic Cleanup**: Invalid entries filtered during data loading
- **Type Coercion**: Strings converted to numbers where appropriate

## 6. API Endpoints

**Note**: This application uses Firebase SDK, not traditional REST APIs. All data operations go through Firebase client libraries.

### Firebase Authentication
- **Anonymous Sign-in**: `signInAnonymously(auth)`
- **Auth State Listener**: `onAuthStateChanged(auth, callback)`

### Firestore Operations
- **Create Session**: `addDoc(collection, {duration, date: serverTimestamp()})`
- **Real-time Listen**: `onSnapshot(query(collection, orderBy('date', 'desc')))`
- **Collection Reference**: `collection(db, 'artifacts', appId, 'users', uid, 'cravings')`

### localStorage Operations
- **Save Data**: `localStorage.setItem('cravingLogs', JSON.stringify(data))`
- **Load Data**: `JSON.parse(localStorage.getItem('cravingLogs') || '[]')`

## 7. Component Structure

### Key React Components

**App.jsx (Lines 103-732)**
- **AppContent**: Main application logic with Firebase integration
- **ErrorBoundary**: Crash protection wrapper component
- **Dual rendering**: Loading states, error states, and main content

**Stopwatch Component (Lines 390-598)**
- **Timer Logic**: High-precision timing with useRef and useEffect
- **Interaction Handling**: Single/double-click detection with timeout management
- **Visual Feedback**: Conditional styling based on timer state
- **Data Integration**: Automatic logging to Firebase/localStorage on stop

**TrendsView Component (Lines 664-731)**
- **Data Processing**: Filtering and validation of log entries
- **Statistics Calculation**: Total sessions, best time computation
- **Chart Integration**: Recharts bar chart with custom styling
- **Responsive Design**: Grid layouts with neumo shadows

**CalendarView Component (Lines 602-660)**
- **Date Logic**: Month navigation with date-fns utilities
- **Data Aggregation**: Daily log grouping and intensity calculation
- **Color Coding**: Threshold-based visual indicators
- **Interactive Navigation**: Previous/next month controls

**Navigation Components**
- **NavButton**: Reusable navigation button with active states
- **View Switching**: Timer and Trends mode toggle

## 8. Recent Development (Last 3 Weeks)

### Version Evolution (V1 → V7)

**V1-V2 (Foundation)**
- Initial React app setup with basic timer functionality
- Firebase integration and Firestore schema design
- PWA manifest and mobile optimization setup

**V3-V4 (UI Enhancement)**
- Implementation of neumo design system
- Custom Tailwind configuration with shadow utilities
- Mobile-first responsive design improvements

**V5-V6 (Animation & Feedback)**
- Advanced CSS animations for breathing effects
- Canvas-confetti celebration integration
- Enhanced visual feedback during timer states
- Sophisticated color transitions and pulsing effects

**V7 (Polish & Robustness)**
- Comprehensive error handling and offline capabilities
- Connection status monitoring and user feedback
- Performance optimizations and code cleanup
- Final UI polish and accessibility improvements

### Recent Commits Analysis
- **39af6af V7**: Final minor adjustment (1 line change)
- **5eb3de3 V6**: Major UI updates, Tailwind config additions (32 insertions, 17 deletions)
- **1771458 V5**: HTML meta updates, CSS animations, App component enhancements (38 insertions, 12 deletions)
- **29ab6b3 V4**: Significant App.jsx refactoring and Tailwind customization (37 insertions, 34 deletions)

### Development Patterns Observed
- **Iterative Refinement**: Small, focused commits building on previous versions
- **UI-First Approach**: Heavy emphasis on visual polish and user experience
- **Mobile Optimization**: Consistent attention to mobile responsiveness
- **Progressive Enhancement**: Features added incrementally without breaking existing functionality

## 9. Known Issues

### Current Limitations
- **No User Accounts**: Anonymous authentication only - data not portable between devices
- **No Data Export**: Users cannot export their resistance data
- **No Backup Strategy**: If localStorage is cleared and Firebase fails, data is lost
- **Single Timer**: No support for multiple concurrent resistance sessions
- **No Notifications**: No reminders or scheduled check-ins

### Technical Debt
- **Code Duplication**: Some styling patterns repeated across components
- **Large Single File**: App.jsx contains multiple concerns (732 lines)
- **No TypeScript**: Missing type safety and better developer experience
- **Limited Testing**: No unit tests or integration tests implemented
- **Environment Config**: Manual Firebase configuration setup required

### Browser Compatibility
- **iOS Safari**: Potential viewport height issues with `100dvh`
- **Older Browsers**: ES6+ features may need polyfills
- **PWA Support**: Limited by browser PWA implementation capabilities

## 10. Next Steps

### Immediate Priorities (Next Sprint)
1. **Component Extraction**: Split App.jsx into smaller, focused components
2. **User Authentication**: Implement email/Google sign-in for data portability
3. **Data Export**: CSV/JSON export functionality for user data
4. **Unit Testing**: Basic test coverage for critical functions
5. **TypeScript Migration**: Gradual conversion for better type safety

### Medium-term Enhancements (Next Month)
1. **Multiple Timers**: Support for different craving types (food, smoking, etc.)
2. **Goal Setting**: Daily/weekly resistance targets and progress tracking
3. **Notifications**: Browser notifications for check-ins and milestones
4. **Social Features**: Optional sharing of milestones or anonymous leaderboards
5. **Advanced Analytics**: Trend analysis, success patterns, time-of-day insights

### Long-term Vision (Next Quarter)
1. **Mobile Apps**: React Native versions for iOS/Android app stores
2. **Web API**: RESTful API for third-party integrations
3. **Machine Learning**: Personalized insights and craving prediction
4. **Healthcare Integration**: FHIR-compliant data export for medical professionals
5. **Multi-language Support**: Internationalization and localization

### Technical Improvements
1. **Performance**: Code splitting, lazy loading, service worker implementation
2. **Accessibility**: WCAG 2.1 compliance, screen reader optimization
3. **Security**: Content Security Policy, input sanitization, rate limiting
4. **Monitoring**: Error tracking, performance monitoring, user analytics
5. **DevOps**: CI/CD pipeline, automated testing, staging environments

---

*This document serves as a comprehensive technical overview of the Craving Stopper application as of Version 7. For specific implementation details, refer to individual component files and the CLAUDE.md development guide.*