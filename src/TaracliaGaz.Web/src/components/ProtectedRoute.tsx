import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

interface TokenPayload {
    sub: string;
    exp: number;
}

const AUTH_KEY = "taracliagaz_auth"; // Совпадает с AdminLoginPage

function decodeJwt(token: string): TokenPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

function isTokenValid(): boolean {
    const token = localStorage.getItem(AUTH_KEY);
    if (!token) return false;

    const payload = decodeJwt(token);
    if (!payload) {
        localStorage.removeItem(AUTH_KEY);
        return false;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
        localStorage.removeItem(AUTH_KEY);
        return false;
    }

    return true;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    if (!isTokenValid()) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
}
