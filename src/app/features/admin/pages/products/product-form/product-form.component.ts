import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { DbProduct, DbCategory } from '../../../../../core/models/product.model';

@Component({
    selector: 'app-product-form',
    imports: [ReactiveFormsModule, RouterLink],
    template: `
        <div class="product-form-page">
            <div class="page-header">
                <a routerLink="/admin/products" class="back-link">← Volver a productos</a>
                <h1>{{ isEditMode() ? 'Editar Producto' : 'Nuevo Producto' }}</h1>
            </div>

            @if (loading()) {
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando...</p>
                </div>
            } @else {
                <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="form-container">
                    <div class="form-grid">
                        <div class="form-main">
                            <section class="form-section">
                                <h2>Información Básica</h2>
                                
                                <div class="form-group">
                                    <label for="name">Nombre del Producto *</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        formControlName="name"
                                        placeholder="Ej: Polo Oversize Negro"
                                    >
                                    @if (productForm.get('name')?.hasError('required') && productForm.get('name')?.touched) {
                                        <span class="field-error">El nombre es requerido</span>
                                    }
                                </div>

                                <div class="form-group">
                                    <label for="description">Descripción</label>
                                    <textarea 
                                        id="description" 
                                        formControlName="description"
                                        rows="4"
                                        placeholder="Describe el producto..."
                                    ></textarea>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="price">Precio (S/) *</label>
                                        <input 
                                            type="number" 
                                            id="price" 
                                            formControlName="price"
                                            step="0.01"
                                            min="0"
                                            placeholder="49.90"
                                        >
                                        @if (productForm.get('price')?.hasError('required') && productForm.get('price')?.touched) {
                                            <span class="field-error">El precio es requerido</span>
                                        }
                                    </div>

                                    <div class="form-group">
                                        <label for="category_id">Categoría</label>
                                        <select id="category_id" formControlName="category_id">
                                            <option value="">Seleccionar...</option>
                                            @for (cat of categories(); track cat.id) {
                                                <option [value]="cat.id">{{ cat.name }}</option>
                                            }
                                        </select>
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="type">Tipo *</label>
                                        <select id="type" formControlName="type">
                                            <option value="simple">Simple</option>
                                            <option value="personalizado">Personalizado</option>
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label for="color">Color</label>
                                        <input 
                                            type="text" 
                                            id="color" 
                                            formControlName="color"
                                            placeholder="Ej: negro, blanco"
                                        >
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="theme">Temática</label>
                                    <input 
                                        type="text" 
                                        id="theme" 
                                        formControlName="theme"
                                        placeholder="Ej: anime, urbano, gaming"
                                    >
                                </div>

                                <div class="form-group">
                                    <label>Tallas Disponibles</label>
                                    <div class="sizes-grid">
                                        @for (size of availableSizes; track size) {
                                            <label class="size-checkbox">
                                                <input 
                                                    type="checkbox" 
                                                    [checked]="selectedSizes().includes(size)"
                                                    (change)="toggleSize(size)"
                                                >
                                                <span>{{ size }}</span>
                                            </label>
                                        }
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div class="form-sidebar">
                            <section class="form-section">
                                <h2>Imagen</h2>
                                
                                <div class="image-upload">
                                    @if (imagePreview()) {
                                        <div class="image-preview">
                                            <img [src]="imagePreview()" alt="Preview">
                                            <button type="button" class="remove-image" (click)="removeImage()">✕</button>
                                        </div>
                                    } @else {
                                        <div class="upload-area" (click)="fileInput.click()">
                                            <span class="upload-icon">📷</span>
                                            <p>Haz clic para subir imagen</p>
                                            <span class="upload-hint">PNG, JPG hasta 2MB</span>
                                        </div>
                                    }
                                    <input 
                                        #fileInput
                                        type="file" 
                                        accept="image/*"
                                        (change)="onFileSelected($event)"
                                        style="display: none"
                                    >
                                </div>

                                @if (uploadProgress() > 0 && uploadProgress() < 100) {
                                    <div class="upload-progress">
                                        <div class="progress-bar" [style.width.%]="uploadProgress()"></div>
                                    </div>
                                }
                            </section>

                            <section class="form-section">
                                <h2>Estado</h2>
                                
                                <label class="toggle-field">
                                    <span>En Stock</span>
                                    <input type="checkbox" formControlName="in_stock">
                                    <span class="toggle"></span>
                                </label>

                                <label class="toggle-field">
                                    <span>Producto Activo</span>
                                    <input type="checkbox" formControlName="is_active">
                                    <span class="toggle"></span>
                                </label>
                            </section>

                            <div class="form-actions">
                                <button 
                                    type="submit" 
                                    class="btn-primary"
                                    [disabled]="productForm.invalid || saving()"
                                >
                                    @if (saving()) {
                                        <span class="spinner-small"></span>
                                        Guardando...
                                    } @else {
                                        {{ isEditMode() ? 'Actualizar Producto' : 'Crear Producto' }}
                                    }
                                </button>
                                <a routerLink="/admin/products" class="btn-secondary">Cancelar</a>
                            </div>
                        </div>
                    </div>
                </form>
            }
        </div>
    `,
    styles: [`
        .product-form-page {
            max-width: 1200px;
            margin: 0 auto;
        }

        .page-header {
            margin-bottom: 32px;
        }

        .back-link {
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
            font-size: 14px;
            transition: color 0.2s;
        }

        .back-link:hover {
            color: #feca57;
        }

        .page-header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #fff;
            margin: 8px 0 0;
        }

        .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px;
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            color: rgba(255, 255, 255, 0.6);
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

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 360px;
            gap: 24px;
        }

        .form-section {
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
        }

        .form-section h2 {
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            margin: 0 0 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
            transition: all 0.2s;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
            color: rgba(255, 255, 255, 0.3);
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #feca57;
            background: rgba(255, 255, 255, 0.08);
        }

        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }

        .field-error {
            color: #ff6b6b;
            font-size: 12px;
            margin-top: 4px;
            display: block;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .sizes-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .size-checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .size-checkbox:has(input:checked) {
            background: rgba(254, 202, 87, 0.2);
            border-color: #feca57;
        }

        .size-checkbox input {
            display: none;
        }

        .size-checkbox span {
            color: #fff;
            font-size: 14px;
            font-weight: 500;
        }

        .image-upload {
            margin-bottom: 16px;
        }

        .upload-area {
            border: 2px dashed rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 40px 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .upload-area:hover {
            border-color: #feca57;
            background: rgba(254, 202, 87, 0.05);
        }

        .upload-icon {
            font-size: 48px;
            display: block;
            margin-bottom: 12px;
        }

        .upload-area p {
            color: #fff;
            margin: 0 0 8px;
        }

        .upload-hint {
            color: rgba(255, 255, 255, 0.4);
            font-size: 12px;
        }

        .image-preview {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
        }

        .image-preview img {
            width: 100%;
            aspect-ratio: 1;
            object-fit: cover;
        }

        .remove-image {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 32px;
            height: 32px;
            background: rgba(0, 0, 0, 0.7);
            border: none;
            border-radius: 50%;
            color: #fff;
            cursor: pointer;
            transition: background 0.2s;
        }

        .remove-image:hover {
            background: #f43f5e;
        }

        .upload-progress {
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #ff6b6b, #feca57);
            transition: width 0.3s;
        }

        .toggle-field {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            cursor: pointer;
        }

        .toggle-field:last-of-type {
            border-bottom: none;
        }

        .toggle-field > span:first-child {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
        }

        .toggle-field input {
            display: none;
        }

        .toggle {
            width: 48px;
            height: 26px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 13px;
            position: relative;
            transition: background 0.2s;
        }

        .toggle::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 20px;
            height: 20px;
            background: #fff;
            border-radius: 50%;
            transition: transform 0.2s;
        }

        .toggle-field input:checked + .toggle {
            background: #10b981;
        }

        .toggle-field input:checked + .toggle::after {
            transform: translateX(22px);
        }

        .form-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .btn-primary {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 14px 24px;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            border: none;
            border-radius: 12px;
            color: #000;
            font-size: 14px;
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

        .spinner-small {
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top-color: #000;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        .btn-secondary {
            display: block;
            padding: 14px 24px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 1024px) {
            .form-grid {
                grid-template-columns: 1fr;
            }

            .form-sidebar {
                order: -1;
            }
        }

        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormComponent implements OnInit {
    private readonly supabase = inject(SupabaseService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly fb = inject(FormBuilder);

    readonly loading = signal(true);
    readonly saving = signal(false);
    readonly isEditMode = signal(false);
    readonly categories = signal<DbCategory[]>([]);
    readonly selectedSizes = signal<string[]>([]);
    readonly imagePreview = signal<string | null>(null);
    readonly uploadProgress = signal(0);

    readonly availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    private productId: string | null = null;
    private selectedFile: File | null = null;

    readonly productForm = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        price: [0, [Validators.required, Validators.min(0)]],
        category_id: [''],
        type: ['simple' as 'simple' | 'personalizado'],
        color: [''],
        theme: [''],
        in_stock: [true],
        is_active: [true]
    });

    async ngOnInit(): Promise<void> {
        this.productId = this.route.snapshot.paramMap.get('id');
        this.isEditMode.set(!!this.productId);

        await this.loadCategories();

        if (this.productId) {
            await this.loadProduct();
        } else {
            this.loading.set(false);
        }
    }

    private async loadCategories(): Promise<void> {
        try {
            const categories = await this.supabase.getAll<DbCategory>('categories');
            this.categories.set(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    private async loadProduct(): Promise<void> {
        if (!this.productId) return;

        try {
            const product = await this.supabase.getById<DbProduct>('products', this.productId);
            if (product) {
                this.productForm.patchValue({
                    name: product.name,
                    description: product.description || '',
                    price: product.price,
                    category_id: product.category_id || '',
                    type: product.type,
                    color: product.color || '',
                    theme: product.theme || '',
                    in_stock: product.in_stock,
                    is_active: product.is_active
                });
                this.selectedSizes.set(product.sizes || []);
                if (product.image_url) {
                    this.imagePreview.set(product.image_url);
                }
            }
        } catch (error) {
            console.error('Error loading product:', error);
        } finally {
            this.loading.set(false);
        }
    }

    toggleSize(size: string): void {
        this.selectedSizes.update(sizes =>
            sizes.includes(size)
                ? sizes.filter(s => s !== size)
                : [...sizes, size]
        );
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('El archivo es muy grande. Máximo 2MB.');
                return;
            }

            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview.set(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage(): void {
        this.selectedFile = null;
        this.imagePreview.set(null);
    }

    async onSubmit(): Promise<void> {
        if (this.productForm.invalid) return;

        this.saving.set(true);

        try {
            let imageUrl = this.imagePreview();

            // Upload image if new file selected
            if (this.selectedFile) {
                const fileName = `${Date.now()}-${this.selectedFile.name}`;
                const path = await this.supabase.uploadFile('products', fileName, this.selectedFile);
                if (path) {
                    imageUrl = this.supabase.getPublicUrl('products', path);
                }
            }

            const formValue = this.productForm.value;
            const productData: Partial<DbProduct> = {
                name: formValue.name || '',
                description: formValue.description || undefined,
                price: formValue.price || 0,
                category_id: formValue.category_id || undefined,
                type: formValue.type || 'simple',
                color: formValue.color || undefined,
                theme: formValue.theme || undefined,
                in_stock: formValue.in_stock ?? true,
                is_active: formValue.is_active ?? true,
                sizes: this.selectedSizes(),
                image_url: imageUrl || undefined
            };

            if (this.isEditMode() && this.productId) {
                await this.supabase.update<DbProduct>('products', this.productId, productData);
            } else {
                await this.supabase.insert<DbProduct>('products', productData);
            }

            this.router.navigate(['/admin/products']);
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error al guardar el producto');
        } finally {
            this.saving.set(false);
        }
    }
}
