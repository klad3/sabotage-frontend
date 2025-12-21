export interface AdminUser {
    id: string;
    email: string;
    created_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthState {
    user: AdminUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}
