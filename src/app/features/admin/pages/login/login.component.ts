import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule],
    template: `
        <div class="login-page">
            <div class="login-container">
                <div class="login-header">
                    <span class="logo-icon">🔥</span>
                    <h1 class="logo-text">SABOTAGE</h1>
                    <p class="subtitle">Panel de Administración</p>
                </div>

                @if (!supabaseEnabled()) {
                    <div class="warning-box">
                        <span class="warning-icon">⚠️</span>
                        <div>
                            <strong>Supabase no configurado</strong>
                            <p>Configura las credenciales en environment.ts para habilitar el login.</p>
                        </div>
                    </div>
                }

                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            formControlName="email"
                            placeholder="ejemplo@correo.com"
                            autocomplete="email"
                            [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                        >
                        @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                            <span class="field-error">El email es requerido</span>
                        }
                        @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                            <span class="field-error">Email inválido</span>
                        }
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input 
                            type="password" 
                            id="password" 
                            formControlName="password"
                            placeholder="••••••••"
                            autocomplete="current-password"
                            [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                        >
                        @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                            <span class="field-error">La contraseña es requerida</span>
                        }
                        @if (loginForm.get('password')?.hasError('minlength') && loginForm.get('password')?.touched) {
                            <span class="field-error">Mínimo 6 caracteres</span>
                        }
                    </div>

                    @if (authService.error()) {
                        <div class="error-message">
                            {{ authService.error() }}
                        </div>
                    }

                    <button 
                        type="submit" 
                        class="submit-btn"
                        [disabled]="loginForm.invalid || authService.loading() || !supabaseEnabled()"
                    >
                        @if (authService.loading()) {
                            <span class="spinner"></span>
                            Iniciando sesión...
                        } @else {
                            Iniciar Sesión
                        }
                    </button>
                </form>

                <div class="login-footer">
                    <a href="/" class="back-link">← Volver a la tienda</a>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .login-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%);
            padding: 20px;
        }

        .login-container {
            width: 100%;
            max-width: 420px;
            background: rgba(26, 26, 26, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 48px 40px;
            backdrop-filter: blur(20px);
        }

        .login-header {
            text-align: center;
            margin-bottom: 40px;
        }

        .logo-icon {
            font-size: 48px;
            display: block;
            margin-bottom: 16px;
        }

        .logo-text {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: 4px;
            margin: 0;
        }

        .subtitle {
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            margin-top: 8px;
        }

        .warning-box {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid rgba(255, 193, 7, 0.3);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
        }

        .warning-icon {
            font-size: 24px;
        }

        .warning-box strong {
            color: #ffc107;
            font-size: 14px;
        }

        .warning-box p {
            color: rgba(255, 255, 255, 0.7);
            font-size: 13px;
            margin: 4px 0 0;
        }

        .login-form {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .form-group label {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-weight: 500;
        }

        .form-group input {
            width: 100%;
            padding: 14px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #fff;
            font-size: 16px;
            transition: all 0.2s;
        }

        .form-group input::placeholder {
            color: rgba(255, 255, 255, 0.3);
        }

        .form-group input:focus {
            outline: none;
            border-color: #feca57;
            background: rgba(255, 255, 255, 0.08);
        }

        .form-group input.error {
            border-color: #ff6b6b;
        }

        .field-error {
            color: #ff6b6b;
            font-size: 12px;
        }

        .error-message {
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid rgba(255, 107, 107, 0.3);
            border-radius: 12px;
            padding: 12px 16px;
            color: #ff6b6b;
            font-size: 14px;
            text-align: center;
        }

        .submit-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            border: none;
            border-radius: 12px;
            color: #000;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
        }

        .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid transparent;
            border-top-color: #000;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .login-footer {
            text-align: center;
            margin-top: 32px;
        }

        .back-link {
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
            font-size: 14px;
            transition: color 0.2s;
        }

        .back-link:hover {
            color: #feca57;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
    readonly authService = inject(AuthService);
    private readonly supabase = inject(SupabaseService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);

    readonly supabaseEnabled = signal(this.supabase.isEnabled);

    readonly loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    async onSubmit(): Promise<void> {
        if (this.loginForm.invalid) return;

        const { email, password } = this.loginForm.value;

        const result = await this.authService.login({
            email: email!,
            password: password!
        });

        if (result.success) {
            this.router.navigate(['/admin/dashboard']);
        }
    }
}
