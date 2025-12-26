import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DbBanner } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class BannerService {
    private readonly supabase = inject(SupabaseService);

    // State
    private readonly _banners = signal<DbBanner[]>([]);
    private readonly _loading = signal(false);
    private loaded = false;
    private pendingLoad: Promise<void> | null = null;

    // Public readonly
    readonly banners = this._banners.asReadonly();
    readonly loading = this._loading.asReadonly();

    /**
     * Load banners with cache - only fetches once
     */
    async loadBanners(): Promise<void> {
        if (this.loaded) return;
        if (this.pendingLoad) return this.pendingLoad;

        this.pendingLoad = this.doLoad();
        try {
            await this.pendingLoad;
        } finally {
            this.pendingLoad = null;
        }
    }

    private async doLoad(): Promise<void> {
        this._loading.set(true);
        try {
            const banners = await this.supabase.getAll<DbBanner>('banners', {
                filters: [{ column: 'is_active', operator: 'eq', value: true }],
                orderBy: { column: 'display_order', ascending: true }
            });
            this._banners.set(banners);
            this.loaded = true;
        } catch (error) {
            console.error('Error loading banners:', error);
            this._banners.set([]);
        } finally {
            this._loading.set(false);
        }
    }

    /**
     * Force refresh banners from API
     */
    async refresh(): Promise<void> {
        this.loaded = false;
        await this.loadBanners();
    }
}
