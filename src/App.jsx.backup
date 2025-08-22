import React, { useState, useEffect, useRef } from 'react';
// Firebase imports commented out for now
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
// import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Play, Square, History, BarChart2 } from 'lucide-react';

// --- Firebase Configuration (commented out for now) ---
// const firebaseConfig = {
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
//     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
//     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
//     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
//     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
//     appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
// };

// const appId = import.meta.env.VITE_FIREBASE_APP_ID || 'default-craving-stopper';
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// --- Helper Functions ---
const formatTime = (time) => {
    const milliseconds = `00${time % 1000}`.slice(-3);
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
    // const [user, setUser] = useState(null); // Not using Firebase auth for now
    const [logs, setLogs] = useState([]);
    
    console.log('App component rendered with view:', view, 'logs:', logs.length);

    // --- Authentication Effect ---
    useEffect(() => {
        // Skip Firebase auth for now
        console.log('Skipping Firebase auth');
    }, []);

    // --- Data Loading Effect ---
    useEffect(() => {
        // Always use localStorage for now
        loadFromLocalStorage();
    }, []);

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
            // Always use localStorage for now
            saveToLocalStorage(duration);
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

    return (
        <div className="min-h-screen bg-stone-100 font-sans text-stone-700 p-6">
            <div className="max-w-sm mx-auto space-y-4">
                {/* Header Widget */}
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <h1 className="text-xl font-bold text-stone-700 text-center">Craving Stopper</h1>
                </div>

                {/* Main Content */}
                {view === 'timer' && <Stopwatch onLog={addLog} logs={logs} />}
                {view === 'calendar' && <CalendarView logs={logs} />}
                {view === 'trends' && <TrendsView logs={logs} />}

                {/* Navigation */}
                <div className="flex space-x-3">
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
        className={`bg-white rounded-2xl p-4 shadow-lg flex-1 flex flex-col items-center justify-center transition-all duration-200 ${
            active ? 'bg-stone-200' : 'hover:bg-stone-50'
        }`}
    >
        <Icon className={`h-5 w-5 mb-2 ${
            active ? 'text-stone-700' : 'text-stone-500'
        }`} />
        <span className={`text-xs font-medium ${
            active ? 'text-stone-700' : 'text-stone-500'
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

    const handleStart = () => {
        setTime(0); // Always reset time before starting
        setIsRunning(true);
    };

    const handleStop = () => {
        setIsRunning(false);
        if (time > 0) { // Only log if time has passed
            onLog(time);
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
            <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="text-center">
                    <div className="bg-stone-50 rounded-2xl p-6 mb-6">
                        <div className="font-mono text-4xl font-medium text-stone-800 tracking-wide">
                            {formatTime(time)}
                        </div>
                        <div className="text-sm text-stone-500 mt-2">
                            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}
                        </div>
                    </div>
                    
                    <button
                        onClick={handleButtonClick}
                        className={`w-40 h-16 rounded-full flex items-center justify-center shadow-xl border-2 transform transition-all duration-200 active:scale-95 mx-auto ${
                            isRunning ? 'bg-rose-200 text-rose-700 border-rose-300 shadow-rose-200/50' : 'bg-emerald-200 text-emerald-700 border-emerald-300 shadow-emerald-200/50'
                        }`}
                    >
                        {isRunning ? <Square size={24} /> : <Play size={24} className="ml-1" />}
                        <span className="ml-2 text-base font-semibold">
                            {isRunning ? 'Stop' : 'Start'}
                        </span>
                    </button>
                    
                    <h2 className="text-base font-medium text-stone-600 mt-4 mb-2 text-center">You're doing great!! Keep Resisting 💪</h2>
                    <p className="text-stone-400 text-sm mt-2 px-4">
                        {isRunning 
                            ? 'Press to stop and log your success!' 
                            : 'Press once to start. Press twice quickly to reset.'}
                    </p>
                </div>
            </div>
            
            {/* Quick Stats Widget */}
            {logs.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-stone-500">Today</div>
                            <div className="flex items-center space-x-3 mt-1">
                                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {logs.filter(log => {
                                        const today = new Date();
                                        const logDate = new Date(log.date);
                                        return logDate.toDateString() === today.toDateString();
                                    }).length}
                                </div>
                                <span className="text-xs text-stone-400">sessions</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-stone-500">Best Streak</div>
                            <div className="text-lg font-medium text-stone-700 mt-1">
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
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-stone-100"><ChevronLeft className="w-4 h-4 text-stone-600" /></button>
                <h2 className="font-medium text-stone-700">{format(currentDate, 'MMMM yyyy')}</h2>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-stone-100"><ChevronRight className="w-4 h-4 text-stone-600" /></button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-stone-400 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-medium">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {days.map(day => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayLogs = logsByDay[dayKey] || [];
                    const hasLogs = dayLogs.length > 0;
                    const totalDuration = dayLogs.reduce((sum, log) => sum + log.duration, 0);
                    
                    let intensityClass = 'bg-stone-50';
                    if (hasLogs) {
                        if (totalDuration < 60000) intensityClass = 'bg-emerald-100'; // < 1 min
                        else if (totalDuration < 300000) intensityClass = 'bg-amber-100'; // < 5 mins
                        else intensityClass = 'bg-rose-100'; // >= 5 mins
                    }

                    return (
                        <div key={day.toString()} className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium relative ${intensityClass}`}>
                            <span className={`${isSameDay(day, new Date()) ? 'bg-stone-700 text-white rounded-lg h-7 w-7 flex items-center justify-center text-xs' : 'text-stone-600'}`}>
                                {format(day, 'd')}
                            </span>
                            {hasLogs && <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full"></div>}
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
        return <div className="text-center py-12 text-gray-500">No data yet. Start logging your cravings to see trends!</div>;
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
        return <div className="text-center py-12 text-gray-500">No valid data yet. Start logging your cravings to see trends!</div>;
    }

    const data = validLogs
        .map(log => ({
            date: format(log.date, 'MMM d'),
            duration: log.duration / 1000, // convert to seconds
        }))
        .reverse(); // Show oldest first on the chart

    const longestHold = validLogs.length > 0 ? Math.max(...validLogs.map(log => log.duration || 0)) : 0;

    return (
        <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-5 rounded-3xl shadow-lg">
                    <p className="text-sm text-stone-500">Total Sessions</p>
                    <p className="text-2xl font-medium text-stone-700 mt-1">{validLogs.length}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-lg">
                    <p className="text-sm text-stone-500">Best Time</p>
                    <p className="text-2xl font-medium text-stone-700 mt-1">{formatTime(longestHold).split('.')[0]}</p>
                </div>
            </div>
            
            {/* Progress Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-stone-500">This Week</p>
                        <p className="text-lg font-medium text-stone-700">
                            {validLogs.filter(log => {
                                const weekAgo = new Date();
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                return new Date(log.date) > weekAgo;
                            }).length} sessions
                        </p>
                    </div>

                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                    <div 
                        className="bg-emerald-300 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, (validLogs.filter(log => {
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return new Date(log.date) > weekAgo;
                        }).length / 7) * 100)}%` }}
                    ></div>
                </div>
            </div>
            
            {/* Calendar */}
            <CalendarView logs={validLogs} />

            {/* Chart Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="font-medium text-stone-700 mb-4">Recent Sessions</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer>
                        <BarChart data={data.slice(-7)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                labelStyle={{ fontWeight: '500', color: '#57534e' }}
                                formatter={(value) => [`${value.toFixed(0)}s`, 'Duration']}
                            />
                            <Bar dataKey="duration" fill="#a7f3d0" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
