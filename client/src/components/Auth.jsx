import React, { useState } from 'react';
import { useStore } from '../store';
import { API_URL } from '../config';

export function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const loginSuccess = useStore(state => state.loginSuccess);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const url = isLogin ? `${API_URL}/api/login` : `${API_URL}/api/signup`;

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            if (isLogin) {
                loginSuccess(data.user, data.token);
            } else {
                setIsLogin(true);
                setError('Signup successful! Please login.');
                setPassword('');
            }
        } catch (err) {
            setError(err.message === 'Failed to fetch' ? `Backend se connection nahi ho pa raha. Server check karein: ${API_URL}` : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay">
            <div className="glass-panel">
                <div className="auth-header">
                    <h2>{isLogin ? 'Welcome Back' : 'Create Character'}</h2>
                    <p>Enter the 3D City Multiplayer</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter unique name..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className={`auth-msg ${error.includes('successful') ? 'success' : 'error'}`}>{error}</div>}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Connecting...' : (isLogin ? 'ENTER CITY' : 'SIGN UP')}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>{isLogin ? "Don't have an account?" : "Already have a character?"}</span>
                    <button className="text-btn" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Create one now' : 'Login here'}
                    </button>
                </div>
            </div>
        </div>
    );
}
