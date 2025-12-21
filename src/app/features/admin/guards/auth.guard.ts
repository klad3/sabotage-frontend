import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export const authGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Wait for auth to initialize (max 5 seconds)
    const maxWait = 5000;
    const interval = 50;
    let waited = 0;

    while (authService.loading() && waited < maxWait) {
        await new Promise(resolve => setTimeout(resolve, interval));
        waited += interval;
    }

    // Check authentication after loading completes
    if (authService.isAuthenticated()) {
        return true;
    }

    // Not authenticated - redirect to login immediately
    router.navigate(['/admin/login'], { replaceUrl: true });
    return false;
};

