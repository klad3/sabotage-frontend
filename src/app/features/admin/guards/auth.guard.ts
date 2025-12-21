import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Wait for auth to initialize
    if (authService.loading()) {
        return new Promise<boolean>((resolve) => {
            const checkAuth = setInterval(() => {
                if (!authService.loading()) {
                    clearInterval(checkAuth);
                    if (authService.isAuthenticated()) {
                        resolve(true);
                    } else {
                        router.navigate(['/admin/login']);
                        resolve(false);
                    }
                }
            }, 100);

            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkAuth);
                router.navigate(['/admin/login']);
                resolve(false);
            }, 5000);
        });
    }

    if (authService.isAuthenticated()) {
        return true;
    }

    router.navigate(['/admin/login']);
    return false;
};
