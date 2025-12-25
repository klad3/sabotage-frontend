import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiteConfigService } from '../../../../../core/services/site-config.service';
import { ToastService } from '../../../../../core/services/toast.service';
import {
    AnnouncementBar,
    ContactInfo,
    Branding,
    StatItem,
    SectionTitles,
    NewsletterContent
} from '../../../../../core/models/product.model';

@Component({
    selector: 'app-site-settings',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule],
    template: `
        <div class="settings-container">
            <h1>Configuración del Sitio</h1>
            <p class="subtitle">Administra la configuración general de tu tienda</p>

            @if (loading()) {
                <div class="loading">Cargando configuraciones...</div>
            } @else {
                <!-- Announcement Bar -->
                <section class="settings-section">
                    <h2>🔔 Barra de Anuncios</h2>
                    <p class="section-desc">Texto promocional en la parte superior de la página</p>
                    
                    <div class="form-group">
                        <label>Texto del anuncio</label>
                        <input type="text" [(ngModel)]="announcement.text" placeholder="¡Envío GRATIS en compras mayores a S/100!">
                    </div>
                    <div class="form-group">
                        <label>Link (opcional)</label>
                        <input type="text" [(ngModel)]="announcement.link" placeholder="/promociones">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Color de fondo</label>
                            <input type="color" [(ngModel)]="announcement.background_color">
                        </div>
                        <div class="form-group">
                            <label>Color de texto</label>
                            <input type="color" [(ngModel)]="announcement.text_color">
                        </div>
                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" [(ngModel)]="announcement.is_active">
                                Activo
                            </label>
                        </div>
                    </div>
                    <button class="btn-save" (click)="saveAnnouncement()" [disabled]="saving()">
                        {{ saving() ? 'Guardando...' : 'Guardar Barra de Anuncios' }}
                    </button>
                </section>

                <!-- Contact Info -->
                <section class="settings-section">
                    <h2>📞 Información de Contacto</h2>
                    <p class="section-desc">Datos de contacto y redes sociales</p>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>WhatsApp (sin +)</label>
                            <input type="text" [(ngModel)]="contact.whatsapp" placeholder="51999999999">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" [(ngModel)]="contact.email" placeholder="contacto@sabotage.pe">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Mensaje predeterminado de WhatsApp</label>
                        <input type="text" [(ngModel)]="contact.whatsapp_message" placeholder="Hola! Me interesa hacer un pedido">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Instagram (usuario)</label>
                            <input type="text" [(ngModel)]="contact.instagram" placeholder="sabotage.pe">
                        </div>
                        <div class="form-group">
                            <label>Facebook (usuario)</label>
                            <input type="text" [(ngModel)]="contact.facebook" placeholder="sabotageperu">
                        </div>
                        <div class="form-group">
                            <label>TikTok (usuario)</label>
                            <input type="text" [(ngModel)]="contact.tiktok" placeholder="sabotage.pe">
                        </div>
                    </div>
                    <button class="btn-save" (click)="saveContact()" [disabled]="saving()">
                        {{ saving() ? 'Guardando...' : 'Guardar Contacto' }}
                    </button>
                </section>

                <!-- Section Titles -->
                <section class="settings-section">
                    <h2>📝 Títulos de Secciones</h2>
                    <p class="section-desc">Textos de las secciones del home</p>
                    
                    <div class="form-group">
                        <label>Categorías</label>
                        <input type="text" [(ngModel)]="sectionTitles.categories" placeholder="COMPRA POR CATEGORÍA">
                    </div>
                    <div class="form-group">
                        <label>Productos del Mes</label>
                        <input type="text" [(ngModel)]="sectionTitles.products_month" placeholder="PRODUCTOS DEL MES">
                    </div>
                    <div class="form-group">
                        <label>Testimonios</label>
                        <input type="text" [(ngModel)]="sectionTitles.testimonials" placeholder="LO QUE DICEN NUESTROS CLIENTES">
                    </div>
                    <div class="form-group">
                        <label>Newsletter</label>
                        <input type="text" [(ngModel)]="sectionTitles.newsletter" placeholder="ÚNETE A NUESTRA COMUNIDAD">
                    </div>
                    <button class="btn-save" (click)="saveSectionTitles()" [disabled]="saving()">
                        {{ saving() ? 'Guardando...' : 'Guardar Títulos' }}
                    </button>
                </section>

                <!-- Stats -->
                <section class="settings-section">
                    <h2>📊 Estadísticas</h2>
                    <p class="section-desc">Números que se muestran en la sección de estadísticas</p>
                    
                    @for (stat of stats; track stat.order; let i = $index) {
                        <div class="stat-row">
                            <div class="form-group">
                                <label>Etiqueta</label>
                                <input type="text" [(ngModel)]="stat.label">
                            </div>
                            <div class="form-group small">
                                <label>Valor numérico</label>
                                <input type="number" [(ngModel)]="stat.numeric_value" [disabled]="stat.numeric_value === null">
                            </div>
                            <div class="form-group small">
                                <label>Sufijo</label>
                                <input type="text" [(ngModel)]="stat.suffix" placeholder="K+, %, +">
                            </div>
                            <div class="form-group small">
                                <label>Valor fijo</label>
                                <input type="text" [(ngModel)]="stat.value" [disabled]="stat.numeric_value !== null">
                            </div>
                        </div>
                    }
                    <button class="btn-save" (click)="saveStats()" [disabled]="saving()">
                        {{ saving() ? 'Guardando...' : 'Guardar Estadísticas' }}
                    </button>
                </section>



                <!-- Newsletter Content -->
                <section class="settings-section">
                    <h2>📧 Newsletter</h2>
                    <p class="section-desc">Título y subtítulo de la sección de suscripción</p>
                    
                    <div class="form-group">
                        <label>Título</label>
                        <input type="text" [(ngModel)]="newsletterContent.title" placeholder="ÚNETE AL CREW">
                    </div>
                    <div class="form-group">
                        <label>Subtítulo</label>
                        <input type="text" [(ngModel)]="newsletterContent.subtitle" placeholder="Suscríbete y recibe descuentos...">
                    </div>
                    <button class="btn-save" (click)="saveNewsletterContent()" [disabled]="saving()">
                        {{ saving() ? 'Guardando...' : 'Guardar Newsletter' }}
                    </button>
                </section>
            }
        </div>
    `,
    styles: [`
        .settings-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
        }

        h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            color: #888;
            margin-bottom: 2rem;
        }

        .settings-section {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .settings-section h2 {
            font-size: 1.25rem;
            margin-bottom: 0.25rem;
        }

        .section-desc {
            color: #888;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #ccc;
        }

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="number"] {
            width: 100%;
            padding: 0.75rem;
            background: #0a0a0a;
            border: 1px solid #333;
            border-radius: 4px;
            color: #fff;
        }

        .form-group input[type="color"] {
            width: 60px;
            height: 40px;
            padding: 0;
            border: none;
            cursor: pointer;
        }

        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
        }

        .checkbox-label {
            display: flex !important;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
            width: 18px;
            height: 18px;
        }

        .stat-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #333;
        }

        .form-group.small input {
            max-width: 100%;
        }



        .btn-save {
            background: linear-gradient(135deg, #00d9ff, #0099ff);
            color: #000;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        .btn-save:hover {
            opacity: 0.9;
        }

        .btn-save:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .loading {
            text-align: center;
            padding: 2rem;
            color: #888;
        }

        @media (max-width: 768px) {
            .stat-row {
                grid-template-columns: 1fr 1fr;
            }

            .form-row {
                grid-template-columns: 1fr;
            }
        }
    `]
})
export class SiteSettingsComponent implements OnInit {
    private readonly siteConfig = inject(SiteConfigService);
    private readonly toast = inject(ToastService);

