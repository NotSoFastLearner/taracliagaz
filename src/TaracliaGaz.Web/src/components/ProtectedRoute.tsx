import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = localStorage.getItem("taracliagaz_auth");

    if (!token) {
        // Если нет токена — перенаправляем на логин
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
}