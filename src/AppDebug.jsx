import React from 'react';

export default function AppDebug() {
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Debug Mode - App is Loading</h1>
            <p>If you see this message, React is working!</p>
            <p>Time: {new Date().toLocaleTimeString()}</p>
        </div>
    );
}