import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AosService {
    private readonly platformId = inject(PLATFORM_ID);
    private initialized = false;

    async init(): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || this.initialized) {
            return;
        }

        const AOS = await import('aos');
        AOS.default.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50
        });
        this.initialized = true;
    }

    async refresh(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const AOS = await import('aos');
        AOS.default.refresh();
    }
}
