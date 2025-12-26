import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiteConfigService } from '../../../../core/services/site-config.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AboutPageConfig, AboutPageModel } from '../../../../core/models/product.model';

@Component({
    selector: 'app-about-page-editor',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule],
    template: `
        <div class="about-editor">
            <div class="page-header">
                <div>
                    <h1>Página "Quiénes Somos"</h1>
                    <p class="subtitle">Configura el contenido de la página /nosotros</p>
                </div>
                <div class="header-actions">
                    <a href="/nosotros" target="_blank" class="btn-secondary">
                        👁 Ver página
                    </a>
                    <button class="btn-primary" (click)="save()" [disabled]="saving()">
                        {{ saving() ? 'Guardando...' : '💾 Guardar' }}
                    </button>
                </div>
            </div>

            @if (message()) {
                <div class="alert" [class.success]="!messageError()" [class.error]="messageError()">
                    {{ message() }}
                </div>
            }

            <!-- Banner Section -->
            <section class="editor-section">
                <div class="section-header">
                    <span class="section-icon">🖼️</span>
                    <h2>Banner Principal</h2>
                </div>
                <p class="section-desc">Imagen que aparece en la parte superior de la página</p>
                
                <div class="upload-zone">
                    @if (bannerPreview() || config.banner.image_url) {
                        <div class="image-preview">
                            <img [src]="bannerPreview() || config.banner.image_url" alt="Banner">
                            <button class="btn-remove" (click)="removeBannerImage()">✕</button>
                        </div>
                    } @else {
                        <input type="file" accept="image/*" (change)="onBannerImageChange($event)" id="banner-upload">
                        <label for="banner-upload" class="upload-label">
                            <span class="upload-icon">📤</span>
                            <span>Subir imagen del banner</span>
                            <span class="upload-hint">Recomendado: 1920 x 400 px</span>
                        </label>
                    }
                </div>
            </section>

            <!-- Intro Section -->
            <section class="editor-section">
                <div class="section-header">
                    <span class="section-icon">📝</span>
                    <h2>¿Quiénes Somos?</h2>
                </div>
                
                <div class="form-group">
                    <label>Título</label>
                    <input type="text" [(ngModel)]="config.intro.title" placeholder="¿Quiénes somos?">
                </div>
                
                <div class="paragraphs-group">
                    <label>Párrafos</label>
                    @for (paragraph of config.intro.paragraphs; track $index; let i = $index) {
                        <div class="paragraph-item">
                            <textarea [(ngModel)]="config.intro.paragraphs[i]" rows="3" placeholder="Escribe un párrafo..."></textarea>
                            <button class="btn-remove-small" (click)="removeIntroParagraph(i)">✕</button>
                        </div>
                    }
                    <button class="btn-add" (click)="addIntroParagraph()">+ Agregar párrafo</button>
                </div>
            </section>

            <!-- History Section -->
            <section class="editor-section">
                <div class="section-header">
                    <span class="section-icon">📖</span>
                    <h2>Nuestra Historia</h2>
                </div>
                
                <div class="form-group">
                    <label>Título</label>
                    <input type="text" [(ngModel)]="config.history.title" placeholder="Nuestra Historia">
                </div>
                
                <div class="paragraphs-group">
                    <label>Párrafos</label>
                    @for (paragraph of config.history.paragraphs; track $index; let i = $index) {
                        <div class="paragraph-item">
                            <textarea [(ngModel)]="config.history.paragraphs[i]" rows="3" placeholder="Escribe un párrafo..."></textarea>
                            <button class="btn-remove-small" (click)="removeHistoryParagraph(i)">✕</button>
                        </div>
                    }
                    <button class="btn-add" (click)="addHistoryParagraph()">+ Agregar párrafo</button>
                </div>
            </section>

            <!-- Mission & Vision Section -->
            <section class="editor-section">
                <div class="section-header">
                    <span class="section-icon">🎯</span>
                    <h2>Misión y Visión</h2>
                </div>
                
                <div class="two-columns">
                    <div class="column">
                        <div class="form-group">
                            <label>Título Misión</label>
                            <input type="text" [(ngModel)]="config.mission_vision.mission_title" placeholder="Misión">
                        </div>
                        <div class="form-group">
                            <label>Texto Misión</label>
                            <textarea [(ngModel)]="config.mission_vision.mission_text" rows="4" placeholder="Nuestra misión es..."></textarea>
                        </div>
                    </div>
                    <div class="column">
                        <div class="form-group">
                            <label>Título Visión</label>
                            <input type="text" [(ngModel)]="config.mission_vision.vision_title" placeholder="Visión">
                        </div>
                        <div class="form-group">
                            <label>Texto Visión</label>
                            <textarea [(ngModel)]="config.mission_vision.vision_text" rows="4" placeholder="Nuestra visión es..."></textarea>
                        </div>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 16px">
                    <label>Imagen de Fondo (opcional)</label>
                    <div class="upload-zone small">
                        @if (missionBgPreview() || config.mission_vision.background_image) {
                            <div class="image-preview small">
                                <img [src]="missionBgPreview() || config.mission_vision.background_image" alt="Fondo">
                                <button class="btn-remove" (click)="removeMissionBgImage()">✕</button>
                            </div>
                        } @else {
                            <input type="file" accept="image/*" (change)="onMissionBgImageChange($event)" id="mission-bg-upload">
                            <label for="mission-bg-upload" class="upload-label small">
                                <span>📤 Subir imagen de fondo</span>
                            </label>
                        }
                    </div>
                </div>
            </section>

            <!-- Values Section -->
            <section class="editor-section">
                <div class="section-header">
                    <span class="section-icon">✨</span>
                    <h2>Valores</h2>
                </div>
                
                <div class="form-group">
                    <label>Título de Sección</label>
                    <input type="text" [(ngModel)]="config.values.title" placeholder="Valores">
                </div>
                
                <div class="values-list">
                    @for (value of config.values.items; track $index; let i = $index) {
                        <div class="value-item">
                            <span class="value-number">{{ i + 1 }}</span>
                            <textarea [(ngModel)]="value.text" rows="2" placeholder="Describe este valor..."></textarea>
                            <button class="btn-remove-small" (click)="removeValue(i)">✕</button>
                        </div>
                    }
                    <button class="btn-add" (click)="addValue()">+ Agregar valor</button>
                </div>
            </section>

            <!-- Models Section -->
            <section class="editor-section">
                <div class="section-header">
                    <span class="section-icon">📸</span>
                    <h2>Estrellas de la Cámara</h2>
                </div>
                <p class="section-desc">Galería de modelos que usan tus productos</p>
                
                <div class="form-group">
                    <label>Título de Sección</label>
                    <input type="text" [(ngModel)]="config.models.title" placeholder="Nuestras estrellas de la cámara">
                </div>
                
                <div class="models-grid">
                    @for (model of config.models.items; track $index; let i = $index) {
                        <div class="model-card">
                            <div class="model-image">
                                @if (modelPreviews()[i] || model.image_url) {
                                    <img [src]="modelPreviews()[i] || model.image_url" [alt]="model.name">
                                    <button class="btn-remove" (click)="removeModelImage(i)">✕</button>
                                } @else {
                                    <input type="file" accept="image/*" (change)="onModelImageChange($event, i)" [id]="'model-upload-' + i">
                                    <label [for]="'model-upload-' + i" class="upload-label-model">
                                        📤 Subir foto
                                    </label>
                                }
                            </div>
                            <input type="text" [(ngModel)]="model.name" placeholder="Nombre (opcional)" class="model-name-input">
                            <button class="btn-delete-model" (click)="removeModel(i)">🗑️ Eliminar</button>
                        </div>
                    }
                    <button class="btn-add-model" (click)="addModel()">
                        <span>➕</span>
                        <span>Agregar Modelo</span>
                    </button>
                </div>
            </section>
        </div>
    `,
    styles: [`
        .about-editor {
            max-width: 900px;
            margin: 0 auto;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
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

        .header-actions {
            display: flex;
            gap: 12px;
        }

        .btn-primary {
            display: inline-flex;
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

        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 12px;
            color: #fff;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
        }

        .btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }

        .alert {
            padding: 16px 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            font-weight: 500;
        }

        .alert.success {
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #10b981;
        }

        .alert.error {
            background: rgba(244, 63, 94, 0.15);
            border: 1px solid rgba(244, 63, 94, 0.3);
            color: #f43f5e;
        }

        .editor-section {
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }

        .section-icon { font-size: 24px; }
        .section-header h2 {
            font-size: 20px;
            font-weight: 600;
            color: #fff;
            margin: 0;
        }

        .section-desc {
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
            margin: 0 0 16px;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-group label {
            display: block;
            color: rgba(255, 255, 255, 0.7);
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            color: #fff;
            font-size: 14px;
            font-family: inherit;
            resize: vertical;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #feca57;
        }

        .two-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

        .upload-zone {
            border: 2px dashed rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            text-align: center;
            transition: border-color 0.2s;
        }

        .upload-zone:hover { border-color: rgba(254, 202, 87, 0.5); }
        .upload-zone.small { padding: 12px; }

        .upload-zone input[type="file"] { display: none; }

        .upload-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 40px;
            cursor: pointer;
            color: rgba(255, 255, 255, 0.6);
        }

        .upload-label.small { padding: 16px; flex-direction: row; }
        .upload-label:hover { color: #feca57; }
        .upload-icon { font-size: 32px; }
        .upload-hint { font-size: 12px; opacity: 0.6; }

        .image-preview {
            position: relative;
            padding: 16px;
        }

        .image-preview img {
            max-width: 100%;
            max-height: 200px;
            border-radius: 8px;
        }

        .image-preview.small img { max-height: 100px; }

        .btn-remove {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 32px;
            height: 32px;
            background: rgba(244, 63, 94, 0.9);
            border: none;
            border-radius: 50%;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
        }

        .paragraphs-group label {
            display: block;
            color: rgba(255, 255, 255, 0.7);
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 12px;
        }

        .paragraph-item {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
        }

        .paragraph-item textarea {
            flex: 1;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            color: #fff;
            font-size: 14px;
            font-family: inherit;
            resize: vertical;
        }

        .btn-remove-small {
            width: 36px;
            height: 36px;
            background: rgba(244, 63, 94, 0.2);
            border: none;
            border-radius: 8px;
            color: #f43f5e;
            cursor: pointer;
            flex-shrink: 0;
        }

        .btn-remove-small:hover { background: rgba(244, 63, 94, 0.3); }

        .btn-add {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px dashed rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            font-size: 14px;
        }

        .btn-add:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .values-list { margin-top: 16px; }

        .value-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
        }

        .value-number {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            border-radius: 50%;
            color: #000;
            font-weight: 700;
            flex-shrink: 0;
        }

        .value-item textarea {
            flex: 1;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            color: #fff;
            font-size: 14px;
            font-family: inherit;
            resize: vertical;
        }

        .models-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 16px;
            margin-top: 16px;
        }

        .model-card {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            overflow: hidden;
        }

        .model-image {
            aspect-ratio: 3/4;
            background: rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .model-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .model-image input[type="file"] { display: none; }

        .upload-label-model {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            font-size: 13px;
        }

        .upload-label-model:hover { color: #feca57; }

        .model-name-input {
            width: 100%;
            padding: 10px 12px;
            background: transparent;
            border: none;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 13px;
            text-align: center;
        }

        .model-name-input:focus { outline: none; background: rgba(255, 255, 255, 0.05); }

        .btn-delete-model {
            width: 100%;
            padding: 8px;
            background: rgba(244, 63, 94, 0.1);
            border: none;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            color: #f43f5e;
            cursor: pointer;
            font-size: 12px;
        }

        .btn-delete-model:hover { background: rgba(244, 63, 94, 0.2); }

        .btn-add-model {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 200px;
            background: rgba(255, 255, 255, 0.02);
            border: 2px dashed rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            font-size: 14px;
        }

        .btn-add-model:hover {
            border-color: rgba(254, 202, 87, 0.4);
            color: #feca57;
        }

        .btn-add-model span:first-child { font-size: 24px; }

        @media (max-width: 768px) {
            .page-header { flex-direction: column; gap: 16px; }
            .two-columns { grid-template-columns: 1fr; }
            .models-grid { grid-template-columns: repeat(2, 1fr); }
        }
    `],
    host: { class: 'block' }
})
export class AboutPageEditorComponent implements OnInit {
    private readonly siteConfig = inject(SiteConfigService);
    private readonly supabase = inject(SupabaseService);
    private readonly toast = inject(ToastService);

