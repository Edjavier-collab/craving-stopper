import React, { useState, useEffect, useRef } from 'react';
// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Play, Square, History, BarChart2 } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const appId = import.meta.env.VITE_FIREBASE_APP_ID || 'default-craving-stopper';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Helper Functions ---
const formatTime = (time) => {
    const milliseconds = `0${Math.floor((time % 1000) / 10)}`.slice(-2);
    const seconds = `0${Math.floor(time / 1000) % 60}`.slice(-2);
    const minutes = `0${Math.floor(time / 60000) % 60}`.slice(-2);
    const hours = `0${Math.floor(time / 3600000)}`.slice(-2);
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

// --- Error Boundary Component ---
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red' }}>
                    <h1>Something went wrong!</h1>
                    <pre>{this.state.error?.toString()}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

// --- Main App Component ---
function AppContent() {
    console.log('App component initializing...');
    
    const [view, setView] = useState('timer'); // 'timer', 'calendar', 'trends'
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    console.log('App component rendered with view:', view, 'logs:', logs.length);

    // --- Authentication Effect ---
    useEffect(() => {
        console.log('Setting up Firebase auth...');
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                console.log('User signed in:', authUser.uid);
                setUser(authUser);
                setError(null);
            } else {
                console.log('No user, signing in anonymously...');
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error('Auth error:', error);
                    setError('Authentication failed. Using offline mode.');
                    setLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    // --- Data Loading Effect ---
    useEffect(() => {
        if (user) {
            console.log('User authenticated, setting up Firestore listener...');
            const userCollection = collection(db, 'artifacts', appId, 'users', user.uid, 'cravings');
            const q = query(userCollection, orderBy('date', 'desc'));
            
            const unsubscribe = onSnapshot(q, 
                (snapshot) => {
                    console.log('Firestore data received:', snapshot.size, 'documents');
                    const firestoreLogs = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        date: doc.data().date?.toDate() || new Date()
                    }));
                    setLogs(firestoreLogs);
                    setLoading(false);
                    setError(null);
                },
                (error) => {
                    console.error('Firestore error:', error);
                    setError('Failed to sync with cloud. Using local data.');
                    loadFromLocalStorage();
                    setLoading(false);
                }
            );
            
            return () => unsubscribe();
        } else if (error) {
            // If there's an auth error, use localStorage
            loadFromLocalStorage();
        }
    }, [user, error]);

    // --- Load data from localStorage on app start ---
    // Removed - handled in main data loading effect

    // --- Load from Local Storage ---
    const loadFromLocalStorage = () => {
        try {
            const storedLogs = JSON.parse(localStorage.getItem('cravingLogs') || '[]');
            // Convert date strings back to Date objects and validate
            const logsWithDates = storedLogs
                .filter(log => log && log.date && log.duration !== undefined)
                .map(log => ({
                    ...log,
                    date: new Date(log.date),
                    duration: Number(log.duration) || 0
                }))
                .filter(log => !isNaN(log.date.getTime())); // Filter out invalid dates
            
            // Sort by date, newest first
            logsWithDates.sort((a, b) => b.date - a.date);
            setLogs(logsWithDates);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            setLogs([]);
        }
    };

    // --- Add Log Function ---
    const addLog = async (duration) => {
        if (duration > 0) {
            if (user) {
                try {
                    console.log('Saving to Firestore...');
                    const userCollection = collection(db, 'artifacts', appId, 'users', user.uid, 'cravings');
                    await addDoc(userCollection, {
                        duration: Number(duration),
                        date: serverTimestamp()
                    });
                    console.log('Successfully saved to Firestore');
                } catch (error) {
                    console.error('Error saving to Firestore:', error);
                    setError('Failed to save to cloud. Saved locally instead.');
                    saveToLocalStorage(duration);
                }
            } else {
                // Fallback to localStorage when no user
                console.log('No user, saving to localStorage...');
                saveToLocalStorage(duration);
            }
        } else {
            console.log("Invalid duration, not logging");
        }
    };

    // --- Local Storage Fallback ---
    const saveToLocalStorage = (duration) => {
        try {
            const newLog = {
                id: Date.now().toString(),
                duration: Number(duration) || 0,
                date: new Date()
            };
            
            const existingLogs = JSON.parse(localStorage.getItem('cravingLogs') || '[]');
            const updatedLogs = [newLog, ...existingLogs];
            localStorage.setItem('cravingLogs', JSON.stringify(updatedLogs));
            
            // Update state immediately with proper date objects
            const logsWithDates = updatedLogs.map(log => ({
                ...log,
                date: log.date instanceof Date ? log.date : new Date(log.date)
            }));
            setLogs(logsWithDates);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-neumo-200 font-sans text-neumo-700 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-neumo-200 rounded-3xl p-8 shadow-neumo">
                        <div className="animate-pulse text-neumo-600 mb-4">Loading...</div>
                        <div className="w-8 h-8 border-4 border-neumo-300 border-t-neumo-600 rounded-full animate-spin mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-neumo-200 font-sans text-neumo-700 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] relative overflow-hidden">
            {/* Background Zen Blobs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-blue-100/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-56 h-56 sm:w-80 sm:h-80 bg-blue-200/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/3 right-0 w-32 h-32 sm:w-72 sm:h-72 sm:translate-x-1/2 bg-blue-50/25 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="max-w-sm mx-auto px-4 sm:px-6 space-y-4 relative z-10">
                {/* Error Notification */}
                {error && (
                    <div className="bg-soft-red rounded-2xl p-4 shadow-neumo border border-red-200">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-sm text-red-700">{error}</span>
                        </div>
                    </div>
                )}

                {/* Header Widget - Only show on timer view */}
                {view !== 'trends' && (
                    <div className="bg-neumo-200/90 backdrop-blur-sm rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 shadow-neumo hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-white/20">
                        <h1 className="text-[clamp(1.75rem,8vw,3rem)] font-black text-center text-blue-300 drop-shadow-[0_0_25px_rgba(147,197,253,0.6)] tracking-wider uppercase leading-tight" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.5), -2px -2px 4px rgba(255,255,255,0.9), 1px 1px 2px rgba(0,0,0,0.8)', WebkitTextStroke: '1px rgba(0,0,0,0.2)'}}>
                            CRAVING STOPPER
                        </h1>
                        <div className="text-center mt-1 sm:mt-2">
                            <div className="inline-block text-xs xs:text-sm sm:text-base md:text-lg font-medium text-neumo-500 tracking-wider drop-shadow-[0_0_10px_rgba(75,85,99,0.3)]">
                                RESIST. OVERCOME. RESET.
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {view === 'timer' && <Stopwatch onLog={addLog} logs={logs} />}
                {view === 'calendar' && <CalendarView logs={logs} />}
                {view === 'trends' && <TrendsView logs={logs} />}

                {/* Navigation */}
                <div className="flex space-x-2 xs:space-x-3">
                    <NavButton icon={History} label="Timer" active={view === 'timer'} onClick={() => setView('timer')} />
                    <NavButton icon={BarChart2} label="Trends" active={view === 'trends'} onClick={() => setView('trends')} />
                </div>
            </div>
        </div>
    );
}

// --- Export App with Error Boundary ---
export default function App() {
    return (
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    );
}

// --- Navigation Button Component ---
const NavButton = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`bg-neumo-200 rounded-2xl p-2 xs:p-3 sm:p-4 flex-1 flex flex-col items-center justify-center transition-all duration-200 min-h-[56px] xs:min-h-[60px] ${
            active ? 'shadow-neumo-pressed' : 'shadow-neumo hover:shadow-neumo-sm'
        }`}
    >
        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2 ${
            active ? 'text-neumo-700' : 'text-neumo-500'
        }`} />
        <span className={`text-xs font-medium ${
            active ? 'text-neumo-700' : 'text-neumo-500'
        }`}>{label}</span>
    </button>
);

// --- Stopwatch Component (Updated with double-press reset) ---
const Stopwatch = ({ onLog, logs = [] }) => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);
    const clickTimeoutRef = useRef(null); // To distinguish single/double clicks

    // Effect for the stopwatch interval
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 10);
            }, 10);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    // Effect to clean up the click timeout when the component unmounts
    useEffect(() => {
        return () => clearTimeout(clickTimeoutRef.current);
    }, []);

    // --- Button Action Handlers ---
    const handleReset = () => {
        setTime(0);
        setIsRunning(false); // Ensure timer is stopped
    };


    // --- Confetti Animation ---
    const triggerConfetti = () => {
        // Multiple bursts from different edges of the card
        const colors = [
            '#ff6b6b', // red
            '#4ecdc4', // teal
            '#45b7d1', // blue
            '#f9ca24', // yellow
            '#f0932b', // orange
            '#eb4d4b', // dark red
            '#6c5ce7', // purple
            '#fd79a8', // pink
            '#00d2d3', // cyan
            '#ff9ff3', // light pink
            '#54a0ff', // bright blue
            '#5f27cd', // dark purple
            '#00d8ff', // light blue
            '#ff9f43', // light orange
            '#10ac84', // green
            '#ffffff', // white
            '#ffeaa7', // light yellow
            '#dda0dd'  // plum
        ];
        
        // Top-left burst
        confetti({
            particleCount: 30,
            angle: 60,
            spread: 45,
            origin: { x: 0.3, y: 0.4 },
            colors: colors,
            gravity: 0.8,
            drift: 0.1
        });
        
        // Top-right burst
        confetti({
            particleCount: 30,
            angle: 120,
            spread: 45,
            origin: { x: 0.7, y: 0.4 },
            colors: colors,
            gravity: 0.8,
            drift: -0.1
        });
        
        // Center burst
        confetti({
            particleCount: 40,
            angle: 90,
            spread: 60,
            origin: { x: 0.5, y: 0.5 },
            colors: colors,
            gravity: 0.6,
            scalar: 0.8
        });
    };



    const handleStart = () => {
        setTime(0); // Always reset time before starting
        setIsRunning(true);
    };

    const handleStop = () => {
        setIsRunning(false);
        if (time > 0) { // Only log if time has passed
            onLog(time);
            // Trigger celebration confetti
            triggerConfetti();
        }
    };

    // --- Main Click Handler ---
    const handleButtonClick = () => {
        // If the timer is running, a single click always stops it.
        if (isRunning) {
            handleStop();
            return;
        }

        // If the timer is stopped, check for a double click.
        if (clickTimeoutRef.current) {
            // This is the second click (a double click).
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
            handleReset(); // Perform the reset action.
        } else {
            // This is the first click. Wait to see if a second one follows.
            clickTimeoutRef.current = setTimeout(() => {
                handleStart(); // If no second click, perform the start action.
                clickTimeoutRef.current = null;
            }, 250); // 250ms window for a double click.
        }
    };

    return (
        <>
            {/* Timer Widget */}
            <div className="bg-neumo-200/90 backdrop-blur-sm rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 shadow-neumo hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-white/20">
                <div className="text-center">
                    <div className={`bg-neumo-200 rounded-2xl p-3 xs:p-4 sm:p-6 mb-4 xs:mb-6 transition-all duration-300 overflow-hidden ${
                        isRunning 
                            ? 'shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff,0_0_20px_rgba(74,222,128,0.6)] animate-smooth-pulse border-2 border-green-300' 
                            : 'shadow-neumo-inset'
                    }`}>
                        <div className={`font-mono text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-neumo-800 tracking-wide transition-transform duration-100 overflow-hidden ${
                            isRunning && Math.floor(time / 1000) % 2 === 0 ? 'animate-gentle-breathe' : ''
                        }`}>
                            {formatTime(time)}
                        </div>
                        <div className="text-sm text-neumo-500 mt-2">
                            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}
                        </div>
                    </div>
                    
                    <button
                        onClick={handleButtonClick}
                        className={`w-full sm:w-40 h-14 sm:h-16 rounded-full flex items-center justify-center border-0 transition-all duration-200 mx-auto ${
                            isRunning 
                                ? 'bg-neumo-200 text-soft-red shadow-neumo-pressed' 
                                : 'bg-gradient-to-b from-green-400 to-green-500 text-white shadow-md hover:scale-105 hover:shadow-lg active:shadow-neumo-pressed'
                        }`}
                    >
                        {isRunning ? 
                            <Square size={24} className="text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.6)] filter brightness-110" fill="currentColor" /> : 
                            <Play size={24} className="ml-1 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] filter brightness-110" fill="currentColor" />
                        }
                        <span className={`ml-2 text-xl xs:text-2xl font-black tracking-wide ${
                            isRunning 
                                ? 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)] animate-soft-glow-pulse' 
                                : 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]'
                        } filter brightness-110 contrast-125`}>
                            {isRunning ? 'STOP' : 'START'}
                        </span>
                    </button>
                    
                    <h2 className="text-xs xs:text-sm sm:text-base font-medium text-neumo-700 mt-3 sm:mt-4 mb-2 text-center italic border border-neumo-300 rounded-lg py-2 px-2 xs:px-3 sm:px-4">You&apos;re doing great!! Keep Resisting 💪</h2>
                    <p className="text-neumo-400 text-xs sm:text-sm mt-2 px-1 xs:px-2 sm:px-4">
                        {isRunning 
                            ? 'Press to stop and log your success!' 
                            : 'Press once to start. Press twice quickly to reset.'}
                    </p>
                </div>
            </div>
            
            {/* Quick Stats Widget */}
            {logs.length > 0 && (
                <div className="bg-neumo-200 rounded-2xl xs:rounded-3xl p-3 xs:p-4 sm:p-6 shadow-neumo hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs xs:text-sm text-neumo-500">Today</div>
                            <div className="flex items-center space-x-2 xs:space-x-3 mt-1">
                                <div className="bg-neumo-200 text-neumo-700 px-2 xs:px-3 py-1 rounded-full text-xs xs:text-sm font-medium shadow-neumo-inset-sm">
                                    {logs.filter(log => {
                                        const today = new Date();
                                        const logDate = new Date(log.date);
                                        return logDate.toDateString() === today.toDateString();
                                    }).length}
                                </div>
                                <span className="text-xs text-neumo-400">sessions</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs xs:text-sm text-neumo-500">Best Streak</div>
                            <div className="text-sm xs:text-base sm:text-lg font-medium text-neumo-700 mt-1">
                                {Math.max(...logs.map(log => log.duration || 0)) > 0 ? 
                                    formatTime(Math.max(...logs.map(log => log.duration || 0))).split('.')[0] : 
                                    '00:00:00'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};


// --- Calendar View Component ---
const CalendarView = ({ logs }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    const startingDayIndex = start.getDay();

    const nextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    
    const logsByDay = logs.reduce((acc, log) => {
        if (!log.date) return acc;
        const dayKey = format(log.date, 'yyyy-MM-dd');
        if (!acc[dayKey]) {
            acc[dayKey] = [];
        }
        acc[dayKey].push(log);
        return acc;
    }, {});

    return (
        <div className="bg-neumo-200/90 backdrop-blur-sm rounded-3xl p-4 xs:p-6 shadow-neumo hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="flex justify-between items-center mb-4 xs:mb-6">
                <button onClick={prevMonth} className="p-2 rounded-full bg-neumo-200 shadow-neumo-sm hover:shadow-neumo-pressed transition-all duration-200"><ChevronLeft className="w-4 h-4 text-neumo-600" /></button>
                <h2 className="font-medium text-neumo-700 text-sm xs:text-base">{format(currentDate, 'MMMM yyyy')}</h2>
                <button onClick={nextMonth} className="p-2 rounded-full bg-neumo-200 shadow-neumo-sm hover:shadow-neumo-pressed transition-all duration-200"><ChevronRight className="w-4 h-4 text-neumo-600" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 xs:gap-2 text-center text-xs sm:text-sm text-neumo-400 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-medium">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 xs:gap-2">
                {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {days.map(day => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayLogs = logsByDay[dayKey] || [];
                    const hasLogs = dayLogs.length > 0;
                    const totalDuration = dayLogs.reduce((sum, log) => sum + log.duration, 0);
                    
                    let intensityClass = 'bg-neumo-200 shadow-neumo-inset-sm';
                    if (hasLogs) {
                        if (totalDuration < 60000) intensityClass = 'bg-soft-green shadow-neumo-inset-sm'; // < 1 min
                        else if (totalDuration < 300000) intensityClass = 'bg-soft-yellow shadow-neumo-inset-sm'; // < 5 mins
                        else intensityClass = 'bg-soft-red shadow-neumo-inset-sm'; // >= 5 mins
                    }

                    return (
                        <div key={day.toString()} className={`h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium relative ${intensityClass}`}>
                            <span className={`${isSameDay(day, new Date()) ? 'bg-neumo-700 text-white rounded-lg h-5 w-5 sm:h-7 sm:w-7 flex items-center justify-center text-xs' : 'text-neumo-600'}`}>
                                {format(day, 'd')}
                            </span>
                            {hasLogs && <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 h-1 w-1 sm:h-2 sm:w-2 bg-blue-300 rounded-full shadow-neumo-sm"></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// --- Trends View Component ---
const TrendsView = ({ logs }) => {
    if (!logs || logs.length === 0) {
        return <div className="text-center py-12 text-neumo-500">No data yet. Start logging your cravings to see trends!</div>;
    }

    // Filter and validate logs
    const validLogs = logs.filter(log => 
        log && 
        log.date && 
        log.date instanceof Date && 
        !isNaN(log.date.getTime()) && 
        typeof log.duration === 'number' && 
        log.duration >= 0
    );

    if (validLogs.length === 0) {
        return <div className="text-center py-12 text-neumo-500">No valid data yet. Start logging your cravings to see trends!</div>;
    }

    const data = validLogs
        .map(log => ({
            date: format(log.date, 'MMM d'),
            duration: log.duration / 1000, // convert to seconds
        }))
        .reverse(); // Show oldest first on the chart

    const longestHold = validLogs.length > 0 ? Math.max(...validLogs.map(log => log.duration || 0)) : 0;

    return (
        <div className="space-y-3 xs:space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 xs:gap-3">
                <div className="bg-neumo-200 p-3 xs:p-4 sm:p-5 rounded-2xl xs:rounded-3xl shadow-neumo hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <p className="text-xs xs:text-sm text-neumo-500">Total Sessions</p>
                    <p className="text-lg xs:text-xl sm:text-2xl font-medium text-neumo-700 mt-1">{validLogs.length}</p>
                </div>
                <div className="bg-neumo-200 p-3 xs:p-4 sm:p-5 rounded-2xl xs:rounded-3xl shadow-neumo hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <p className="text-xs xs:text-sm text-neumo-500">Best Time</p>
                    <p className="text-lg xs:text-xl sm:text-2xl font-medium text-neumo-700 mt-1">{formatTime(longestHold).split('.')[0]}</p>
                </div>
            </div>
            
            
            {/* Calendar */}
            <CalendarView logs={validLogs} />

            {/* Chart Widget */}
            <div className="bg-neumo-200/90 backdrop-blur-sm rounded-2xl xs:rounded-3xl p-4 xs:p-6 shadow-neumo hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-white/20">
                <h3 className="font-medium text-neumo-700 mb-3 xs:mb-4 text-sm xs:text-base">Recent Sessions</h3>
                <div className="h-56 min-h-[200px] sm:h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.slice(-7)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ced4da" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6c757d' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6c757d' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#dee2e6', border: 'none', borderRadius: '1rem', boxShadow: '4px 4px 8px #c5c5c5, -4px -4px 8px #ffffff' }}
                                labelStyle={{ fontWeight: '500', color: '#495057' }}
                                formatter={(value) => [`${value.toFixed(0)}s`, 'Duration']}
                            />
                            <Bar dataKey="duration" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
