

import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Play, Square, History, BarChart2 } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};


// --- App ID ---
const appId = import.meta.env.VITE_FIREBASE_APP_ID || 'default-craving-stopper';

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Helper Functions ---
const formatTime = (time) => {
    const milliseconds = `00${time % 1000}`.slice(-3);
    const seconds = `0${Math.floor(time / 1000) % 60}`.slice(-2);
    const minutes = `0${Math.floor(time / 60000) % 60}`.slice(-2);
    const hours = `0${Math.floor(time / 3600000)}`.slice(-2);
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

// --- Main App Component ---
export default function App() {
    const [view, setView] = useState('timer'); // 'timer', 'calendar', 'trends'
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);

    // --- Authentication Effect ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                try {
                    const userCredential = await signInAnonymously(auth);
                    setUser(userCredential.user);
                } catch (error) {
                    console.error("Anonymous sign-in failed:", error);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // --- Data Loading Effect ---
    useEffect(() => {
        const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";
        
        if (user && isFirebaseConfigured) {
            // Use Firebase
            const cravingsCollectionPath = `artifacts/${appId}/users/${user.uid}/cravings`;
            const q = query(collection(db, cravingsCollectionPath));
            
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                try {
                    const fetchedLogs = [];
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data && data.date && data.duration !== undefined) {
                            fetchedLogs.push({
                                id: doc.id,
                                duration: Number(data.duration) || 0,
                                // Convert Firestore Timestamp to JS Date object
                                date: data.date?.toDate()
                            });
                        }
                    });
                    // Sort logs by date, newest first
                    fetchedLogs.sort((a, b) => b.date - a.date);
                    setLogs(fetchedLogs);
                } catch (error) {
                    console.error("Error processing Firebase data:", error);
                    loadFromLocalStorage();
                }
            }, (error) => {
                console.error("Error fetching craving logs: ", error);
                // Fallback to localStorage on error
                loadFromLocalStorage();
            });

            return () => unsubscribe();
        } else {
            // Use localStorage fallback - load immediately when Firebase is not configured
            loadFromLocalStorage();
        }
    }, [user]);

    // --- Load data from localStorage on app start ---
    useEffect(() => {
        const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";
        if (!isFirebaseConfigured) {
            // If Firebase is not configured, load localStorage data immediately
            loadFromLocalStorage();
        }
    }, []);

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
            // Check if Firebase is properly configured
            const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";
            
            if (user && isFirebaseConfigured) {
                try {
                    const cravingsCollectionPath = `artifacts/${appId}/users/${user.uid}/cravings`;
                    await addDoc(collection(db, cravingsCollectionPath), {
                        duration: duration,
                        date: serverTimestamp() 
                    });
                } catch (error) {
                    console.error("Error adding document: ", error);
                    // Fallback to localStorage if Firebase fails
                    saveToLocalStorage(duration);
                }
            } else {
                // Use localStorage as fallback
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                <header className="p-6 bg-indigo-600 text-white text-center">
                    <h1 className="text-2xl font-bold">Craving Stopper</h1>
                    <p className="text-indigo-200 mt-1">Track your resistance, build your strength.</p>
                </header>

                <main className="p-6">
                    {view === 'timer' && <Stopwatch onLog={addLog} />}
                    {view === 'calendar' && <CalendarView logs={logs} />}
                    {view === 'trends' && <TrendsView logs={logs} />}
                </main>

                <footer className="bg-gray-100 p-2 flex justify-around border-t">
                    <NavButton icon={History} label="Timer" active={view === 'timer'} onClick={() => setView('timer')} />
                    <NavButton icon={BarChart2} label="Trends" active={view === 'trends'} onClick={() => setView('trends')} />
                </footer>
            </div>
             <p className="text-xs text-gray-400 mt-4">UserID: {user ? user.uid : 'Initializing...'}</p>
        </div>
    );
}

// --- Navigation Button Component ---
const NavButton = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full p-2 rounded-lg transition-colors duration-200 ${
            active ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-200'
        }`}
    >
        <Icon className="h-6 w-6 mb-1" />
        <span className="text-xs font-medium">{label}</span>
    </button>
);

// --- Stopwatch Component (Updated with double-press reset) ---
const Stopwatch = ({ onLog }) => {
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
        <div className="flex flex-col items-center justify-center space-y-8 py-8">
            <div className="font-mono text-5xl tracking-tighter text-gray-700 bg-gray-100 p-4 rounded-lg w-full text-center">
                {formatTime(time)}
            </div>
            <button
                onClick={handleButtonClick}
                className={`w-40 h-40 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform duration-200 active:scale-95 ${
                    isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
            >
                {isRunning ? <Square size={60} /> : <Play size={60} className="ml-2" />}
            </button>
            <p className="text-gray-500 text-center px-4">
                {isRunning 
                    ? 'Press to stop and log your success!' 
                    : 'Press once to start. Press twice quickly to reset.'}
            </p>
        </div>
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
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
                <h2 className="font-bold text-lg">{format(currentDate, 'MMMM yyyy')}</h2>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
                {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {days.map(day => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayLogs = logsByDay[dayKey] || [];
                    const hasLogs = dayLogs.length > 0;
                    const totalDuration = dayLogs.reduce((sum, log) => sum + log.duration, 0);
                    
                    let intensityClass = '';
                    if (hasLogs) {
                        if (totalDuration < 60000) intensityClass = 'bg-green-200'; // < 1 min
                        else if (totalDuration < 300000) intensityClass = 'bg-yellow-200'; // < 5 mins
                        else intensityClass = 'bg-red-200'; // >= 5 mins
                    }

                    return (
                        <div key={day.toString()} className={`h-10 flex items-center justify-center rounded-full relative ${intensityClass}`}>
                            <span className={`${isSameDay(day, new Date()) ? 'bg-indigo-600 text-white rounded-full h-7 w-7 flex items-center justify-center' : ''}`}>
                                {format(day, 'd')}
                            </span>
                            {hasLogs && <div className="absolute bottom-1 h-1 w-1 bg-indigo-500 rounded-full"></div>}
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

    const totalTimeResisted = validLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const averageDuration = validLogs.length > 0 ? totalTimeResisted / validLogs.length : 0;
    const longestHold = validLogs.length > 0 ? Math.max(...validLogs.map(log => log.duration || 0)) : 0;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Overall Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Cravings</p>
                        <p className="text-2xl font-bold text-indigo-600">{validLogs.length}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Longest Hold</p>
                        <p className="text-2xl font-bold text-indigo-600">{formatTime(longestHold).split('.')[0]}</p>
                    </div>
                     <div className="bg-gray-100 p-4 rounded-lg col-span-2">
                        <p className="text-sm text-gray-500">Average Duration</p>
                        <p className="text-2xl font-bold text-indigo-600">{formatTime(averageDuration).split('.')[0]}</p>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Craving Log</h3>
                 <CalendarView logs={validLogs} />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Duration Over Time (seconds)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer>
                        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '0.5rem' }}
                                labelStyle={{ fontWeight: 'bold', color: '#333' }}
                                formatter={(value) => [`${value.toFixed(2)}s`, 'Duration']}
                            />
                            <Legend />
                            <Bar dataKey="duration" fill="#4f46e5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