    config: AboutPageConfig = {
        banner: { image_url: null },
        intro: { title: '', paragraphs: [] },
        history: { title: '', paragraphs: [] },
        mission_vision: {
            mission_title: '', mission_text: '',
            vision_title: '', vision_text: '',
            background_image: null
        },
        values: { title: '', items: [] },
        models: { title: '', items: [] }
    };

    readonly saving = signal(false);
    readonly message = signal<string | null>(null);
    readonly messageError = signal(false);

    // Image previews
    readonly bannerPreview = signal<string | null>(null);
    readonly missionBgPreview = signal<string | null>(null);
    readonly modelPreviews = signal<(string | null)[]>([]);

    // Files to upload
    private bannerFile: File | null = null;
    private missionBgFile: File | null = null;
    private modelFiles: (File | null)[] = [];

    async ngOnInit(): Promise<void> {
        await this.siteConfig.loadConfigs();
        this.config = JSON.parse(JSON.stringify(this.siteConfig.aboutPage()));
        this.modelPreviews.set(new Array(this.config.models.items.length).fill(null));
        this.modelFiles = new Array(this.config.models.items.length).fill(null);
    }

    // Banner image
    onBannerImageChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.[0]) {
            this.bannerFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => this.bannerPreview.set(e.target?.result as string);
            reader.readAsDataURL(this.bannerFile);
        }
    }

    removeBannerImage(): void {
        this.bannerFile = null;
        this.bannerPreview.set(null);
        this.config.banner.image_url = null;
    }

    // Mission background image
    onMissionBgImageChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.[0]) {
            this.missionBgFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => this.missionBgPreview.set(e.target?.result as string);
            reader.readAsDataURL(this.missionBgFile);
        }
    }

    removeMissionBgImage(): void {
        this.missionBgFile = null;
        this.missionBgPreview.set(null);
        this.config.mission_vision.background_image = null;
    }

    // Model images
    onModelImageChange(event: Event, index: number): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.[0]) {
            this.modelFiles[index] = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const previews = [...this.modelPreviews()];
                previews[index] = e.target?.result as string;
                this.modelPreviews.set(previews);
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    removeModelImage(index: number): void {
        this.modelFiles[index] = null;
        const previews = [...this.modelPreviews()];
        previews[index] = null;
        this.modelPreviews.set(previews);
        this.config.models.items[index].image_url = null;
    }

    // Intro paragraphs
    addIntroParagraph(): void {
        this.config.intro.paragraphs.push('');
    }
    removeIntroParagraph(index: number): void {
        this.config.intro.paragraphs.splice(index, 1);
    }

    // History paragraphs
    addHistoryParagraph(): void {
        this.config.history.paragraphs.push('');
    }
    removeHistoryParagraph(index: number): void {
        this.config.history.paragraphs.splice(index, 1);
    }

    // Values
    addValue(): void {
        this.config.values.items.push({ text: '' });
    }
    removeValue(index: number): void {
        this.config.values.items.splice(index, 1);
    }

    // Models
    addModel(): void {
        this.config.models.items.push({ name: '', image_url: null });
        this.modelFiles.push(null);
        this.modelPreviews.set([...this.modelPreviews(), null]);
    }

    removeModel(index: number): void {
        this.config.models.items.splice(index, 1);
        this.modelFiles.splice(index, 1);
        const previews = [...this.modelPreviews()];
        previews.splice(index, 1);
        this.modelPreviews.set(previews);
    }

    async save(): Promise<void> {
        this.saving.set(true);
        this.message.set(null);

        try {
            // Upload banner if new file
            if (this.bannerFile) {
                const fileName = `about_banner_${Date.now()}_${this.bannerFile.name}`;
                this.config.banner.image_url = await this.supabase.uploadFile('banners', fileName, this.bannerFile);
            }

            // Upload mission background if new file
            if (this.missionBgFile) {
                const fileName = `about_mission_bg_${Date.now()}_${this.missionBgFile.name}`;
                this.config.mission_vision.background_image = await this.supabase.uploadFile('banners', fileName, this.missionBgFile);
            }

            // Upload model images
            for (let i = 0; i < this.modelFiles.length; i++) {
                if (this.modelFiles[i]) {
                    const fileName = `about_model_${Date.now()}_${i}_${this.modelFiles[i]!.name}`;
                    this.config.models.items[i].image_url = await this.supabase.uploadFile('banners', fileName, this.modelFiles[i]!);
                }
            }

            const success = await this.siteConfig.updateConfig('about_page', this.config);
            if (success) {
                this.toast.success('Cambios guardados correctamente');
                this.message.set('✓ Cambios guardados correctamente');
                this.messageError.set(false);

                // Reset file states
                this.bannerFile = null;
                this.missionBgFile = null;
                this.modelFiles = this.modelFiles.map(() => null);
                this.bannerPreview.set(null);
                this.missionBgPreview.set(null);
            } else {
                this.toast.error('Error al guardar');
                this.message.set('Error al guardar los cambios');
                this.messageError.set(true);
            }
        } catch (error) {
            console.error('Error saving about page:', error);
            this.toast.error('Error al guardar');
            this.message.set('Error al guardar los cambios');
            this.messageError.set(true);
        } finally {
            this.saving.set(false);
            setTimeout(() => this.message.set(null), 3000);
        }
    }
}
