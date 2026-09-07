const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

async function request<T>(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const token = localStorage.getItem("taracliagaz_auth");

    const init: RequestInit = {
        method,
        headers: {
            ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    };

    if (body !== undefined) {
        init.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    const response = await fetch(url, init);

    // 🔐 АВТОМАТИЧЕСКИЙ LOGOUT при истёкшем токене
    if (response.status === 401) {
        localStorage.removeItem("taracliagaz_auth");
        if (!window.location.pathname.includes("/admin/login")) {
            window.location.href = "/admin/login";
        }
        throw new Error("Сессия истекла. Войдите снова.");
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export const http = {
    get: <T>(path: string, headers?: Record<string, string>) => request<T>("GET", path, undefined, headers),
    post: <T>(path: string, body?: unknown, headers?: Record<string, string>) => request<T>("POST", path, body, headers),
    put: <T>(path: string, body?: unknown, headers?: Record<string, string>) => request<T>("PUT", path, body, headers),
    delete: <T>(path: string, headers?: Record<string, string>) => request<T>("DELETE", path, undefined, headers),
};