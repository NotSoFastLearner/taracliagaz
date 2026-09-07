import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/authApi";

export default function AdminLoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await login(username, password);

            // Сохраняем токен в localStorage
            localStorage.setItem("taracliagaz_auth", response.access_token);

            // Перенаправляем в админку
            navigate("/admin");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Неверные учётные данные");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="section">
            <div className="container admin-login">
                <h1>Вход в панель управления</h1>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <label>
                        Имя пользователя
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </label>
                    <label>
                        Пароль
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </label>
                    <button type="submit" disabled={loading}>
                        {loading ? "Вход..." : "Войти"}
                    </button>
                </form>
            </div>
        </section>
    );
}