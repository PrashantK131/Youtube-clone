import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

/* ── JWT decode (no library needed — just base64) ─────────────────────────── */
const decodeToken = (token) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
};

const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return true;
    // Add 10-second buffer
    return decoded.exp * 1000 < Date.now() + 10_000;
};

/* ── Storage helpers (centralised keys) ───────────────────────────────────── */
const KEYS = { user: 'ytUser', token: 'ytToken', rememberMe: 'ytRememberMe' };

const saveToStorage = (userData, token, rememberMe) => {
    // rememberMe → localStorage (persists after tab close)
    // !rememberMe → sessionStorage (cleared when tab/browser closes)
    const store = rememberMe ? localStorage : sessionStorage;
    store.setItem(KEYS.user, JSON.stringify(userData));
    store.setItem(KEYS.token, token);
    store.setItem(KEYS.rememberMe, String(rememberMe));
    localStorage.setItem(KEYS.rememberMe, String(rememberMe));
};

const clearStorage = () => {
    [localStorage, sessionStorage].forEach((s) => {
        s.removeItem(KEYS.user);
        s.removeItem(KEYS.token);
        s.removeItem(KEYS.rememberMe);
    });
};

const readFromStorage = () => {
    const rememberMe = localStorage.getItem(KEYS.rememberMe) === 'true';
    const store = rememberMe ? localStorage : sessionStorage;
    const token = store.getItem(KEYS.token);
    const raw = store.getItem(KEYS.user);
    if (!token || !raw) return null;
    if (isTokenExpired(token)) { clearStorage(); return null; }
    try { return { user: JSON.parse(raw), token }; }
    catch { clearStorage(); return null; }
};

/* ── Provider ─────────────────────────────────────────────────────────────── */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* Restore session on mount */
    useEffect(() => {
        const stored = readFromStorage();
        if (stored) {
            setUser(stored.user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${stored.token}`;
        }
        setLoading(false);
    }, []);

    /* Cross-tab sync — when another tab logs in/out, mirror the change */
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === KEYS.token) {
                if (!e.newValue) {
                // Logged out in another tab
                    setUser(null);
                    delete axios.defaults.headers.common['Authorization'];
                } else {
                // Logged in / refreshed in another tab
                    const stored = readFromStorage();
                    if (stored) {
                        setUser(stored.user);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${stored.token}`;
                    }
                }
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const login = useCallback((userData, token, rememberMe = true) => {
        setUser(userData);
        saveToStorage(userData, token, rememberMe);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, []);

    const logout = useCallback(async () => {
        try {
            await axios.post('/auth/logout', {}, { withCredentials: true });
        } catch {
            // ignore network errors on logout
        }
        setUser(null);
        clearStorage();
        delete axios.defaults.headers.common['Authorization'];
    }, []);

    /* Expose token getter so components can check it */
    const getToken = useCallback(() => {
        const stored = readFromStorage();
        return stored?.token || null;
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, getToken }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
