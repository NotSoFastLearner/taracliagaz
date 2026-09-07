import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // TODO: wire up real API login
    if (userName === "admin" && password === "admin") {
      navigate("/admin");
    } else {
      setError("Неверные учётные данные");
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
            <input value={userName} onChange={(e) => setUserName(e.target.value)} required />
          </label>
          <label>
            Пароль
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit">Войти</button>
        </form>
      </div>
    </section>
  );
}
