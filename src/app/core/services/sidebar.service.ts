import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    // Mobile menu open state
    private readonly _isMobileOpen = signal(false);
    readonly isMobileOpen = this._isMobileOpen.asReadonly();

    // Desktop collapsed state
    private readonly _isCollapsed = signal(false);
    readonly isCollapsed = this._isCollapsed.asReadonly();

    toggle(): void {
        if (this.isMobile()) {
            this._isMobileOpen.update(v => !v);
        } else {
            this._isCollapsed.update(v => !v);
        }
    }

    openMobile(): void {
        this._isMobileOpen.set(true);
    }

    closeMobile(): void {
        this._isMobileOpen.set(false);
    }

    private isMobile(): boolean {
        if (typeof window === 'undefined') return false;
        return window.innerWidth <= 768;
    }
}
