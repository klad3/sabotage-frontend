import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { DbCategory } from '../../../../../core/models/product.model';

@Component({
    selector: 'app-category-list',
    imports: [FormsModule],
    template: `
        <div class="category-list-page">
            <div class="page-header">
                <h1>Categorías</h1>
                <button class="btn-primary" (click)="openModal()">
                    <span>➕</span> Nueva Categoría
                </button>
            </div>

            @if (loading()) {
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando categorías...</p>
                </div>
            } @else if (categories().length === 0) {
                <div class="empty-state">
                    <span class="empty-icon">📁</span>
                    <h3>No hay categorías</h3>
                    <p>Crea tu primera categoría para organizar tus productos</p>
                    <button class="btn-primary" (click)="openModal()">Crear Categoría</button>
                </div>
            } @else {
                <div class="categories-grid">
                                    @for (category of categories(); track category.id) {
                        <div class="category-card">
                            @if (category.image_url) {
                                <div class="card-image">
                                    <img [src]="category.image_url" [alt]="category.name">
                                </div>
                            }
                            <div class="card-header">
                                <h3>{{ category.name }}</h3>
                                <span class="slug">/{{ category.slug }}</span>
                            </div>
                            @if (category.description) {
                                <p class="description">{{ category.description }}</p>
                            }
                            <div class="card-footer">
                                <span class="status" [class.active]="category.is_active">
                                    {{ category.is_active ? 'Activa' : 'Inactiva' }}
                                </span>
                                <div class="actions">
                                    <button class="btn-icon" (click)="editCategory(category)" title="Editar">✏️</button>
                                    <button class="btn-icon delete" (click)="confirmDelete(category)" title="Eliminar">🗑️</button>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            }

            @if (showModal()) {
                <div class="modal-overlay" (click)="closeModal()">
                    <div class="modal" (click)="$event.stopPropagation()">
                        <h3>{{ editingCategory() ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
                        
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" [(ngModel)]="formData.name" placeholder="Ej: Oversize">
                        </div>

                        <div class="form-group">
                            <label>Slug *</label>
                            <input type="text" [(ngModel)]="formData.slug" placeholder="Ej: oversize">
                            <span class="hint">URL amigable, sin espacios ni caracteres especiales</span>
                        </div>

                        <div class="form-group">
                            <label>Descripción</label>
                            <textarea [(ngModel)]="formData.description" rows="3" placeholder="Descripción opcional..."></textarea>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" [(ngModel)]="formData.is_active">
                                <span>Categoría Activa</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label>Imagen de Categoría</label>
                            <div class="image-upload-area">
                                @if (imagePreview()) {
                                    <div class="image-preview">
                                        <img [src]="imagePreview()" alt="Preview">
                                        <button type="button" class="remove-image" (click)="removeImage()">✕</button>
                                    </div>
                                } @else {
                                    <div class="upload-placeholder" (click)="imageInput.click()">
                                        <span class="upload-icon">🖼️</span>
                                        <span>Clic para subir imagen</span>
                                    </div>
                                }
                                <input #imageInput type="file" accept="image/*" 
                                       (change)="onImageSelected($event)" 
                                       style="display: none">
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button class="btn-secondary" (click)="closeModal()">Cancelar</button>
                            <button class="btn-primary" (click)="saveCategory()" [disabled]="saving()">
                                {{ saving() ? 'Guardando...' : 'Guardar' }}
                            </button>
                        </div>
                    </div>
                </div>
            }

            @if (showDeleteModal()) {
                <div class="modal-overlay" (click)="showDeleteModal.set(false)">
                    <div class="modal" (click)="$event.stopPropagation()">
                        <h3>¿Eliminar categoría?</h3>
                        <p>Esta acción no se puede deshacer. Los productos en esta categoría quedarán sin categoría asignada.</p>
                        <div class="modal-actions">
                            <button class="btn-secondary" (click)="showDeleteModal.set(false)">Cancelar</button>
                            <button class="btn-danger" (click)="deleteCategory()" [disabled]="deleting()">
                                {{ deleting() ? 'Eliminando...' : 'Eliminar' }}
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        .category-list-page {
            max-width: 1200px;
            margin: 0 auto;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .page-header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #fff;
            margin: 0;
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
            box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
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

        .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
        }

        .empty-state h3 {
            color: #fff;
            margin: 0 0 8px;
        }

        .empty-state p {
            color: rgba(255, 255, 255, 0.5);
            margin: 0 0 24px;
        }

        .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }

        .category-card {
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 20px;
            transition: all 0.3s;
        }

        .category-card:hover {
            border-color: rgba(254, 202, 87, 0.3);
        }

        .card-image {
            margin: -20px -20px 16px -20px;
            border-radius: 16px 16px 0 0;
            overflow: hidden;
            height: 150px;
        }

        .card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .card-header h3 {
            font-size: 18px;
            font-weight: 600;
            color: #fff;
            margin: 0 0 4px;
        }

        .slug {
            font-size: 13px;
            color: #feca57;
            font-family: monospace;
        }

        .description {
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            margin: 12px 0;
            line-height: 1.5;
        }

        .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }

        .image-upload-area {
            margin-top: 8px;
        }

        .upload-placeholder {
            border: 2px dashed rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .upload-placeholder:hover {
            border-color: #feca57;
            background: rgba(254, 202, 87, 0.1);
        }

        .upload-icon {
            font-size: 32px;
        }

        .image-preview {
            position: relative;
            border-radius: 8px;
            overflow: hidden;
        }

        .image-preview img {
            width: 100%;
            max-height: 200px;
            object-fit: cover;
        }

        .remove-image {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .remove-image:hover {
            background: #ff6464;
        }

        .status.active {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
        }

        .status:not(.active) {
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
        }

        .actions {
            display: flex;
            gap: 8px;
        }

        .btn-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-icon:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .btn-icon.delete:hover {
            background: rgba(244, 63, 94, 0.2);
        }

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
            max-width: 480px;
            width: 90%;
        }

        .modal h3 {
            color: #fff;
            margin: 0 0 24px;
            font-size: 20px;
        }

        .modal p {
            color: rgba(255, 255, 255, 0.7);
            margin: 0 0 24px;
            line-height: 1.6;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #feca57;
        }

        .hint {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.4);
            margin-top: 4px;
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
        }

        .checkbox-label input {
            width: auto;
        }

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

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
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

        .btn-danger:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        @media (max-width: 768px) {
            .page-header {
                flex-direction: column;
                gap: 16px;
                align-items: flex-start;
            }

            .page-header h1 {
                font-size: 24px;
            }

            .categories-grid {
                grid-template-columns: 1fr;
            }

            .modal {
                padding: 24px;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryListComponent implements OnInit {
    private readonly supabase = inject(SupabaseService);

    readonly loading = signal(true);
    readonly saving = signal(false);
    readonly deleting = signal(false);
    readonly categories = signal<DbCategory[]>([]);
    readonly showModal = signal(false);
    readonly showDeleteModal = signal(false);
    readonly editingCategory = signal<DbCategory | null>(null);
    readonly categoryToDelete = signal<DbCategory | null>(null);

    formData = {
        name: '',
        slug: '',
        description: '',
        is_active: true,
        image_url: '' as string | null
    };

    readonly imagePreview = signal<string | null>(null);
    private selectedImageFile: File | null = null;

    async ngOnInit(): Promise<void> {
        await this.loadCategories();
    }

    private async loadCategories(): Promise<void> {
        this.loading.set(true);
        try {
            const categories = await this.supabase.getAll<DbCategory>('categories', {
                orderBy: { column: 'display_order', ascending: true }
            });
            this.categories.set(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            this.loading.set(false);
        }
    }

    openModal(): void {
        this.editingCategory.set(null);
        this.formData = { name: '', slug: '', description: '', is_active: true, image_url: null };
        this.imagePreview.set(null);
        this.selectedImageFile = null;
        this.showModal.set(true);
    }

    editCategory(category: DbCategory): void {
        this.editingCategory.set(category);
        this.formData = {
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            is_active: category.is_active,
            image_url: category.image_url
        };
        this.imagePreview.set(category.image_url);
        this.selectedImageFile = null;
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingCategory.set(null);
        this.imagePreview.set(null);
        this.selectedImageFile = null;
    }

    onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.selectedImageFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview.set(e.target?.result as string);
            };
            reader.readAsDataURL(this.selectedImageFile);
        }
    }

    removeImage(): void {
        this.selectedImageFile = null;
        this.imagePreview.set(null);
        this.formData.image_url = null;
    }

    async saveCategory(): Promise<void> {
        if (!this.formData.name.trim() || !this.formData.slug.trim()) {
            alert('Nombre y slug son requeridos');
            return;
        }

        this.saving.set(true);
        try {
            // Upload image if selected
            if (this.selectedImageFile) {
                const fileName = `${this.formData.slug}-${Date.now()}.${this.selectedImageFile.name.split('.').pop()}`;
                const imageUrl = await this.supabase.uploadFile('categories', fileName, this.selectedImageFile);
                this.formData.image_url = imageUrl;
            }

            const editing = this.editingCategory();
            if (editing) {
                await this.supabase.update<DbCategory>('categories', editing.id, this.formData);
            } else {
                await this.supabase.insert<DbCategory>('categories', this.formData);
            }
            await this.loadCategories();
            this.closeModal();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Error al guardar la categoría');
        } finally {
            this.saving.set(false);
        }
    }

    confirmDelete(category: DbCategory): void {
        this.categoryToDelete.set(category);
        this.showDeleteModal.set(true);
    }

    async deleteCategory(): Promise<void> {
        const category = this.categoryToDelete();
        if (!category) return;

        this.deleting.set(true);
        try {
            await this.supabase.delete('categories', category.id);
            await this.loadCategories();
            this.showDeleteModal.set(false);
        } catch (error) {
            console.error('Error deleting category:', error);
        } finally {
            this.deleting.set(false);
        }
    }
}
