import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

interface TokenPayload {
    sub: string;
    exp: number;
}

const AUTH_KEY = "taracliagaz_auth"; // ✅ Единая константа

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

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

    useEffect(() => {
        const token = localStorage.getItem(AUTH_KEY); // ✅ Было "access_token"
        if (!token) {
            setStatus("unauthorized");
            return;
        }

        const payload = decodeJwt(token);
        if (!payload) {
            localStorage.removeItem(AUTH_KEY);
            setStatus("unauthorized");
            return;
        }

        const nowSec = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < nowSec) {
            localStorage.removeItem(AUTH_KEY);
            setStatus("unauthorized");
            return;
        }

        setStatus("authorized");
    }, []);

    if (status === "loading") {
        return <p>Проверка авторизации...</p>;
    }

    if (status === "unauthorized") {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
}