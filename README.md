# Craving Stopper

A React-based web application to help you track and manage your cravings by timing how long you can resist them. Built with Vite, React, Firebase, and Tailwind CSS.

## Features

- **Stopwatch Timer**: Track how long you resist cravings with a simple start/stop interface
- **Calendar View**: Visual calendar showing your resistance patterns with color-coded intensity
- **Trends Analysis**: Charts and statistics showing your progress over time
- **Firebase Integration**: Secure data storage with anonymous authentication
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Firebase project (for data storage)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

You need to set up a Firebase project and configure the app:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication with Anonymous sign-in
4. Create a Firestore database
5. Get your Firebase configuration

### 3. Configure Firebase

Create a `.env` file in the root directory:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Update Firebase Config

Edit `src/App.jsx` and replace the placeholder Firebase configuration with your actual config:

```javascript
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates a `dist` folder with the production build.

### Preview Production Build

```bash
npm run preview
```

## How to Use

1. **Timer Mode**: 
   - Press the green button once to start timing your resistance
   - Press the red button to stop and log your success
   - Double-click quickly to reset the timer

2. **Trends Mode**:
   - View your overall statistics
   - See a calendar view of your resistance patterns
   - Analyze duration trends with interactive charts

## Project Structure

```
craving-stopper/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles with Tailwind
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── README.md           # This file
```

## Technologies Used

- **React 18**: UI framework
- **Vite**: Build tool and development server
- **Firebase**: Backend services (Auth, Firestore)
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Chart library for data visualization
- **date-fns**: Date manipulation library
- **Lucide React**: Icon library

## Troubleshooting

### Firebase Connection Issues
- Ensure your Firebase project is properly configured
- Check that Anonymous Authentication is enabled
- Verify your Firestore database is created and rules allow read/write

### Build Issues
- Make sure all dependencies are installed: `npm install`
- Clear node_modules and reinstall if needed: `rm -rf node_modules && npm install`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
