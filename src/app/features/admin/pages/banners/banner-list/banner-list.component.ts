import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { DbBanner } from '../../../../../core/models/product.model';

@Component({
    selector: 'app-banner-list',
    imports: [FormsModule],
    template: `
        <div class="banner-list-page">
            <div class="page-header">
                <div>
                    <h1>Banners del Carrusel</h1>
                    <p class="subtitle">Gestiona las imágenes del carrusel principal</p>
                </div>
                <button class="btn-primary" (click)="openModal()">
                    <span>➕</span> Nuevo Banner
                </button>
            </div>

            <div class="info-box">
                <strong>📐 Dimensiones recomendadas:</strong>
                <ul>
                    <li><strong>Desktop:</strong> 1920 x 720 px (horizontal)</li>
                    <li><strong>Tablet:</strong> 1024 x 768 px</li>
                    <li><strong>Mobile:</strong> 400 x 600 px (vertical)</li>
                </ul>
            </div>

            @if (loading()) {
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando banners...</p>
                </div>
            } @else if (banners().length === 0) {
                <div class="empty-state">
                    <span class="empty-icon">🖼️</span>
                    <h3>No hay banners</h3>
                    <p>Agrega banners para mostrar en el carrusel de la página principal</p>
                    <button class="btn-primary" (click)="openModal()">Crear Banner</button>
                </div>
            } @else {
                <div class="banners-grid">
                    @for (banner of banners(); track banner.id) {
                        <div class="banner-card" [class.inactive]="!banner.is_active">
                            <div class="banner-preview">
                                <div class="preview-section">
                                    <span class="label">Desktop</span>
                                    @if (banner.image_desktop) {
                                        <img [src]="banner.image_desktop" alt="Desktop">
                                    } @else {
                                        <div class="no-image">Sin imagen</div>
                                    }
                                </div>
                                <div class="preview-section">
                                    <span class="label">Tablet</span>
                                    @if (banner.image_tablet) {
                                        <img [src]="banner.image_tablet" alt="Tablet">
                                    } @else {
                                        <div class="no-image">Sin imagen</div>
                                    }
                                </div>
                                <div class="preview-section">
                                    <span class="label">Mobile</span>
                                    @if (banner.image_mobile) {
                                        <img [src]="banner.image_mobile" alt="Mobile">
                                    } @else {
                                        <div class="no-image">Sin imagen</div>
                                    }
                                </div>
                            </div>
                            <div class="banner-info">
                                <h3>{{ banner.title }}</h3>
                                @if (banner.link) {
                                    <span class="link">🔗 {{ banner.link }}</span>
                                }
                            </div>
                            <div class="banner-footer">
                                <span class="order">Orden: {{ banner.display_order }}</span>
                                <span class="status" [class.active]="banner.is_active">
                                    {{ banner.is_active ? 'Activo' : 'Inactivo' }}
                                </span>
                            </div>
                            <div class="banner-actions">
                                <button class="btn-icon" (click)="editBanner(banner)" title="Editar">✏️</button>
                                <button class="btn-icon" (click)="toggleActive(banner)" [title]="banner.is_active ? 'Desactivar' : 'Activar'">
                                    {{ banner.is_active ? '🔴' : '🟢' }}
                                </button>
                                <button class="btn-icon delete" (click)="confirmDelete(banner)" title="Eliminar">🗑️</button>
                            </div>
                        </div>
                    }
                </div>
            }

            @if (showModal()) {
                <div class="modal-overlay" (click)="closeModal()">
                    <div class="modal" (click)="$event.stopPropagation()">
                        <h3>{{ editingBanner() ? 'Editar Banner' : 'Nuevo Banner' }}</h3>

                        <div class="form-group">
                            <label>Título *</label>
                            <input type="text" [(ngModel)]="formData.title" placeholder="Ej: Promoción Verano">
                        </div>

                        <div class="form-group">
                            <label>Imagen Desktop (1920x720 - horizontal)</label>
                            <div class="upload-area">
                                @if (desktopPreview() || formData.image_desktop) {
                                    <img [src]="desktopPreview() || formData.image_desktop" class="preview-img">
                                    <button class="btn-remove" (click)="removeDesktopImage()">✕</button>
                                } @else {
                                    <input type="file" accept="image/*" (change)="onDesktopImageChange($event)" id="desktop-upload">
                                    <label for="desktop-upload" class="upload-label">
                                        <span>📤</span> Subir imagen desktop
                                    </label>
                                }
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Imagen Tablet (1024x768)</label>
                            <div class="upload-area">
                                @if (tabletPreview() || formData.image_tablet) {
                                    <img [src]="tabletPreview() || formData.image_tablet" class="preview-img">
                                    <button class="btn-remove" (click)="removeTabletImage()">✕</button>
                                } @else {
                                    <input type="file" accept="image/*" (change)="onTabletImageChange($event)" id="tablet-upload">
                                    <label for="tablet-upload" class="upload-label">
                                        <span>📤</span> Subir imagen tablet
                                    </label>
                                }
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Imagen Mobile (400x600 - vertical)</label>
                            <div class="upload-area">
                                @if (mobilePreview() || formData.image_mobile) {
                                    <img [src]="mobilePreview() || formData.image_mobile" class="preview-img">
                                    <button class="btn-remove" (click)="removeMobileImage()">✕</button>
                                } @else {
                                    <input type="file" accept="image/*" (change)="onMobileImageChange($event)" id="mobile-upload">
                                    <label for="mobile-upload" class="upload-label">
                                        <span>📤</span> Subir imagen mobile
                                    </label>
                                }
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Link (opcional)</label>
                            <input type="url" [(ngModel)]="formData.link" placeholder="https://...">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Orden</label>
                                <input type="number" [(ngModel)]="formData.display_order" min="0">
                            </div>
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" [(ngModel)]="formData.is_active">
                                    <span>Activo</span>
                                </label>
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button class="btn-secondary" (click)="closeModal()">Cancelar</button>
                            <button class="btn-primary" (click)="saveBanner()" [disabled]="saving()">
                                {{ saving() ? 'Guardando...' : 'Guardar' }}
                            </button>
                        </div>
                    </div>
                </div>
            }

            @if (showDeleteModal()) {
                <div class="modal-overlay" (click)="showDeleteModal.set(false)">
                    <div class="modal" (click)="$event.stopPropagation()">
                        <h3>¿Eliminar banner?</h3>
                        <p>El banner "{{ bannerToDelete()?.title }}" será eliminado permanentemente.</p>
                        <div class="modal-actions">
                            <button class="btn-secondary" (click)="showDeleteModal.set(false)">Cancelar</button>
                            <button class="btn-danger" (click)="deleteBanner()" [disabled]="deleting()">
                                {{ deleting() ? 'Eliminando...' : 'Eliminar' }}
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        .banner-list-page {
            max-width: 1200px;
            margin: 0 auto;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
        }

        .page-header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #fff;
            margin: 0;
        }

        .subtitle {
            color: rgba(255, 255, 255, 0.5);
            margin: 4px 0 0;
        }

        .info-box {
            background: rgba(254, 202, 87, 0.1);
            border: 1px solid rgba(254, 202, 87, 0.3);
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
            color: #feca57;
        }

        .info-box ul {
            margin: 8px 0 0 20px;
            padding: 0;
        }

        .info-box li {
            margin: 4px 0;
            color: rgba(255, 255, 255, 0.8);
        }

        .btn-primary {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            border: none;
            border-radius: 12px;
            color: #000;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
        }

        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .loading-state, .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px;
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: #feca57;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 16px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .empty-icon { font-size: 64px; margin-bottom: 16px; }
        .empty-state h3 { color: #fff; margin: 0 0 8px; }
        .empty-state p { color: rgba(255, 255, 255, 0.5); margin: 0 0 24px; }

        .banners-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
        }

        .banner-card {
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.3s;
        }

        .banner-card.inactive {
            opacity: 0.5;
        }

        .banner-card:hover {
            border-color: rgba(254, 202, 87, 0.3);
        }

        .banner-preview {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            padding: 12px;
            background: rgba(0, 0, 0, 0.3);
        }

        .preview-section {
            position: relative;
        }

        .preview-section .label {
            position: absolute;
            top: 4px;
            left: 4px;
            background: rgba(0, 0, 0, 0.7);
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            color: #fff;
            z-index: 1;
        }

        .preview-section img {
            width: 100%;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
        }

        .preview-section .no-image {
            width: 100%;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            color: rgba(255, 255, 255, 0.3);
            font-size: 12px;
        }

        .banner-info {
            padding: 16px;
        }

        .banner-info h3 {
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            margin: 0 0 8px;
            text-transform: uppercase;
        }

        .banner-info .link {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            word-break: break-all;
        }

        .banner-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .order {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
        }

        .status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
        }

        .status.active {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
        }

        .banner-actions {
            display: flex;
            gap: 8px;
            padding: 12px 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .btn-icon {
            width: 36px;
            height: 36px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-icon:hover { background: rgba(255, 255, 255, 0.1); }
        .btn-icon.delete:hover { background: rgba(244, 63, 94, 0.2); }

        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal {
            background: #1a1a1a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal h3 { color: #fff; margin: 0 0 24px; font-size: 20px; }
        .modal p { color: rgba(255, 255, 255, 0.7); margin: 0 0 24px; }

        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: block;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
        }

        .form-group input[type="text"],
        .form-group input[type="url"],
        .form-group input[type="number"] {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
        }

        .form-group input:focus {
            outline: none;
            border-color: #feca57;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            align-items: end;
        }

        .upload-area {
            position: relative;
            border: 2px dashed rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }

        .upload-area input[type="file"] {
            display: none;
        }

        .upload-label {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 16px;
        }

        .upload-label:hover {
            color: #feca57;
        }

        .preview-img {
            max-width: 100%;
            max-height: 150px;
            border-radius: 8px;
        }

        .btn-remove {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 28px;
            height: 28px;
            background: rgba(244, 63, 94, 0.8);
            border: none;
            border-radius: 50%;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            height: 100%;
        }

        .checkbox-label input { width: auto; }

        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
        }

        .btn-secondary {
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 12px;
            color: #fff;
            font-weight: 500;
            cursor: pointer;
        }

        .btn-danger {
            padding: 12px 24px;
            background: #f43f5e;
            border: none;
            border-radius: 12px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
        }

        .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 768px) {
            .page-header {
                flex-direction: column;
                gap: 16px;
            }

            .page-header h1 { font-size: 24px; }

            .banners-grid {
                grid-template-columns: 1fr;
            }

            .form-row {
                grid-template-columns: 1fr;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerListComponent implements OnInit {
    private readonly supabase = inject(SupabaseService);
    private readonly toast = inject(ToastService);

    readonly loading = signal(true);
    readonly saving = signal(false);
    readonly deleting = signal(false);
    readonly banners = signal<DbBanner[]>([]);
    readonly showModal = signal(false);
    readonly showDeleteModal = signal(false);
    readonly editingBanner = signal<DbBanner | null>(null);
    readonly bannerToDelete = signal<DbBanner | null>(null);
    readonly desktopPreview = signal<string | null>(null);
    readonly tabletPreview = signal<string | null>(null);
    readonly mobilePreview = signal<string | null>(null);

    formData = {
        title: '',
        image_desktop: '',
        image_tablet: '',
        image_mobile: '',
        link: '',
        display_order: 0,
        is_active: true
    };

    private desktopFile: File | null = null;
    private tabletFile: File | null = null;
    private mobileFile: File | null = null;

    async ngOnInit(): Promise<void> {
        await this.loadBanners();
    }

    private async loadBanners(): Promise<void> {
        this.loading.set(true);
        try {
            const banners = await this.supabase.getAll<DbBanner>('banners', {
                orderBy: { column: 'display_order', ascending: true }
            });
            this.banners.set(banners);
        } catch (error) {
            console.error('Error loading banners:', error);
            this.toast.error('Error al cargar los banners');
        } finally {
            this.loading.set(false);
        }
    }

    openModal(): void {
        this.editingBanner.set(null);
        this.formData = { title: '', image_desktop: '', image_tablet: '', image_mobile: '', link: '', display_order: 0, is_active: true };
        this.desktopFile = null;
        this.tabletFile = null;
        this.mobileFile = null;
        this.desktopPreview.set(null);
        this.tabletPreview.set(null);
        this.mobilePreview.set(null);
        this.showModal.set(true);
    }

    editBanner(banner: DbBanner): void {
        this.editingBanner.set(banner);
        this.formData = {
            title: banner.title,
            image_desktop: banner.image_desktop || '',
            image_tablet: banner.image_tablet || '',
            image_mobile: banner.image_mobile || '',
            link: banner.link || '',
            display_order: banner.display_order,
            is_active: banner.is_active
        };
        this.desktopFile = null;
        this.tabletFile = null;
        this.mobileFile = null;
        this.desktopPreview.set(null);
        this.tabletPreview.set(null);
        this.mobilePreview.set(null);
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingBanner.set(null);
    }

    onDesktopImageChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.desktopFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                this.desktopPreview.set(e.target?.result as string);
            };
            reader.readAsDataURL(this.desktopFile);
        }
    }

    onMobileImageChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.mobileFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                this.mobilePreview.set(e.target?.result as string);
            };
            reader.readAsDataURL(this.mobileFile);
        }
    }

    onTabletImageChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.tabletFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                this.tabletPreview.set(e.target?.result as string);
            };
            reader.readAsDataURL(this.tabletFile);
        }
    }

    removeDesktopImage(): void {
        this.desktopFile = null;
        this.desktopPreview.set(null);
        this.formData.image_desktop = '';
    }

    removeTabletImage(): void {
        this.tabletFile = null;
        this.tabletPreview.set(null);
        this.formData.image_tablet = '';
    }

    removeMobileImage(): void {
        this.mobileFile = null;
        this.mobilePreview.set(null);
        this.formData.image_mobile = '';
    }

    async saveBanner(): Promise<void> {
        if (!this.formData.title.trim()) {
            this.toast.warning('El título es requerido');
            return;
        }

        this.saving.set(true);
        try {
            let desktopUrl: string | null = this.formData.image_desktop || null;
            let tabletUrl: string | null = this.formData.image_tablet || null;
            let mobileUrl: string | null = this.formData.image_mobile || null;

            // Upload desktop image if new file
            if (this.desktopFile) {
                const fileName = `desktop_${Date.now()}_${this.desktopFile.name}`;
                desktopUrl = await this.supabase.uploadFile('banners', fileName, this.desktopFile);
            }

            // Upload tablet image if new file
            if (this.tabletFile) {
                const fileName = `tablet_${Date.now()}_${this.tabletFile.name}`;
                tabletUrl = await this.supabase.uploadFile('banners', fileName, this.tabletFile);
            }

            // Upload mobile image if new file
            if (this.mobileFile) {
                const fileName = `mobile_${Date.now()}_${this.mobileFile.name}`;
                mobileUrl = await this.supabase.uploadFile('banners', fileName, this.mobileFile);
            }

            const data = {
                title: this.formData.title.trim(),
                image_desktop: desktopUrl || null,
                image_tablet: tabletUrl || null,
                image_mobile: mobileUrl || null,
                link: this.formData.link.trim() || null,
                display_order: this.formData.display_order,
                is_active: this.formData.is_active
            };

            const editing = this.editingBanner();
            if (editing) {
                await this.supabase.update<DbBanner>('banners', editing.id, data);
                this.toast.success('Banner actualizado');
            } else {
                await this.supabase.insert<DbBanner>('banners', data);
                this.toast.success('Banner creado');
            }

            await this.loadBanners();
            this.closeModal();
        } catch (error) {
            console.error('Error saving banner:', error);
            this.toast.error('Error al guardar el banner');
        } finally {
            this.saving.set(false);
        }
    }

    async toggleActive(banner: DbBanner): Promise<void> {
        try {
            await this.supabase.update<DbBanner>('banners', banner.id, {
                is_active: !banner.is_active
            });
            await this.loadBanners();
            this.toast.success(banner.is_active ? 'Banner desactivado' : 'Banner activado');
        } catch (error) {
            console.error('Error toggling banner:', error);
            this.toast.error('Error al cambiar estado');
        }
    }

    confirmDelete(banner: DbBanner): void {
        this.bannerToDelete.set(banner);
        this.showDeleteModal.set(true);
    }

    async deleteBanner(): Promise<void> {
        const banner = this.bannerToDelete();
        if (!banner) return;

        this.deleting.set(true);
        try {
            await this.supabase.delete('banners', banner.id);
            await this.loadBanners();
            this.showDeleteModal.set(false);
            this.toast.success('Banner eliminado');
        } catch (error) {
            console.error('Error deleting banner:', error);
            this.toast.error('Error al eliminar el banner');
        } finally {
            this.deleting.set(false);
        }
    }
}
