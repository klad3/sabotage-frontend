import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {
    DbSiteConfig,
    AnnouncementBar,
    ContactInfo,
    Branding,
    StatItem,
    SectionTitles,
    FooterConfig
} from '../models/product.model';

// Default values when database is not configured
const DEFAULT_ANNOUNCEMENT_BAR: AnnouncementBar = {
    text: '¡Bienvenido a SABOTAGE!',
    link: null,
    is_active: false,
    background_color: '#1a1a1a',
    text_color: '#ffffff'
};

const DEFAULT_CONTACT_INFO: ContactInfo = {
    whatsapp: '',
    whatsapp_message: 'Hola! Me interesa hacer un pedido',
    email: '',
    instagram: '',
    facebook: '',
    tiktok: ''
};

const DEFAULT_BRANDING: Branding = {
    logo_url: null,
    logo_alt: 'SABOTAGE',
    favicon_url: null,
    site_name: 'SABOTAGE',
    tagline: 'VISTIENDO TU PASIÓN'
};

const DEFAULT_STATS: StatItem[] = [
    { value: '15K+', label: 'Clientes felices', numeric_value: 15, suffix: 'K+', order: 1 },
    { value: '500+', label: 'Productos', numeric_value: 500, suffix: '+', order: 2 },
    { value: '98%', label: 'Satisfacción', numeric_value: 98, suffix: '%', order: 3 },
    { value: '24/7', label: 'Atención', numeric_value: null, suffix: null, order: 4 }
];

const DEFAULT_SECTION_TITLES: SectionTitles = {
    categories: 'COMPRA POR CATEGORÍA',
    products_month: 'PRODUCTOS DEL MES',
    testimonials: 'LO QUE DICEN NUESTROS CLIENTES',
    newsletter: 'ÚNETE A NUESTRA COMUNIDAD'
};

const DEFAULT_FOOTER: FooterConfig = {
    about_text: 'SABOTAGE es una marca peruana de ropa urbana.',
    copyright: '© 2024 SABOTAGE. Todos los derechos reservados.',
    show_social_links: true,
    show_payment_methods: true
};

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
    private readonly supabase = inject(SupabaseService);

    // Cached configurations
    private readonly configs = signal<Map<string, unknown>>(new Map());
    private loaded = false;

    // ============================================
    // Public Getters (with defaults)
    // ============================================

    readonly announcementBar = signal<AnnouncementBar>(DEFAULT_ANNOUNCEMENT_BAR);
    readonly contactInfo = signal<ContactInfo>(DEFAULT_CONTACT_INFO);
    readonly branding = signal<Branding>(DEFAULT_BRANDING);
    readonly stats = signal<StatItem[]>(DEFAULT_STATS);
    readonly sectionTitles = signal<SectionTitles>(DEFAULT_SECTION_TITLES);
    readonly footer = signal<FooterConfig>(DEFAULT_FOOTER);

    // ============================================
    // Load All Configurations
    // ============================================

    async loadConfigs(): Promise<void> {
        if (this.loaded) return;

        try {
            const configs = await this.supabase.getAll<DbSiteConfig>('site_config');
            const configMap = new Map<string, unknown>();

            for (const config of configs) {
                configMap.set(config.key, config.value);
                this.applyConfig(config.key, config.value);
            }

            this.configs.set(configMap);
            this.loaded = true;
        } catch (error) {
            console.warn('Could not load site configs, using defaults:', error);
        }
    }

    private applyConfig(key: string, value: unknown): void {
        switch (key) {
            case 'announcement_bar':
                this.announcementBar.set({ ...DEFAULT_ANNOUNCEMENT_BAR, ...(value as Partial<AnnouncementBar>) });
                break;
            case 'contact_info':
                this.contactInfo.set({ ...DEFAULT_CONTACT_INFO, ...(value as Partial<ContactInfo>) });
                break;
            case 'branding':
                this.branding.set({ ...DEFAULT_BRANDING, ...(value as Partial<Branding>) });
                break;
            case 'stats':
                if (Array.isArray(value)) {
                    this.stats.set(value as StatItem[]);
                }
                break;
            case 'section_titles':
                this.sectionTitles.set({ ...DEFAULT_SECTION_TITLES, ...(value as Partial<SectionTitles>) });
                break;
            case 'footer':
                this.footer.set({ ...DEFAULT_FOOTER, ...(value as Partial<FooterConfig>) });
                break;
        }
    }

    // ============================================
    // Get Config by Key (generic)
    // ============================================

    async getConfig<T>(key: string): Promise<T | null> {
        if (!this.loaded) {
            await this.loadConfigs();
        }
        return (this.configs().get(key) as T) ?? null;
    }

    // ============================================
    // Update Config (for admin)
    // ============================================

    async updateConfig<T extends object>(key: string, value: T): Promise<boolean> {
        try {
            // Check if config exists
            const existing = await this.supabase.getAll<DbSiteConfig>('site_config', {
                filters: [{ column: 'key', operator: 'eq', value: key }]
            });

            const updateData = { value: value as unknown };

            if (existing.length > 0) {
                await this.supabase.update('site_config', existing[0].id, updateData);
            } else {
                await this.supabase.insert('site_config', { key, ...updateData });
            }

            // Update local cache
            this.configs.update(map => {
                const newMap = new Map(map);
                newMap.set(key, value);
                return newMap;
            });
            this.applyConfig(key, value);

            return true;
        } catch (error) {
            console.error('Error updating config:', error);
            return false;
        }
    }

    // ============================================
    // Get All Configs (for admin)
    // ============================================

    async getAllConfigs(): Promise<DbSiteConfig[]> {
        return this.supabase.getAll<DbSiteConfig>('site_config');
    }

    // Force reload
    async reload(): Promise<void> {
        this.loaded = false;
        await this.loadConfigs();
    }
}
