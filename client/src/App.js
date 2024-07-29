// client/src/App.js
import React from 'react';
import { Link } from 'react-router-dom';

function App() {
    return (
        <div className="App">
            <h1>Live Video Streaming App</h1>
            <nav>
                <ul>
                    <li><Link to="/streaming">Go to Streaming</Link></li>
                    <li><Link to="/viewing">Go to Viewing</Link></li>
                </ul>
            </nav>
        </div>
    );
}

export default App;
