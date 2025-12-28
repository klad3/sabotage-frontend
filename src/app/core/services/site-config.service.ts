import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {
    DbSiteConfig,
    AnnouncementBar,
    ContactInfo,
    Branding,
    StatItem,
    SectionTitles,
    FooterConfig,
    Testimonial,
    NewsletterContent,
    HeaderConfig,
    AboutPageConfig
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

const DEFAULT_TESTIMONIALS: Testimonial[] = [
    { stars: 5, text: 'La calidad es increíble!', author: 'María G.', order: 1 },
    { stars: 5, text: 'Los diseños son únicos!', author: 'Carlos R.', order: 2 },
    { stars: 5, text: 'Excelente relación calidad-precio!', author: 'Andrea L.', order: 3 }
];

const DEFAULT_NEWSLETTER_CONTENT: NewsletterContent = {
    title: 'ÚNETE AL CREW',
    subtitle: 'Suscríbete y recibe descuentos exclusivos, lanzamientos y más'
};

const DEFAULT_HEADER_CONFIG: HeaderConfig = {
    is_sticky: true
};

const DEFAULT_ABOUT_PAGE: AboutPageConfig = {
    banner: {
        image_url: null
    },
    intro: {
        title: '¿Quiénes somos?',
        paragraphs: [
            'Somos una marca de moda urbana creada para quienes expresan su estilo sin pedir permiso.',
            'Diseñamos polos oversize, poleras, gorros y bolsos de alta calidad, pensados para destacar, combinar y marcar presencia en cada look.',
            'Unimos creatividad y visión para ofrecer diseños actuales, con materiales seleccionados y acabados cuidados. Creemos que la ropa no solo se usa, se siente; cada prenda refleja actitud, autenticidad y una forma única de reinterpretar la moda.'
        ]
    },
    history: {
        title: 'Nuestra Historia',
        paragraphs: [
            'Nuestra historia nace del deseo de crear prendas que realmente representen a quienes las usan. Empezamos con una idea clara: ofrecer polos oversize y piezas urbanas de buena calidad, con diseño y actitud, para personas que quieren verse bien y sentirse cómodas al mismo tiempo.',
            'Con creatividad, visión y mucha dedicación, fuimos construyendo una marca pensada para nuestra comunidad. Cada prenda refleja ese inicio: hacer moda urbana con identidad, cuidando los detalles y poniendo siempre al cliente en el centro de todo lo que hacemos.'
        ]
    },
    mission_vision: {
        mission_title: 'Misión',
        mission_text: 'Ofrecer prendas de moda urbana de alta calidad que ayuden a las personas a expresar su estilo con seguridad y comodidad. Creamos diseños actuales, pensando en quienes buscan verse bien, sentirse auténticos y usar ropa que los represente.',
        vision_title: 'Visión',
        vision_text: 'Ser una marca de moda urbana cercana y referente, reconocida por la calidad de sus polos y por acompañar a nuestra comunidad a mostrar su identidad a través de cada prenda.',
        background_image: null
    },
    values: {
        title: 'Valores',
        items: [
            { title: 'CALIDAD', text: 'Priorizamos materiales y acabados que garanticen comodidad, durabilidad y una experiencia que se note desde el primer uso.', image_url: null, hover_image_url: null },
            { title: 'AUTENTICIDAD', text: 'Creemos en el estilo propio. Cada prenda está pensada para que nuestros clientes se expresen tal como son, sin seguir reglas impuestas.', image_url: null, hover_image_url: null },
            { title: 'COMUNIDAD', text: 'Escuchamos a nuestra comunidad y creamos pensando en sus gustos, necesidades y forma de vivir la moda.', image_url: null, hover_image_url: null }
        ]
    },
    models: {
        title: 'Nuestras estrellas de la camara',
        items: []
    }
};

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
    private readonly supabase = inject(SupabaseService);

    // Cached configurations
    private readonly configs = signal<Map<string, unknown>>(new Map());
    private loaded = false;
    private pendingLoad: Promise<void> | null = null;

    // ============================================
    // Public Getters (with defaults)
    // ============================================

    readonly announcementBar = signal<AnnouncementBar>(DEFAULT_ANNOUNCEMENT_BAR);
    readonly contactInfo = signal<ContactInfo>(DEFAULT_CONTACT_INFO);
    readonly branding = signal<Branding>(DEFAULT_BRANDING);
    readonly stats = signal<StatItem[]>(DEFAULT_STATS);
    readonly sectionTitles = signal<SectionTitles>(DEFAULT_SECTION_TITLES);
    readonly footer = signal<FooterConfig>(DEFAULT_FOOTER);
    readonly testimonials = signal<Testimonial[]>(DEFAULT_TESTIMONIALS);
    readonly newsletterContent = signal<NewsletterContent>(DEFAULT_NEWSLETTER_CONTENT);
    readonly headerConfig = signal<HeaderConfig>(DEFAULT_HEADER_CONFIG);
    readonly aboutPage = signal<AboutPageConfig>(DEFAULT_ABOUT_PAGE);

    // ============================================
    // Load All Configurations
    // ============================================

    async loadConfigs(): Promise<void> {
        // Already loaded, return immediately
        if (this.loaded) return;

        // If a load is in progress, wait for it
        if (this.pendingLoad) {
            return this.pendingLoad;
        }

        // Start new load and store the promise
        this.pendingLoad = this.doLoadConfigs();

        try {
            await this.pendingLoad;
        } finally {
            this.pendingLoad = null;
        }
    }

    private async doLoadConfigs(): Promise<void> {
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
            case 'testimonials':
                if (Array.isArray(value)) {
                    this.testimonials.set(value as Testimonial[]);
                }
                break;
            case 'newsletter_content':
                this.newsletterContent.set({ ...DEFAULT_NEWSLETTER_CONTENT, ...(value as Partial<NewsletterContent>) });
                break;
            case 'header_config':
                this.headerConfig.set({ ...DEFAULT_HEADER_CONFIG, ...(value as Partial<HeaderConfig>) });
                break;
            case 'about_page':
                this.aboutPage.set({ ...DEFAULT_ABOUT_PAGE, ...(value as Partial<AboutPageConfig>) });
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
