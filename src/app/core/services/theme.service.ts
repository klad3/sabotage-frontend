import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly document = inject(DOCUMENT);

    readonly currentTheme = signal<Theme>('light');

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            // Check for saved preference
            const saved = localStorage.getItem('sabotage-theme') as Theme | null;
            if (saved) {
                this.setTheme(saved);
            }
        }
    }

    toggleTheme(): void {
        const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme: Theme): void {
        this.currentTheme.set(theme);

        if (isPlatformBrowser(this.platformId)) {
            const body = this.document.body;

            if (theme === 'light') {
                body.classList.add('light-mode');
            } else {
                body.classList.remove('light-mode');
            }

            localStorage.setItem('sabotage-theme', theme);
        }
    }

    isDarkMode(): boolean {
        return this.currentTheme() === 'dark';
    }

    isLightMode(): boolean {
        return this.currentTheme() === 'light';
    }
}
