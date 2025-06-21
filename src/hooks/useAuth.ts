// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthUser {
    id: string;
    email: string;
    role: 'admin' | 'user';
}

export function useAuth() {
    const [auth, setAuth] = useState<AuthUser | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('google_token');
        if (token) {
            try {
                const decoded = jwtDecode<AuthUser>(token);
                setAuth(decoded);
            } catch (error) {
                console.error("Invalid token:", error);
                setAuth(null);
            }
        }
    }, []);

    return auth;
}