    readonly loading = signal(true);
    readonly saving = signal(false);

    // Form data
    announcement: AnnouncementBar = {
        text: '',
        link: null,
        is_active: false,
        background_color: '#1a1a1a',
        text_color: '#ffffff'
    };

    contact: ContactInfo = {
        whatsapp: '',
        whatsapp_message: '',
        email: '',
        instagram: '',
        facebook: '',
        tiktok: ''
    };

    sectionTitles: SectionTitles = {
        categories: '',
        products_month: '',
        testimonials: '',
        newsletter: ''
    };

    stats: StatItem[] = [];



    newsletterContent: NewsletterContent = {
        title: '',
        subtitle: ''
    };

    async ngOnInit(): Promise<void> {
        await this.loadSettings();
    }

    private async loadSettings(): Promise<void> {
        this.loading.set(true);
        try {
            await this.siteConfig.loadConfigs();

            // Copy values to form
            this.announcement = { ...this.siteConfig.announcementBar() };
            this.contact = { ...this.siteConfig.contactInfo() };
            this.sectionTitles = { ...this.siteConfig.sectionTitles() };
            this.stats = [...this.siteConfig.stats()];

            this.newsletterContent = { ...this.siteConfig.newsletterContent() };
        } finally {
            this.loading.set(false);
        }
    }

    async saveAnnouncement(): Promise<void> {
        this.saving.set(true);
        const success = await this.siteConfig.updateConfig('announcement_bar', this.announcement);
        this.saving.set(false);

        if (success) {
            this.toast.success('Barra de anuncios actualizada');
        } else {
            this.toast.error('Error al guardar');
        }
    }

    async saveContact(): Promise<void> {
        this.saving.set(true);
        const success = await this.siteConfig.updateConfig('contact_info', this.contact);
        this.saving.set(false);

        if (success) {
            this.toast.success('Información de contacto actualizada');
        } else {
            this.toast.error('Error al guardar');
        }
    }

    async saveSectionTitles(): Promise<void> {
        this.saving.set(true);
        const success = await this.siteConfig.updateConfig('section_titles', this.sectionTitles);
        this.saving.set(false);

        if (success) {
            this.toast.success('Títulos actualizados');
        } else {
            this.toast.error('Error al guardar');
        }
    }

    async saveStats(): Promise<void> {
        this.saving.set(true);
        const success = await this.siteConfig.updateConfig('stats', this.stats);
        this.saving.set(false);

        if (success) {
            this.toast.success('Estadísticas actualizadas');
        } else {
            this.toast.error('Error al guardar');
        }
    }



    async saveNewsletterContent(): Promise<void> {
        this.saving.set(true);
        const success = await this.siteConfig.updateConfig('newsletter_content', this.newsletterContent);
        this.saving.set(false);

        if (success) {
            this.toast.success('Newsletter actualizado');
        } else {
            this.toast.error('Error al guardar');
        }
    }
}
