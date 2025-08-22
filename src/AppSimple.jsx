import React, { useState } from 'react';

export default function AppSimple() {
    const [count, setCount] = useState(0);
    
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Simple Test App</h1>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)} style={{ padding: '10px', marginRight: '10px' }}>
                Increment
            </button>
            <button onClick={() => setCount(0)} style={{ padding: '10px' }}>
                Reset
            </button>
        </div>
    );
}