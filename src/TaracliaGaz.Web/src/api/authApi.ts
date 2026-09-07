import { http } from "./http";

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface UserResponse {
    id: number;
    username: string;
    role: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
    // OAuth2PasswordRequestForm требует application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api"}/auth/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Ошибка входа");
    }

    return response.json();
};

export const getCurrentUser = async (): Promise<UserResponse> => {
    return http.get<UserResponse>("/auth/me");
};