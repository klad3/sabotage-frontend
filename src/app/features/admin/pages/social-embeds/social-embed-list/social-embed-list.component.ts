import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { DbSocialEmbed, SocialPlatform } from '../../../../../core/models/product.model';

const PLATFORM_OPTIONS: { value: SocialPlatform; label: string; icon: string }[] = [
    { value: 'instagram', label: 'Instagram', icon: '📸' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'facebook', label: 'Facebook', icon: '👤' },
    { value: 'youtube', label: 'YouTube', icon: '▶️' },
    { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
    { value: 'other', label: 'Otro', icon: '🔗' }
];

@Component({
    selector: 'app-social-embed-list',
    imports: [FormsModule],
    template: `
        <div class="embed-list-page">
            <div class="page-header">
                <div>
                    <h1>Redes Sociales</h1>
                    <p class="subtitle">Gestiona los iframes de redes sociales en la sección "Síguenos"</p>
                </div>
                <button class="btn-primary" (click)="openModal()">
                    <span>➕</span> Nuevo Embed
                </button>
            </div>

            <div class="info-box">
                <strong>💡 ¿Cómo obtener el código embed?</strong>
                <ul>
                    <li><strong>Instagram:</strong> Ve a la publicación → Menú (···) → Insertar → Copiar código</li>
                    <li><strong>TikTok:</strong> Ve al video → Compartir → Insertar → Copiar código</li>
                    <li><strong>YouTube:</strong> En el video → Compartir → Insertar</li>
                    <li><strong>Facebook:</strong> En la publicación → Menú → Insertar</li>
                </ul>
            </div>

            @if (loading()) {
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando embeds...</p>
                </div>
            } @else if (embeds().length === 0) {
                <div class="empty-state">
                    <span class="empty-icon">📱</span>
                    <h3>No hay embeds configurados</h3>
                    <p>Agrega embeds de Instagram, TikTok y otras redes sociales</p>
                    <button class="btn-primary" (click)="openModal()">Crear Embed</button>
                </div>
            } @else {
                <div class="embeds-grid">
                    @for (embed of embeds(); track embed.id) {
                        <div class="embed-card" [class.inactive]="!embed.is_active">
                            <div class="embed-header">
                                <span class="platform-badge" [attr.data-platform]="embed.platform">
                                    {{ getPlatformIcon(embed.platform) }} {{ getPlatformLabel(embed.platform) }}
                                </span>
                                <span class="status" [class.active]="embed.is_active">
                                    {{ embed.is_active ? 'Activo' : 'Inactivo' }}
                                </span>
                            </div>
                            <div class="embed-info">
                                <h3>{{ embed.title }}</h3>
                                <span class="order">Orden: {{ embed.display_order }}</span>
                            </div>
                            <div class="embed-preview">
                                <pre>{{ getPreviewCode(embed.embed_code) }}</pre>
                            </div>
                            <div class="embed-actions">
                                <button class="btn-icon" (click)="editEmbed(embed)" title="Editar">✏️</button>
                                <button class="btn-icon" (click)="toggleActive(embed)" [title]="embed.is_active ? 'Desactivar' : 'Activar'">
                                    {{ embed.is_active ? '🔴' : '🟢' }}
                                </button>
                                <button class="btn-icon delete" (click)="confirmDelete(embed)" title="Eliminar">🗑️</button>
                            </div>
                        </div>
                    }
                </div>
            }

            @if (showModal()) {
                <div class="modal-overlay" (click)="closeModal()">
                    <div class="modal" (click)="$event.stopPropagation()">
                        <h3>{{ editingEmbed() ? 'Editar Embed' : 'Nuevo Embed' }}</h3>

                        <div class="form-group">
                            <label for="embed-title">Título (referencia interna) *</label>
                            <input 
                                type="text" 
                                id="embed-title"
                                [(ngModel)]="formData.title" 
                                placeholder="Ej: Post navideño Instagram">
                        </div>

                        <div class="form-group">
                            <label for="embed-platform">Plataforma *</label>
                            <select id="embed-platform" [(ngModel)]="formData.platform">
                                @for (platform of platformOptions; track platform.value) {
                                    <option [value]="platform.value">
                                        {{ platform.icon }} {{ platform.label }}
                                    </option>
                                }
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="embed-code">Código Embed (HTML) *</label>
                            <textarea 
                                id="embed-code"
                                [(ngModel)]="formData.embed_code" 
                                placeholder="Pega aquí el código HTML del embed..."
                                rows="8"></textarea>
                            <small class="help-text">Copia el código embed completo de la red social</small>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="embed-order">Orden</label>
                                <input type="number" id="embed-order" [(ngModel)]="formData.display_order" min="0">
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
                            <button class="btn-primary" (click)="saveEmbed()" [disabled]="saving()">
                                {{ saving() ? 'Guardando...' : 'Guardar' }}
                            </button>
                        </div>
                    </div>
                </div>
            }

            @if (showDeleteModal()) {
                <div class="modal-overlay" (click)="showDeleteModal.set(false)">
                    <div class="modal" (click)="$event.stopPropagation()">
                        <h3>¿Eliminar embed?</h3>
                        <p>El embed "{{ embedToDelete()?.title }}" será eliminado permanentemente.</p>
                        <div class="modal-actions">
                            <button class="btn-secondary" (click)="showDeleteModal.set(false)">Cancelar</button>
                            <button class="btn-danger" (click)="deleteEmbed()" [disabled]="deleting()">
                                {{ deleting() ? 'Eliminando...' : 'Eliminar' }}
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        .embed-list-page {
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
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
            color: #60a5fa;
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

        .embeds-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
        }

        .embed-card {
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.3s;
        }

        .embed-card.inactive {
            opacity: 0.5;
        }

        .embed-card:hover {
            border-color: rgba(254, 202, 87, 0.3);
        }

        .embed-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: rgba(0, 0, 0, 0.3);
        }

        .platform-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            color: #fff;
        }

        .platform-badge[data-platform="instagram"] { background: rgba(225, 48, 108, 0.3); }
        .platform-badge[data-platform="tiktok"] { background: rgba(0, 0, 0, 0.5); }
        .platform-badge[data-platform="facebook"] { background: rgba(24, 119, 242, 0.3); }
        .platform-badge[data-platform="youtube"] { background: rgba(255, 0, 0, 0.3); }
        .platform-badge[data-platform="twitter"] { background: rgba(29, 161, 242, 0.3); }

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

        .embed-info {
            padding: 16px;
        }

        .embed-info h3 {
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            margin: 0 0 8px;
        }

        .embed-info .order {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
        }

        .embed-preview {
            padding: 12px 16px;
            background: rgba(0, 0, 0, 0.2);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .embed-preview pre {
            margin: 0;
            padding: 8px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.6);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
        }

        .embed-actions {
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
            max-width: 550px;
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
        .form-group input[type="number"],
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
            font-family: inherit;
        }

        .form-group select {
            cursor: pointer;
        }

        .form-group select option {
            background: #1a1a1a;
            color: #fff;
        }

        .form-group textarea {
            resize: vertical;
            min-height: 120px;
            font-family: 'Consolas', 'Monaco', monospace;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #feca57;
        }

        .help-text {
            display: block;
            margin-top: 6px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.4);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            align-items: end;
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

            .embeds-grid {
                grid-template-columns: 1fr;
            }

            .form-row {
                grid-template-columns: 1fr;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialEmbedListComponent implements OnInit {
    private readonly supabase = inject(SupabaseService);
    private readonly toast = inject(ToastService);

    readonly loading = signal(true);
    readonly saving = signal(false);
    readonly deleting = signal(false);
    readonly embeds = signal<DbSocialEmbed[]>([]);
    readonly showModal = signal(false);
    readonly showDeleteModal = signal(false);
    readonly editingEmbed = signal<DbSocialEmbed | null>(null);
    readonly embedToDelete = signal<DbSocialEmbed | null>(null);

    readonly platformOptions = PLATFORM_OPTIONS;

    formData = {
        title: '',
        platform: 'instagram' as SocialPlatform,
        embed_code: '',
        display_order: 0,
        is_active: true
    };

    async ngOnInit(): Promise<void> {
        await this.loadEmbeds();
    }

    private async loadEmbeds(): Promise<void> {
        this.loading.set(true);
        try {
            const embeds = await this.supabase.getAll<DbSocialEmbed>('social_embeds', {
                orderBy: { column: 'display_order', ascending: true }
            });
            this.embeds.set(embeds);
        } catch (error) {
            console.error('Error loading embeds:', error);
            this.toast.error('Error al cargar los embeds');
        } finally {
            this.loading.set(false);
        }
    }

    getPlatformIcon(platform: SocialPlatform): string {
        return PLATFORM_OPTIONS.find(p => p.value === platform)?.icon ?? '🔗';
    }

    getPlatformLabel(platform: SocialPlatform): string {
        return PLATFORM_OPTIONS.find(p => p.value === platform)?.label ?? 'Otro';
    }

    getPreviewCode(code: string): string {
        const maxLength = 80;
        const cleanCode = code.replace(/\s+/g, ' ').trim();
        return cleanCode.length > maxLength
            ? cleanCode.substring(0, maxLength) + '...'
            : cleanCode;
    }

    openModal(): void {
        this.editingEmbed.set(null);
        this.formData = {
            title: '',
            platform: 'instagram',
            embed_code: '',
            display_order: 0,
            is_active: true
        };
        this.showModal.set(true);
    }

    editEmbed(embed: DbSocialEmbed): void {
        this.editingEmbed.set(embed);
        this.formData = {
            title: embed.title,
            platform: embed.platform,
            embed_code: embed.embed_code,
            display_order: embed.display_order,
            is_active: embed.is_active
        };
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingEmbed.set(null);
    }

    async saveEmbed(): Promise<void> {
        if (!this.formData.title.trim()) {
            this.toast.warning('El título es requerido');
            return;
        }

        if (!this.formData.embed_code.trim()) {
            this.toast.warning('El código embed es requerido');
            return;
        }

        this.saving.set(true);
        try {
            const data = {
                title: this.formData.title.trim(),
                platform: this.formData.platform,
                embed_code: this.formData.embed_code.trim(),
                display_order: this.formData.display_order,
                is_active: this.formData.is_active
            };

            const editing = this.editingEmbed();
            if (editing) {
                await this.supabase.update<DbSocialEmbed>('social_embeds', editing.id, data);
                this.toast.success('Embed actualizado');
            } else {
                await this.supabase.insert<DbSocialEmbed>('social_embeds', data);
                this.toast.success('Embed creado');
            }

            await this.loadEmbeds();
            this.closeModal();
        } catch (error) {
            console.error('Error saving embed:', error);
            this.toast.error('Error al guardar el embed');
        } finally {
            this.saving.set(false);
        }
    }

    async toggleActive(embed: DbSocialEmbed): Promise<void> {
        try {
            await this.supabase.update<DbSocialEmbed>('social_embeds', embed.id, {
                is_active: !embed.is_active
            });
            await this.loadEmbeds();
            this.toast.success(embed.is_active ? 'Embed desactivado' : 'Embed activado');
        } catch (error) {
            console.error('Error toggling embed:', error);
            this.toast.error('Error al cambiar estado');
        }
    }

    confirmDelete(embed: DbSocialEmbed): void {
        this.embedToDelete.set(embed);
        this.showDeleteModal.set(true);
    }

    async deleteEmbed(): Promise<void> {
        const embed = this.embedToDelete();
        if (!embed) return;

        this.deleting.set(true);
        try {
            await this.supabase.delete('social_embeds', embed.id);
            await this.loadEmbeds();
            this.showDeleteModal.set(false);
            this.embedToDelete.set(null);
            this.toast.success('Embed eliminado');
        } catch (error) {
            console.error('Error deleting embed:', error);
            this.toast.error('Error al eliminar el embed');
        } finally {
            this.deleting.set(false);
        }
    }
}
