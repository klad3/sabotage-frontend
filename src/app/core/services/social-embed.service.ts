import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DbSocialEmbed } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class SocialEmbedService {
    private readonly supabase = inject(SupabaseService);

    // State
    private readonly _embeds = signal<DbSocialEmbed[]>([]);
    private readonly _loading = signal(false);
    private loaded = false;
    private pendingLoad: Promise<void> | null = null;

    // Public readonly
    readonly embeds = this._embeds.asReadonly();
    readonly loading = this._loading.asReadonly();

    /**
     * Load social embeds with cache - only fetches once
     */
    async loadEmbeds(): Promise<void> {
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
            const embeds = await this.supabase.getAll<DbSocialEmbed>('social_embeds', {
                filters: [{ column: 'is_active', operator: 'eq', value: true }],
                orderBy: { column: 'display_order', ascending: true }
            });
            this._embeds.set(embeds);
            this.loaded = true;
        } catch (error) {
            console.error('Error loading social embeds:', error);
            this._embeds.set([]);
        } finally {
            this._loading.set(false);
        }
    }

    /**
     * Force refresh embeds from API
     */
    async refresh(): Promise<void> {
        this.loaded = false;
        await this.loadEmbeds();
    }
}
