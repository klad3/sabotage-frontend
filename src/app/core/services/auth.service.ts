import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { AdminUser, AuthState, LoginCredentials } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly supabase = inject(SupabaseService);
    private readonly router = inject(Router);

    // Auth state
    private readonly _state = signal<AuthState>({
        user: null,
        isAuthenticated: false,
        loading: true,
        error: null
    });

    // Public readonly signals
    readonly user = computed(() => this._state().user);
    readonly isAuthenticated = computed(() => this._state().isAuthenticated);
    readonly loading = computed(() => this._state().loading);
    readonly error = computed(() => this._state().error);

    constructor() {
        this.initializeAuth();
    }

    private async initializeAuth(): Promise<void> {
        if (!this.supabase.isEnabled) {
            this._state.update(s => ({ ...s, loading: false }));
            return;
        }

        try {
            const auth = this.supabase.auth;
            if (!auth) {
                this._state.update(s => ({ ...s, loading: false }));
                return;
            }

            // Get current session
            const { data: { session } } = await auth.getSession();

            if (session?.user) {
                this._state.set({
                    user: {
                        id: session.user.id,
                        email: session.user.email || '',
                        created_at: session.user.created_at
                    },
                    isAuthenticated: true,
                    loading: false,
                    error: null
                });
            } else {
                this._state.update(s => ({ ...s, loading: false }));
            }

            // Listen for auth changes
            auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    this._state.set({
                        user: {
                            id: session.user.id,
                            email: session.user.email || '',
                            created_at: session.user.created_at
                        },
                        isAuthenticated: true,
                        loading: false,
                        error: null
                    });
                } else if (event === 'SIGNED_OUT') {
                    this._state.set({
                        user: null,
                        isAuthenticated: false,
                        loading: false,
                        error: null
                    });
                }
            });
        } catch (err) {
            console.error('Auth initialization error:', err);
            this._state.update(s => ({ ...s, loading: false }));
        }
    }

    async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
        if (!this.supabase.isEnabled) {
            return { success: false, error: 'Supabase no está configurado' };
        }

        const auth = this.supabase.auth;
        if (!auth) {
            return { success: false, error: 'Auth no disponible' };
        }

        this._state.update(s => ({ ...s, loading: true, error: null }));

        try {
            const { data, error } = await auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password
            });

            if (error) {
                this._state.update(s => ({
                    ...s,
                    loading: false,
                    error: this.getErrorMessage(error.message)
                }));
                return { success: false, error: this.getErrorMessage(error.message) };
            }

            if (data.user) {
                this._state.set({
                    user: {
                        id: data.user.id,
                        email: data.user.email || '',
                        created_at: data.user.created_at
                    },
                    isAuthenticated: true,
                    loading: false,
                    error: null
                });
                return { success: true };
            }

            return { success: false, error: 'Error desconocido' };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error de autenticación';
            this._state.update(s => ({ ...s, loading: false, error: message }));
            return { success: false, error: message };
        }
    }

    async logout(): Promise<void> {
        const auth = this.supabase.auth;
        if (auth) {
            await auth.signOut();
        }

        this._state.set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null
        });

        this.router.navigate(['/admin/login']);
    }

    clearError(): void {
        this._state.update(s => ({ ...s, error: null }));
    }

    private getErrorMessage(message: string): string {
        const errorMessages: Record<string, string> = {
            'Invalid login credentials': 'Credenciales inválidas',
            'Email not confirmed': 'Email no confirmado',
            'User not found': 'Usuario no encontrado',
            'Invalid email or password': 'Email o contraseña inválidos'
        };

        return errorMessages[message] || message;
    }
}
